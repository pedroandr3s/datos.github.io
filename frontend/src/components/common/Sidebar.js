import React from 'react';

const Sidebar = ({ usuario, abierto, onCerrar, rutaActiva, onNavegar }) => {
  const menuItems = [
    {
      id: 'dashboard',
      titulo: 'Dashboard',
      icono: '📊',
      ruta: '/dashboard',
      descripcion: 'Resumen general'
    },
    {
      id: 'apiarios',
      titulo: 'Apiarios',
      icono: '🏡',
      ruta: '/apiarios',
      descripcion: 'Gestionar apiarios'
    },
    {
      id: 'colmenas',
      titulo: 'Colmenas',
      icono: '🍯',
      ruta: '/colmenas',
      descripcion: 'Ver todas las colmenas'
    },
    {
      id: 'divider1',
      tipo: 'divider'
    },
    {
      id: 'perfil',
      titulo: 'Mi Perfil',
      icono: '👤',
      ruta: '/perfil',
      descripcion: 'Configurar perfil'
    }
  ];

  const manejarClick = (item) => {
    if (item.ruta) {
      onNavegar(item.ruta);
      onCerrar(); // Cerrar sidebar en móviles
    }
  };

  const esRutaActiva = (ruta) => {
    if (ruta === '/dashboard') {
      return rutaActiva === '/' || rutaActiva === '/dashboard';
    }
    return rutaActiva === ruta || rutaActiva.startsWith(ruta + '/');
  };

  return (
    <aside className={`sidebar ${abierto ? 'open' : ''}`}>
      <div className="sidebar-content">
        {/* Header del sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="user-avatar">
              {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
            </div>
            <div className="user-details">
              <div className="user-name">
                {usuario?.nombre} {usuario?.apellido}
              </div>
              <div className="user-role">
                {usuario?.rol_nombre || 'Apicultor'}
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(item => {
              if (item.tipo === 'divider') {
                return (
                  <li key={item.id} className="nav-divider">
                    <hr />
                  </li>
                );
              }

              const activo = esRutaActiva(item.ruta);

              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${activo ? 'active' : ''}`}
                    onClick={() => manejarClick(item)}
                    title={item.descripcion}
                  >
                    <span className="nav-icon">{item.icono}</span>
                    <span className="nav-text">{item.titulo}</span>
                    {activo && <span className="nav-indicator"></span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del sidebar */}
        <div className="sidebar-footer">
          <div className="app-info">
            <div className="app-version">
              SmartBee v1.0
            </div>
            <div className="app-description">
              Sistema de gestión apícola
            </div>
          </div>
          
          {/* Enlaces adicionales */}
          <div className="footer-links">
            <button className="footer-link" title="Ayuda">
              ❓ Ayuda
            </button>
            <button className="footer-link" title="Configuración">
              ⚙️ Configuración
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;