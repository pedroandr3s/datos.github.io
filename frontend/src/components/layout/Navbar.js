import React from 'react';
import { useApi } from '../../context/ApiContext';

const Navbar = () => {
  const { isConnected, testConnection, loading } = useApi();

  const handleRefresh = () => {
    testConnection();
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
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              PV
            </div>
            <div>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#1f2937' 
              }}>
                Pedro Vera
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280' 
              }}>
                Administrador
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '0.25rem',
                color: '#6b7280',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
                e.target.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b7280';
              }}
              title="Cerrar Sesión"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;