import React, { useState } from 'react';
import { usuariosAPI, manejarError } from '../../services/api';

const Login = ({ onLogin }) => {
  const [datos, setDatos] = useState({
    email: '',
    password: ''
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al empezar a escribir
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!datos.email || !datos.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setCargando(true);
      setError(null);
      
      const response = await usuariosAPI.login(datos.email, datos.password);
      
      if (response.data.token && response.data.usuario) {
        onLogin(response.data.usuario, response.data.token);
      } else {
        setError('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo.mensaje);
    } finally {
      setCargando(false);
    }
  };

  const toggleMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword);
  };

  // Función para manejar el "olvidar contraseña"
  const handleForgotPassword = () => {
    // Por ahora solo muestra una alerta, puedes implementar la lógica completa después
    alert('Funcionalidad de recuperación de contraseña estará disponible próximamente.');
    
    // Ejemplo de implementación futura:
    // navigate('/forgot-password');
    // o abrir un modal para recuperación
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="login-logo">🐝</div>
          <h1 className="login-title">SmartBee</h1>
          <p className="login-subtitle">Sistema de Gestión Apícola</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alerta danger" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="alerta-icon">⚠️</div>
              <div className="alerta-content">
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={datos.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Ingresa tu nombre de usuario"
              disabled={cargando}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={datos.password}
                onChange={handleChange}
                className="form-input"
                style={{ paddingRight: '45px' }}
                placeholder="••••••••"
                disabled={cargando}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={toggleMostrarPassword}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={cargando}
              >
                {mostrarPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={cargando}
            style={{ marginTop: 'var(--spacing-lg)' }}
          >
            {cargando ? (
              <>
                <span className="loading-dots">⏳</span>
                Iniciando sesión...
              </>
            ) : (
              <>
                🔑 Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <button 
          type="button" 
          className="link-button" 
          onClick={handleForgotPassword}
        >
          ¿Olvidaste tu contraseña?
        </button>

        {/* Demo credentials info */}
        <div style={{ 
          marginTop: 'var(--spacing-xl)', 
          padding: 'var(--spacing-md)', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--gray-600)'
        }}>
          <p style={{ margin: '0 0 var(--spacing-xs) 0', fontWeight: '600' }}>
            💡 Credenciales de prueba:
          </p>
          <p style={{ margin: '0' }}>
            Usuario: admin<br />
            Contraseña: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;