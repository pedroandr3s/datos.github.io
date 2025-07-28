import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const Colmenas = () => {
  const { colmenas, usuarios, nodos, mensajes, loading, error } = useApi();
  const [colmenasList, setColmenasList] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [nodosList, setNodosList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingColmena, setEditingColmena] = useState(null);
  const [selectedColmena, setSelectedColmena] = useState(null);
  const [colmenaDetail, setColmenaDetail] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: '',
    dueno: '',
    latitud: '',
    longitud: '',
    ubicacion_descripcion: '',
    comuna: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Estado para autenticación
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const checkAuthentication = () => {
    try {
      const token = localStorage.getItem('smartbee_token');
      const userData = localStorage.getItem('smartbee_user');
      
      if (!token || !userData) {
        console.log('❌ Usuario no autenticado, redirigiendo al login...');
        window.location.reload();
        return;
      }

      const user = JSON.parse(userData);
      setCurrentUser(user);
      setIsAuthenticated(true);
      console.log('✅ Usuario autenticado:', user);
      
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('smartbee_token');
      localStorage.removeItem('smartbee_user');
      window.location.reload();
    }
  };

  const loadData = async () => {
    try {
      console.log('🔄 Cargando datos de colmenas...');
      
      const [colmenasData, usuariosData, nodosData] = await Promise.all([
        colmenas.getAll(),
        usuarios.getAll(),
        nodos.getAll()
      ]);
      
      console.log('✅ Colmenas cargadas:', colmenasData);
      console.log('✅ Usuarios cargados:', usuariosData);
      console.log('✅ Nodos cargados:', nodosData);
      
      setColmenasList(colmenasData || []);
      setUsuariosList(usuariosData || []);
      setNodosList(nodosData || []);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      
      // Si el error es 401, probablemente el token expiró
      if (err.response && err.response.status === 401) {
        console.log('🔐 Token expirado, cerrando sesión...');
        localStorage.removeItem('smartbee_token');
        localStorage.removeItem('smartbee_user');
        window.location.reload();
        return;
      }
      
      setAlertMessage({
        type: 'error',
        message: 'Error al cargar los datos de colmenas'
      });
    }
  };

  const loadColmenaDetail = async (colmenaId) => {
    try {
      console.log(`🔍 Cargando detalle de colmena ${colmenaId}`);
      
      // Intentar obtener detalle completo si el método existe
      let colmenaData;
      try {
        if (colmenas.getById) {
          colmenaData = await colmenas.getById(colmenaId);
        } else {
          // Fallback: usar datos de la lista
          colmenaData = colmenasList.find(c => c.id === colmenaId);
        }
      } catch (err) {
        console.warn('⚠️ getById no disponible, usando datos de lista');
        colmenaData = colmenasList.find(c => c.id === colmenaId);
      }
      
      // Intentar obtener nodos asociados
      let nodosData = [];
      try {
        if (colmenas.getNodos) {
          nodosData = await colmenas.getNodos(colmenaId);
        }
      } catch (err) {
        console.warn('⚠️ getNodos no disponible');
      }
      
      setColmenaDetail({
        ...colmenaData,
        nodos: nodosData,
        mensajesRecientes: []
      });
      
    } catch (err) {
      console.error('❌ Error cargando detalle:', err);
      
      // Manejar errores de autenticación
      if (err.response && err.response.status === 401) {
        console.log('🔐 Token expirado durante carga de detalle...');
        localStorage.removeItem('smartbee_token');
        localStorage.removeItem('smartbee_user');
        window.location.reload();
        return;
      }
      
      setAlertMessage({
        type: 'error',
        message: 'Error al cargar el detalle de la colmena'
      });
    }
  };

  const handleOpenModal = (colmena = null) => {
    // Verificar permisos antes de abrir modal
    if (!currentUser) {
      setAlertMessage({
        type: 'error',
        message: 'No tienes permisos para realizar esta acción'
      });
      return;
    }

    if (colmena) {
      setEditingColmena(colmena);
      setFormData({
        descripcion: colmena.descripcion || '',
        dueno: colmena.dueno || '',
        latitud: colmena.latitud || '',
        longitud: colmena.longitud || '',
        ubicacion_descripcion: colmena.ubicacion_descripcion || '',
        comuna: colmena.comuna || ''
      });
    } else {
      setEditingColmena(null);
      setFormData({
        descripcion: '',
        dueno: '',
        latitud: '',
        longitud: '',
        ubicacion_descripcion: '',
        comuna: ''
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingColmena(null);
    setFormData({
      descripcion: '',
      dueno: '',
      latitud: '',
      longitud: '',
      ubicacion_descripcion: '',
      comuna: ''
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  const handleOpenDetailModal = async (colmena) => {
    setSelectedColmena(colmena);
    setIsDetailModalOpen(true);
    await loadColmenaDetail(colmena.id);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedColmena(null);
    setColmenaDetail(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.descripcion || !formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.dueno) {
      errors.dueno = 'El dueño es requerido';
    }

    if (formData.latitud && (isNaN(formData.latitud) || formData.latitud < -90 || formData.latitud > 90)) {
      errors.latitud = 'Latitud debe ser un número entre -90 y 90';
    }

    if (formData.longitud && (isNaN(formData.longitud) || formData.longitud < -180 || formData.longitud > 180)) {
      errors.longitud = 'Longitud debe ser un número entre -180 y 180';
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
      console.log('📝 Enviando datos de colmena:', formData);
      
      const colmenaData = {
        descripcion: formData.descripcion.trim(),
        dueno: formData.dueno
      };

      let colmenaId;
      
      if (editingColmena) {
        console.log('✏️ Actualizando colmena:', editingColmena.id);
        await colmenas.update(editingColmena.id, colmenaData);
        colmenaId = editingColmena.id;
        setAlertMessage({
          type: 'success',
          message: 'Colmena actualizada correctamente'
        });
      } else {
        console.log('➕ Creando nueva colmena');
        const nuevaColmena = await colmenas.create(colmenaData);
        colmenaId = nuevaColmena.id;
        setAlertMessage({
          type: 'success',
          message: 'Colmena creada correctamente'
        });
      }

      // Intentar agregar ubicación si hay datos y el método existe
      if (formData.latitud && formData.longitud && colmenas.addUbicacion) {
        const ubicacionData = {
          latitud: parseFloat(formData.latitud),
          longitud: parseFloat(formData.longitud),
          descripcion: formData.ubicacion_descripcion,
          comuna: formData.comuna
        };
        
        try {
          console.log('📍 Agregando ubicación:', ubicacionData);
          await colmenas.addUbicacion(colmenaId, ubicacionData);
          console.log('✅ Ubicación agregada exitosamente');
        } catch (ubicErr) {
          console.warn('⚠️ Error agregando ubicación (puede ser normal si el endpoint no existe):', ubicErr);
          // No mostrar error al usuario, ya que la colmena se creó exitosamente
        }
      }
      
      handleCloseModal();
      await loadData();
    } catch (err) {
      console.error('❌ Error guardando colmena:', err);
      
      // Manejar errores de autenticación
      if (err.response && err.response.status === 401) {
        console.log('🔐 Token expirado durante operación...');
        localStorage.removeItem('smartbee_token');
        localStorage.removeItem('smartbee_user');
        window.location.reload();
        return;
      }
      
      let errorMessage = `Error al ${editingColmena ? 'actualizar' : 'crear'} la colmena`;
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

  const handleDelete = async (colmenaId, descripcion) => {
    // Verificar permisos antes de eliminar
    if (!currentUser || currentUser.rol !== 'ADM') {
      setAlertMessage({
        type: 'error',
        message: 'Solo los administradores pueden eliminar colmenas'
      });
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar la colmena "${descripcion}"?`)) {
      try {
        console.log(`🗑️ Eliminando colmena ${colmenaId}`);
        await colmenas.delete(colmenaId);
        setAlertMessage({
          type: 'success',
          message: 'Colmena eliminada correctamente'
        });
        await loadData();
      } catch (err) {
        console.error('❌ Error eliminando colmena:', err);
        
        // Manejar errores de autenticación
        if (err.response && err.response.status === 401) {
          console.log('🔐 Token expirado durante eliminación...');
          localStorage.removeItem('smartbee_token');
          localStorage.removeItem('smartbee_user');
          window.location.reload();
          return;
        }
        
        setAlertMessage({
          type: 'error',
          message: 'Error al eliminar la colmena'
        });
      }
    }
  };

  const getDuenoName = (duenoId) => {
    const usuario = usuariosList.find(u => u.id === duenoId);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sin asignar';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditColmena = (colmena) => {
    if (!currentUser) return false;
    
    // Administradores pueden editar cualquier colmena
    if (currentUser.rol === 'ADM') return true;
    
    // Los dueños pueden editar sus propias colmenas
    if (colmena.dueno === currentUser.id) return true;
    
    return false;
  };

  const canDeleteColmena = () => {
    return currentUser && currentUser.rol === 'ADM';
  };

  // Si no está autenticado, mostrar mensaje de carga
  if (!isAuthenticated) {
    return <Loading message="Verificando autenticación..." />;
  }

  if (loading && colmenasList.length === 0) {
    return <Loading message="Cargando colmenas..." />;
  }

  return (
    <div>
      {/* Header con información del usuario actual */}
      <div className="flex flex-between flex-center mb-6">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Colmenas</h1>
          {currentUser && (
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              margin: '4px 0 0 0' 
            }}>
              Sesión activa: <strong>{currentUser.nombre} {currentUser.apellido}</strong> 
              ({currentUser.rol_nombre || currentUser.rol})
            </p>
          )}
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
          disabled={isSubmitting}
        >
          + Nueva Colmena
        </button>
      </div>

      {alertMessage && (
        <Alert 
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <Card title="Lista de Colmenas">
        {colmenasList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>
              No hay colmenas registradas
            </h3>
            <p>Comienza agregando tu primera colmena</p>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => handleOpenModal()}
            >
              Crear Colmena
            </button>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Dueño</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {colmenasList.map((colmena) => (
                  <tr key={colmena.id}>
                    <td>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        #{colmena.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {colmena.descripcion || 'Sin descripción'}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280' 
                        }}>
                          Colmena ID: {colmena.id}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>
                        {getDuenoName(colmena.dueno)}
                      </div>
                      {/* Indicador si es tu colmena */}
                      {currentUser && colmena.dueno === currentUser.id && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#059669',
                          fontWeight: '500'
                        }}>
                          Mi colmena
                        </div>
                      )}
                    </td>
                    <td>
                      {colmena.comuna ? (
                        <div>
                          <div style={{ fontWeight: '500' }}>{colmena.comuna}</div>
                          {colmena.latitud && colmena.longitud && (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: '#6b7280' 
                            }}>
                              {parseFloat(colmena.latitud).toFixed(4)}, {parseFloat(colmena.longitud).toFixed(4)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Sin ubicación</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-success">
                        Activa
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-gap">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetailModal(colmena)}
                          disabled={isSubmitting}
                          title="Ver detalles"
                        >
                          👁️ Ver
                        </button>
                        
                        {/* Solo mostrar editar si tiene permisos */}
                        {canEditColmena(colmena) && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenModal(colmena)}
                            disabled={isSubmitting}
                            title="Editar colmena"
                          >
                            ✏️ Editar
                          </button>
                        )}
                        
                        {/* Solo mostrar eliminar si es administrador */}
                        {canDeleteColmena() && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(colmena.id, colmena.descripcion)}
                            disabled={isSubmitting}
                            title="Eliminar colmena (solo administradores)"
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal para crear/editar colmena */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingColmena ? 'Editar Colmena' : 'Nueva Colmena'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Descripción *</label>
              <textarea
                className={`form-textarea ${formErrors.descripcion ? 'error' : ''}`}
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Describe la colmena"
                rows="3"
                disabled={isSubmitting}
              />
              {formErrors.descripcion && (
                <div className="error-message">{formErrors.descripcion}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Dueño *</label>
              <select
                className={`form-select ${formErrors.dueno ? 'error' : ''}`}
                value={formData.dueno}
                onChange={(e) => setFormData({...formData, dueno: e.target.value})}
                disabled={isSubmitting}
              >
                <option value="">Selecciona un dueño</option>
                {usuariosList.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido}
                    {usuario.id === currentUser?.id ? ' (Tú)' : ''}
                  </option>
                ))}
              </select>
              {formErrors.dueno && (
                <div className="error-message">{formErrors.dueno}</div>
              )}
            </div>
          </div>

          <h4 style={{ 
            marginTop: '2rem', 
            marginBottom: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            Ubicación (Opcional)
          </h4>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Latitud</label>
              <input
                type="number"
                step="any"
                className={`form-input ${formErrors.latitud ? 'error' : ''}`}
                value={formData.latitud}
                onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                placeholder="-36.606111"
                disabled={isSubmitting}
              />
              {formErrors.latitud && (
                <div className="error-message">{formErrors.latitud}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Longitud</label>
              <input
                type="number"
                step="any"
                className={`form-input ${formErrors.longitud ? 'error' : ''}`}
                value={formData.longitud}
                onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                placeholder="-72.103611"
                disabled={isSubmitting}
              />
              {formErrors.longitud && (
                <div className="error-message">{formErrors.longitud}</div>
              )}
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Comuna</label>
              <input
                type="text"
                className="form-input"
                value={formData.comuna}
                onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                placeholder="Chillán"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción de Ubicación</label>
              <input
                type="text"
                className="form-input"
                value={formData.ubicacion_descripcion}
                onChange={(e) => setFormData({...formData, ubicacion_descripcion: e.target.value})}
                placeholder="Ubicada en predio agrícola"
                disabled={isSubmitting}
              />
            </div>
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
                (editingColmena ? 'Actualizando...' : 'Creando...') : 
                (editingColmena ? 'Actualizar' : 'Crear')
              }
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de detalle de colmena */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title={`Detalle de Colmena #${selectedColmena?.id}`}
        size="xl"
      >
        {colmenaDetail ? (
          <div>
            <div className="grid grid-2 mb-6">
              <Card title="Información General">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong>Descripción:</strong>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                      {colmenaDetail.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                  <div>
                    <strong>Dueño:</strong>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                      {getDuenoName(colmenaDetail.dueno)}
                      {currentUser && colmenaDetail.dueno === currentUser.id && (
                        <span style={{ 
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem', 
                          color: '#059669',
                          fontWeight: '500'
                        }}>
                          (Tu colmena)
                        </span>
                      )}
                    </p>
                  </div>
                  {colmenaDetail.comuna && (
                    <div>
                      <strong>Ubicación:</strong>
                      <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                        {colmenaDetail.comuna}
                        {colmenaDetail.latitud && colmenaDetail.longitud && (
                          <>
                            <br />
                            <span style={{ fontSize: '0.875rem' }}>
                              {parseFloat(colmenaDetail.latitud).toFixed(6)}, {parseFloat(colmenaDetail.longitud).toFixed(6)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Estado Actual">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                  <h3 style={{ color: '#059669', marginBottom: '0.5rem' }}>
                    Colmena Activa
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    Monitoreando {colmenaDetail.nodos?.length || 0} sensores
                  </p>
                  {currentUser && (
                    <div style={{ 
                      marginTop: '1rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      Visualizando como: <strong>{currentUser.nombre}</strong>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {colmenaDetail.nodos && colmenaDetail.nodos.length > 0 && (
              <Card title="Nodos/Sensores Asociados" className="mb-6">
                <div style={{ overflow: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colmenaDetail.nodos.map((nodo) => (
                        <tr key={nodo.id}>
                          <td>#{nodo.id}</td>
                          <td>{nodo.descripcion}</td>
                          <td>
                            <span className="badge badge-info">
                              {nodo.tipo_descripcion || `Tipo ${nodo.tipo}`}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-success">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <Card title="Actividad Reciente">
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                <p>Datos de sensores y actividad reciente aparecerán aquí</p>
                <div style={{ 
                  fontSize: '0.875rem',
                  marginTop: '1rem'
                }}>
                  Acceso: {currentUser?.rol_nombre || currentUser?.rol}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Loading message="Cargando detalle de colmena..." />
        )}
      </Modal>
    </div>
  );
};

export default Colmenas;