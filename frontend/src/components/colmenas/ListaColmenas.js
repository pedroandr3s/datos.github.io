import React, { useState, useEffect } from 'react';
import { colmenasAPI, manejarError } from '../../services/api';

const ListaColmenas = ({ apiarioId, onSeleccionarColmena, onEditarColmena, onEliminarColmena }) => {
  const [colmenas, setColmenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    cargarColmenas();
  }, [apiarioId]);

  const cargarColmenas = async () => {
    try {
      setCargando(true);
      const response = await colmenasAPI.obtenerColmenas(apiarioId);
      setColmenas(response);
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

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'activa': return 'var(--success-color)';
      case 'inactiva': return 'var(--gray-400)';
      default: return 'var(--gray-400)';
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'activa': return '🐝';
      case 'inactiva': return '💤';
      default: return '❓';
    }
  };

  // Filtrar colmenas
  const colmenasFiltradas = colmenas.filter(colmena => {
    const cumpleFiltroTexto = colmena.nombre.toLowerCase().includes(filtro.toLowerCase());
    const cumpleFiltroEstado = filtroEstado === 'todas' || colmena.estado === filtroEstado;
    return cumpleFiltroTexto && cumpleFiltroEstado;
  });

  if (cargando) {
    return (
      <div className="lista-loading">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando colmenas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-error">
        <p>Error al cargar colmenas: {error.mensaje}</p>
        <button onClick={cargarColmenas} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="lista-colmenas">
      {/* Filtros */}
      <div className="filtros-colmenas">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar colmenas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="form-select"
        >
          <option value="todas">Todas</option>
          <option value="activa">Activas</option>
          <option value="inactiva">Inactivas</option>
        </select>
      </div>

      {/* Lista de colmenas */}
      {colmenasFiltradas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍯</div>
          <h3>
            {filtro || filtroEstado !== 'todas' 
              ? 'No se encontraron colmenas' 
              : 'No hay colmenas registradas'
            }
          </h3>
          <p>
            {filtro || filtroEstado !== 'todas'
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Comienza registrando la primera colmena'
            }
          </p>
        </div>
      ) : (
        <div className="colmenas-list">
          {colmenasFiltradas.map(colmena => (
            <div 
              key={colmena.id} 
              className="colmena-item"
              onClick={() => onSeleccionarColmena && onSeleccionarColmena(colmena)}
            >
              <div className="colmena-header">
                <div className="colmena-title">
                  <span 
                    className="estado-icon" 
                    style={{ color: obtenerColorEstado(colmena.estado) }}
                  >
                    {obtenerIconoEstado(colmena.estado)}
                  </span>
                  <h4>{colmena.nombre}</h4>
                  <span className={`estado-badge ${colmena.estado}`}>
                    {colmena.estado}
                  </span>
                </div>
                
                <div className="colmena-actions">
                  <button 
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditarColmena && onEditarColmena(colmena);
                    }}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarColmena && onEliminarColmena(colmena);
                    }}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="colmena-info">
                <div className="info-row">
                  <span className="info-label">Tipo:</span>
                  <span className="info-value">{colmena.tipo}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Instalada:</span>
                  <span className="info-value">{formatearFecha(colmena.fecha_instalacion)}</span>
                </div>
                
                {colmena.ultima_revision && (
                  <div className="info-row">
                    <span className="info-label">Última revisión:</span>
                    <span className="info-value">{formatearFecha(colmena.ultima_revision)}</span>
                  </div>
                )}
                
                <div className="info-row">
                  <span className="info-label">Revisiones:</span>
                  <span className="info-value">{colmena.total_revisiones || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      <div className="colmenas-stats">
        <div className="stat">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{colmenas.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Activas:</span>
          <span className="stat-value">
            {colmenas.filter(c => c.estado === 'activa').length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Inactivas:</span>
          <span className="stat-value">
            {colmenas.filter(c => c.estado === 'inactiva').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListaColmenas;