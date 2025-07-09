import React, { useState } from 'react';
import { revisionesAPI, manejarError } from '../../services/api';

const FormularioRevision = ({ colmena, revision, onSubmit, onCancelar }) => {
  const [datos, setDatos] = useState({
    fecha_revision: revision?.fecha_revision ? 
      new Date(revision.fecha_revision).toISOString().slice(0, 16) :
      new Date().toISOString().slice(0, 16),
    num_alzas: revision?.num_alzas || '',
    marcos_abejas: revision?.marcos_abejas || '',
    marcos_cria: revision?.marcos_cria || '',
    marcos_alimento: revision?.marcos_alimento || '',
    marcos_polen: revision?.marcos_polen || '',
    presencia_varroa: revision?.presencia_varroa || 'no',
    condicion_reina: revision?.condicion_reina || 'buena',
    producto_sanitario: revision?.producto_sanitario || '',
    dosis_sanitario: revision?.dosis_sanitario || '',
    notas: revision?.notas || ''
  });
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});

  const esEdicion = !!revision;

  const opcionesCondicionReina = [
    { value: 'buena', label: '👑 Buena', description: 'Reina presente y activa' },
    { value: 'regular', label: '⚠️ Regular', description: 'Reina presente pero con problemas' },
    { value: 'mala', label: '❌ Mala', description: 'Reina en mal estado' },
    { value: 'ausente', label: '🚫 Ausente', description: 'No se encontró la reina' }
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    let newValue = value;
    
    // Para campos numéricos, asegurar que sean números válidos
    if (type === 'number') {
      newValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    }
    
    setDatos(prev => ({
      ...prev,
      [name]: newValue
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

    if (!datos.fecha_revision) {
      nuevosErrores.fecha_revision = 'La fecha de revisión es obligatoria';
    }

    // Validar que la fecha no sea futura
    const fechaRevision = new Date(datos.fecha_revision);
    const ahora = new Date();
    if (fechaRevision > ahora) {
      nuevosErrores.fecha_revision = 'La fecha no puede ser futura';
    }

    // Validaciones de campos numéricos
    const camposNumericos = ['num_alzas', 'marcos_abejas', 'marcos_cria', 'marcos_alimento', 'marcos_polen'];
    camposNumericos.forEach(campo => {
      const valor = parseInt(datos[campo]);
      if (datos[campo] !== '' && (isNaN(valor) || valor < 0)) {
        nuevosErrores[campo] = 'Debe ser un número válido mayor o igual a 0';
      }
    });

    // Validar coherencia de marcos
    const totalMarcos = ['marcos_abejas', 'marcos_cria', 'marcos_alimento', 'marcos_polen']
      .reduce((total, campo) => {
        const valor = parseInt(datos[campo]) || 0;
        return total + valor;
      }, 0);

    if (totalMarcos > 50) { // Límite razonable
      nuevosErrores.marcos_total = 'El total de marcos parece excesivo. Revisa los números.';
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
      
      const datosRevision = {
        ...datos,
        colmena_id: colmena.id,
        // Convertir campos numéricos vacíos a 0
        num_alzas: parseInt(datos.num_alzas) || 0,
        marcos_abejas: parseInt(datos.marcos_abejas) || 0,
        marcos_cria: parseInt(datos.marcos_cria) || 0,
        marcos_alimento: parseInt(datos.marcos_alimento) || 0,
        marcos_polen: parseInt(datos.marcos_polen) || 0,
        // Limpiar campos de texto
        producto_sanitario: datos.producto_sanitario.trim() || null,
        dosis_sanitario: datos.dosis_sanitario.trim() || null,
        notas: datos.notas.trim() || null
      };

      if (esEdicion) {
        await revisionesAPI.actualizarRevision(revision.id, datosRevision);
      } else {
        await revisionesAPI.crearRevision(datosRevision);
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
    <div className="formulario-revision">
      <div className="form-header">
        <h2>
          {esEdicion ? '✏️ Editar Revisión' : '📝 Nueva Revisión'}
        </h2>
        <div className="colmena-info">
          <span>🍯 {colmena.nombre}</span>
          <span>🏡 {colmena.apiario_nombre}</span>
        </div>
        <button 
          className="btn-close"
          onClick={onCancelar}
          type="button"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="revision-form">
        {/* Fecha de revisión */}
        <div className="form-group">
          <label htmlFor="fecha_revision" className="form-label">
            Fecha y Hora de Revisión *
          </label>
          <input
            type="datetime-local"
            id="fecha_revision"
            name="fecha_revision"
            value={datos.fecha_revision}
            onChange={handleChange}
            className={`form-input ${errores.fecha_revision ? 'error' : ''}`}
            disabled={cargando}
            max={new Date().toISOString().slice(0, 16)}
          />
          {errores.fecha_revision && (
            <span className="error-message">{errores.fecha_revision}</span>
          )}
        </div>

        {/* Estructura de la colmena */}
        <div className="form-section">
          <h3>🏠 Estructura de la Colmena</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="num_alzas" className="form-label">
                Número de Alzas
              </label>
              <input
                type="number"
                id="num_alzas"
                name="num_alzas"
                value={datos.num_alzas}
                onChange={handleChange}
                className={`form-input ${errores.num_alzas ? 'error' : ''}`}
                min="0"
                max="20"
                disabled={cargando}
              />
              {errores.num_alzas && (
                <span className="error-message">{errores.num_alzas}</span>
              )}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="marcos_abejas" className="form-label">
                🐝 Marcos con Abejas
              </label>
              <input
                type="number"
                id="marcos_abejas"
                name="marcos_abejas"
                value={datos.marcos_abejas}
                onChange={handleChange}
                className={`form-input ${errores.marcos_abejas ? 'error' : ''}`}
                min="0"
                max="50"
                disabled={cargando}
              />
              {errores.marcos_abejas && (
                <span className="error-message">{errores.marcos_abejas}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="marcos_cria" className="form-label">
                🥚 Marcos con Cría
              </label>
              <input
                type="number"
                id="marcos_cria"
                name="marcos_cria"
                value={datos.marcos_cria}
                onChange={handleChange}
                className={`form-input ${errores.marcos_cria ? 'error' : ''}`}
                min="0"
                max="30"
                disabled={cargando}
              />
              {errores.marcos_cria && (
                <span className="error-message">{errores.marcos_cria}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="marcos_alimento" className="form-label">
                🍯 Marcos con Alimento
              </label>
              <input
                type="number"
                id="marcos_alimento"
                name="marcos_alimento"
                value={datos.marcos_alimento}
                onChange={handleChange}
                className={`form-input ${errores.marcos_alimento ? 'error' : ''}`}
                min="0"
                max="30"
                disabled={cargando}
              />
              {errores.marcos_alimento && (
                <span className="error-message">{errores.marcos_alimento}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="marcos_polen" className="form-label">
                🌼 Marcos con Polen
              </label>
              <input
                type="number"
                id="marcos_polen"
                name="marcos_polen"
                value={datos.marcos_polen}
                onChange={handleChange}
                className={`form-input ${errores.marcos_polen ? 'error' : ''}`}
                min="0"
                max="20"
                disabled={cargando}
              />
              {errores.marcos_polen && (
                <span className="error-message">{errores.marcos_polen}</span>
              )}
            </div>
          </div>

          {errores.marcos_total && (
            <div className="error-message global">{errores.marcos_total}</div>
          )}
        </div>

        {/* Estado sanitario */}
        <div className="form-section">
          <h3>🏥 Estado Sanitario</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="presencia_varroa" className="form-label">
                🔬 Presencia de Varroa
              </label>
              <select
                id="presencia_varroa"
                name="presencia_varroa"
                value={datos.presencia_varroa}
                onChange={handleChange}
                className="form-select"
                disabled={cargando}
              >
                <option value="no">✅ No detectada</option>
                <option value="si">⚠️ Detectada</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condicion_reina" className="form-label">
                👑 Condición de la Reina
              </label>
              <select
                id="condicion_reina"
                name="condicion_reina"
                value={datos.condicion_reina}
                onChange={handleChange}
                className="form-select"
                disabled={cargando}
              >
                {opcionesCondicionReina.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
              <small className="form-help">
                {opcionesCondicionReina.find(o => o.value === datos.condicion_reina)?.description}
              </small>
            </div>
          </div>
        </div>

        {/* Tratamientos */}
        <div className="form-section">
          <h3>💉 Tratamientos Aplicados</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="producto_sanitario" className="form-label">
                Producto Sanitario
              </label>
              <input
                type="text"
                id="producto_sanitario"
                name="producto_sanitario"
                value={datos.producto_sanitario}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: Apistan, Bayvarol, Ácido oxálico..."
                maxLength={100}
                disabled={cargando}
              />
              <small className="form-help">
                Nombre del producto utilizado para tratamiento
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="dosis_sanitario" className="form-label">
                Dosis Aplicada
              </label>
              <input
                type="text"
                id="dosis_sanitario"
                name="dosis_sanitario"
                value={datos.dosis_sanitario}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: 2 tiras, 50ml, según fabricante..."
                maxLength={50}
                disabled={cargando}
              />
              <small className="form-help">
                Cantidad o dosis del producto aplicado
              </small>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="form-section">
          <h3>📝 Observaciones</h3>
          
          <div className="form-group">
            <label htmlFor="notas" className="form-label">
              Notas Adicionales
            </label>
            <textarea
              id="notas"
              name="notas"
              value={datos.notas}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe cualquier observación importante: comportamiento de las abejas, estado de los panales, problemas detectados, cambios realizados, etc."
              rows={4}
              maxLength={1000}
              disabled={cargando}
            />
            <small className="form-help">
              {datos.notas.length}/1000 caracteres
            </small>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="revision-summary">
          <h4>📊 Resumen de la Revisión</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total marcos poblados:</span>
              <span className="summary-value">
                {(parseInt(datos.marcos_abejas) || 0) + 
                 (parseInt(datos.marcos_cria) || 0) + 
                 (parseInt(datos.marcos_alimento) || 0) + 
                 (parseInt(datos.marcos_polen) || 0)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Estado sanitario:</span>
              <span className={`summary-value ${datos.presencia_varroa === 'si' ? 'warning' : 'success'}`}>
                {datos.presencia_varroa === 'si' ? '⚠️ Requiere atención' : '✅ Bueno'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Condición reina:</span>
              <span className="summary-value">
                {opcionesCondicionReina.find(o => o.value === datos.condicion_reina)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Consejos */}
        <div className="form-tips">
          <h4>💡 Consejos para la Revisión</h4>
          <ul>
            <li>🌡️ Realiza revisiones en días cálidos y sin viento</li>
            <li>🕐 El mejor momento es entre 10:00 y 15:00 horas</li>
            <li>🥽 Siempre usa equipo de protección adecuado</li>
            <li>🚭 Mantén el ahumador encendido durante toda la revisión</li>
            <li>⏱️ Minimiza el tiempo de colmena abierta</li>
            <li>📸 Considera tomar fotos para documentar hallazgos importantes</li>
          </ul>
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
                {esEdicion ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                {esEdicion ? '💾 Actualizar Revisión' : '📝 Guardar Revisión'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioRevision;