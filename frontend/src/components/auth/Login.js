import React, { useState, useEffect } from 'react';
import { usuariosAPI, manejarError } from '../../services/api';

const Login = ({ onLogin }) => {
  const [datos, setDatos] = useState({
    email: '',
    password: ''
  });
  const [cargando, setCargando] = useState(true); // Cambiado a true para mostrar loading inicial
  const [error, setError] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [autoLoginRealizado, setAutoLoginRealizado] = useState(false);

  // AUTO-LOGIN AUTOMÁTICO al cargar el componente
  useEffect(() => {
    const realizarAutoLogin = async () => {
      console.log('🚀 Iniciando auto-login automático...');
      
      // Verificar si ya hay una sesión guardada
      const usuarioGuardado = localStorage.getItem('smartbee_usuario');
      const tokenGuardado = localStorage.getItem('smartbee_token');
      
      if (usuarioGuardado && tokenGuardado) {
        try {
          const usuarioParsed = JSON.parse(usuarioGuardado);
          console.log('📱 Sesión existente encontrada, restaurando...');
          onLogin(usuarioParsed, tokenGuardado);
          setAutoLoginRealizado(true);
          setCargando(false);
          return;
        } catch (error) {
          console.log('⚠️ Error parseando sesión guardada, creando nueva...');
          localStorage.removeItem('smartbee_usuario');
          localStorage.removeItem('smartbee_token');
        }
      }
      
      // Crear sesión automática con datos del admin
      const usuarioAdmin = {
        id: 1,
        nombre: 'Admin',
        apellido: 'SmartBee',
        email: 'admin@smartbee.com',
        telefono: '+56900000000',
        rol_nombre: 'Administrador',
        fecha_registro: new Date().toISOString()
      };
      
      const tokenAdmin = `smartbee_auto_${Date.now()}`;
      
      // Simular delay de carga (opcional, puedes quitarlo)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('✅ Auto-login completado para:', usuarioAdmin.email);
      
      // Llamar onLogin con los datos del admin
      onLogin(usuarioAdmin, tokenAdmin);
      setAutoLoginRealizado(true);
      setCargando(false);
    };

    realizarAutoLogin();
  }, [onLogin]);

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
    alert('Funcionalidad de recuperación de contraseña estará disponible próximamente.');
  };

  // Función para cancelar auto-login y mostrar formulario manual
  const handleLoginManual = () => {
    console.log('🔄 Cambiando a login manual');
    setAutoLoginRealizado(false);
    setCargando(false);
  };

  // Mostrar loading mientras se hace auto-login
  if (cargando && !autoLoginRealizado) {
    return (
      <div className="login-container">
        <div className="login-card fade-in">
          <div className="login-header">
            <div className="login-logo">🐝</div>
            <h1 className="login-title">SmartBee</h1>
            <p className="login-subtitle">Sistema de Gestión Apícola</p>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-xl)',
            color: 'var(--gray-600)'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: 'var(--spacing-lg)',
              animation: 'spin 2s linear infinite'
            }}>
              🐝
            </div>
            <h3 style={{ margin: '0 0 var(--spacing-sm) 0' }}>
              Iniciando SmartBee...
            </h3>
            <p style={{ margin: '0 0 var(--spacing-lg) 0' }}>
              Configurando tu sesión automáticamente
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: 'var(--primary-color)',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: 'var(--primary-color)',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite 0.3s'
              }}></div>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: 'var(--primary-color)',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite 0.6s'
              }}></div>
            </div>

            <button
              type="button"
              onClick={handleLoginManual}
              className="link-button"
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              🔄 Usar login manual
            </button>
          </div>
          
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 80%, 100% { opacity: 0.3; }
              40% { opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Si el auto-login ya se realizó, no mostrar nada (la app principal se cargará)
  if (autoLoginRealizado) {
    return null;
  }

  // Formulario de login manual (solo se muestra si se cancela el auto-login)
  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="login-logo">🐝</div>
          <h1 className="login-title">SmartBee</h1>
          <p className="login-subtitle">Sistema de Gestión Apícola</p>
        </div>

        <div style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          backgroundColor: '#fff3cd',
          borderRadius: 'var(--border-radius)',
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: 'var(--font-size-sm)', color: '#856404' }}>
            ⚠️ Modo manual activado
          </p>
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
              placeholder="admin@smartbee.com"
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
                placeholder="admin123"
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
            Usuario: admin@smartbee.com<br />
            Contraseña: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;