import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ApiProvider } from './context/ApiContext';
import Login from './pages/Login';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Colmenas from './pages/Colmenas';
import Revisiones from './pages/Revisiones';

// Componente wrapper para la aplicación autenticada
const AuthenticatedApp = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Función para cambiar página y actualizar URL
  const setCurrentPage = (page) => {
    navigate(`/${page}`);
  };

  // Obtener página actual desde la URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    return path.substring(1); // Remover el '/' inicial
  };

  return (
    <div className="app">
      <Sidebar 
        currentPage={getCurrentPage()} 
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
      />
      <div className="main-content">
        <Navbar 
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/colmenas" element={<Colmenas />} />
            <Route path="/revisiones" element={<Revisiones />} />
            {/* Ruta catch-all para páginas no encontradas */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('smartbee_token');
        const userData = localStorage.getItem('smartbee_user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          setIsAuthenticated(true);
          console.log('✅ Sesión existente encontrada:', user);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('smartbee_token');
        localStorage.removeItem('smartbee_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Manejar login exitoso
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    console.log('🚀 Usuario autenticado, redirigiendo a usuarios');
  };

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('smartbee_token');
    localStorage.removeItem('smartbee_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    console.log('👋 Usuario desconectado');
  };

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando SmartBee...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ApiProvider>
        {/* Si no está autenticado, mostrar login */}
        {!isAuthenticated ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          /* Si está autenticado, mostrar la aplicación principal */
          <AuthenticatedApp 
            currentUser={currentUser} 
            onLogout={handleLogout} 
          />
        )}
      </ApiProvider>
    </Router>
  );
}

export default App;