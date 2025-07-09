import React, { useState } from 'react';

const Header = ({ usuario, onLogout, onToggleSidebar, sidebarAbierto }) => {
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  const toggleMenuUsuario = () => {
    setMenuUsuarioAbierto(!menuUsuarioAbierto);
  };

  const handleLogout = () => {
    setMenuUsuarioAbierto(false);
    onLogout();
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className={`hamburger ${sidebarAbierto ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        <div className="logo">
          <span className="logo-icon">🐝</span>
          <span className="logo-text">SmartBee</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <input 
            type="text"
            placeholder="Buscar colmenas, apiarios..."
            className="search-input"
          />
          <button className="search-button">
            🔍
          </button>
        </div>
      </div>

      <div className="header-right">
        {/* Notificaciones */}
        <button className="notification-button">
          <span className="icon">🔔</span>
          <span className="badge">3</span>
        </button>

        {/* Menú de usuario */}
        <div className="user-menu">
          <button 
            className="user-button"
            onClick={toggleMenuUsuario}
          >
            <div className="user-avatar">
              {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">
                {usuario?.nombre} {usuario?.apellido}
              </span>
              <span className="user-role">
                {usuario?.rol_nombre || 'Apicultor'}
              </span>
            </div>
            <span className={`dropdown-arrow ${menuUsuarioAbierto ? 'open' : ''}`}>
              ▼
            </span>
          </button>

          {menuUsuarioAbierto && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-avatar large">
                  {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
                </div>
                <div>
                  <div className="user-name">
                    {usuario?.nombre} {usuario?.apellido}
                  </div>
                  <div className="user-email">
                    {usuario?.email}
                  </div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item"
                onClick={() => {
                  setMenuUsuarioAbierto(false);
                  window.location.href = '/perfil';
                }}
              >
                👤 Mi Perfil
              </button>
              
              <button 
                className="dropdown-item"
                onClick={() => setMenuUsuarioAbierto(false)}
              >
                ⚙️ Configuración
              </button>
              
              <button 
                className="dropdown-item"
                onClick={() => setMenuUsuarioAbierto(false)}
              >
                ❓ Ayuda
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay para cerrar menú de usuario */}
      {menuUsuarioAbierto && (
        <div 
          className="dropdown-overlay"
          onClick={() => setMenuUsuarioAbierto(false)}
        />
      )}
    </header>
  );
};

export default Header;