import React, { useState, useEffect, useCallback } from 'react';
import { usuariosAPI, manejarError } from '../services/api';

const Perfil = ({ usuario }) => {
  const [datos, setDatos] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState({});
  const [mostrarCambiarPassword, setMostrarCambiarPassword] = useState(false);

  // Memoized function to avoid useEffect dependency issues
  const cargarPerfil = useCallback(async () => {
    try {
      setCargando(true);
      const response = await usuariosAPI.obtenerPerfil(usuario.id);
      setDatos({
        nombre: response.nombre || '',
        apellido: response.apellido || '',
        email: response.email || '',
        telefono: response.telefono || ''
      });
      setError(null);
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
    } finally {
      setCargando(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    if (usuario?.id) {
      cargarPerfil();
    }
  }, [usuario?.id, cargarPerfil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datos.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!datos.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio';
    }

    if (!datos.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(datos.email)) {
      nuevosErrores.email = 'El email no es válido';
    }

    // Fixed regex - removed unnecessary escape characters
    if (datos.telefono && !/^\+?[\d\s\-()]+$/.test(datos.telefono)) {
      nuevosErrores.telefono = 'El teléfono no es válido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);
      await usuariosAPI.actualizarPerfil(usuario.id, datos);
      
      setMensaje({
        tipo: 'success',
        texto: 'Perfil actualizado exitosamente'
      });
      
      // Actualizar datos en localStorage si es necesario
      const usuarioActualizado = { ...usuario, ...datos };
      localStorage.setItem('smartbee_usuario', JSON.stringify(usuarioActualizado));
      
    } catch (err) {
      const errorInfo = manejarError(err);
      setMensaje({
        tipo: 'error',
        texto: errorInfo.mensaje
      });
    } finally {
      setGuardando(false);
    }
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

  if (cargando) {
    return (
      <div className="page-loading">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      {/* Header de la página */}
      <div className="page-header">
        <div className="header-content">
          <h1>👤 Mi Perfil</h1>
          <p className="page-subtitle">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      <div className="perfil-container">
        {/* Tarjeta de información básica */}
        <div className="perfil-card">
          <div className="perfil-header">
            <div className="avatar-section">
              <div className="user-avatar large">
                {datos.nombre?.charAt(0)}{datos.apellido?.charAt(0)}
              </div>
              <div className="user-details">
                <h2>{datos.nombre} {datos.apellido}</h2>
                <p className="user-role">{usuario?.rol_nombre || 'Apicultor'}</p>
                <p className="user-email">{datos.email}</p>
              </div>
            </div>
            
            {usuario?.fecha_registro && (
              <div className="registro-info">
                <span className="info-label">Miembro desde:</span>
                <span className="info-value">{formatearFecha(usuario.fecha_registro)}</span>
              </div>
            )}
          </div>

          {/* Formulario de edición */}
          <div className="perfil-form-section">
            <h3>📝 Información Personal</h3>
            
            {mensaje && (
              <div className={`alerta ${mensaje.tipo}`} style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="alerta-icon">
                  {mensaje.tipo === 'success' ? '✅' : '⚠️'}
                </div>
                <div className="alerta-content">
                  <p>{mensaje.texto}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="alerta danger" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="alerta-icon">⚠️</div>
                <div className="alerta-content">
                  <p>{error.mensaje}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="perfil-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={datos.nombre}
                    onChange={handleChange}
                    className={`form-input ${errores.nombre ? 'error' : ''}`}
                    disabled={guardando}
                  />
                  {errores.nombre && (
                    <span className="error-message">{errores.nombre}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="apellido" className="form-label">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={datos.apellido}
                    onChange={handleChange}
                    className={`form-input ${errores.apellido ? 'error' : ''}`}
                    disabled={guardando}
                  />
                  {errores.apellido && (
                    <span className="error-message">{errores.apellido}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={datos.email}
                  onChange={handleChange}
                  className={`form-input ${errores.email ? 'error' : ''}`}
                  disabled={guardando}
                />
                {errores.email && (
                  <span className="error-message">{errores.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telefono" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={datos.telefono}
                  onChange={handleChange}
                  className={`form-input ${errores.telefono ? 'error' : ''}`}
                  placeholder="Ej: +56 9 1234 5678"
                  disabled={guardando}
                />
                {errores.telefono && (
                  <span className="error-message">{errores.telefono}</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <span className="loading-dots">⏳</span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      💾 Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sección de configuraciones adicionales */}
        <div className="configuraciones-card">
          <h3>⚙️ Configuraciones</h3>
          
          <div className="config-section">
            <div className="config-item">
              <div className="config-info">
                <h4>🔒 Cambiar Contraseña</h4>
                <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => setMostrarCambiarPassword(true)}
              >
                Cambiar
              </button>
            </div>

            <div className="config-item">
              <div className="config-info">
                <h4>🔔 Notificaciones</h4>
                <p>Configura cómo y cuándo recibir alertas</p>
              </div>
              <button className="btn btn-outline" disabled>
                Próximamente
              </button>
            </div>

            <div className="config-item">
              <div className="config-info">
                <h4>📊 Exportar Datos</h4>
                <p>Descarga un respaldo de toda tu información</p>
              </div>
              <button className="btn btn-outline" disabled>
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas del usuario */}
        <div className="estadisticas-usuario-card">
          <h3>📈 Tu Actividad</h3>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🏡</div>
              <div className="stat-content">
                <div className="stat-number">-</div>
                <div className="stat-label">Apiarios</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">🍯</div>
              <div className="stat-content">
                <div className="stat-number">-</div>
                <div className="stat-label">Colmenas</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-number">-</div>
                <div className="stat-label">Revisiones</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-number">-</div>
                <div className="stat-label">Días activo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      {mostrarCambiarPassword && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="form-header">
              <h2>🔒 Cambiar Contraseña</h2>
              <button 
                className="btn-close"
                onClick={() => setMostrarCambiarPassword(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--gray-600)' }}>
                Esta funcionalidad estará disponible en una próxima actualización.
              </p>
              
              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setMostrarCambiarPassword(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;