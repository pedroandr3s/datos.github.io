import React from 'react';
import { useApi } from '../../context/ApiContext';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { isConnected } = useApi();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊' 
    },
    { 
      id: 'usuarios', 
      label: 'Usuarios', 
      icon: '👥' 
    },
    { 
      id: 'colmenas', 
      label: 'Colmenas', 
      icon: '🏠' 
    },
    { 
      id: 'revisiones', 
      label: 'Revisiones', 
      icon: '📋' 
    }
  ];

  return (
    <div className="sidebar">
      <div style={{ padding: '1.5rem' }}>
        {/* Logo/Title */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginBottom: '2rem' 
        }}>
          <span style={{ fontSize: '1.5rem' }}>🐝</span>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            color: '#1f2937',
            margin: 0
          }}>
            ApiControl
          </h2>
        </div>

        {/* Connection Status */}
        <div style={{ 
          padding: '0.75rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          backgroundColor: isConnected ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${isConnected ? '#a7f3d0' : '#fecaca'}`
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: isConnected ? '#059669' : '#dc2626' 
            }} />
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: isConnected ? '#065f46' : '#991b1b' 
            }}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <nav>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: currentPage === item.id ? '#3b82f6' : 'transparent',
                color: currentPage === item.id ? 'white' : '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer Info */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280',
            marginBottom: '0.5rem'
          }}>
            Sistema de Gestión Apícola
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#9ca3af'
          }}>
            v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;