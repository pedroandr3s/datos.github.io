import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';

const Navbar = () => {
  const { isConnected, testConnection, loading } = useApi();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Cargar datos del usuario al inicializar el componente
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('smartbee_user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        console.log('✅ Datos del usuario cargados en Navbar:', user);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  };

  const handleRefresh = () => {
    testConnection();
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      console.log('👋 Cerrando sesión...');
      
      // Limpiar localStorage
      localStorage.removeItem('smartbee_token');
      localStorage.removeItem('smartbee_user');
      
      // Recargar la página para volver al login
      window.location.reload();
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const nombre = currentUser.nombre || '';
    const apellido = currentUser.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getUserName = () => {
    if (!currentUser) return 'Usuario';
    return `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim();
  };

  const getUserRole = () => {
    if (!currentUser) return 'Sin rol';
    return currentUser.rol_nombre || currentUser.rol || 'Sin rol';
  };

  const getRoleColor = () => {
    if (!currentUser) return '#6b7280';
    
    switch (currentUser.rol) {
      case 'ADM':
        return '#dc2626'; // Rojo para administrador
      case 'API':
        return '#059669'; // Verde para apicultor
      case 'INV':
        return '#2563eb'; // Azul para investigador
      default:
        return '#6b7280'; // Gris por defecto
    }
  };

  return (
    <div className="navbar">
      <div className="flex flex-between flex-center">
        <div>
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Sistema de Gestión Apícola
          </h1>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280', 
            margin: 0
          }}>
            Monitoreo y control de colmenas
          </p>
        </div>

        <div className="flex flex-center flex-gap">
          {/* Current Time */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: '1rem'
          }}>
            <div style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: '#374151'
            }}>
              {getCurrentTime()}
            </div>
          </div>

          {/* Connection Status */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            backgroundColor: isConnected ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${isConnected ? '#d1fae5' : '#fee2e2'}`
          }}>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: isConnected ? '#10b981' : '#ef4444' 
            }} />
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500',
              color: isConnected ? '#059669' : '#dc2626'
            }}>
              {isConnected ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <span style={{ 
              fontSize: '0.875rem',
              transform: loading ? 'rotate(360deg)' : 'rotate(0deg)',
              transition: 'transform 0.5s ease'
            }}>
              🔄
            </span>
            {loading ? 'Conectando...' : 'Actualizar'}
          </button>

          {/* User Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginLeft: '1rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb'
          }}>
            {/* Avatar con iniciales del usuario */}
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: getRoleColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {getUserInitials()}
            </div>
            
            {/* Información del usuario */}
            <div>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#1f2937' 
              }}>
                {getUserName()}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: getRoleColor(),
                fontWeight: '500'
              }}>
                {getUserRole()}
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                color: '#6b7280',
                fontSize: '1.125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fee2e2';
                e.target.style.color = '#dc2626';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b7280';
                e.target.style.transform = 'scale(1)';
              }}
              title="Cerrar Sesión"
            >
              🚪
            </button>
          </div>

          {/* Indicador de sesión activa */}
          {currentUser && (
            <div style={{
              fontSize: '0.75rem',
              color: '#059669',
              backgroundColor: '#ecfdf5',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #d1fae5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981'
              }} />
              Sesión Activa
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;