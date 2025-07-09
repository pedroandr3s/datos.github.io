import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, usuario, onLogout }) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarAbierto(!sidebarAbierto);
  };

  const cerrarSidebar = () => {
    setSidebarAbierto(false);
  };

  return (
    <div className="layout">
      <Header 
        usuario={usuario}
        onLogout={onLogout}
        onToggleSidebar={toggleSidebar}
        sidebarAbierto={sidebarAbierto}
      />
      
      <div className="layout-content">
        <Sidebar 
          usuario={usuario}
          abierto={sidebarAbierto}
          onCerrar={cerrarSidebar}
          rutaActiva={location.pathname}
          onNavegar={navigate}
        />
        
        <main className={`main-content ${sidebarAbierto ? 'sidebar-open' : ''}`}>
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay para cerrar sidebar en móviles */}
      {sidebarAbierto && (
        <div 
          className="sidebar-overlay"
          onClick={cerrarSidebar}
        />
      )}
    </div>
  );
};

export default Layout;