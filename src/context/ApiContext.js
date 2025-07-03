import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Configuración dinámica de la URL base
const getBaseURL = () => {
  // Si hay una variable de entorno definida, úsala
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // En desarrollo, usa localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  }
  
  // En producción, usa tu URL de Railway
  return 'https://tu-backend.railway.app/api'; // ⚠️ CAMBIA ESTA URL
};

// Configuración de axios para conectar al backend
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.message);
    console.error('❌ URL que falló:', error.config?.url);
    return Promise.reject(error);
  }
);

export const ApiProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mostrar la URL que se está usando
  useEffect(() => {
    console.log('🌐 Base URL configurada:', getBaseURL());
  }, []);

  // Probar conexión al cargar
  useEffect(() => {
    testConnection();
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(() => {
      testConnectionSilent();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      setIsConnected(true);
      setError(null);
      console.log('🟢 Conexión establecida:', response.data.message);
      return response.data;
    } catch (err) {
      setIsConnected(false);
      const errorMessage = err.response?.data?.message || err.message || 'Error de conexión con el servidor';
      setError(errorMessage);
      console.error('🔴 Error de conexión:', errorMessage);
      console.error('🔴 URL que falló:', err.config?.url);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testConnectionSilent = async () => {
    try {
      await api.get('/health');
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError('Conexión perdida');
    }
  };

  const apiRequest = async (method, endpoint, data = null, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await api.get(endpoint);
          break;
        case 'post':
          response = await api.post(endpoint, data);
          break;
        case 'put':
          response = await api.put(endpoint, data);
          break;
        case 'delete':
          response = await api.delete(endpoint);
          break;
        default:
          throw new Error(`Método HTTP no válido: ${method}`);
      }
      
      setIsConnected(true);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error en la petición';
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setIsConnected(false);
        setError('No se puede conectar al servidor backend');
      } else {
        setError(errorMessage);
      }
      
      console.error(`❌ Error en ${method.toUpperCase()} ${endpoint}:`, errorMessage);
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Métodos específicos para cada entidad
  const usuarios = {
    getAll: () => apiRequest('get', '/usuarios'),
    getById: (id) => apiRequest('get', `/usuarios/${id}`),
    create: (data) => apiRequest('post', '/usuarios', data),
    update: (id, data) => apiRequest('put', `/usuarios/${id}`, data),
    delete: (id) => apiRequest('delete', `/usuarios/${id}`),
  };

  const apiarios = {
    getAll: () => apiRequest('get', '/apiarios'),
    getById: (id) => apiRequest('get', `/apiarios/${id}`),
    create: (data) => apiRequest('post', '/apiarios', data),
    update: (id, data) => apiRequest('put', `/apiarios/${id}`, data),
    delete: (id) => apiRequest('delete', `/apiarios/${id}`),
    getEstadisticas: (id) => apiRequest('get', `/apiarios/${id}/estadisticas`),
  };

  const colmenas = {
    getAll: () => apiRequest('get', '/colmenas'),
    getById: (id) => apiRequest('get', `/colmenas/${id}`),
    getActivas: () => apiRequest('get', '/colmenas/activas'),
    create: (data) => apiRequest('post', '/colmenas', data),
    update: (id, data) => apiRequest('put', `/colmenas/${id}`, data),
    delete: (id) => apiRequest('delete', `/colmenas/${id}`),
    getSensores: (id) => apiRequest('get', `/colmenas/${id}/sensores`),
    getEstadisticas: (id) => apiRequest('get', `/colmenas/${id}/estadisticas`),
  };

  const revisiones = {
    getAll: () => apiRequest('get', '/revisiones'),
    getById: (id) => apiRequest('get', `/revisiones/${id}`),
    create: (data) => apiRequest('post', '/revisiones', data),
    update: (id, data) => apiRequest('put', `/revisiones/${id}`, data),
    delete: (id) => apiRequest('delete', `/revisiones/${id}`),
    getByColmena: (colmenaId) => apiRequest('get', `/revisiones/colmena/${colmenaId}`),
    getResumen: (colmenaId) => apiRequest('get', `/revisiones/resumen/${colmenaId}`),
    getAlertas: (colmenaId) => apiRequest('get', `/revisiones/alertas/${colmenaId}`),
  };

  const dashboard = {
    getStats: () => apiRequest('get', '/dashboard/stats'),
    getRecent: () => apiRequest('get', '/dashboard/recent'),
    getAlertas: () => apiRequest('get', '/dashboard/alertas'),
    getGraficos: () => apiRequest('get', '/dashboard/graficos'),
  };

  const selects = {
    usuarios: () => apiRequest('get', '/select/usuarios', null, false),
    apiarios: () => apiRequest('get', '/select/apiarios', null, false),
    colmenas: () => apiRequest('get', '/select/colmenas', null, false),
    roles: () => apiRequest('get', '/select/roles', null, false),
  };

  const value = {
    // Estado
    isConnected,
    loading,
    error,
    
    // Métodos de conexión
    testConnection,
    
    // Entidades principales
    usuarios,
    apiarios,
    colmenas,
    revisiones,
    dashboard,
    selects,
    
    // Método genérico
    apiRequest,
    
    // Configuración de axios
    api,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};