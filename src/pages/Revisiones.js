import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Thermometer, Droplets, Weight, RefreshCw, Bug, Crown } from 'lucide-react';
import { useApi } from '../context/ApiContext';

const Revisiones = () => {
  const { revisiones, colmenas, loading, error } = useApi();
  const [revisionesList, setRevisionesList] = useState([]);
  const [colmenasList, setColmenasList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    colmena_id: '',
    fecha_revision: '',
    num_alzas: 0,
    marcos_abejas: 0,
    marcos_cria: 0,
    marcos_alimento: 0,
    marcos_polen: 0,
    presencia_varroa: 'no',
    condicion_reina: 'buena',
    producto_sanitario: '',
    dosis_sanitario: '',
    temperatura: '',
    humedad: '',
    peso: '',
    notas: ''
  });

  useEffect(() => {
    loadRevisiones();
    loadColmenasActivas();
    
    // Establecer fecha actual
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFormData(prev => ({ ...prev, fecha_revision: localDateTime }));
  }, []);

  const loadRevisiones = async () => {
    setRefreshing(true);
    try {
      const data = await revisiones.getAll();
      setRevisionesList(data);
    } catch (err) {
      console.error('Error cargando revisiones:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const loadColmenasActivas = async () => {
    try {
      const data = await colmenas.getActivas();
      setColmenasList(data);
    } catch (err) {
      console.error('Error cargando colmenas:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.colmena_id) {
      alert('Debe seleccionar una colmena');
      return;
    }
    
    try {
      // Convertir valores vacíos a null para números
      const dataToSend = {
        ...formData,
        temperatura: formData.temperatura || null,
        humedad: formData.humedad || null,
        peso: formData.peso || null
      };
      
      await revisiones.create(dataToSend);
      
      // Resetear formulario
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
        
      setFormData({
        colmena_id: '',
        fecha_revision: localDateTime,
        num_alzas: 0,
        marcos_abejas: 0,
        marcos_cria: 0,
        marcos_alimento: 0,
        marcos_polen: 0,
        presencia_varroa: 'no',
        condicion_reina: 'buena',
        producto_sanitario: '',
        dosis_sanitario: '',
        temperatura: '',
        humedad: '',
        peso: '',
        notas: ''
      });
      
      setShowForm(false);
      loadRevisiones();
      alert('Revisión registrada exitosamente');
    } catch (err) {
      alert('Error al registrar revisión: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    });
  };

  const getVarroaColor = (varroa) => {
    return varroa === 'no' 
      ? 'text-green-600' 
      : 'text-red-600';
  };

  const getReinaColor = (condicion) => {
    switch(condicion) {
      case 'buena': return 'text-green-600';
      case 'regular': return 'text-yellow-600';
      case 'mala': return 'text-orange-600';
      case 'ausente': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getReinaIcon = (condicion) => {
    return condicion === 'ausente' ? '👑❌' : '👑';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3 text-purple-600" />
            Registro de Revisiones
          </h1>
          <p className="text-gray-600 mt-1">Documenta las inspecciones de tus colmenas</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadRevisiones}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-bee-green text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Revisión
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Nueva Revisión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colmena *
                </label>
                <select
                  name="colmena_id"
                  value={formData.colmena_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar colmena...</option>
                  {colmenasList.map(colmena => (
                    <option key={colmena.id} value={colmena.id}>
                      {colmena.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora de Revisión *
                </label>
                <input
                  type="datetime-local"
                  name="fecha_revision"
                  value={formData.fecha_revision}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Información de marcos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                📦 Información de Marcos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏗️ Alzas
                  </label>
                  <input
                    type="number"
                    name="num_alzas"
                    value={formData.num_alzas}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🐝 Marcos con Abejas
                  </label>
                  <input
                    type="number"
                    name="marcos_abejas"
                    value={formData.marcos_abejas}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🥚 Marcos con Cría
                  </label>
                  <input
                    type="number"
                    name="marcos_cria"
                    value={formData.marcos_cria}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🍯 Marcos Alimento
                  </label>
                  <input
                    type="number"
                    name="marcos_alimento"
                    value={formData.marcos_alimento}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌼 Marcos Polen
                  </label>
                  <input
                    type="number"
                    name="marcos_polen"
                    value={formData.marcos_polen}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Estado de la colonia */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                🏥 Estado de la Colonia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🦠 Presencia de Varroa
                  </label>
                  <select
                    name="presencia_varroa"
                    value={formData.presencia_varroa}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="no">No detectada</option>
                    <option value="si">Detectada</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👑 Condición de la Reina
                  </label>
                  <select
                    name="condicion_reina"
                    value={formData.condicion_reina}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="buena">Buena</option>
                    <option value="regular">Regular</option>
                    <option value="mala">Mala</option>
                    <option value="ausente">Ausente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tratamientos */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                💊 Tratamientos Aplicados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto Sanitario
                  </label>
                  <input
                    type="text"
                    name="producto_sanitario"
                    value={formData.producto_sanitario}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nombre del producto aplicado"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosis Aplicada
                  </label>
                  <input
                    type="text"
                    name="dosis_sanitario"
                    value={formData.dosis_sanitario}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Cantidad y unidad"
                  />
                </div>
              </div>
            </div>

            {/* Mediciones ambientales */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                📊 Mediciones Ambientales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Thermometer className="h-4 w-4 inline mr-1 text-red-500" />
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    name="temperatura"
                    value={formData.temperatura}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="25.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Droplets className="h-4 w-4 inline mr-1 text-blue-500" />
                    Humedad (%)
                  </label>
                  <input
                    type="number"
                    name="humedad"
                    value={formData.humedad}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="60.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Weight className="h-4 w-4 inline mr-1 text-green-500" />
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="45.2"
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Notas de la Revisión
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Observaciones generales de la revisión..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Registrar Revisión
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de revisiones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Revisiones Registradas ({revisionesList.length})
          </h2>
        </div>
        
        <div className="p-6">
          {loading && revisionesList.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando revisiones...</p>
            </div>
          ) : revisionesList.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No hay revisiones registradas</p>
              <p className="text-gray-500">Registra la primera revisión para comenzar a monitorear tus colmenas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {revisionesList.map((revision) => (
                <div key={revision.id} className="border border-gray-200 rounded-lg p-6 card-hover bg-gradient-to-br from-purple-50 to-indigo-50">
                  {/* Header de la revisión */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900 text-lg">
                          🏺 {revision.colmena_nombre}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(revision.fecha_revision).toLocaleString('es-ES')}
                        </p>
                        <p className="text-sm text-purple-600 font-medium">
                          Inspector: {revision.inspector_nombre} {revision.inspector_apellido}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información de marcos en grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">🏗️ Alzas</p>
                      <p className="text-xl font-bold text-gray-900">{revision.num_alzas}</p>
                    </div>
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">🐝 Con Abejas</p>
                      <p className="text-xl font-bold text-gray-900">{revision.marcos_abejas}</p>
                    </div>
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">🥚 Cría</p>
                      <p className="text-xl font-bold text-gray-900">{revision.marcos_cria}</p>
                    </div>
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-600">🍯 Alimento</p>
                      <p className="text-xl font-bold text-gray-900">{revision.marcos_alimento}</p>
                    </div>
                  </div>

                  {/* Estado de la colonia */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Bug className="h-4 w-4 mr-1" />
                        Varroa
                      </p>
                      <p className={`font-bold text-lg ${getVarroaColor(revision.presencia_varroa)}`}>
                        {revision.presencia_varroa === 'si' ? '⚠️ Presente' : '✅ Ausente'}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Crown className="h-4 w-4 mr-1" />
                        Reina
                      </p>
                      <p className={`font-bold text-lg capitalize ${getReinaColor(revision.condicion_reina)}`}>
                        {getReinaIcon(revision.condicion_reina)} {revision.condicion_reina}
                      </p>
                    </div>
                  </div>

                  {/* Mediciones ambientales */}
                  {(revision.temperatura || revision.humedad || revision.peso) && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {revision.temperatura && (
                        <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-lg text-center">
                          <Thermometer className="h-5 w-5 text-red-600 mx-auto mb-1" />
                          <p className="text-sm font-bold text-red-800">{revision.temperatura}°C</p>
                        </div>
                      )}
                      {revision.humedad && (
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-lg text-center">
                          <Droplets className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm font-bold text-blue-800">{revision.humedad}%</p>
                        </div>
                      )}
                      {revision.peso && (
                        <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-lg text-center">
                          <Weight className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm font-bold text-green-800">{revision.peso}kg</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tratamientos aplicados */}
                  {revision.producto_sanitario && (
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        💊 Tratamiento Aplicado
                      </p>
                      <p className="font-semibold text-gray-900">
                        {revision.producto_sanitario}
                        {revision.dosis_sanitario && (
                          <span className="text-gray-600 font-normal"> - {revision.dosis_sanitario}</span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Notas de la revisión */}
                  {revision.notas && (
                    <div className="bg-white bg-opacity-70 p-4 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        📝 Observaciones
                      </p>
                      <p className="text-sm text-gray-800 italic leading-relaxed">
                        "{revision.notas}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Revisiones;