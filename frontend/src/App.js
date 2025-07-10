import React, { useState } from 'react';
import { ApiProvider } from './context/ApiContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Colmenas from './pages/Colmenas';
import Revisiones from './pages/Revisiones';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'usuarios':
        return <Usuarios />;
      case 'colmenas':
        return <Colmenas />;
      case 'revisiones':
        return <Revisiones />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ApiProvider>
      <div className="app">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="main-content">
          <Navbar />
          <div className="page-container">
            {renderPage()}
          </div>
        </div>
      </div>
    </ApiProvider>
  );
}

export default App;