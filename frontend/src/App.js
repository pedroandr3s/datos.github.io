import React, { useState, useEffect } from 'react';
import { ApiProvider } from './context/ApiContext';
import Login from './pages/Login'; // Asegúrate de que la ruta sea correcta
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Colmenas from './pages/Colmenas';
import Revisiones from './pages/Revisiones';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
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
    setCurrentPage('usuarios'); // Redirigir a la página de usuarios como solicitas
    console.log('🚀 Usuario autenticado, redirigiendo a usuarios');
  };

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('smartbee_token');
    localStorage.removeItem('smartbee_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    console.log('👋 Usuario desconectado');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'usuarios':
        return <Usuarios />;
      case 'colmenas':
        return <Colmenas />;
      case 'revisiones':
        return <Revisiones />;
      default:
        return <Dashboard />;
    }
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
    <ApiProvider>
      {/* Si no está autenticado, mostrar login */}
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        /* Si está autenticado, mostrar la aplicación principal */
        <div className="app">
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            currentUser={currentUser}
          />
          <div className="main-content">
            <Navbar 
              currentUser={currentUser}
              onLogout={handleLogout}
            />
            <div className="page-container">
              {renderPage()}
            </div>
          </div>
        </div>
      )}
    </ApiProvider>
  );
}

export default App;