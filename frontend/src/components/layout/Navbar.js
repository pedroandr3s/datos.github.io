import React from 'react';
import { Menu, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useApi } from '../../context/ApiContext';

const Navbar = ({ onMenuClick }) => {
  const { isConnected, testConnection, loading } = useApi();

  const handleConnectionTest = async () => {
    try {
      await testConnection();
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bee-yellow"
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center ml-4 md:ml-0">
              <div className="text-4xl mr-3 animate-buzz">🐝</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-bee-yellow to-bee-orange bg-clip-text text-transparent">
                  SmartBee
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">Sistema de Gestión Apícola</p>
              </div>
            </div>
          </div>

          {/* Estado de conexión y acciones */}
          <div className="flex items-center space-x-3">
            {/* Indicador de tiempo real */}
            <div className="hidden md:block text-sm text-gray-500">
              {new Date().toLocaleTimeString('es-ES')}
            </div>

            {/* Botón de prueba de conexión */}
            <button
              onClick={handleConnectionTest}
              disabled={loading}
              className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                isConnected
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isConnected ? 'Conectado a Railway' : 'Desconectado - Click para reconectar'}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Probando...</span>
                </>
              ) : isConnected ? (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Conectado</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Desconectado</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full ml-2 animate-pulse"></div>
                </>
              )}
            </button>

            {/* Información del usuario (opcional) */}
            <div className="hidden lg:flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 bg-bee-yellow rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="ml-2">Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de estado adicional */}
      {!isConnected && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-red-800 text-center">
              ⚠️ Sin conexión al servidor. Los datos pueden no estar actualizados.
              <button 
                onClick={handleConnectionTest}
                className="ml-2 underline hover:no-underline"
              >
                Intentar reconectar
              </button>
            </p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;