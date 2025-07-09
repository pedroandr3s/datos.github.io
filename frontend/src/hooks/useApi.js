import { useState, useCallback } from 'react';
import { manejarError } from '../services/api';

export const useApi = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [datos, setDatos] = useState(null);

  const ejecutar = useCallback(async (apiFunction, ...args) => {
    try {
      setCargando(true);
      setError(null);
      
      const resultado = await apiFunction(...args);
      setDatos(resultado);
      
      return resultado;
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
      throw errorInfo;
    } finally {
      setCargando(false);
    }
  }, []);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  const limpiarDatos = useCallback(() => {
    setDatos(null);
  }, []);

  const reiniciar = useCallback(() => {
    setCargando(false);
    setError(null);
    setDatos(null);
  }, []);

  return {
    cargando,
    error,
    datos,
    ejecutar,
    limpiarError,
    limpiarDatos,
    reiniciar
  };
};

export const useApiList = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const cargar = useCallback(async (apiFunction, ...args) => {
    try {
      setCargando(true);
      setError(null);
      
      const resultado = await apiFunction(...args);
      
      if (Array.isArray(resultado)) {
        setItems(resultado);
        setTotal(resultado.length);
      } else if (resultado.items && Array.isArray(resultado.items)) {
        setItems(resultado.items);
        setTotal(resultado.total || resultado.items.length);
      } else {
        setItems([]);
        setTotal(0);
      }
      
      return resultado;
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
      setItems([]);
      setTotal(0);
      throw errorInfo;
    } finally {
      setCargando(false);
    }
  }, []);

  const agregar = useCallback((nuevoItem) => {
    setItems(prev => [nuevoItem, ...prev]);
    setTotal(prev => prev + 1);
  }, []);

  const actualizar = useCallback((id, datosActualizados) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...datosActualizados } : item
    ));
  }, []);

  const eliminar = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setTotal(prev => prev - 1);
  }, []);

  const limpiar = useCallback(() => {
    setItems([]);
    setTotal(0);
    setError(null);
  }, []);

  return {
    cargando,
    error,
    items,
    total,
    cargar,
    agregar,
    actualizar,
    eliminar,
    limpiar
  };
};

export const useApiForm = (apiFunction, onSuccess) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [errores, setErrores] = useState({});

  const enviar = useCallback(async (datos) => {
    try {
      setCargando(true);
      setError(null);
      setErrores({});
      
      const resultado = await apiFunction(datos);
      
      if (onSuccess) {
        onSuccess(resultado);
      }
      
      return resultado;
    } catch (err) {
      const errorInfo = manejarError(err);
      
      // Si el error incluye errores de validación por campo
      if (errorInfo.errores && typeof errorInfo.errores === 'object') {
        setErrores(errorInfo.errores);
      } else {
        setError(errorInfo);
      }
      
      throw errorInfo;
    } finally {
      setCargando(false);
    }
  }, [apiFunction, onSuccess]);

  const limpiarErrores = useCallback(() => {
    setError(null);
    setErrores({});
  }, []);

  return {
    cargando,
    error,
    errores,
    enviar,
    limpiarErrores
  };
};

export default useApi;