// 1. ACTUALIZAR TU ARCHIVO DE API (api.js)
import axios from 'axios';
import React from 'react';

// Configuración base de Axios
const api = axios.create({
  baseURL: 'https://backend-production-6c78.up.railway.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Función para garantizar que siempre devolvemos un array
const garantizarArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    // Buscar arrays dentro del objeto
    const posiblesArrays = ['data', 'items', 'results', 'apiarios', 'colmenas', 'revisiones', 'usuarios'];
    for (const prop of posiblesArrays) {
      if (Array.isArray(data[prop])) return data[prop];
    }
  }
  return []; // Devolver array vacío como fallback
};

// Función para manejar respuestas de API de forma segura
const manejarRespuestaSegura = (response) => {
  try {
    if (!response || !response.data) {
      return { success: false, data: [], error: 'No se recibieron datos' };
    }
    
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('Error procesando respuesta:', error);
    return { success: false, data: [], error: error.message };
  }
};

// Interceptores
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartbee_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartbee_token');
      localStorage.removeItem('smartbee_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// APIs con manejo seguro
export const usuariosAPI = {
  obtenerUsuarios: async () => {
    try {
      const response = await api.get('/usuarios');
      return {
        success: true,
        data: garantizarArray(response.data),
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },
  
  // Otros métodos...
  login: async (email, password) => {
    try {
      const response = await api.post('/usuarios/login', { email, password });
      return manejarRespuestaSegura(response);
    } catch (error) {
      throw manejarError(error);
    }
  }
};

export const apiariosAPI = {
  obtenerApiarios: async (usuarioId = null) => {
    try {
      const params = usuarioId ? { usuario_id: usuarioId } : {};
      const response = await api.get('/apiarios', { params });
      return {
        success: true,
        data: garantizarArray(response.data),
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },
  
  obtenerEstadisticas: async (id) => {
    try {
      const response = await api.get(`/apiarios/${id}/estadisticas`);
      return manejarRespuestaSegura(response);
    } catch (error) {
      return {
        success: false,
        data: {},
        error: error.message
      };
    }
  }
};

export const colmenasAPI = {
  obtenerColmenas: async (apiarioId = null) => {
    try {
      const params = apiarioId ? { apiario_id: apiarioId } : {};
      const response = await api.get('/colmenas', { params });
      return {
        success: true,
        data: garantizarArray(response.data),
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },
  
  obtenerEstadisticas: async (id) => {
    try {
      const response = await api.get(`/colmenas/${id}/estadisticas`);
      return manejarRespuestaSegura(response);
    } catch (error) {
      return {
        success: false,
        data: {},
        error: error.message
      };
    }
  }
};

export const dashboardAPI = {
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return manejarRespuestaSegura(response);
    } catch (error) {
      return {
        success: false,
        data: {},
        error: error.message
      };
    }
  }
};

// Función principal para cargar estadísticas
export const cargarEstadisticas = async (tipo = 'dashboard', id = null) => {
  try {
    let response;
    
    switch (tipo) {
      case 'dashboard':
        response = await dashboardAPI.obtenerEstadisticas();
        break;
      case 'apiario':
        if (!id) throw new Error('ID de apiario requerido');
        response = await apiariosAPI.obtenerEstadisticas(id);
        break;
      case 'colmena':
        if (!id) throw new Error('ID de colmena requerido');
        response = await colmenasAPI.obtenerEstadisticas(id);
        break;
      default:
        throw new Error('Tipo de estadística no válido');
    }
    
    return response;
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    return {
      success: false,
      data: {},
      error: error.message
    };
  }
};

// Utilidad para manejar errores
export const manejarError = (error) => {
  console.error('Error en API:', error);
  
  if (error.response) {
    return {
      success: false,
      mensaje: error.response.data?.error || error.response.data?.message || 'Error del servidor',
      codigo: error.response.status,
      data: null
    };
  } else if (error.request) {
    return {
      success: false,
      mensaje: 'Error de conexión. Verifique su conexión a internet.',
      codigo: 'NETWORK_ERROR',
      data: null
    };
  } else {
    return {
      success: false,
      mensaje: 'Error inesperado. Intente nuevamente.',
      codigo: 'UNKNOWN_ERROR',
      data: null
    };
  }
};

// Hook personalizado mejorado
export const useApiState = () => {
  const [cargando, setCargando] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const ejecutar = async (apiCall) => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await apiCall();
      setCargando(false);
      return response;
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
      setCargando(false);
      return {
        success: false,
        data: [],
        error: errorInfo.mensaje
      };
    }
  };
  
  return { cargando, error, ejecutar, setError };
};

// 2. COMPONENTE DE EJEMPLO CON MANEJO SEGURO
export const EjemploComponente = () => {
  const [apiarios, setApiarios] = React.useState([]);
  const [estadisticas, setEstadisticas] = React.useState({});
  const [cargando, setCargando] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Función para cargar datos de forma segura
  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    
    try {
      // Cargar apiarios
      const responseApiarios = await apiariosAPI.obtenerApiarios();
      if (responseApiarios.success) {
        // Garantizar que siempre sea un array
        const apiariosArray = Array.isArray(responseApiarios.data) 
          ? responseApiarios.data 
          : [];
        setApiarios(apiariosArray);
      }

      // Cargar estadísticas
      const responseStats = await cargarEstadisticas('dashboard');
      if (responseStats.success) {
        setEstadisticas(responseStats.data || {});
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(error.message);
      // Establecer valores por defecto en caso de error
      setApiarios([]);
      setEstadisticas({});
    } finally {
      setCargando(false);
    }
  };

  React.useEffect(() => {
    cargarDatos();
  }, []);

  if (cargando) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Apiarios</h1>
      {apiarios.length > 0 ? (
        apiarios.map(apiario => (
          <div key={apiario.id || Math.random()}>
            {apiario.nombre || 'Sin nombre'}
          </div>
        ))
      ) : (
        <p>No hay apiarios disponibles</p>
      )}
      
      <h2>Estadísticas</h2>
      <pre>{JSON.stringify(estadisticas, null, 2)}</pre>
    </div>
  );
};

export { api };