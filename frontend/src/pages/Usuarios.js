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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      console.log('🔄 Cargando datos de usuarios y roles...');
      
      const [usuariosData, rolesData] = await Promise.all([
        usuarios.getAll(),
        roles.getAll()
      ]);
      
      console.log('✅ Usuarios cargados:', usuariosData);
      console.log('✅ Roles cargados:', rolesData);
      
      setUsuariosList(usuariosData || []);
      setRolesList(rolesData || []);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setAlertMessage({
        type: 'error',
        message: 'Error al cargar los datos de usuarios'
      });
    }
  };

  // NUEVA FUNCIÓN: Obtener rol ID desde rol_nombre si no existe rol
  const getRolIdFromName = (rolNombre) => {
    if (!rolNombre || !rolesList || rolesList.length === 0) {
      return null;
    }
    
    const rol = rolesList.find(r => r.descripcion === rolNombre);
    return rol ? (rol.rol || rol.id) : null;
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      console.log('📝 Editando usuario:', user);
      setEditingUser(user);
      
      // CORREGIDO: Obtener el rol ID, con fallback a rol_nombre
      let rolId = user.rol;
      if (!rolId && user.rol_nombre) {
        rolId = getRolIdFromName(user.rol_nombre);
        console.log(`🔄 Rol ID obtenido desde rol_nombre "${user.rol_nombre}": ${rolId}`);
      }
      
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        clave: '',
        rol: rolId || ''
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
    setIsSubmitting(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre || !formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido || !formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }
    
    if (!editingUser && (!formData.clave || !formData.clave.trim())) {
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

    setIsSubmitting(true);

    try {
      console.log('📝 Enviando datos del formulario:', formData);
      
      const dataToSend = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        rol: parseInt(formData.rol)
      };
      
      if (formData.clave && formData.clave.trim()) {
        dataToSend.clave = formData.clave.trim();
      }
      
      console.log('📤 Datos a enviar:', dataToSend);

      if (editingUser) {
        console.log('✏️ Actualizando usuario:', editingUser.id);
        const result = await usuarios.update(editingUser.id, dataToSend);
        console.log('✅ Usuario actualizado:', result);
        setAlertMessage({
          type: 'success',
          message: 'Usuario actualizado correctamente'
        });
      } else {
        console.log('➕ Creando nuevo usuario');
        const result = await usuarios.create(dataToSend);
        console.log('✅ Usuario creado:', result);
        setAlertMessage({
          type: 'success',
          message: 'Usuario creado correctamente'
        });
      }
      
      handleCloseModal();
      await loadData();
    } catch (err) {
      console.error('❌ Error guardando usuario:', err);
      
      let errorMessage = `Error al ${editingUser ? 'actualizar' : 'crear'} el usuario`;
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      
      setAlertMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"?`)) {
      try {
        console.log('🗑️ Eliminando usuario:', userId);
        await usuarios.delete(userId);
        setAlertMessage({
          type: 'success',
          message: 'Usuario eliminado correctamente'
        });
        await loadData();
      } catch (err) {
        console.error('❌ Error eliminando usuario:', err);
        
        let errorMessage = 'Error al eliminar el usuario';
        if (err.response && err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
        
        setAlertMessage({
          type: 'error',
          message: errorMessage
        });
      }
    }
  };

  // CORREGIDO: Función para obtener el nombre del rol con múltiples fallbacks
  const getRoleName = (usuario) => {
    console.log('🔍 Obteniendo nombre del rol para usuario:', usuario);
    
    // Opción 1: Si ya tiene rol_nombre, usarlo directamente
    if (usuario.rol_nombre && usuario.rol_nombre !== 'Usuario') {
      console.log('✅ Usando rol_nombre directo:', usuario.rol_nombre);
      return usuario.rol_nombre;
    }
    
    // Opción 2: Si tiene rol (ID), buscar en la lista de roles
    if (usuario.rol && rolesList && rolesList.length > 0) {
      const rol = rolesList.find(r => {
        return (r.rol && r.rol === parseInt(usuario.rol)) || (r.id && r.id === parseInt(usuario.rol));
      });
      
      if (rol) {
        console.log('✅ Rol encontrado por ID:', rol);
        return rol.descripcion;
      }
    }
    
    // Opción 3: Fallback
    console.log('⚠️ No se encontró rol, usando fallback');
    return 'Sin rol';
  };

  const getRoleBadgeClass = (usuario) => {
    // Intentar obtener el ID del rol
    let rolId = usuario.rol;
    
    // Si no tiene rol pero tiene rol_nombre, intentar obtener el ID
    if (!rolId && usuario.rol_nombre) {
      rolId = getRolIdFromName(usuario.rol_nombre);
    }
    
    const rolIdNum = parseInt(rolId);
    switch (rolIdNum) {
      case 1:
        return 'badge-danger';   // Administrador - Rojo
      case 2:
        return 'badge-success';  // Apicultor - Verde
      case 3:
        return 'badge-info';     // Investigador - Azul
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
          disabled={isSubmitting}
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
                {usuariosList.map((usuario) => {
                  console.log('👤 Usuario en tabla:', usuario);
                  
                  return (
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
                        <span className={`badge ${getRoleBadgeClass(usuario)}`}>
                          {getRoleName(usuario)}
                        </span>
                        {/* DEBUG: Mostrar información de debug */}
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                          {usuario.rol ? `ID: ${usuario.rol}` : `Nombre: ${usuario.rol_nombre}`}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-gap">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenModal(usuario)}
                            disabled={isSubmitting}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(usuario.id, `${usuario.nombre} ${usuario.apellido}`)}
                            disabled={isSubmitting}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              className={`form-input ${formErrors.nombre ? 'error' : ''}`}
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ingresa el nombre"
              disabled={isSubmitting}
            />
            {formErrors.nombre && (
              <div className="error-message">{formErrors.nombre}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Apellido *</label>
            <input
              type="text"
              className={`form-input ${formErrors.apellido ? 'error' : ''}`}
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              placeholder="Ingresa el apellido"
              disabled={isSubmitting}
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
              className={`form-input ${formErrors.clave ? 'error' : ''}`}
              value={formData.clave}
              onChange={(e) => setFormData({...formData, clave: e.target.value})}
              placeholder={editingUser ? "Nueva clave (opcional)" : "Ingresa la clave"}
              disabled={isSubmitting}
            />
            {formErrors.clave && (
              <div className="error-message">{formErrors.clave}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Rol *</label>
            <select
              className={`form-select ${formErrors.rol ? 'error' : ''}`}
              value={formData.rol}
              onChange={(e) => {
                console.log('🔄 Cambiando rol a:', e.target.value);
                setFormData({...formData, rol: e.target.value});
              }}
              disabled={isSubmitting}
            >
              <option value="">Selecciona un rol</option>
              {rolesList.map((rol) => {
                const rolId = rol.rol || rol.id;
                return (
                  <option key={rolId} value={rolId}>
                    {rol.descripcion}
                  </option>
                );
              })}
            </select>
            {formErrors.rol && (
              <div className="error-message">{formErrors.rol}</div>
            )}
            {formData.rol && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                Rol seleccionado: {formData.rol}
              </div>
            )}
          </div>

          <div className="flex flex-gap flex-between mt-6">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                (editingUser ? 'Actualizando...' : 'Creando...') : 
                (editingUser ? 'Actualizar' : 'Crear')
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;