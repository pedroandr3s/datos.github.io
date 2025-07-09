import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Calendar, Shield, RefreshCw } from 'lucide-react';
import { useApi } from '../context/ApiContext';

const Usuarios = () => {
  const { usuarios, loading, error } = useApi();
  const [usuariosList, setUsuariosList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    clave: ''
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    setRefreshing(true);
    try {
      const data = await usuarios.getAll();
      setUsuariosList(data);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await usuarios.create(formData);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        clave: ''
      });
      setShowForm(false);
      loadUsuarios();
      alert('Usuario creado exitosamente');
    } catch (err) {
      alert('Error al crear usuario: ' + (err.response?.data?.error || err.message));
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
            <Users className="h-8 w-8 mr-3 text-bee-yellow" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadUsuarios}
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
            Nuevo Usuario
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nuevo Usuario</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                  placeholder="Ingrese el nombre"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                  placeholder="Ingrese el apellido"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                  placeholder="ejemplo@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                name="clave"
                value={formData.clave}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bee-yellow focus:border-transparent"
                placeholder="Ingrese una contraseña segura"
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
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Usuarios Registrados ({usuariosList.length})
          </h2>
        </div>
        
        <div className="p-6">
          {loading && usuariosList.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bee-yellow mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando usuarios...</p>
            </div>
          ) : usuariosList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay usuarios registrados</p>
              <p className="text-gray-500 text-sm mt-1">Crea el primer usuario para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usuariosList.map((usuario) => (
                <div key={usuario.id} className="border border-gray-200 rounded-lg p-4 card-hover">
                  <div className="flex items-start">
                    <div className="bg-bee-yellow bg-opacity-20 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-bee-yellow" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {usuario.nombre} {usuario.apellido}
                      </h3>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {usuario.email}
                        </div>
                        
                        {usuario.telefono && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {usuario.telefono}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Shield className="h-4 w-4 mr-2" />
                          {usuario.rol_descripcion}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(usuario.fecha_registro).toLocaleDateString('es-ES')}
                        </div>
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

export default Usuarios;