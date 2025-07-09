import React, { useState, useEffect } from 'react';
import { colmenasAPI, manejarError } from '../services/api';

const Dashboard = ({ usuario }) => {
  const [colmenas, setColmenas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar colmenas directamente desde tu API
      const responseColmenas = await colmenasAPI.obtenerColmenas();
      setColmenas(responseColmenas);
      
      // Crear estadísticas basadas en las colmenas
      const stats = {
        estadisticas: {
          usuarios: 1, // placeholder
          colmenas: responseColmenas.length,
          ubicaciones: [...new Set(responseColmenas.map(c => c.apiario_nombre))].length,
          nodos: 0
        },
        ultimasColmenas: responseColmenas.slice(0, 5).map(colmena => ({
          ...colmena,
          colmena_nombre: colmena.nombre,
          apiario_nombre: colmena.apiario_nombre,
          fecha_revision: colmena.fecha_instalacion,
          num_alzas: Math.floor(Math.random() * 5) + 1,
          marcos_abejas: Math.floor(Math.random() * 10) + 1,
          presencia_varroa: Math.random() > 0.7 ? 'si' : 'no'
        }))
      };
      
      setEstadisticas(stats);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <h2>Error al cargar el dashboard</h2>
          <p>{error.mensaje}</p>
          <button 
            className="btn btn-primary"
            onClick={cargarEstadisticas}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>¡Bienvenido, {usuario?.nombre}! 🐝</h1>
          <p className="welcome-subtitle">
            Aquí tienes un resumen de tu actividad apícola
          </p>
        </div>
        <div className="date-section">
          <div className="current-date">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card apiarios">
          <div className="stat-icon">🏡</div>
          <div className="stat-content">
            <h3>Apiarios</h3>
            <div className="stat-number">
              {estadisticas?.estadisticas?.apiarios || 0}
            </div>
            <p className="stat-description">Total de apiarios registrados</p>
          </div>
        </div>

        <div className="stat-card colmenas">
          <div className="stat-icon">🍯</div>
          <div className="stat-content">
            <h3>Colmenas</h3>
            <div className="stat-number">
              {estadisticas?.estadisticas?.colmenas || 0}
            </div>
            <p className="stat-description">Colmenas bajo monitoreo</p>
          </div>
        </div>

        <div className="stat-card usuarios">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Usuarios</h3>
            <div className="stat-number">
              {estadisticas?.estadisticas?.usuarios || 0}
            </div>
            <p className="stat-description">Usuarios en el sistema</p>
          </div>
        </div>

        <div className="stat-card productividad">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Productividad</h3>
            <div className="stat-number">95%</div>
            <p className="stat-description">Eficiencia promedio</p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="dashboard-content">
        {/* Últimas Revisiones */}
        <div className="content-section">
          <div className="section-header">
            <h2>📋 Últimas Colmenas</h2>
            <button className="btn btn-outline">Ver todas</button>
          </div>
          
          <div className="revisiones-recientes">
            {estadisticas?.ultimasColmenas?.length > 0 ? (
              estadisticas.ultimasColmenas.map(colmena => (
                <div key={colmena.id} className="revision-card">
                  <div className="revision-info">
                    <h4>{colmena.colmena_nombre}</h4>
                    <p className="apiario-name">{colmena.apiario_nombre}</p>
                    <div className="revision-details">
                      <span className="detail">
                        🏠 {colmena.num_alzas || 0} alzas
                      </span>
                      <span className="detail">
                        🐝 {colmena.marcos_abejas || 0} marcos con abejas
                      </span>
                      {colmena.presencia_varroa === 'si' && (
                        <span className="detail warning">
                          ⚠️ Varroa detectada
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="revision-fecha">
                    {formatearFecha(colmena.fecha_revision)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No hay colmenas registradas</h3>
                <p>Comienza registrando tu primera colmena en el sistema</p>
                <button className="btn btn-primary">
                  Nueva Colmena
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="content-section">
          <div className="section-header">
            <h2>⚡ Acciones Rápidas</h2>
          </div>
          
          <div className="acciones-grid">
            <button className="accion-card nueva-revision">
              <div className="accion-icon">📝</div>
              <h3>Nueva Revisión</h3>
              <p>Registrar inspección de colmena</p>
            </button>

            <button className="accion-card nuevo-apiario">
              <div className="accion-icon">🏡</div>
              <h3>Nuevo Apiario</h3>
              <p>Agregar ubicación de colmenas</p>
            </button>

            <button className="accion-card nueva-colmena">
              <div className="accion-icon">🍯</div>
              <h3>Nueva Colmena</h3>
              <p>Registrar nueva colonia</p>
            </button>

            <button className="accion-card reportes">
              <div className="accion-icon">📊</div>
              <h3>Ver Reportes</h3>
              <p>Análisis y estadísticas</p>
            </button>
          </div>
        </div>

        {/* Alertas y Notificaciones */}
        <div className="content-section">
          <div className="section-header">
            <h2>🔔 Alertas y Recordatorios</h2>
          </div>
          
          <div className="alertas-container">
            <div className="alerta warning">
              <div className="alerta-icon">⚠️</div>
              <div className="alerta-content">
                <h4>Revisión Pendiente</h4>
                <p>Colmena "Reina Victoria" requiere revisión (último control hace 15 días)</p>
              </div>
              <button className="alerta-action">Ver</button>
            </div>

            <div className="alerta info">
              <div className="alerta-icon">💡</div>
              <div className="alerta-content">
                <h4>Condiciones Climáticas</h4>
                <p>Temperatura óptima para revisión hoy (22°C, viento suave)</p>
              </div>
              <button className="alerta-action">Ok</button>
            </div>

            <div className="alerta success">
              <div className="alerta-icon">✅</div>
              <div className="alerta-content">
                <h4>Tratamiento Completado</h4>
                <p>Apiario "Los Naranjos" completó tratamiento anti-varroa</p>
              </div>
              <button className="alerta-action">Ver</button>
            </div>
          </div>
        </div>
      </div>

      {/* Clima Widget */}
      <div className="weather-widget">
        <div className="weather-header">
          <h3>🌤️ Clima Actual</h3>
          <span className="location">Coronel, Biobío</span>
        </div>
        <div className="weather-content">
          <div className="temperature">18°C</div>
          <div className="conditions">Parcialmente nublado</div>
          <div className="details">
            <span>💨 Viento: 12 km/h</span>
            <span>💧 Humedad: 65%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;