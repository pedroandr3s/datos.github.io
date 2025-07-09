import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Apiarios from './pages/Apiarios';
import Colmenas from './pages/Colmenas';
import Revisiones from './pages/Revisiones';
import { ApiProvider } from './context/ApiContext';

// Componente de navegación simple
const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: '📊' },
    { path: '/usuarios', name: 'Usuarios', icon: '👥' },
    { path: '/apiarios', name: 'Apiarios', icon: '🏠' },
    { path: '/colmenas', name: 'Colmenas', icon: '🏺' },
    { path: '/revisiones', name: 'Revisiones', icon: '📝' }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-3xl mr-3 animate-pulse">🐝</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">SmartBee</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Sistema Apícola</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-2 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-yellow-100 text-yellow-800 border-r-4 border-yellow-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <ApiProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/apiarios" element={<Apiarios />} />
              <Route path="/colmenas" element={<Colmenas />} />
              <Route path="/revisiones" element={<Revisiones />} />
            </Routes>
          </main>

          {/* Footer simple */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🍯</span>
                  <span className="text-sm">SmartBee v1.0 - Sistema de Gestión Apícola</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ApiProvider>
  );
}

export default App;