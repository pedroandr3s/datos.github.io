import axios from 'axios';
import React from 'react';

// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartbee_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('smartbee_token');
      localStorage.removeItem('smartbee_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de API

// Usuarios
export const usuariosAPI = {
  login: (email, password) => api.post('/usuarios/login', { email, password }),
  obtenerPerfil: (id) => api.get(`/usuarios/${id}`),
  actualizarPerfil: (id, datos) => api.put(`/usuarios/${id}`, datos),
  obtenerUsuarios: () => api.get('/usuarios'),
  crearUsuario: (datos) => api.post('/usuarios', datos),
  eliminarUsuario: (id) => api.delete(`/usuarios/${id}`),
  obtenerRoles: () => api.get('/usuarios/admin/roles'),
  
  // 🆕 NUEVAS FUNCIONES AGREGADAS
  obtenerEstadisticas: (id) => api.get(`/usuarios/${id}/stats`),
  crearUsuarioPrueba: () => api.post('/crear-usuario-prueba'),
  arreglarPassword: () => api.post('/fix-admin-password'),
  testLogin: (email, password) => api.post('/test-login', { email, password })
};

// Apiarios  
export const apiariosAPI = {
  // ✅ CORREGIDAS: Cambiar nombres para coincidir con backend
  obtenerTodos: (usuarioId = null) => {
    const params = usuarioId ? { usuario_id: usuarioId } : {};
    return api.get('/apiarios', { params });
  },
  obtener: (id) => api.get(`/apiarios/${id}`),
  crear: (datos) => api.post('/apiarios', datos),
  actualizar: (id, datos) => api.put(`/apiarios/${id}`, datos),
  eliminar: (id) => api.delete(`/apiarios/${id}`),
  
  // ✅ MANTENER nombres alternativos para compatibilidad
  obtenerApiarios: (usuarioId = null) => {
    const params = usuarioId ? { usuario_id: usuarioId } : {};
    return api.get('/apiarios', { params });
  },
  obtenerApiario: (id) => api.get(`/apiarios/${id}`),
  crearApiario: (datos) => api.post('/apiarios', datos),
  actualizarApiario: (id, datos) => api.put(`/apiarios/${id}`, datos),
  eliminarApiario: (id) => api.delete(`/apiarios/${id}`),
  obtenerEstadisticas: (id) => api.get(`/apiarios/${id}/estadisticas`)
};

// Colmenas
export const colmenasAPI = {
  // ✅ CORREGIDAS: Cambiar nombres para coincidir con backend y componentes
  obtenerTodas: (apiarioId = null) => {
    const params = apiarioId ? { apiario_id: apiarioId } : {};
    return api.get('/colmenas', { params });
  },
  obtener: (id) => api.get(`/colmenas/${id}`),
  crear: (datos) => api.post('/colmenas', datos),
  actualizar: (id, datos) => api.put(`/colmenas/${id}`, datos),
  eliminar: (id) => api.delete(`/colmenas/${id}`),
  
  // ✅ MANTENER nombres alternativos para compatibilidad
  obtenerColmenas: (apiarioId = null) => {
    const params = apiarioId ? { apiario_id: apiarioId } : {};
    return api.get('/colmenas', { params });
  },
  obtenerColmena: (id) => api.get(`/colmenas/${id}`),
  crearColmena: (datos) => api.post('/colmenas', datos),
  actualizarColmena: (id, datos) => api.put(`/colmenas/${id}`, datos),
  eliminarColmena: (id) => api.delete(`/colmenas/${id}`),
  
  // Funciones específicas
  obtenerActivas: () => api.get('/colmenas/activas'),
  obtenerSensores: (id, periodo = 'semana', tipoSensor = null) => {
    const params = { periodo };
    if (tipoSensor) params.tipo_sensor = tipoSensor;
    return api.get(`/colmenas/${id}/sensores`, { params });
  },
  obtenerEstadisticas: (id) => api.get(`/colmenas/${id}/estadisticas`)
};

// Revisiones
export const revisionesAPI = {
  obtenerRevisiones: (filtros = {}) => {
    return api.get('/revisiones', { params: filtros });
  },
  obtenerRevision: (id) => api.get(`/revisiones/${id}`),
  crearRevision: (datos) => api.post('/revisiones', datos),
  actualizarRevision: (id, datos) => api.put(`/revisiones/${id}`, datos),
  eliminarRevision: (id) => api.delete(`/revisiones/${id}`),
  obtenerResumen: (colmenaId, periodo = 'mes') => {
    return api.get(`/revisiones/resumen/${colmenaId}`, { params: { periodo } });
  },
  obtenerAlertas: (colmenaId) => api.get(`/revisiones/alertas/${colmenaId}`)
};

// Dashboard
export const dashboardAPI = {
  obtenerEstadisticas: () => api.get('/dashboard/stats'),
  obtenerRecientes: () => api.get('/dashboard/recent')
};

// 🆕 NUEVAS APIs para funciones auxiliares

// Selects/Opciones
export const selectsAPI = {
  obtenerUsuarios: () => api.get('/select/usuarios'),
  obtenerApiarios: () => api.get('/select/apiarios')
};

// Debug/Testing (para desarrollo)
export const debugAPI = {
  usuarios: () => api.get('/debug/usuarios'),
  testBcrypt: (password) => api.get(`/debug/bcrypt/${password}`),
  testLogin: (email, password) => api.post('/debug/login', { email, password }),
  health: () => api.get('/health'),
  testDb: () => api.get('/test-db')
};

// 🆕 API WRAPPER para manejar respuestas del backend
// Esta clase envuelve las respuestas para consistencia
class APIWrapper {
  constructor(axiosInstance) {
    this.api = axiosInstance;
  }
  
  // Método para manejar respuestas que pueden venir con o sin .data
  async call(apiFunction) {
    try {
      const response = await apiFunction();
      
      // Log para debugging
      console.log('API Response:', {
        url: response.config?.url,
        method: response.config?.method,
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });
      
      // El backend devuelve datos directos en response.data
      return response.data;
      
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // Login especial que mantiene la estructura { data: { token, usuario } }
  async login(email, password) {
    try {
      const response = await usuariosAPI.login(email, password);
      console.log('Login Response:', response);
      
      // Login YA devuelve la estructura correcta { data: { token, usuario } }
      return response.data;
      
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }
}

// Instancia del wrapper
const apiWrapper = new APIWrapper(api);

// 🆕 EXPORTS SIMPLIFICADOS para los componentes
export const usuariosSimple = {
  login: (email, password) => apiWrapper.login(email, password),
  obtenerPerfil: (id) => apiWrapper.call(() => usuariosAPI.obtenerPerfil(id)),
  actualizarPerfil: (id, datos) => apiWrapper.call(() => usuariosAPI.actualizarPerfil(id, datos)),
  obtenerEstadisticas: (id) => apiWrapper.call(() => usuariosAPI.obtenerEstadisticas(id))
};

export const apiariosSimple = {
  obtenerTodos: () => apiWrapper.call(() => apiariosAPI.obtenerTodos()),
  obtener: (id) => apiWrapper.call(() => apiariosAPI.obtener(id)),
  crear: (datos) => apiWrapper.call(() => apiariosAPI.crear(datos)),
  actualizar: (id, datos) => apiWrapper.call(() => apiariosAPI.actualizar(id, datos)),
  eliminar: (id) => apiWrapper.call(() => apiariosAPI.eliminar(id))
};

export const colmenasSimple = {
  obtenerTodas: () => apiWrapper.call(() => colmenasAPI.obtenerTodas()),
  obtener: (id) => apiWrapper.call(() => colmenasAPI.obtener(id)),
  crear: (datos) => apiWrapper.call(() => colmenasAPI.crear(datos)),
  actualizar: (id, datos) => apiWrapper.call(() => colmenasAPI.actualizar(id, datos)),
  eliminar: (id) => apiWrapper.call(() => colmenasAPI.eliminar(id))
};

// Utilidades mejoradas
export const manejarError = (error) => {
  console.error('Error en API:', error);
  
  if (error.response) {
    // Error de respuesta del servidor
    const mensaje = error.response.data?.error || 
                   error.response.data?.message || 
                   error.response.data?.details ||
                   'Error del servidor';
    return {
      tipo: 'error',
      mensaje,
      codigo: error.response.status
    };
  } else if (error.request) {
    // Error de red
    return {
      tipo: 'error',
      mensaje: 'Error de conexión. Verifique su conexión a internet.',
      codigo: 'NETWORK_ERROR'
    };
  } else {
    // Error de configuración
    return {
      tipo: 'error',
      mensaje: error.message || 'Error inesperado. Intente nuevamente.',
      codigo: 'UNKNOWN_ERROR'
    };
  }
};

// Hook mejorado para manejo de estado de API
export const useApiState = () => {
  const [cargando, setCargando] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const ejecutar = async (apiCall) => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await apiCall();
      setCargando(false);
      
      // Si es una función del wrapper, ya devuelve los datos directos
      // Si es una función original, devuelve response.data
      return response.data ? response.data : response;
      
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
      setCargando(false);
      throw errorInfo;
    }
  };
  
  const limpiarError = () => setError(null);
  
  return { cargando, error, ejecutar, setError, limpiarError };
};

// 🆕 Hook específico para usar APIs simplificadas
export const useApiSimple = () => {
  const [cargando, setCargando] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const ejecutar = async (apiCall) => {
    setCargando(true);
    setError(null);
    
    try {
      const data = await apiCall();
      setCargando(false);
      return data; // Ya viene procesado por el wrapper
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
      setCargando(false);
      throw errorInfo;
    }
  };
  
  return { cargando, error, ejecutar, setError };
};

// Función de verificación de conexión
export const verificarConexion = async () => {
  try {
    const response = await debugAPI.health();
    console.log('✅ Backend conectado:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend no disponible:', error);
    return false;
  }
};

export { api, apiWrapper };