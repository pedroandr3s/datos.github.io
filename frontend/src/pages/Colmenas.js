import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const Colmenas = () => {
  const { colmenas, usuarios, nodos, mensajes, loading, error } = useApi();
  const navigate = useNavigate();
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
  
  // Estados para filtros
  const [filtrosDueño, setFiltrosDueño] = useState('');
  const [colmenasFiltradas, setColmenasFiltradas] = useState([]);
  const [filtroDesdeUsuarios, setFiltroDesdeUsuarios] = useState(null);
  
  const [formData, setFormData] = useState({
    descripcion: '',
    dueno: ''
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

  // Efecto para aplicar filtros cuando cambien las colmenas o el filtro
  useEffect(() => {
    aplicarFiltros();
  }, [colmenasList, filtrosDueño]);

  // Efecto para verificar si hay filtro desde usuarios al cargar
  useEffect(() => {
    verificarFiltroDesdeUsuarios();
  }, [usuariosList]);

  const verificarFiltroDesdeUsuarios = () => {
    const filtroGuardado = localStorage.getItem('colmenas_filtro_dueno');
    const nombreGuardado = localStorage.getItem('colmenas_filtro_nombre');
    const aplicarFiltro = localStorage.getItem('colmenas_filtro_aplicar');
    
    if (filtroGuardado && aplicarFiltro === 'true' && usuariosList.length > 0) {
      console.log('🔍 Aplicando filtro desde usuarios:', filtroGuardado);
      
      // Verificar que el usuario existe en la lista
      const usuarioExiste = usuariosList.find(u => u.id === filtroGuardado);
      
      if (usuarioExiste) {
        setFiltrosDueño(filtroGuardado);
        setFiltroDesdeUsuarios({
          id: filtroGuardado,
          nombre: nombreGuardado || `Usuario ${filtroGuardado}`
        });
        
        // Mostrar mensaje informativo
        setAlertMessage({
          type: 'success',
          message: `✅ Filtro aplicado: Mostrando colmenas de ${nombreGuardado || filtroGuardado}`
        });
      }
      
      // Limpiar los flags de filtro guardado
      localStorage.removeItem('colmenas_filtro_dueno');
      localStorage.removeItem('colmenas_filtro_nombre');
      localStorage.removeItem('colmenas_filtro_aplicar');
    }
  };

  // Función para aplicar filtro manualmente (si el usuario ya está en colmenas)
  const aplicarFiltroGuardado = () => {
    const filtroGuardado = localStorage.getItem('colmenas_filtro_dueno');
    const nombreGuardado = localStorage.getItem('colmenas_filtro_nombre');
    
    if (filtroGuardado && usuariosList.length > 0) {
      const usuarioExiste = usuariosList.find(u => u.id === filtroGuardado);
      
      if (usuarioExiste) {
        setFiltrosDueño(filtroGuardado);
        setFiltroDesdeUsuarios({
          id: filtroGuardado,
          nombre: nombreGuardado || `Usuario ${filtroGuardado}`
        });
        
        setAlertMessage({
          type: 'success',
          message: `✅ Filtro aplicado: ${nombreGuardado || filtroGuardado}`
        });
        
        // Limpiar filtro guardado
        localStorage.removeItem('colmenas_filtro_dueno');
        localStorage.removeItem('colmenas_filtro_nombre');
        localStorage.removeItem('colmenas_filtro_aplicar');
      }
    }
  };

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

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let colmenasFiltradas = [...colmenasList];

    // Filtrar por dueño si hay un filtro seleccionado
    if (filtrosDueño && filtrosDueño !== '') {
      colmenasFiltradas = colmenasFiltradas.filter(colmena => 
        colmena.dueno.toString() === filtrosDueño.toString()
      );
    }

    setColmenasFiltradas(colmenasFiltradas);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltrosDueño('');
    setFiltroDesdeUsuarios(null);
  };

  // Función para volver a usuarios
  const volverAUsuarios = () => {
    navigate('/usuarios');
  };

  // Verificar si hay filtro pendiente al cargar la página
  useEffect(() => {
    const verificarFiltroPendiente = () => {
      const filtroGuardado = localStorage.getItem('colmenas_filtro_dueno');
      const aplicarFiltro = localStorage.getItem('colmenas_filtro_aplicar');
      
      if (filtroGuardado && aplicarFiltro === 'true') {
        // Mostrar botón para aplicar filtro
        setAlertMessage({
          type: 'info',
          message: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Tienes un filtro pendiente de usuarios.</span>
              <button 
                onClick={aplicarFiltroGuardado}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Aplicar Filtro
              </button>
            </div>
          )
        });
      }
    };
    
    if (usuariosList.length > 0) {
      verificarFiltroPendiente();
    }
  }, [usuariosList]);

  // Función para obtener ubicación de una colmena basada en sus nodos
  const getUbicacionColmena = (colmena) => {
    // Si la colmena tiene nodos asociados con ubicación
    if (colmena.nodos && colmena.nodos.length > 0) {
      const nodoConUbicacion = colmena.nodos.find(nodo => 
        nodo.ubicacion && (nodo.ubicacion.comuna || nodo.ubicacion.descripcion)
      );
      
      if (nodoConUbicacion && nodoConUbicacion.ubicacion) {
        const ubicacion = nodoConUbicacion.ubicacion;
        return {
          comuna: ubicacion.comuna,
          descripcion: ubicacion.descripcion,
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud
        };
      }
    }
    
    // Si no tiene nodos con ubicación, buscar en propiedades directas (fallback)
    if (colmena.ubicacion) {
      return colmena.ubicacion;
    }
    
    return null;
  };
  const getEstadisticasFiltros = () => {
    const total = colmenasList.length;
    const filtradas = colmenasFiltradas.length;
    
    return { total, filtradas };
  };

  // Función para obtener el nombre del usuario seleccionado en el filtro
  const getNombreDuenoFiltrado = () => {
    if (!filtrosDueño) return '';
    const usuario = usuariosList.find(u => u.id.toString() === filtrosDueño.toString());
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : '';
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
        dueno: colmena.dueno || ''
      });
    } else {
      setEditingColmena(null);
      setFormData({
        descripcion: '',
        dueno: ''
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
      dueno: ''
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

      if (editingColmena) {
        console.log('✏️ Actualizando colmena:', editingColmena.id);
        await colmenas.update(editingColmena.id, colmenaData);
        setAlertMessage({
          type: 'success',
          message: 'Colmena actualizada correctamente'
        });
      } else {
        console.log('➕ Creando nueva colmena');
        const nuevaColmena = await colmenas.create(colmenaData);
        setAlertMessage({
          type: 'success',
          message: 'Colmena creada correctamente'
        });
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
    
    // Todos los usuarios autenticados pueden editar cualquier colmena
    return true;
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

  const estadisticas = getEstadisticasFiltros();

  return (
    <div>
      {/* Header con información del usuario actual */}
      <div className="flex flex-between flex-center mb-6">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Colmenas
            {filtroDesdeUsuarios && (
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: '400',
                color: '#6b7280',
                marginLeft: '0.5rem'
              }}>
                - {filtroDesdeUsuarios.nombre}
              </span>
            )}
          </h1>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Botón para verificar filtros pendientes */}
          {(() => {
            const filtroGuardado = localStorage.getItem('colmenas_filtro_dueno');
            const aplicarFiltro = localStorage.getItem('colmenas_filtro_aplicar');
            
            if (filtroGuardado && aplicarFiltro === 'true') {
              return (
                <button 
                  className="btn btn-success"
                  onClick={aplicarFiltroGuardado}
                  style={{ 
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem'
                  }}
                  title="Aplicar filtro guardado desde usuarios"
                >
                  🔍 Aplicar Filtro
                </button>
              );
            }
            return null;
          })()}
          
          {filtroDesdeUsuarios && (
            <button 
              className="btn btn-secondary"
              onClick={volverAUsuarios}
              style={{ 
                padding: '0.75rem 1rem',
                fontSize: '0.875rem'
              }}
            >
              ← Menú Principal
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
            disabled={isSubmitting}
          >
            + Nueva Colmena
          </button>
        </div>
      </div>

      {alertMessage && (
        <Alert 
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {/* Panel de Filtros */}
      <Card title="🔍 Filtros de Búsqueda" className="mb-6">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1rem',
          alignItems: 'end'
        }}>
          {/* Filtro por Dueño */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500',
              marginBottom: '0.5rem' 
            }}>
              Filtrar por Dueño
            </label>
            <select
              className="form-select"
              value={filtrosDueño}
              onChange={(e) => setFiltrosDueño(e.target.value)}
              style={{ 
                padding: '0.75rem',
                backgroundColor: filtroDesdeUsuarios ? '#f0f9ff' : '#f9fafb',
                border: filtroDesdeUsuarios ? '2px solid #0ea5e9' : '2px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}
            >
              <option value="">Todos los dueños</option>
              {usuariosList.map((usuario) => {
                const colmenasDelUsuario = colmenasList.filter(c => c.dueno === usuario.id).length;
                return (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido} ({colmenasDelUsuario} colmenas)
                    {usuario.rol === 'ADM' ? ' - Administrador' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Botón de acción */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={limpiarFiltros}
              disabled={!filtrosDueño}
              style={{ 
                padding: '0.75rem 1rem',
                opacity: !filtrosDueño ? 0.5 : 1
              }}
            >
              🗑️ Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Estadísticas de filtros */}
        <div style={{ 
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: filtroDesdeUsuarios ? '#ecfdf5' : '#f0f9ff',
          border: filtroDesdeUsuarios ? '1px solid #86efac' : '1px solid #bae6fd',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: filtroDesdeUsuarios ? '#166534' : '#0c4a6e'
        }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <span>
              📊 <strong>Total de colmenas:</strong> {estadisticas.total}
            </span>
            <span>
              🔍 <strong>Mostrando:</strong> {estadisticas.filtradas}
            </span>
            {filtrosDueño && (
              <span>
                ✅ <strong>Filtro activo:</strong> {getNombreDuenoFiltrado()}
              </span>
            )}
            {filtroDesdeUsuarios && (
              <span>
                🔗 <strong>Filtro desde usuarios:</strong> {filtroDesdeUsuarios.nombre}
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card title="Lista de Colmenas">
        {colmenasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {filtrosDueño ? '🔍' : '🏠'}
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>
              {filtrosDueño ? 'No se encontraron colmenas' : 'No hay colmenas registradas'}
            </h3>
            <p>
              {filtrosDueño ? 
                `No hay colmenas asignadas a ${getNombreDuenoFiltrado()}` : 
                'Comienza agregando la primera colmena'
              }
            </p>
            {!filtrosDueño && currentUser && (
              <button 
                className="btn btn-primary mt-4"
                onClick={() => handleOpenModal()}
              >
                Crear Colmena
              </button>
            )}
            {filtrosDueño && (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={limpiarFiltros}
                >
                  Limpiar Filtros
                </button>
                {filtroDesdeUsuarios && (
                  <button 
                    className="btn btn-primary"
                    onClick={volverAUsuarios}
                  >
                    Volver a Usuarios
                  </button>
                )}
              </div>
            )}
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
                {colmenasFiltradas.map((colmena) => (
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
                      {/* Indicador de rol del dueño */}
                      {(() => {
                        const usuario = usuariosList.find(u => u.id === colmena.dueno);
                        if (usuario) {
                          return (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: usuario.rol === 'ADM' ? '#dc2626' : '#059669',
                              fontWeight: '500'
                            }}>
                              {usuario.rol === 'ADM' ? 'Administrador' : 'Usuario'}
                              {filtroDesdeUsuarios && filtroDesdeUsuarios.id === usuario.id && 
                                <span style={{ marginLeft: '0.25rem' }}>🎯</span>
                              }
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const ubicacion = getUbicacionColmena(colmena);
                        
                        if (ubicacion && (ubicacion.comuna || ubicacion.descripcion)) {
                          return (
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {ubicacion.comuna && ubicacion.descripcion 
                                  ? `${ubicacion.comuna} - ${ubicacion.descripcion}`
                                  : ubicacion.comuna || ubicacion.descripcion
                                }
                              </div>
                              {ubicacion.latitud && ubicacion.longitud && (
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  color: '#6b7280' 
                                }}>
                                  {parseFloat(ubicacion.latitud).toFixed(4)}, {parseFloat(ubicacion.longitud).toFixed(4)}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          return <span style={{ color: '#6b7280' }}>Sin ubicación</span>;
                        }
                      })()}
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

      {/* Modal para crear/editar colmena - Formulario original del administrador */}
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
                    {usuario.rol === 'ADM' ? ' (Administrador)' : ''}
                  </option>
                ))}
              </select>
              {formErrors.dueno && (
                <div className="error-message">{formErrors.dueno}</div>
              )}
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#0c4a6e'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>ℹ️</span>
              <strong>Información sobre ubicaciones</strong>
            </div>
            <p style={{ margin: 0 }}>
              Las ubicaciones de las colmenas se obtienen automáticamente desde los nodos IoT asociados. 
              Para establecer ubicaciones, gestiona los nodos desde la sección correspondiente.
            </p>
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
                      {(() => {
                        const usuario = usuariosList.find(u => u.id === colmenaDetail.dueno);
                        if (usuario) {
                          return (
                            <span style={{ 
                              marginLeft: '0.5rem',
                              fontSize: '0.75rem', 
                              color: usuario.rol === 'ADM' ? '#dc2626' : '#059669',
                              fontWeight: '500'
                            }}>
                              ({usuario.rol === 'ADM' ? 'Administrador' : 'Usuario'})
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </p>
                  </div>
                  {(() => {
                    const ubicacion = getUbicacionColmena(colmenaDetail);
                    if (ubicacion && (ubicacion.comuna || ubicacion.descripcion)) {
                      return (
                        <div>
                          <strong>Ubicación:</strong>
                          <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                            {ubicacion.comuna && ubicacion.descripcion 
                              ? `${ubicacion.comuna} - ${ubicacion.descripcion}`
                              : ubicacion.comuna || ubicacion.descripcion
                            }
                            {ubicacion.latitud && ubicacion.longitud && (
                              <>
                                <br />
                                <span style={{ fontSize: '0.875rem' }}>
                                  {parseFloat(ubicacion.latitud).toFixed(6)}, {parseFloat(ubicacion.longitud).toFixed(6)}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
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
                      <br />
                      <span style={{ fontSize: '0.75rem' }}>
                        ({currentUser.rol_nombre || currentUser.rol})
                      </span>
                    </div>
                  )}
                  {filtroDesdeUsuarios && (
                    <div style={{ 
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#059669',
                      fontWeight: '500'
                    }}>
                      🔗 Filtro desde usuarios activo
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
                {filtroDesdeUsuarios && (
                  <div style={{ 
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    color: '#059669'
                  }}>
                    Vista filtrada desde gestión de usuarios
                  </div>
                )}
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