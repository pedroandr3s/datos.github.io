import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

const Revisiones = () => {
  const { mensajes, nodos, colmenas, nodoTipos, loading, error } = useApi();
  const [mensajesList, setMensajesList] = useState([]);
  const [nodosList, setNodosList] = useState([]);
  const [colmenasList, setColmenasList] = useState([]);
  const [nodoTiposList, setNodoTiposList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMensaje, setSelectedMensaje] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [filters, setFilters] = useState({
    nodo: '',
    topico: '',
    fechaInicio: '',
    fechaFin: '',
    limite: 100
  });
  const [filteredMensajes, setFilteredMensajes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porTopico: {},
    porNodo: {},
    ultimaHora: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [mensajesList, filters]);

  const loadData = async () => {
    try {
      const [mensajesData, nodosData, colmenasData, tiposData] = await Promise.all([
        mensajes.getRecientes(24), // Últimas 24 horas
        nodos.getAll(),
        colmenas.getAll(),
        nodoTipos.getAll()
      ]);
      
      setMensajesList(mensajesData);
      setNodosList(nodosData);
      setColmenasList(colmenasData);
      setNodoTiposList(tiposData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setAlertMessage({
        type: 'error',
        message: 'Error al cargar los datos de revisiones'
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...mensajesList];

    if (filters.nodo) {
      filtered = filtered.filter(m => m.nodo_id.toString() === filters.nodo);
    }

    if (filters.topico) {
      filtered = filtered.filter(m => 
        m.topico.toLowerCase().includes(filters.topico.toLowerCase())
      );
    }

    if (filters.fechaInicio) {
      const fechaInicio = new Date(filters.fechaInicio);
      filtered = filtered.filter(m => new Date(m.fecha) >= fechaInicio);
    }

    if (filters.fechaFin) {
      const fechaFin = new Date(filters.fechaFin);
      fechaFin.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.fecha) <= fechaFin);
    }

    // Limitar cantidad
    filtered = filtered.slice(0, filters.limite);

    setFilteredMensajes(filtered);
  };

  const calculateStats = () => {
    const stats = {
      total: mensajesList.length,
      porTopico: {},
      porNodo: {},
      ultimaHora: 0
    };

    const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);

    mensajesList.forEach(mensaje => {
      // Por tópico
      stats.porTopico[mensaje.topico] = (stats.porTopico[mensaje.topico] || 0) + 1;
      
      // Por nodo
      stats.porNodo[mensaje.nodo_id] = (stats.porNodo[mensaje.nodo_id] || 0) + 1;
      
      // Última hora
      if (new Date(mensaje.fecha) >= unaHoraAtras) {
        stats.ultimaHora++;
      }
    });

    setEstadisticas(stats);
  };

  const handleOpenDetailModal = (mensaje) => {
    setSelectedMensaje(mensaje);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMensaje(null);
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = () => {
    applyFilters();
    handleCloseFilterModal();
  };

  const handleClearFilters = () => {
    setFilters({
      nodo: '',
      topico: '',
      fechaInicio: '',
      fechaFin: '',
      limite: 100
    });
  };

  const handleRefresh = () => {
    loadData();
  };

  const getNodoInfo = (nodoId) => {
    const nodo = nodosList.find(n => n.id === nodoId);
    if (!nodo) return { descripcion: `Nodo ${nodoId}`, tipo: 'Desconocido' };
    
    const tipo = nodoTiposList.find(t => t.tipo === nodo.tipo);
    return {
      descripcion: nodo.descripcion,
      tipo: tipo ? tipo.descripcion : `Tipo ${nodo.tipo}`
    };
  };

  const getTopicoBadge = (topico) => {
    switch (topico.toLowerCase()) {
      case 'temperatura':
        return { class: 'badge-warning', icon: '🌡️' };
      case 'humedad':
        return { class: 'badge-info', icon: '💧' };
      case 'estado':
        return { class: 'badge-success', icon: '⚙️' };
      default:
        return { class: 'badge-secondary', icon: '📊' };
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && mensajesList.length === 0) {
    return <Loading message="Cargando revisiones..." />;
  }

  return (
    <div>
      <div className="flex flex-between flex-center mb-6">
        <h1 className="page-title" style={{ margin: 0 }}>Revisiones y Monitoreo</h1>
        <div className="flex flex-gap">
          <button 
            className="btn btn-secondary"
            onClick={handleOpenFilterModal}
          >
            🔍 Filtros
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            🔄 Actualizar
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

      {/* Estadísticas */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <h3>{estadisticas.total}</h3>
          <p>Total Mensajes</p>
          <div style={{ fontSize: '2rem', marginTop: '0.5rem' }}>📊</div>
        </div>
        
        <div className="stat-card">
          <h3>{estadisticas.ultimaHora}</h3>
          <p>Última Hora</p>
          <div style={{ fontSize: '2rem', marginTop: '0.5rem' }}>⏰</div>
        </div>
        
        <div className="stat-card">
          <h3>{Object.keys(estadisticas.porTopico).length}</h3>
          <p>Tipos de Datos</p>
          <div style={{ fontSize: '2rem', marginTop: '0.5rem' }}>📡</div>
        </div>
        
        <div className="stat-card">
          <h3>{Object.keys(estadisticas.porNodo).length}</h3>
          <p>Nodos Activos</p>
          <div style={{ fontSize: '2rem', marginTop: '0.5rem' }}>🔗</div>
        </div>
      </div>

      <div className="grid grid-3 mb-6">
        {/* Distribución por Tópico */}
        <Card title="Por Tipo de Dato">
          {Object.keys(estadisticas.porTopico).length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
              Sin datos
            </p>
          ) : (
            <div>
              {Object.entries(estadisticas.porTopico).map(([topico, cantidad]) => {
                const badge = getTopicoBadge(topico);
                return (
                  <div key={topico} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{badge.icon}</span>
                      <span style={{ textTransform: 'capitalize' }}>{topico}</span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#374151' }}>
                      {cantidad}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Distribución por Nodo */}
        <Card title="Por Nodo">
          {Object.keys(estadisticas.porNodo).length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
              Sin datos
            </p>
          ) : (
            <div>
              {Object.entries(estadisticas.porNodo).slice(0, 5).map(([nodoId, cantidad]) => {
                const nodoInfo = getNodoInfo(parseInt(nodoId));
                return (
                  <div key={nodoId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>Nodo #{nodoId}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {nodoInfo.descripcion}
                      </div>
                    </div>
                    <span style={{ fontWeight: '600', color: '#374151' }}>
                      {cantidad}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Filtros Activos */}
        <Card title="Filtros Activos">
          {Object.values(filters).every(v => !v || v === 100) ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
              Sin filtros aplicados
            </p>
          ) : (
            <div>
              {filters.nodo && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span className="badge badge-info">
                    Nodo: {filters.nodo}
                  </span>
                </div>
              )}
              {filters.topico && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span className="badge badge-info">
                    Tópico: {filters.topico}
                  </span>
                </div>
              )}
              {filters.fechaInicio && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span className="badge badge-info">
                    Desde: {new Date(filters.fechaInicio).toLocaleDateString()}
                  </span>
                </div>
              )}
              {filters.fechaFin && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span className="badge badge-info">
                    Hasta: {new Date(filters.fechaFin).toLocaleDateString()}
                  </span>
                </div>
              )}
              <button
                className="btn btn-secondary btn-sm mt-4"
                onClick={handleClearFilters}
                style={{ width: '100%' }}
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Lista de Mensajes */}
      <Card title={`Mensajes Recientes (${filteredMensajes.length})`}>
        {filteredMensajes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>
              No hay mensajes
            </h3>
            <p>No se encontraron mensajes con los filtros aplicados</p>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Nodo</th>
                  <th>Tipo</th>
                  <th>Tópico</th>
                  <th>Valor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMensajes.map((mensaje) => {
                  const nodoInfo = getNodoInfo(mensaje.nodo_id);
                  const badge = getTopicoBadge(mensaje.topico);
                  
                  return (
                    <tr key={mensaje.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {formatearFechaCorta(mensaje.fecha)}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280' 
                          }}>
                            {new Date(mensaje.fecha).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            Nodo #{mensaje.nodo_id}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280' 
                          }}>
                            {nodoInfo.descripcion}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {nodoInfo.tipo}
                        </span>
                      </td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem' 
                        }}>
                          <span>{badge.icon}</span>
                          <span className={`badge ${badge.class}`}>
                            {mensaje.topico}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: '600',
                          color: '#374151',
                          fontFamily: 'monospace'
                        }}>
                          {mensaje.payload}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetailModal(mensaje)}
                        >
                          👁️ Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Filtros */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        title="Filtros de Búsqueda"
        size="md"
      >
        <div>
          <div className="form-group">
            <label className="form-label">Nodo</label>
            <select
              className="form-select"
              value={filters.nodo}
              onChange={(e) => setFilters({...filters, nodo: e.target.value})}
            >
              <option value="">Todos los nodos</option>
              {nodosList.map((nodo) => (
                <option key={nodo.id} value={nodo.id}>
                  Nodo #{nodo.id} - {nodo.descripcion}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tópico</label>
            <input
              type="text"
              className="form-input"
              value={filters.topico}
              onChange={(e) => setFilters({...filters, topico: e.target.value})}
              placeholder="temperatura, humedad, estado..."
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-input"
                value={filters.fechaInicio}
                onChange={(e) => setFilters({...filters, fechaInicio: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-input"
                value={filters.fechaFin}
                onChange={(e) => setFilters({...filters, fechaFin: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Límite de Resultados</label>
            <select
              className="form-select"
              value={filters.limite}
              onChange={(e) => setFilters({...filters, limite: parseInt(e.target.value)})}
            >
              <option value={50}>50 mensajes</option>
              <option value={100}>100 mensajes</option>
              <option value={200}>200 mensajes</option>
              <option value={500}>500 mensajes</option>
            </select>
          </div>

          <div className="flex flex-gap flex-between mt-6">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearFilters}
            >
              Limpiar
            </button>
            <div className="flex flex-gap">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseFilterModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApplyFilters}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Detalle de Mensaje */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Detalle del Mensaje"
        size="md"
      >
        {selectedMensaje && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <strong>ID del Mensaje:</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                  #{selectedMensaje.id}
                </p>
              </div>

              <div>
                <strong>Nodo:</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                  Nodo #{selectedMensaje.nodo_id} - {getNodoInfo(selectedMensaje.nodo_id).descripcion}
                </p>
              </div>

              <div>
                <strong>Tipo de Nodo:</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                  {getNodoInfo(selectedMensaje.nodo_id).tipo}
                </p>
              </div>

              <div>
                <strong>Tópico:</strong>
                <div style={{ margin: '0.25rem 0 0' }}>
                  {(() => {
                    const badge = getTopicoBadge(selectedMensaje.topico);
                    return (
                      <span className={`badge ${badge.class}`} style={{ fontSize: '0.875rem' }}>
                        {badge.icon} {selectedMensaje.topico}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div>
                <strong>Valor/Payload:</strong>
                <div style={{ 
                  margin: '0.5rem 0 0',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {selectedMensaje.payload}
                </div>
              </div>

              <div>
                <strong>Fecha y Hora:</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                  {formatearFecha(selectedMensaje.fecha)}
                </p>
              </div>
            </div>

            <div className="flex flex-center mt-6">
              <button
                className="btn btn-primary"
                onClick={handleCloseModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Revisiones;