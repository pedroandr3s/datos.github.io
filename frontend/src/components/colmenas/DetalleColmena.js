import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { colmenasAPI, revisionesAPI, manejarError } from '../../services/api';
import FormularioRevision from '../revisiones/FormularioRevision';

const DetalleColmena = ({ usuario }) => {
  const { id } = useParams();
  const [colmena, setColmena] = useState(null);
  const [revisiones, setRevisiones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormularioRevision, setMostrarFormularioRevision] = useState(false);
  const [tabActiva, setTabActiva] = useState('general');

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar información de la colmena
      const responseColmena = await colmenasAPI.obtenerColmena(id);
      setColmena(responseColmena);
      
      // Cargar revisiones
      const responseRevisiones = await revisionesAPI.obtenerRevisiones({ colmena_id: id });
      setRevisiones(responseRevisiones);
      
      // Cargar estadísticas
      const responseEstadisticas = await colmenasAPI.obtenerEstadisticas(id);
      setEstadisticas(responseEstadisticas);
      
      // Cargar alertas
      const responseAlertas = await revisionesAPI.obtenerAlertas(id);
      setAlertas(responseAlertas.alertas || []);
      
      setError(null);
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
    } finally {
      setCargando(false);
    }
  };

  const handleNuevaRevision = () => {
    setMostrarFormularioRevision(true);
  };

  const handleRevisionSubmit = async () => {
    setMostrarFormularioRevision(false);
    await cargarDatos();
  };

  const handleCerrarFormulario = () => {
    setMostrarFormularioRevision(false);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
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

  const obtenerColorAlerta = (tipo) => {
    switch (tipo) {
      case 'danger': return 'var(--danger-color)';
      case 'warning': return 'var(--warning-color)';
      case 'info': return 'var(--info-color)';
      default: return 'var(--gray-500)';
    }
  };

  if (cargando) {
    return (
      <div className="page-loading">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando detalle de colmena...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h3>Error al cargar la colmena</h3>
          <p>{error.mensaje}</p>
          <button onClick={cargarDatos} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!colmena) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h3>Colmena no encontrada</h3>
          <p>La colmena solicitada no existe o ha sido eliminada.</p>
          <button onClick={() => window.history.back()} className="btn btn-primary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-colmena">
      {/* Header */}
      <div className="detalle-header">
        <div className="header-content">
          <div className="colmena-title">
            <span 
              className="estado-icon" 
              style={{ color: obtenerColorEstado(colmena.estado) }}
            >
              {obtenerIconoEstado(colmena.estado)}
            </span>
            <h1>{colmena.nombre}</h1>
            <span className={`estado-badge ${colmena.estado}`}>
              {colmena.estado}
            </span>
          </div>
          <div className="apiario-info">
            <span className="apiario-name">
              🏡 {colmena.apiario_nombre}
            </span>
            <span className="apiario-location">
              📍 {colmena.apiario_ubicacion}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => window.history.back()}
          >
            ← Volver
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleNuevaRevision}
          >
            📝 Nueva Revisión
          </button>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="alertas-section">
          <h3>🚨 Alertas</h3>
          <div className="alertas-grid">
            {alertas.map((alerta, index) => (
              <div 
                key={index} 
                className={`alerta ${alerta.tipo}`}
                style={{ borderLeftColor: obtenerColorAlerta(alerta.tipo) }}
              >
                <div className="alerta-content">
                  <p>{alerta.mensaje}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab ${tabActiva === 'general' ? 'active' : ''}`}
            onClick={() => setTabActiva('general')}
          >
            📊 General
          </button>
          <button 
            className={`tab ${tabActiva === 'revisiones' ? 'active' : ''}`}
            onClick={() => setTabActiva('revisiones')}
          >
            📝 Revisiones
          </button>
          <button 
            className={`tab ${tabActiva === 'sensores' ? 'active' : ''}`}
            onClick={() => setTabActiva('sensores')}
          >
            📈 Sensores
          </button>
        </div>

        <div className="tab-content">
          {/* Tab General */}
          {tabActiva === 'general' && (
            <div className="general-tab">
              <div className="general-grid">
                {/* Información básica */}
                <div className="info-card">
                  <h3>ℹ️ Información Básica</h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Tipo:</span>
                      <span className="info-value">{colmena.tipo}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Estado:</span>
                      <span className="info-value">{colmena.estado}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Fecha instalación:</span>
                      <span className="info-value">{formatearFecha(colmena.fecha_instalacion)}</span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                {estadisticas && (
                  <div className="stats-card">
                    <h3>📈 Estadísticas</h3>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-number">{estadisticas.total_revisiones || 0}</div>
                        <div className="stat-label">Revisiones</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-number">{Math.round(estadisticas.promedio_alzas || 0)}</div>
                        <div className="stat-label">Promedio Alzas</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-number">{Math.round(estadisticas.promedio_marcos_abejas || 0)}</div>
                        <div className="stat-label">Promedio Marcos</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Últimas revisiones */}
                <div className="revisiones-recientes-card">
                  <h3>📝 Últimas Revisiones</h3>
                  {revisiones.length === 0 ? (
                    <div className="empty-state-small">
                      <p>No hay revisiones registradas</p>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={handleNuevaRevision}
                      >
                        Crear Primera Revisión
                      </button>
                    </div>
                  ) : (
                    <div className="revisiones-mini-list">
                      {revisiones.slice(0, 3).map(revision => (
                        <div key={revision.id} className="revision-mini-item">
                          <div className="revision-fecha">
                            {formatearFechaCorta(revision.fecha_revision)}
                          </div>
                          <div className="revision-resumen">
                            <span>🏠 {revision.num_alzas} alzas</span>
                            <span>🐝 {revision.marcos_abejas} marcos</span>
                            {revision.presencia_varroa === 'si' && (
                              <span className="warning">⚠️ Varroa</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Revisiones */}
          {tabActiva === 'revisiones' && (
            <div className="revisiones-tab">
              <div className="revisiones-header">
                <h3>📝 Historial de Revisiones</h3>
                <button 
                  className="btn btn-primary"
                  onClick={handleNuevaRevision}
                >
                  + Nueva Revisión
                </button>
              </div>

              {revisiones.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No hay revisiones registradas</h3>
                  <p>Comienza registrando la primera revisión de esta colmena</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleNuevaRevision}
                  >
                    Crear Primera Revisión
                  </button>
                </div>
              ) : (
                <div className="revisiones-list">
                  {revisiones.map(revision => (
                    <div key={revision.id} className="revision-card">
                      <div className="revision-header">
                        <h4>{formatearFecha(revision.fecha_revision)}</h4>
                        <div className="revision-actions">
                          <button className="btn-icon" title="Editar">
                            ✏️
                          </button>
                          <button className="btn-icon danger" title="Eliminar">
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="revision-content">
                        <div className="revision-datos">
                          <div className="dato-item">
                            <span className="dato-label">Alzas:</span>
                            <span className="dato-valor">{revision.num_alzas}</span>
                          </div>
                          <div className="dato-item">
                            <span className="dato-label">Marcos con abejas:</span>
                            <span className="dato-valor">{revision.marcos_abejas}</span>
                          </div>
                          <div className="dato-item">
                            <span className="dato-label">Marcos con cría:</span>
                            <span className="dato-valor">{revision.marcos_cria}</span>
                          </div>
                          <div className="dato-item">
                            <span className="dato-label">Marcos con alimento:</span>
                            <span className="dato-valor">{revision.marcos_alimento}</span>
                          </div>
                          <div className="dato-item">
                            <span className="dato-label">Marcos con polen:</span>
                            <span className="dato-valor">{revision.marcos_polen}</span>
                          </div>
                        </div>

                        <div className="revision-estado">
                          <div className={`estado-item ${revision.presencia_varroa === 'si' ? 'warning' : 'success'}`}>
                            <span>Varroa: {revision.presencia_varroa === 'si' ? '⚠️ Detectada' : '✅ No detectada'}</span>
                          </div>
                          <div className="estado-item">
                            <span>Reina: {revision.condicion_reina}</span>
                          </div>
                        </div>

                        {revision.producto_sanitario && (
                          <div className="revision-tratamiento">
                            <strong>Tratamiento:</strong> {revision.producto_sanitario}
                            {revision.dosis_sanitario && ` (${revision.dosis_sanitario})`}
                          </div>
                        )}

                        {revision.notas && (
                          <div className="revision-notas">
                            <strong>Notas:</strong> {revision.notas}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Sensores */}
          {tabActiva === 'sensores' && (
            <div className="sensores-tab">
              <div className="sensores-placeholder">
                <div className="placeholder-icon">📈</div>
                <h3>Monitoreo de Sensores</h3>
                <p>
                  Esta funcionalidad estará disponible cuando conectes sensores IoT a tu colmena.
                  Podrás monitorear temperatura, humedad y peso en tiempo real.
                </p>
                <button className="btn btn-outline" disabled>
                  Próximamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de nueva revisión */}
      {mostrarFormularioRevision && (
        <div className="modal-overlay">
          <div className="modal large">
            <FormularioRevision
              colmena={colmena}
              onSubmit={handleRevisionSubmit}
              onCancelar={handleCerrarFormulario}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleColmena;