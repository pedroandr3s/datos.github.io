import React, { useState } from 'react';
import { apiariosAPI, manejarError } from '../../services/api';

const FormularioApiario = ({ apiario, usuario, onSubmit, onCancelar }) => {
  const [datos, setDatos] = useState({
    nombre: apiario?.nombre || '',
    ubicacion: apiario?.ubicacion || '',
    descripcion: apiario?.descripcion || ''
  });
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const esEdicion = !!apiario;

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
    } else if (datos.nombre.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!datos.ubicacion.trim()) {
      nuevosErrores.ubicacion = 'La ubicación es obligatoria';
    } else if (datos.ubicacion.length < 5) {
      nuevosErrores.ubicacion = 'La ubicación debe ser más específica';
    }

    if (datos.descripcion && datos.descripcion.length > 500) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 500 caracteres';
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
      setCargando(true);
      
      const datosApiario = {
        ...datos,
        usuario_id: usuario.id
      };

      if (esEdicion) {
        await apiariosAPI.actualizarApiario(apiario.id, datosApiario);
      } else {
        await apiariosAPI.crearApiario(datosApiario);
      }

      onSubmit();
    } catch (err) {
      const errorInfo = manejarError(err);
      alert(`Error: ${errorInfo.mensaje}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="formulario-apiario">
      <div className="form-header">
        <h2>
          {esEdicion ? '✏️ Editar Apiario' : '🏡 Nuevo Apiario'}
        </h2>
        <button 
          className="btn-close"
          onClick={onCancelar}
          type="button"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="apiario-form">
        <div className="form-group">
          <label htmlFor="nombre" className="form-label">
            Nombre del Apiario *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={datos.nombre}
            onChange={handleChange}
            className={`form-input ${errores.nombre ? 'error' : ''}`}
            placeholder="Ej: Los Naranjos, Campo Norte..."
            maxLength={100}
            disabled={cargando}
          />
          {errores.nombre && (
            <span className="error-message">{errores.nombre}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="ubicacion" className="form-label">
            Ubicación *
          </label>
          <input
            type="text"
            id="ubicacion"
            name="ubicacion"
            value={datos.ubicacion}
            onChange={handleChange}
            className={`form-input ${errores.ubicacion ? 'error' : ''}`}
            placeholder="Ej: Camino Rural Km 15, Sector Los Pinos..."
            maxLength={200}
            disabled={cargando}
          />
          {errores.ubicacion && (
            <span className="error-message">{errores.ubicacion}</span>
          )}
          <small className="form-help">
            Incluye referencias específicas para facilitar la ubicación
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion" className="form-label">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={datos.descripcion}
            onChange={handleChange}
            className={`form-textarea ${errores.descripcion ? 'error' : ''}`}
            placeholder="Describe características del terreno, acceso, fuentes de agua, flora cercana..."
            rows={4}
            maxLength={500}
            disabled={cargando}
          />
          {errores.descripcion && (
            <span className="error-message">{errores.descripcion}</span>
          )}
          <small className="form-help">
            {datos.descripcion.length}/500 caracteres
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="loading-dots">⏳</span>
                {esEdicion ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                {esEdicion ? '💾 Actualizar' : '➕ Crear Apiario'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioApiario;