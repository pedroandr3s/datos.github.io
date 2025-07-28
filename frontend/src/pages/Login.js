import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import './login.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  // Usar el ApiContext de forma segura
  let apiContext = null;
  try {
    apiContext = useApi();
  } catch (error) {
    console.warn('ApiContext no disponible en Login:', error.message);
  }

  const { usuarios, isConnected, loading } = apiContext || {};

  // Verificar conexión al cargar el componente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        
        // Intentar conectar directamente si no hay ApiContext
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8080' 
          : 'https://backend-production-eb26.up.railway.app';
          
        const response = await fetch(`${baseUrl}/api/health`);
        
        if (response.ok) {
          setConnectionStatus('connected');
          console.log('✅ Conexión al servidor establecida');
        } else {
          setConnectionStatus('disconnected');
          console.log('❌ Servidor responde pero con error');
        }
      } catch (error) {
        setConnectionStatus('disconnected');
        console.error('❌ Error de conexión:', error);
      }
    };

    // Si tenemos ApiContext, usar su estado de conexión
    if (apiContext && typeof isConnected !== 'undefined') {
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } else {
      // Si no, verificar conexión manualmente
      checkConnection();
    }
  }, [apiContext, isConnected]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (connectionStatus !== 'connected') {
      setError('No hay conexión con el servidor. Verifique su conexión.');
      return;
    }
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Nombre de usuario y contraseña son requeridos');
      return;
    }

    setIsLogging(true);
    setError('');

    try {
      console.log('🔐 Intentando login...');
      
      let result;
      
      // Intentar usar ApiContext primero
      if (usuarios && usuarios.login) {
        console.log('📡 Usando ApiContext para login');
        result = await usuarios.login({
          email: formData.email.trim(),
          password: formData.password
        });
      } else {
        // Fallback: petición directa
        console.log('📡 Usando fetch directo para login');
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8080' 
          : 'https://backend-production-eb26.up.railway.app';
          
        const response = await fetch(`${baseUrl}/api/usuarios/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        result = await response.json();
      }

      // Manejar respuesta exitosa
      if (result.data) {
        localStorage.setItem('smartbee_token', result.data.token);
        localStorage.setItem('smartbee_user', JSON.stringify(result.data.usuario));
        
        console.log('✅ Login exitoso:', result.data.usuario);
        onLoginSuccess(result.data.usuario);
      } else {
        throw new Error(result.error || 'Error al iniciar sesión');
      }
      
    } catch (error) {
      console.error('💥 Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Credenciales incorrectas. Verifique su usuario y contraseña.';
            break;
          case 404:
            errorMessage = 'Servicio de login no disponible. Contacte al administrador.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intente más tarde.';
            break;
          default:
            errorMessage = error.response.data?.error || 'Error del servidor';
        }
      } else if (error.message.includes('401')) {
        errorMessage = 'Credenciales incorrectas. Verifique su usuario y contraseña.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Servicio de login no disponible. Contacte al administrador.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Intente más tarde.';
      } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Error de conexión. Verifique su conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLogging(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Contacte al administrador para restablecer su contraseña');
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return { bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e', text: '#166534' };
      case 'disconnected': return { bg: '#fef2f2', border: '#fecaca', dot: '#ef4444', text: '#b91c1c' };
      case 'checking': return { bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b', text: '#92400e' };
      default: return { bg: '#f9fafb', border: '#e5e7eb', dot: '#6b7280', text: '#374151' };
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado al servidor';
      case 'disconnected': return 'Sin conexión al servidor';
      case 'checking': return 'Verificando conexión...';
      default: return 'Estado desconocido';
    }
  };

  const colors = getConnectionColor();

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="login-logo">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="login-title">SmartBee</h1>
            <p className="login-subtitle">Sistema de Gestión de Colmenas</p>
            
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-dot"></div>
                <span>Monitoreo en tiempo real</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-dot"></div>
                <span>Gestión de usuarios y colmenas</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-dot"></div>
                <span>Control de sensores IoT</span>
              </div>
            </div>
          </div>
          
          <div className="login-decoration-1"></div>
          <div className="login-decoration-2"></div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-container">
            <div className="login-header">
              <h2 className="login-welcome-title">Bienvenido</h2>
              <p className="login-welcome-subtitle">Ingresa tus credenciales para acceder</p>
            </div>

            {/* Estado de conexión */}
            <div style={{ 
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.dot
              }} />
              <span style={{ 
                fontSize: '0.875rem',
                color: colors.text,
                fontWeight: '500'
              }}>
                {getConnectionText()}
              </span>
            </div>

            {error && (
              <div className="login-error">
                <div className="login-error-content">
                  <svg className="login-error-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="login-error-text">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="email" className="login-form-label">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="login-form-input"
                  placeholder="Ingresa tu nombre de usuario"
                  disabled={isLogging || connectionStatus !== 'connected'}
                  autoComplete="username"
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="password" className="login-form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="login-form-input"
                  placeholder="Ingresa tu contraseña"
                  disabled={isLogging || connectionStatus !== 'connected'}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLogging || connectionStatus !== 'connected'}
                className="login-submit-button"
              >
                {isLogging ? (
                  <>
                    <div className="login-spinner"></div>
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            <div className="login-forgot-password">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="login-forgot-link"
                disabled={isLogging}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="login-footer">
              <p className="login-footer-text">
                SmartBee © 2025 - Sistema de Gestión de Colmenas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;