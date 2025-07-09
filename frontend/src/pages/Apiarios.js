import React, { useState, useEffect } from 'react';
import { apiariosAPI, manejarError } from '../services/api';
import FormularioApiario from '../components/apiarios/FormularioApiario';

const Apiarios = ({ usuario }) => {
  const [apiarios, setApiarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [apiarioEditar, setApiarioEditar] = useState(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarApiarios();
  }, [usuario]);

  const cargarApiarios = async () => {
    try {
      setCargando(true);
      const response = await apiariosAPI.obtenerApiarios(usuario?.id);
      setApiarios(response);
      setError(null);
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearApiario = () => {
    setApiarioEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarApiario = (apiario) => {
    setApiarioEditar(apiario);
    setMostrarFormulario(true);
  };

  const handleEliminarApiario = async (apiario) => {
    if (!window.confirm(`¿Estás seguro de eliminar el apiario "${apiario.nombre}"?`)) {
      return;
    }

    try {
      await apiariosAPI.eliminarApiario(apiario.id);
      await cargarApiarios();
      alert('Apiario eliminado exitosamente');
    } catch (err) {
      const errorInfo = manejarError(err);
      alert(`Error al eliminar: ${errorInfo.mensaje}`);
    }
  };

  const handleFormularioSubmit = async () => {
    setMostrarFormulario(false);
    setApiarioEditar(null);
    await cargarApiarios();
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setApiarioEditar(null);
  };

  const apiariosFiltrados = apiarios.filter(apiario =>
    apiario.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    apiario.ubicacion.toLowerCase().includes(filtro.toLowerCase())
  );

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (cargando) {
    return (
      <div className="page-loading">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando apiarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apiarios-page">
      {/* Header de la página */}
      <div className="page-header">
        <div className="header-content">
          <h1>🏡 Mis Apiarios</h1>
          <p className="page-subtitle">
            Gestiona las ubicaciones de tus colmenas
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCrearApiario}
          >
            + Nuevo Apiario
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="page-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar apiarios por nombre o ubicación..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-stats">
          <span className="stat">
            📊 {apiariosFiltrados.length} de {apiarios.length} apiarios
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      {error ? (
        <div className="error-container">
          <div className="error-content">
            <h3>Error al cargar apiarios</h3>
            <p>{error.mensaje}</p>
            <button 
              className="btn btn-primary"
              onClick={cargarApiarios}
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : apiariosFiltrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏡</div>
          <h3>
            {filtro ? 'No se encontraron apiarios' : 'No tienes apiarios registrados'}
          </h3>
          <p>
            {filtro 
              ? 'Intenta cambiar los términos de búsqueda'
              : 'Comienza creando tu primer apiario para organizar tus colmenas'
            }
          </p>
          {!filtro && (
            <button 
              className="btn btn-primary"
              onClick={handleCrearApiario}
            >
              Crear Primer Apiario
            </button>
          )}
        </div>
      ) : (
        <div className="apiarios-grid">
          {apiariosFiltrados.map(apiario => (
            <div key={apiario.id} className="apiario-card">
              <div className="card-header">
                <h3 className="apiario-nombre">{apiario.nombre}</h3>
                <div className="card-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleEditarApiario(apiario)}
                    title="Editar apiario"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon danger"
                    onClick={() => handleEliminarApiario(apiario)}
                    title="Eliminar apiario"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="apiario-info">
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <span className="info-text">{apiario.ubicacion}</span>
                  </div>
                  
                  {apiario.descripcion && (
                    <div className="info-item">
                      <span className="info-icon">📝</span>
                      <span className="info-text">{apiario.descripcion}</span>
                    </div>
                  )}
                  
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <span className="info-text">
                      Creado: {formatearFecha(apiario.fecha_creacion)}
                    </span>
                  </div>
                </div>

                <div className="apiario-stats">
                  <div className="stat-item">
                    <div className="stat-number">{apiario.total_colmenas || 0}</div>
                    <div className="stat-label">Colmenas</div>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn btn-outline full-width"
                  onClick={() => window.location.href = `/colmenas/${apiario.id}`}
                >
                  Ver Colmenas 🍯
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal del formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <FormularioApiario
              apiario={apiarioEditar}
              usuario={usuario}
              onSubmit={handleFormularioSubmit}
              onCancelar={handleCerrarFormulario}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Apiarios;