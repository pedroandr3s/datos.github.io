import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

// Componentes
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Apiarios from './pages/Apiarios';
import Colmenas from './pages/Colmenas';
import DetalleColmena from './components/colmenas/DetalleColmena';
import Login from './components/auth/Login';

// Servicios
import { api } from './services/api';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado
    const token = localStorage.getItem('smartbee_token');
    const usuarioGuardado = localStorage.getItem('smartbee_usuario');
    
    if (token && usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuario(usuarioData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
        localStorage.removeItem('smartbee_token');
        localStorage.removeItem('smartbee_usuario');
      }
    }
    
    setCargando(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUsuario(userData);
    localStorage.setItem('smartbee_token', token);
    localStorage.setItem('smartbee_usuario', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('smartbee_token');
    localStorage.removeItem('smartbee_usuario');
    delete api.defaults.headers.common['Authorization'];
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando SmartBee...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!usuario ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Layout usuario={usuario} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard usuario={usuario} />} />
              <Route path="/dashboard" element={<Dashboard usuario={usuario} />} />
              <Route path="/perfil" element={<Perfil usuario={usuario} />} />
              <Route path="/apiarios" element={<Apiarios usuario={usuario} />} />
              <Route path="/colmenas" element={<Colmenas usuario={usuario} />} />
              <Route path="/colmenas/:apiarioId" element={<Colmenas usuario={usuario} />} />
              <Route path="/colmena/:id" element={<DetalleColmena usuario={usuario} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  );
}

export default App;