import React, { useState, useEffect } from 'react';
import { apiariosAPI, manejarError } from '../../services/api';

const ListaApiarios = ({ usuario, onSeleccionarApiario, onEditarApiario, onEliminarApiario }) => {
  const [apiarios, setApiarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
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

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filtrar apiarios
  const apiariosFiltrados = apiarios.filter(apiario =>
    apiario.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    apiario.ubicacion.toLowerCase().includes(filtro.toLowerCase())
  );

  if (cargando) {
    return (
      <div className="lista-loading">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando apiarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-error">
        <p>Error al cargar apiarios: {error.mensaje}</p>
        <button onClick={cargarApiarios} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="lista-apiarios">
      {/* Filtros */}
      <div className="filtros-apiarios">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar apiarios..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="stats-summary">
          <span className="stat">
            📊 {apiariosFiltrados.length} de {apiarios.length} apiarios
          </span>
        </div>
      </div>

      {/* Lista de apiarios */}
      {apiariosFiltrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏡</div>
          <h3>
            {filtro ? 'No se encontraron apiarios' : 'No hay apiarios registrados'}
          </h3>
          <p>
            {filtro 
              ? 'Intenta cambiar los términos de búsqueda'
              : 'Comienza creando tu primer apiario'
            }
          </p>
        </div>
      ) : (
        <div className="apiarios-list">
          {apiariosFiltrados.map(apiario => (
            <div 
              key={apiario.id} 
              className="apiario-item"
              onClick={() => onSeleccionarApiario && onSeleccionarApiario(apiario)}
            >
              <div className="apiario-header">
                <div className="apiario-title">
                  <h4>{apiario.nombre}</h4>
                  <span className="colmenas-count">
                    {apiario.total_colmenas || 0} colmenas
                  </span>
                </div>
                
                <div className="apiario-actions">
                  <button 
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditarApiario && onEditarApiario(apiario);
                    }}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarApiario && onEliminarApiario(apiario);
                    }}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="apiario-info">
                <div className="info-row">
                  <span className="info-icon">📍</span>
                  <span className="info-text">{apiario.ubicacion}</span>
                </div>
                
                {apiario.descripcion && (
                  <div className="info-row">
                    <span className="info-icon">📝</span>
                    <span className="info-text description">
                      {apiario.descripcion.length > 80 
                        ? `${apiario.descripcion.substring(0, 80)}...`
                        : apiario.descripcion
                      }
                    </span>
                  </div>
                )}
                
                <div className="info-row">
                  <span className="info-icon">📅</span>
                  <span className="info-text">
                    Creado: {formatearFecha(apiario.fecha_creacion)}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-icon">👤</span>
                  <span className="info-text">
                    {apiario.propietario_nombre} {apiario.propietario_apellido}
                  </span>
                </div>
              </div>

              <div className="apiario-stats">
                <div className="stat-badge">
                  <span className="stat-number">{apiario.total_colmenas || 0}</span>
                  <span className="stat-label">Colmenas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen estadístico */}
      <div className="apiarios-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-label">Total apiarios:</span>
            <span className="summary-value">{apiarios.length}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Total colmenas:</span>
            <span className="summary-value">
              {apiarios.reduce((total, apiario) => total + (apiario.total_colmenas || 0), 0)}
            </span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Promedio por apiario:</span>
            <span className="summary-value">
              {apiarios.length > 0 
                ? Math.round(apiarios.reduce((total, apiario) => total + (apiario.total_colmenas || 0), 0) / apiarios.length)
                : 0
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaApiarios;