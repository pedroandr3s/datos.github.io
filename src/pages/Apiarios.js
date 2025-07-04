import React, { useState, useEffect } from 'react';
import { Home, Plus, MapPin, Calendar, Package, RefreshCw } from 'lucide-react';
import { useApi } from '../context/ApiContext';

const Apiarios = () => {
  const { apiarios, loading, error } = useApi();
  const [apiariosList, setApiariosList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: ''
  });

  useEffect(() => {
    loadApiarios();
  }, []);

  const loadApiarios = async () => {
    setRefreshing(true);
    try {
      const data = await apiarios.getAll();
      setApiariosList(data);
    } catch (err) {
      console.error('Error cargando apiarios:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiarios.create(formData);
      setFormData({
        nombre: '',
        ubicacion: '',
        descripcion: ''
      });
      setShowForm(false);
      loadApiarios();
      alert('Apiario creado exitosamente');
    } catch (err) {
      alert('Error al crear apiario: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Home className="h-8 w-8 mr-3 text-bee-green" />
            Gestión de Apiarios
          </h1>
          <p className="text-gray-600 mt-1">Administra las ubicaciones de tus colmenas</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadApiarios}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-bee-green text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-bee-yellow text-white rounded-lg hover:bg-bee-orange transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Apiario
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nuevo Apiario</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Apiario *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                  placeholder="Ej: Apiario Las Flores"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                  placeholder="Ej: Coronel, Biobío, Chile"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                placeholder="Describe las características del apiario..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-bee-yellow text-white rounded-lg hover:bg-bee-orange disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Apiario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de apiarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Apiarios Registrados ({apiariosList.length})
          </h2>
        </div>
        
        <div className="p-6">
          {loading && apiariosList.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bee-yellow mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando apiarios...</p>
            </div>
          ) : apiariosList.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay apiarios registrados</p>
              <p className="text-gray-500 text-sm mt-1">Crea el primer apiario para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiariosList.map((apiario) => (
                <div key={apiario.id} className="border border-gray-200 rounded-lg p-6 card-hover bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex items-start">
                    <div className="bg-bee-green bg-opacity-20 p-3 rounded-lg">
                      <Home className="h-6 w-6 text-bee-green" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {apiario.nombre}
                      </h3>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-bee-green" />
                          {apiario.ubicacion}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="h-4 w-4 mr-2 text-bee-yellow" />
                          {apiario.total_colmenas} colmena(s)
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          Creado: {new Date(apiario.fecha_creacion).toLocaleDateString('es-ES')}
                        </div>
                      </div>

                      {apiario.descripcion && (
                        <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {apiario.descripcion}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center text-sm">
                        <span className="text-gray-600">Propietario:</span>
                        <span className="ml-2 font-medium text-bee-dark">
                          {apiario.propietario_nombre} {apiario.propietario_apellido}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Apiarios;