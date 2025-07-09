import React, { useState, useEffect } from 'react';
import { usuariosAPI, manejarError } from '../../services/api';

const PerfilUsuario = ({ usuario, onActualizar }) => {
  const [datos, setDatos] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (usuario) {
      setDatos({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        telefono: usuario.telefono || ''
      });
    }
  }, [usuario]);

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
    
    // Limpiar mensajes
    if (error) setError(null);
    if (mensaje) setMensaje(null);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datos.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (datos.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!datos.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio';
    } else if (datos.apellido.trim().length < 2) {
      nuevosErrores.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!datos.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(datos.email)) {
      nuevosErrores.email = 'El email no es válido';
    }

    if (datos.telefono && !/^\+?[\d\s\-\(\)]+$/.test(datos.telefono)) {
      nuevosErrores.telefono = 'El formato del teléfono no es válido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleEditar = () => {
    setEditando(true);
    setError(null);
    setMensaje(null);
  };

  const handleCancelar = () => {
    // Restaurar datos originales
    setDatos({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      telefono: usuario.telefono || ''
    });
    setEditando(false);
    setErrores({});
    setError(null);
    setMensaje(null);
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);
      
      const datosLimpios = {
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        email: datos.email.trim().toLowerCase(),
        telefono: datos.telefono.trim() || null
      };

      await usuariosAPI.actualizarPerfil(usuario.id, datosLimpios);
      
      setMensaje({
        tipo: 'success',
        texto: 'Perfil actualizado exitosamente'
      });
      
      setEditando(false);
      
      // Notificar al componente padre si hay callback
      if (onActualizar) {
        onActualizar({ ...usuario, ...datosLimpios });
      }
      
      // Actualizar datos en localStorage
      const usuarioActualizado = { ...usuario, ...datosLimpios };
      localStorage.setItem('smartbee_usuario', JSON.stringify(usuarioActualizado));
      
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo.mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="perfil-usuario">
      <div className="perfil-header">
        <div className="avatar-section">
          <div className="user-avatar extra-large">
            {datos.nombre?.charAt(0)}{datos.apellido?.charAt(0)}
          </div>
          <div className="user-details">
            <h2>{datos.nombre} {datos.apellido}</h2>
            <p className="user-role">{usuario?.rol_nombre || 'Apicultor'}</p>
            <p className="user-email">{datos.email}</p>
            {usuario?.fecha_registro && (
              <p className="member-since">
                Miembro desde {formatearFecha(usuario.fecha_registro)}
              </p>
            )}
          </div>
        </div>
        
        <div className="perfil-actions">
          {!editando ? (
            <button 
              className="btn btn-primary"
              onClick={handleEditar}
            >
              ✏️ Editar Perfil
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelar}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleGuardar}
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <span className="loading-dots">⏳</span>
                    Guardando...
                  </>
                ) : (
                  '💾 Guardar'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`alerta ${mensaje.tipo}`}>
          <div className="alerta-icon">
            {mensaje.tipo === 'success' ? '✅' : 'ℹ️'}
          </div>
          <div className="alerta-content">
            <p>{mensaje.texto}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="alerta danger">
          <div className="alerta-icon">⚠️</div>
          <div className="alerta-content">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Formulario de datos */}
      <div className="perfil-form-section">
        <h3>📝 Información Personal</h3>
        
        <div className="perfil-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre *
              </label>
              {editando ? (
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={datos.nombre}
                  onChange={handleChange}
                  className={`form-input ${errores.nombre ? 'error' : ''}`}
                  disabled={guardando}
                  maxLength={100}
                />
              ) : (
                <div className="form-display">{datos.nombre}</div>
              )}
              {errores.nombre && (
                <span className="error-message">{errores.nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="apellido" className="form-label">
                Apellido *
              </label>
              {editando ? (
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={datos.apellido}
                  onChange={handleChange}
                  className={`form-input ${errores.apellido ? 'error' : ''}`}
                  disabled={guardando}
                  maxLength={100}
                />
              ) : (
                <div className="form-display">{datos.apellido}</div>
              )}
              {errores.apellido && (
                <span className="error-message">{errores.apellido}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico *
            </label>
            {editando ? (
              <input
                type="email"
                id="email"
                name="email"
                value={datos.email}
                onChange={handleChange}
                className={`form-input ${errores.email ? 'error' : ''}`}
                disabled={guardando}
                maxLength={150}
              />
            ) : (
              <div className="form-display">{datos.email}</div>
            )}
            {errores.email && (
              <span className="error-message">{errores.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="telefono" className="form-label">
              Teléfono
            </label>
            {editando ? (
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={datos.telefono}
                onChange={handleChange}
                className={`form-input ${errores.telefono ? 'error' : ''}`}
                placeholder="Ej: +56 9 1234 5678"
                disabled={guardando}
                maxLength={20}
              />
            ) : (
              <div className="form-display">
                {datos.telefono || 'No especificado'}
              </div>
            )}
            {errores.telefono && (
              <span className="error-message">{errores.telefono}</span>
            )}
            {editando && (
              <small className="form-help">
                Incluye código de país para mejor identificación
              </small>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="perfil-info-section">
        <h3>ℹ️ Información de Cuenta</h3>
        
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Rol:</span>
            <span className="info-value">{usuario?.rol_nombre || 'Apicultor'}</span>
          </div>
          
          {usuario?.fecha_registro && (
            <div className="info-item">
              <span className="info-label">Fecha de registro:</span>
              <span className="info-value">{formatearFecha(usuario.fecha_registro)}</span>
            </div>
          )}
          
          <div className="info-item">
            <span className="info-label">Estado:</span>
            <span className="info-value status-active">✅ Activo</span>
          </div>
        </div>
      </div>

      {/* Acciones adicionales */}
      <div className="perfil-actions-section">
        <h3>⚙️ Configuraciones</h3>
        
        <div className="actions-grid">
          <button className="action-btn" disabled>
            <div className="action-icon">🔒</div>
            <div className="action-content">
              <h4>Cambiar Contraseña</h4>
              <p>Actualiza tu contraseña de acceso</p>
            </div>
            <div className="action-status">Próximamente</div>
          </button>

          <button className="action-btn" disabled>
            <div className="action-icon">🔔</div>
            <div className="action-content">
              <h4>Notificaciones</h4>
              <p>Configura alertas y recordatorios</p>
            </div>
            <div className="action-status">Próximamente</div>
          </button>

          <button className="action-btn" disabled>
            <div className="action-icon">📱</div>
            <div className="action-content">
              <h4>Aplicación Móvil</h4>
              <p>Descarga la app para tu dispositivo</p>
            </div>
            <div className="action-status">En desarrollo</div>
          </button>

          <button className="action-btn" disabled>
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h4>Exportar Datos</h4>
              <p>Descarga respaldo de tu información</p>
            </div>
            <div className="action-status">Próximamente</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;