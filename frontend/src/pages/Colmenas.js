import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { colmenasAPI, apiariosAPI, manejarError } from '../services/api';
import FormularioColmena from '../components/colmenas/FormularioColmena';

const Colmenas = ({ usuario }) => {
  const { apiarioId } = useParams();
  const [colmenas, setColmenas] = useState([]);
  const [apiario, setApiario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [colmenaEditar, setColmenaEditar] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    cargarDatos();
  }, [apiarioId, usuario]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar colmenas
      const responseColmenas = await colmenasAPI.obtenerColmenas(apiarioId);
      setColmenas(responseColmenas);
      
      // Si hay apiarioId específico, cargar información del apiario
      if (apiarioId) {
        const responseApiario = await apiariosAPI.obtenerApiario(apiarioId);
        setApiario(responseApiario);
      }
      
      setError(null);
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearColmena = () => {
    setColmenaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarColmena = (colmena) => {
    setColmenaEditar(colmena);
    setMostrarFormulario(true);
  };

  const handleEliminarColmena = async (colmena) => {
    if (!window.confirm(`¿Estás seguro de eliminar la colmena "${colmena.nombre}"?`)) {
      return;
    }

    try {
      await colmenasAPI.eliminarColmena(colmena.id);
      await cargarDatos();
      alert('Colmena eliminada exitosamente');
    } catch (err) {
      const errorInfo = manejarError(err);
      alert(`Error al eliminar: ${errorInfo.mensaje}`);
    }
  };

  const handleFormularioSubmit = async () => {
    setMostrarFormulario(false);
    setColmenaEditar(null);
    await cargarDatos();
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setColmenaEditar(null);
  };

  const handleVerDetalle = (colmena) => {
    window.location.href = `/colmena/${colmena.id}`;
  };

  // Filtrar colmenas
  const colmenasFiltradas = colmenas.filter(colmena => {
    const cumpleFiltroTexto = colmena.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                             colmena.apiario_nombre?.toLowerCase().includes(filtro.toLowerCase());
    
    const cumpleFiltroEstado = filtroEstado === 'todas' || colmena.estado === filtroEstado;
    
    return cumpleFiltroTexto && cumpleFiltroEstado;
  });

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

  if (cargando) {
    return (
      <div className="page-loading">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando colmenas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="colmenas-page">
      {/* Header de la página */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            🍯 {apiario ? `Colmenas de ${apiario.nombre}` : 'Todas las Colmenas'}
          </h1>
          <p className="page-subtitle">
            {apiario 
              ? `${apiario.ubicacion} - ${colmenasFiltradas.length} colmenas`
              : `Gestiona todas las colmenas - ${colmenasFiltradas.length} total`
            }
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCrearColmena}
          >
            + Nueva Colmena
          </button>
        </div>
      </div>

      {/* Información del apiario (si aplica) */}
      {apiario && (
        <div className="apiario-info-card">
          <div className="info-header">
            <h3>📍 Información del Apiario</h3>
          </div>
          <div className="info-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Ubicación:</span>
                <span className="info-value">{apiario.ubicacion}</span>
              </div>
              {apiario.descripcion && (
                <div className="info-item">
                  <span className="info-label">Descripción:</span>
                  <span className="info-value">{apiario.descripcion}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Creado:</span>
                <span className="info-value">{formatearFecha(apiario.fecha_creacion)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="page-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar colmenas por nombre..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-controls">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="form-select"
          >
            <option value="todas">Todas las colmenas</option>
            <option value="activa">Solo activas</option>
            <option value="inactiva">Solo inactivas</option>
          </select>
        </div>
        
        <div className="filter-stats">
          <span className="stat">
            📊 {colmenasFiltradas.length} de {colmenas.length} colmenas
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      {error ? (
        <div className="error-container">
          <div className="error-content">
            <h3>Error al cargar colmenas</h3>
            <p>{error.mensaje}</p>
            <button 
              className="btn btn-primary"
              onClick={cargarDatos}
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : colmenasFiltradas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍯</div>
          <h3>
            {filtro || filtroEstado !== 'todas' 
              ? 'No se encontraron colmenas' 
              : (apiario ? 'No hay colmenas en este apiario' : 'No tienes colmenas registradas')
            }
          </h3>
          <p>
            {filtro || filtroEstado !== 'todas'
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Comienza registrando tu primera colmena para hacer seguimiento'
            }
          </p>
          {!filtro && filtroEstado === 'todas' && (
            <button 
              className="btn btn-primary"
              onClick={handleCrearColmena}
            >
              Registrar Primera Colmena
            </button>
          )}
        </div>
      ) : (
        <div className="colmenas-grid">
          {colmenasFiltradas.map(colmena => (
            <div key={colmena.id} className="colmena-card">
              <div className="card-header">
                <div className="colmena-title">
                  <span className="estado-icon" style={{ color: obtenerColorEstado(colmena.estado) }}>
                    {obtenerIconoEstado(colmena.estado)}
                  </span>
                  <h3 className="colmena-nombre">{colmena.nombre}</h3>
                  <span className={`estado-badge ${colmena.estado}`}>
                    {colmena.estado}
                  </span>
                </div>
                <div className="card-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleVerDetalle(colmena)}
                    title="Ver detalles"
                  >
                    👁️
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => handleEditarColmena(colmena)}
                    title="Editar colmena"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon danger"
                    onClick={() => handleEliminarColmena(colmena)}
                    title="Eliminar colmena"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="colmena-info">
                  {!apiario && (
                    <div className="info-item">
                      <span className="info-icon">🏡</span>
                      <span className="info-text">{colmena.apiario_nombre}</span>
                    </div>
                  )}
                  
                  <div className="info-item">
                    <span className="info-icon">📦</span>
                    <span className="info-text">Tipo: {colmena.tipo}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <span className="info-text">
                      Instalada: {formatearFecha(colmena.fecha_instalacion)}
                    </span>
                  </div>
                  
                  {colmena.ultima_revision && (
                    <div className="info-item">
                      <span className="info-icon">📝</span>
                      <span className="info-text">
                        Última revisión: {formatearFecha(colmena.ultima_revision)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="colmena-stats">
                  <div className="stat-item">
                    <div className="stat-number">{colmena.total_revisiones || 0}</div>
                    <div className="stat-label">Revisiones</div>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => handleVerDetalle(colmena)}
                  style={{ flex: 1, marginRight: 'var(--spacing-sm)' }}
                >
                  Ver Detalles
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = `/colmena/${colmena.id}/revision`}
                  style={{ flex: 1 }}
                >
                  Nueva Revisión
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
            <FormularioColmena
              colmena={colmenaEditar}
              apiarioId={apiarioId}
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

export default Colmenas;