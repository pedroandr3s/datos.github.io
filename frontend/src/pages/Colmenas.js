import React, { useState, useEffect } from 'react';
import { Package, Plus, Calendar, User, Home, RefreshCw } from 'lucide-react';
import { useApi } from '../context/ApiContext';

const Colmenas = () => {
  const { colmenas, selects, loading, error } = useApi();
  const [colmenasList, setColmenasList] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [apiariosList, setApiariosList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Langstroth',
    descripcion: '',
    dueno: '',
    apiario_id: ''
  });

  useEffect(() => {
    loadColmenas();
    loadSelectData();
  }, []);

  const loadColmenas = async () => {
    setRefreshing(true);
    try {
      const data = await colmenas.getAll();
      setColmenasList(data);
    } catch (err) {
      console.error('Error cargando colmenas:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const loadSelectData = async () => {
    try {
      const [usuariosData, apiariosData] = await Promise.all([
        selects.usuarios(),
        selects.apiarios()
      ]);
      setUsuariosList(usuariosData);
      setApiariosList(apiariosData);
    } catch (err) {
      console.error('Error cargando datos para selects:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dueno) {
      alert('Debe seleccionar un propietario');
      return;
    }
    
    try {
      await colmenas.create(formData);
      setFormData({
        nombre: '',
        tipo: 'Langstroth',
        descripcion: '',
        dueno: '',
        apiario_id: ''
      });
      setShowForm(false);
      loadColmenas();
      alert('Colmena creada exitosamente');
    } catch (err) {
      alert('Error al crear colmena: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (estado) => {
    return estado === 'activa' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-bee-yellow" />
            Gestión de Colmenas
          </h1>
          <p className="text-gray-600 mt-1">Administra tus colmenas y su estado</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadColmenas}
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
            Nueva Colmena
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nueva Colmena</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Colmena *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                  placeholder="Ej: Colmena 001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Colmena
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                >
                  <option value="Langstroth">Langstroth</option>
                  <option value="Top Bar">Top Bar</option>
                  <option value="Warre">Warré</option>
                  <option value="Kenyan">Kenyan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propietario *
                </label>
                <select
                  name="dueno"
                  value={formData.dueno}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                >
                  <option value="">Seleccionar propietario...</option>
                  {usuariosList.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} {usuario.apellido}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apiario
                </label>
                <select
                  name="apiario_id"
                  value={formData.apiario_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                >
                  <option value="">Sin asignar</option>
                  {apiariosList.map(apiario => (
                    <option key={apiario.id} value={apiario.id}>
                      {apiario.nombre}
                    </option>
                  ))}
                </select>
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
                placeholder="Describe las características de la colmena..."
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
                {loading ? 'Creando...' : 'Crear Colmena'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de colmenas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Colmenas Registradas ({colmenasList.length})
          </h2>
        </div>
        
        <div className="p-6">
          {loading && colmenasList.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bee-yellow mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando colmenas...</p>
            </div>
          ) : colmenasList.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay colmenas registradas</p>
              <p className="text-gray-500 text-sm mt-1">Crea la primera colmena para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colmenasList.map((colmena) => (
                <div key={colmena.id} className="border border-gray-200 rounded-lg p-6 card-hover bg-gradient-to-br from-yellow-50 to-amber-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="bg-bee-yellow bg-opacity-20 p-3 rounded-lg">
                        <Package className="h-6 w-6 text-bee-yellow" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {colmena.nombre}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(colmena.estado)}`}>
                          {colmena.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2 text-bee-orange" />
                      Tipo: {colmena.tipo}
                    </div>
                    
                    {colmena.apiario_nombre && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Home className="h-4 w-4 mr-2 text-bee-green" />
                        {colmena.apiario_nombre}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2 text-bee-dark" />
                      {colmena.dueno_nombre} {colmena.dueno_apellido}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      Instalada: {new Date(colmena.fecha_instalacion).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  {colmena.descripcion && (
                    <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {colmena.descripcion}
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

export default Colmenas;