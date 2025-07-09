import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, BarChart3, Users, Home, Package, FileText, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { 
      path: '/', 
      name: 'Dashboard', 
      icon: BarChart3, 
      description: 'Resumen general',
      color: 'text-blue-600'
    },
    { 
      path: '/usuarios', 
      name: 'Usuarios', 
      icon: Users, 
      description: 'Gestión de usuarios',
      color: 'text-purple-600'
    },
    { 
      path: '/apiarios', 
      name: 'Apiarios', 
      icon: Home, 
      description: 'Ubicaciones de colmenas',
      color: 'text-green-600'
    },
    { 
      path: '/colmenas', 
      name: 'Colmenas', 
      icon: Package, 
      description: 'Administrar colmenas',
      color: 'text-yellow-600'
    },
    { 
      path: '/revisiones', 
      name: 'Revisiones', 
      icon: FileText, 
      description: 'Registro de inspecciones',
      color: 'text-indigo-600'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
            <div className="flex items-center">
              <div className="text-2xl mr-2">🐝</div>
              <h2 className="text-lg font-semibold text-gray-900">SmartBee</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navegación Principal
              </h3>
              
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`group flex items-start px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-bee-yellow to-bee-orange text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:transform hover:scale-102'
                    }`}
                  >
                    <Icon 
                      className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors ${
                        active ? 'text-white' : item.color
                      }`} 
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className={`text-xs mt-1 ${
                        active ? 'text-white opacity-90' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    
                    {active && (
                      <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Sección adicional */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Sistema
              </h3>
              
              <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                <Settings className="h-5 w-5 mr-3 text-gray-500" />
                <span>Configuración</span>
              </button>
              
              <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center">
              <div className="text-3xl mr-3 animate-bounce-slow">🍯</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">SmartBee v1.0</p>
                <p className="text-xs text-gray-600">Sistema Apícola Inteligente</p>
              </div>
            </div>
            
            {/* Estadística rápida */}
            <div className="mt-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Estado:</span>
                <span className="text-green-600 font-semibold">✅ Operativo</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;