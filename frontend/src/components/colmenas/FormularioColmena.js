import React, { useState, useEffect } from 'react';
import { colmenasAPI, apiariosAPI, manejarError } from '../../services/api';

const FormularioColmena = ({ colmena, apiarioId, usuario, onSubmit, onCancelar }) => {
  const [datos, setDatos] = useState({
    nombre: '',
    tipo: 'Langstroth',
    estado: 'activa',
    apiario_id: apiarioId || ''
  });
  const [apiarios, setApiarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoApiarios, setCargandoApiarios] = useState(false);
  const [errores, setErrores] = useState({});

  const esEdicion = !!colmena;

  const tiposColmena = [
    'Langstroth',
    'Dadant',
    'Top Bar',
    'Warre',
    'Kenyan',
    'Flow Hive',
    'Otro'
  ];

  useEffect(() => {
    if (colmena) {
      setDatos({
        nombre: colmena.nombre || '',
        tipo: colmena.tipo || 'Langstroth',
        estado: colmena.estado || 'activa',
        apiario_id: colmena.apiario_id || apiarioId || ''
      });
    }
    
    if (!apiarioId) {
      cargarApiarios();
    }
  }, [colmena, apiarioId]);

  const cargarApiarios = async () => {
    try {
      setCargandoApiarios(true);
      const response = await apiariosAPI.obtenerApiarios(usuario?.id);
      setApiarios(response);
    } catch (err) {
      console.error('Error cargando apiarios:', err);
    } finally {
      setCargandoApiarios(false);
    }
  };

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
    } else if (datos.nombre.length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!datos.tipo) {
      nuevosErrores.tipo = 'El tipo de colmena es obligatorio';
    }

    if (!datos.apiario_id) {
      nuevosErrores.apiario_id = 'Debe seleccionar un apiario';
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
      
      const datosColmena = {
        ...datos,
        nombre: datos.nombre.trim(),
        apiario_id: parseInt(datos.apiario_id)
      };

      if (esEdicion) {
        await colmenasAPI.actualizarColmena(colmena.id, datosColmena);
      } else {
        await colmenasAPI.crearColmena(datosColmena);
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
    <div className="formulario-colmena">
      <div className="form-header">
        <h2>
          {esEdicion ? '✏️ Editar Colmena' : '🍯 Nueva Colmena'}
        </h2>
        <button 
          className="btn-close"
          onClick={onCancelar}
          type="button"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="colmena-form">
        <div className="form-group">
          <label htmlFor="nombre" className="form-label">
            Nombre de la Colmena *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={datos.nombre}
            onChange={handleChange}
            className={`form-input ${errores.nombre ? 'error' : ''}`}
            placeholder="Ej: Reina Victoria, Colmena #1..."
            maxLength={100}
            disabled={cargando}
          />
          {errores.nombre && (
            <span className="error-message">{errores.nombre}</span>
          )}
          <small className="form-help">
            Asigna un nombre único y descriptivo para identificar fácilmente la colmena
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tipo" className="form-label">
              Tipo de Colmena *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={datos.tipo}
              onChange={handleChange}
              className={`form-select ${errores.tipo ? 'error' : ''}`}
              disabled={cargando}
            >
              {tiposColmena.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {errores.tipo && (
              <span className="error-message">{errores.tipo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="estado" className="form-label">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={datos.estado}
              onChange={handleChange}
              className="form-select"
              disabled={cargando}
            >
              <option value="activa">🐝 Activa</option>
              <option value="inactiva">💤 Inactiva</option>
            </select>
            <small className="form-help">
              Estado actual de la colmena
            </small>
          </div>
        </div>

        {!apiarioId && (
          <div className="form-group">
            <label htmlFor="apiario_id" className="form-label">
              Apiario *
            </label>
            {cargandoApiarios ? (
              <div className="loading-select">Cargando apiarios...</div>
            ) : (
              <select
                id="apiario_id"
                name="apiario_id"
                value={datos.apiario_id}
                onChange={handleChange}
                className={`form-select ${errores.apiario_id ? 'error' : ''}`}
                disabled={cargando}
              >
                <option value="">Seleccionar apiario...</option>
                {apiarios.map(apiario => (
                  <option key={apiario.id} value={apiario.id}>
                    {apiario.nombre} - {apiario.ubicacion}
                  </option>
                ))}
              </select>
            )}
            {errores.apiario_id && (
              <span className="error-message">{errores.apiario_id}</span>
            )}
            <small className="form-help">
              Selecciona el apiario donde se ubicará la colmena
            </small>
          </div>
        )}

        {/* Información adicional para nuevas colmenas */}
        {!esEdicion && (
          <div className="info-section">
            <h4>📋 Información Adicional</h4>
            <div className="info-content">
              <p>
                <strong>💡 Consejos para el registro:</strong>
              </p>
              <ul>
                <li>🏷️ Usa nombres descriptivos (ej: "Reina Isabel", "Colmena Norte #3")</li>
                <li>📦 Selecciona el tipo correcto según tu sistema de manejo</li>
                <li>📍 Asegúrate de que el apiario sea el correcto</li>
                <li>📝 Después del registro podrás añadir más detalles y realizar revisiones</li>
              </ul>
            </div>
          </div>
        )}

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
            disabled={cargando || cargandoApiarios}
          >
            {cargando ? (
              <>
                <span className="loading-dots">⏳</span>
                {esEdicion ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                {esEdicion ? '💾 Actualizar Colmena' : '➕ Crear Colmena'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioColmena;