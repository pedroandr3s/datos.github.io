import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const Usuarios = () => {
  const { usuarios, roles, loading, error } = useApi();
  const [usuariosList, setUsuariosList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    clave: '',
    rol: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usuariosData, rolesData] = await Promise.all([
        usuarios.getAll(),
        roles.getAll()
      ]);
      setUsuariosList(usuariosData);
      setRolesList(rolesData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setAlertMessage({
        type: 'error',
        message: 'Error al cargar los datos de usuarios'
      });
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        clave: '',
        rol: user.rol
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        clave: '',
        rol: ''
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      clave: '',
      rol: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }
    
    if (!editingUser && !formData.clave.trim()) {
      errors.clave = 'La clave es requerida';
    }
    
    if (!formData.rol) {
      errors.rol = 'El rol es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const dataToSend = { ...formData };
      
      // Si estamos editando y no hay nueva clave, no la enviamos
      if (editingUser && !dataToSend.clave.trim()) {
        delete dataToSend.clave;
      }

      if (editingUser) {
        await usuarios.update(editingUser.id, dataToSend);
        setAlertMessage({
          type: 'success',
          message: 'Usuario actualizado correctamente'
        });
      } else {
        await usuarios.create(dataToSend);
        setAlertMessage({
          type: 'success',
          message: 'Usuario creado correctamente'
        });
      }
      
      handleCloseModal();
      loadData();
    } catch (err) {
      console.error('Error guardando usuario:', err);
      setAlertMessage({
        type: 'error',
        message: `Error al ${editingUser ? 'actualizar' : 'crear'} el usuario`
      });
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"?`)) {
      try {
        await usuarios.delete(userId);
        setAlertMessage({
          type: 'success',
          message: 'Usuario eliminado correctamente'
        });
        loadData();
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        setAlertMessage({
          type: 'error',
          message: 'Error al eliminar el usuario'
        });
      }
    }
  };

  const getRoleName = (rolId) => {
    const rol = rolesList.find(r => r.rol === rolId);
    return rol ? rol.descripcion : 'Sin rol';
  };

  const getRoleBadgeClass = (rolId) => {
    switch (rolId) {
      case 1:
        return 'badge-danger';
      case 2:
        return 'badge-success';
      case 3:
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  if (loading && usuariosList.length === 0) {
    return <Loading message="Cargando usuarios..." />;
  }

  return (
    <div>
      <div className="flex flex-between flex-center mb-6">
        <h1 className="page-title" style={{ margin: 0 }}>Usuarios</h1>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          + Nuevo Usuario
        </button>
      </div>

      {alertMessage && (
        <Alert 
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <Card title="Lista de Usuarios">
        {usuariosList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>
              No hay usuarios registrados
            </h3>
            <p>Comienza agregando tu primer usuario</p>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => handleOpenModal()}
            >
              Crear Usuario
            </button>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosList.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        #{usuario.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280' 
                        }}>
                          Usuario ID: {usuario.id}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(usuario.rol)}`}>
                        {getRoleName(usuario.rol)}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-gap">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenModal(usuario)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(usuario.id, `${usuario.nombre} ${usuario.apellido}`)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal para crear/editar usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              className="form-input"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ingresa el nombre"
            />
            {formErrors.nombre && (
              <div className="error-message">{formErrors.nombre}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Apellido *</label>
            <input
              type="text"
              className="form-input"
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              placeholder="Ingresa el apellido"
            />
            {formErrors.apellido && (
              <div className="error-message">{formErrors.apellido}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Clave {editingUser ? '(dejar vacío para mantener actual)' : '*'}
            </label>
            <input
              type="password"
              className="form-input"
              value={formData.clave}
              onChange={(e) => setFormData({...formData, clave: e.target.value})}
              placeholder={editingUser ? "Nueva clave (opcional)" : "Ingresa la clave"}
            />
            {formErrors.clave && (
              <div className="error-message">{formErrors.clave}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Rol *</label>
            <select
              className="form-select"
              value={formData.rol}
              onChange={(e) => setFormData({...formData, rol: e.target.value})}
            >
              <option value="">Selecciona un rol</option>
              {rolesList.map((rol) => (
                <option key={rol.rol} value={rol.rol}>
                  {rol.descripcion}
                </option>
              ))}
            </select>
            {formErrors.rol && (
              <div className="error-message">{formErrors.rol}</div>
            )}
          </div>

          <div className="flex flex-gap flex-between mt-6">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;