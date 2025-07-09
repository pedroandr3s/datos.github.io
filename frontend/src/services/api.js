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
  obtenerRoles: () => api.get('/usuarios/admin/roles')
};

// Apiarios
export const apiariosAPI = {
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
  obtenerColmenas: (apiarioId = null) => {
    const params = apiarioId ? { apiario_id: apiarioId } : {};
    return api.get('/colmenas', { params });
  },
  obtenerColmena: (id) => api.get(`/colmenas/${id}`),
  crearColmena: (datos) => api.post('/colmenas', datos),
  actualizarColmena: (id, datos) => api.put(`/colmenas/${id}`, datos),
  eliminarColmena: (id) => api.delete(`/colmenas/${id}`),
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
  obtenerEstadisticas: () => api.get('/dashboard/stats')
};

// Utilidades
export const manejarError = (error) => {
  console.error('Error en API:', error);
  
  if (error.response) {
    // Error de respuesta del servidor
    const mensaje = error.response.data?.error || error.response.data?.message || 'Error del servidor';
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
      mensaje: 'Error inesperado. Intente nuevamente.',
      codigo: 'UNKNOWN_ERROR'
    };
  }
};


export const useApiState = () => {
  const [cargando, setCargando] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const ejecutar = async (apiCall) => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await apiCall();
      setCargando(false);
      return response.data;
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
      setCargando(false);
      throw errorInfo;
    }
  };
  
  return { cargando, error, ejecutar, setError };
};

export { api };