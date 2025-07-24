import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import './Revisiones.css';

// IMPORTANTE: Crear este archivo en src/utils/alertSystem.js con el código del sistema de alertas
import { 
  analyzeMessage, 
  generateAlertMessage, 
  getCategoryColor, 
  getCategoryIcon, 
  getPriorityLevel,
  getAlertStatistics,
  ALERT_SYSTEM 
} from '../utils/alertSystem';

const Revisiones = () => {
  const { mensajes, nodos, colmenas, nodoTipos, loading, error } = useApi();
  
  // Estados principales
  const [mensajesList, setMensajesList] = useState([]);
  const [nodosList, setNodosList] = useState([]);
  const [colmenasList, setColmenasList] = useState([]);
  const [nodoTiposList, setNodoTiposList] = useState([]);
  
  // Estados de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  // Estados de datos seleccionados
  const [selectedMensaje, setSelectedMensaje] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  
  // Estados de carga
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  
  // Estados para alertas
  const [alertStats, setAlertStats] = useState({});
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nodo_id: '',
    topico: '',
    payload: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Estados para filtros
  const [filters, setFilters] = useState({
    nodo: '',
    topico: '',
    fechaInicio: '',
    fechaFin: '',
    limite: 100,
    categoria: '',
    prioridad: ''
  });
  const [filteredMensajes, setFilteredMensajes] = useState([]);
  
  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porTopico: {},
    porNodo: {},
    ultimaHora: 0
  });

  // Estados para gráficos
  const [chartData, setChartData] = useState([]);
  const [chartTimeScale, setChartTimeScale] = useState('segundo');
  const [realTimeData, setRealTimeData] = useState(new Map());

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
    analyzeAlerts();
  }, [mensajesList, filters]);

  useEffect(() => {
    updateChartData();
  }, [realTimeData, chartTimeScale]);

  // Función para analizar alertas en los mensajes
  const analyzeAlerts = () => {
    const critical = [];
    const stats = getAlertStatistics(mensajesList);
    
    mensajesList.forEach(mensaje => {
      const analysis = analyzeMessage(mensaje.topico, mensaje.payload);
      
      if (analysis.category === 'critical') {
        critical.push({
          ...mensaje,
          analysis,
          alertMessage: generateAlertMessage(mensaje.nodo_id, mensaje.topico, analysis)
        });
      }
    });
    
    critical.sort((a, b) => {
      const priorityDiff = getPriorityLevel(b.analysis.priority) - getPriorityLevel(a.analysis.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.fecha) - new Date(a.fecha);
    });
    
    setCriticalAlerts(critical);
    setAlertStats(stats);
    
    if (critical.length > 0) {
      const latestCritical = critical[0];
      if (new Date(latestCritical.fecha) > new Date(Date.now() - 60000)) {
        setAlertMessage({
          type: 'error',
          title: '🚨 ALERTA CRÍTICA',
          message: `${latestCritical.analysis.message} - Nodo ${latestCritical.nodo_id}`
        });
      }
    }
  };

  const loadData = async () => {
    try {
      console.log('🔄 Cargando datos iniciales...');
      const [mensajesData, nodosData, colmenasData, tiposData] = await Promise.all([
        mensajes.getRecientes(24),
        nodos.getAll(),
        colmenas.getAll(),
        nodoTipos.getAll()
      ]);
      
      setMensajesList(mensajesData || []);
      setNodosList(nodosData || []);
      setColmenasList(colmenasData || []);
      setNodoTiposList(tiposData || []);
      
      initializeRealTimeData(mensajesData || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setAlertMessage({
        type: 'error',
        message: 'Error al cargar los datos de revisiones'
      });
    }
  };

  const initializeRealTimeData = (mensajesData) => {
    console.log('🔄 Inicializando datos en tiempo real con:', mensajesData.length, 'mensajes');
    
    const dataMap = new Map();
    mensajesData.forEach(mensaje => {
      const numericValue = extractNumericValue(mensaje.payload);
      if (numericValue !== null) {
        const key = `${mensaje.topico}_${mensaje.nodo_id}`;
        const analysis = analyzeMessage(mensaje.topico, mensaje.payload);
        
        dataMap.set(key, {
          topico: mensaje.topico,
          nodo_id: mensaje.nodo_id,
          value: numericValue,
          timestamp: new Date(mensaje.fecha),
          analysis: analysis
        });
        console.log(`📊 Dato inicializado: ${key} = ${numericValue} (${analysis.category})`);
      }
    });
    
    console.log('✅ Datos en tiempo real inicializados:', dataMap.size, 'entradas');
    setRealTimeData(dataMap);
    
    if (dataMap.size > 0) {
      const initialPoint = {
        timestamp: new Date(),
        data: {}
      };
      
      dataMap.forEach((data, key) => {
        initialPoint.data[key] = data.value;
      });
      
      setChartData([initialPoint]);
      console.log('📈 Punto inicial del gráfico creado');
    }
  };

  const extractNumericValue = (payload) => {
    const match = payload.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  };

  const generateSampleData = async () => {
    if (isGeneratingData) {
      console.log('⚠️ Ya se está generando datos, esperando...');
      return;
    }

    setIsGeneratingData(true);
    console.log('🎲 Generando datos de muestra con sistema de alertas...');
    
    try {
      if (realTimeData.size === 0) {
        console.log('📊 Creando datos base para demostración...');
        await createBaseSampleData();
      } else {
        await simulateDataVariation();
      }
      
      setAlertMessage({
        type: 'success',
        message: 'Nuevos datos de muestra generados correctamente'
      });
    } catch (error) {
      console.error('❌ Error generando datos:', error);
      setAlertMessage({
        type: 'error',
        message: 'Error al generar datos de muestra'
      });
    } finally {
      setIsGeneratingData(false);
    }
  };

  const createBaseSampleData = async () => {
    const nodosDisponibles = nodosList.length > 0 ? nodosList : [
      { id: 1 }, { id: 2 }, { id: 3 }
    ];

    const sampleData = [
      { nodo_id: nodosDisponibles[0]?.id || 1, topico: 'temperatura', payload: '25.5°C' },
      { nodo_id: nodosDisponibles[0]?.id || 1, topico: 'humedad', payload: '55%' },
      { nodo_id: nodosDisponibles[1]?.id || 2, topico: 'temperatura', payload: '36.8°C' },
      { nodo_id: nodosDisponibles[1]?.id || 2, topico: 'humedad', payload: '72%' },
      { nodo_id: nodosDisponibles[2]?.id || 3, topico: 'temperatura', payload: '39.2°C' },
      { nodo_id: nodosDisponibles[2]?.id || 3, topico: 'humedad', payload: '45%' }
    ];

    const promises = sampleData.map(async (data) => {
      try {
        await mensajes.create(data);
        const analysis = analyzeMessage(data.topico, data.payload);
        console.log(`✅ Dato creado: Nodo ${data.nodo_id}, ${data.topico}: ${data.payload} - ${analysis.category.toUpperCase()}`);
        return data;
      } catch (error) {
        console.error(`❌ Error creando dato base:`, error);
        return null;
      }
    });

    await Promise.all(promises);
    await loadData();
  };

  const simulateDataVariation = async () => {
    console.log('🔄 Simulando variación de datos con alertas...');
    
    if (realTimeData.size === 0) {
      console.log('❌ No hay datos en tiempo real para simular');
      await createBaseSampleData();
      return;
    }

    try {
      const promises = Array.from(realTimeData.entries()).map(async ([key, data]) => {
        let variation;
        
        if (Math.random() < 0.2) {
          variation = (Math.random() - 0.5) * 0.6;
        } else {
          variation = (Math.random() - 0.5) * 0.3;
        }
        
        const newValue = Math.max(0, data.value * (1 + variation));
        
        let newPayload;
        switch (data.topico.toLowerCase()) {
          case 'temperatura':
            newPayload = `${newValue.toFixed(1)}°C`;
            break;
          case 'humedad':
            newPayload = `${Math.round(newValue)}%`;
            break;
          case 'presion':
            newPayload = `${newValue.toFixed(0)} hPa`;
            break;
          default:
            newPayload = newValue.toFixed(1);
        }

        const analysis = analyzeMessage(data.topico, newPayload);
        
        console.log(`📝 Creando mensaje: Nodo ${data.nodo_id}, ${data.topico}: ${newPayload} - ${analysis.category.toUpperCase()}`);

        const nuevoMensaje = {
          nodo_id: data.nodo_id,
          topico: data.topico,
          payload: newPayload
        };

        await mensajes.create(nuevoMensaje);
        return { key, value: newValue, timestamp: new Date(), payload: newPayload, analysis };
      });

      const results = await Promise.all(promises);
      console.log('✅ Mensajes creados exitosamente:', results.length);
      
      const alertasGeneradas = results.filter(r => r.analysis.category === 'critical').length;
      if (alertasGeneradas > 0) {
        console.log(`🚨 Se generaron ${alertasGeneradas} alertas críticas`);
      }
      
      const newRealTimeData = new Map(realTimeData);
      results.forEach(({ key, value, timestamp, analysis }) => {
        if (newRealTimeData.has(key)) {
          newRealTimeData.set(key, {
            ...newRealTimeData.get(key),
            value,
            timestamp,
            analysis
          });
        }
      });
      setRealTimeData(newRealTimeData);

      const newChartPoint = {
        timestamp: new Date(),
        data: {}
      };

      results.forEach(({ key, value }) => {
        newChartPoint.data[key] = value;
      });

      setChartData(prevData => {
        const updated = [...prevData, newChartPoint];
        const maxPoints = getMaxPointsForScale(chartTimeScale);
        return updated.slice(-maxPoints);
      });

      console.log('🔄 Recargando lista de mensajes...');
      const mensajesActualizados = await mensajes.getRecientes(24);
      setMensajesList(mensajesActualizados || []);

    } catch (error) {
      console.error('❌ Error simulando variación de datos:', error);
      throw error;
    }
  };

  const updateChartData = () => {
    if (realTimeData.size === 0) return;

    const now = new Date();
    const newPoint = {
      timestamp: now,
      data: {}
    };

    realTimeData.forEach((data, key) => {
      newPoint.data[key] = data.value;
    });

    setChartData(prevData => {
      const lastPoint = prevData[prevData.length - 1];
      if (lastPoint && (now - lastPoint.timestamp) < 1000) {
        return prevData;
      }

      const updated = [...prevData, newPoint];
      const maxPoints = getMaxPointsForScale(chartTimeScale);
      return updated.slice(-maxPoints);
    });
  };

  const getMaxPointsForScale = (scale) => {
    switch (scale) {
      case 'segundo': return 60;
      case 'minuto': return 60;
      case 'hora': return 24;
      case 'dia': return 30;
      case 'semana': return 52;
      case 'mes': return 12;
      default: return 60;
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

    if (filters.categoria) {
      filtered = filtered.filter(m => {
        const analysis = analyzeMessage(m.topico, m.payload);
        return analysis.category === filters.categoria;
      });
    }

    if (filters.prioridad) {
      filtered = filtered.filter(m => {
        const analysis = analyzeMessage(m.topico, m.payload);
        return analysis.priority === filters.prioridad;
      });
    }

    if (showOnlyCritical) {
      filtered = filtered.filter(m => {
        const analysis = analyzeMessage(m.topico, m.payload);
        return analysis.category === 'critical';
      });
    }

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
      stats.porTopico[mensaje.topico] = (stats.porTopico[mensaje.topico] || 0) + 1;
      stats.porNodo[mensaje.nodo_id] = (stats.porNodo[mensaje.nodo_id] || 0) + 1;
      
      if (new Date(mensaje.fecha) >= unaHoraAtras) {
        stats.ultimaHora++;
      }
    });

    setEstadisticas(stats);
  };

  // CRUD Functions
  const handleCreateMensaje = () => {
    setFormData({
      nodo_id: '',
      topico: '',
      payload: ''
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nodo_id) {
      errors.nodo_id = 'El nodo es requerido';
    }
    
    if (!formData.topico || !formData.topico.trim()) {
      errors.topico = 'El tópico es requerido';
    }
    
    if (!formData.payload || !formData.payload.trim()) {
      errors.payload = 'El payload es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitMensaje = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSend = {
        nodo_id: parseInt(formData.nodo_id),
        topico: formData.topico.trim(),
        payload: formData.payload.trim()
      };

      const analysis = analyzeMessage(dataToSend.topico, dataToSend.payload);
      
      await mensajes.create(dataToSend);
      
      let messageType = 'success';
      let message = 'Mensaje creado correctamente';
      
      if (analysis.category === 'critical') {
        messageType = 'error';
        message = `🚨 ALERTA CRÍTICA CREADA: ${analysis.message}`;
      } else if (analysis.category === 'warning') {
        messageType = 'warning';
        message = `⚠️ Alerta preventiva: ${analysis.message}`;
      }
      
      setAlertMessage({
        type: messageType,
        message: message
      });
      
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error guardando mensaje:', err);
      setAlertMessage({
        type: 'error',
        message: 'Error al crear el mensaje'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMensaje = async (mensajeId, topico) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el mensaje "${topico}"?`)) {
      try {
        await mensajes.delete(mensajeId);
        setAlertMessage({
          type: 'success',
          message: 'Mensaje eliminado correctamente'
        });
        await loadData();
      } catch (err) {
        console.error('Error eliminando mensaje:', err);
        setAlertMessage({
          type: 'error',
          message: 'Error al eliminar el mensaje'
        });
      }
    }
  };

  // Handlers para alertas
  const handleOpenAlertModal = (alert) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false);
    setSelectedAlert(null);
  };

  // Modal handlers
  const handleOpenDetailModal = (mensaje) => {
    setSelectedMensaje(mensaje);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMensaje(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      nodo_id: '',
      topico: '',
      payload: ''
    });
    setFormErrors({});
    setIsSubmitting(false);
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
      limite: 100,
      categoria: '',
      prioridad: ''
    });
  };

  const handleRefresh = () => {
    loadData();
  };

  // Helper functions
  const getNodoInfo = (nodoId) => {
    const nodo = nodosList.find(n => n.id === nodoId);
    if (!nodo) return { descripcion: `Nodo ${nodoId}`, tipo: 'Desconocido' };
    
    const tipo = nodoTiposList.find(t => t.tipo === nodo.tipo);
    return {
      descripcion: nodo.descripcion,
      tipo: tipo ? tipo.descripcion : `Tipo ${nodo.tipo}`
    };
  };

  const getTopicoBadge = (topico, payload = null) => {
    const baseColors = {
      'temperatura': { class: 'badge-warning', icon: '🌡️' },
      'humedad': { class: 'badge-info', icon: '💧' },
      'estado': { class: 'badge-success', icon: '⚙️' },
      'presion': { class: 'badge-primary', icon: '🔘' },
      'luz': { class: 'badge-warning', icon: '💡' },
      'sonido': { class: 'badge-secondary', icon: '🔊' }
    };
    
    let badge = baseColors[topico.toLowerCase()] || { class: 'badge-secondary', icon: '📊' };
    
    if (payload) {
      const analysis = analyzeMessage(topico, payload);
      
      if (analysis.category === 'critical') {
        badge = { class: 'badge-danger', icon: '🚨' };
      } else if (analysis.category === 'warning') {
        badge = { class: 'badge-warning', icon: '⚠️' };
      }
    }
    
    return badge;
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

  const formatearValorTiempoReal = (valor, topico) => {
    const numValue = valor.toFixed(1);
    switch (topico.toLowerCase()) {
      case 'temperatura':
        return `${numValue}°C`;
      case 'humedad':
        return `${numValue}%`;
      case 'presion':
        return `${numValue} hPa`;
      default:
        return numValue;
    }
  };

  // Función para renderizar el gráfico
  const renderChart = () => {
    if (chartData.length === 0 || realTimeData.size === 0) {
      return (
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#6b7280'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
            <p>Esperando datos para el gráfico...</p>
            <p style={{ fontSize: '0.875rem' }}>
              Puntos de datos: {chartData.length} | Datos en tiempo real: {realTimeData.size}
            </p>
            <button 
              className="btn btn-primary btn-sm"
              onClick={generateSampleData}
              disabled={isGeneratingData}
              style={{ marginTop: '1rem' }}
            >
              {isGeneratingData ? 'Generando...' : '🎲 Generar Datos de Muestra'}
            </button>
          </div>
        </div>
      );
    }

    const allTopics = Array.from(realTimeData.keys());
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

    let minVal = Infinity;
    let maxVal = -Infinity;
    
    chartData.forEach(point => {
      Object.values(point.data || {}).forEach(val => {
        if (typeof val === 'number' && !isNaN(val)) {
          minVal = Math.min(minVal, val);
          maxVal = Math.max(maxVal, val);
        }
      });
    });

    if (minVal === Infinity || maxVal === -Infinity || isNaN(minVal) || isNaN(maxVal)) {
      minVal = 0;
      maxVal = 100;
    } else {
      const range = maxVal - minVal;
      const padding = range * 0.1;
      minVal = Math.max(0, minVal - padding);
      maxVal = maxVal + padding;
    }

    if (maxVal - minVal < 1) {
      maxVal = minVal + 10;
    }

    return (
      <div style={{ height: '300px', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          fontSize: '0.75rem', 
          color: '#6b7280' 
        }}>
          Puntos: {chartData.length} | Escala: {chartTimeScale} | Rango: {minVal.toFixed(1)}-{maxVal.toFixed(1)}
        </div>
        
        <svg width="100%" height="100%" viewBox="0 0 800 300">
          {[0, 1, 2, 3, 4].map(i => (
            <g key={i}>
              <line
                x1="50"
                y1={50 + i * 50}
                x2="750"
                y2={50 + i * 50}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x="45"
                y={55 + i * 50}
                fontSize="10"
                fill="#6b7280"
                textAnchor="end"
              >
                {(maxVal - (i * (maxVal - minVal) / 4)).toFixed(1)}
              </text>
            </g>
          ))}
          
          <line x1="50" y1="50" x2="50" y2="250" stroke="#374151" strokeWidth="2"/>
          <line x1="50" y1="250" x2="750" y2="250" stroke="#374151" strokeWidth="2"/>
          
          {allTopics.map((topicKey, topicIndex) => {
            const color = colors[topicIndex % colors.length];
            
            if (chartData.length < 2) return null;
            
            const validPoints = [];
            chartData.forEach((point, index) => {
              const value = point.data && point.data[topicKey];
              
              if (typeof value === 'number' && !isNaN(value)) {
                validPoints.push({
                  x: 50 + (index * (700 / (chartData.length - 1))),
                  y: 250 - ((value - minVal) / (maxVal - minVal)) * 200,
                  value: value,
                  timestamp: point.timestamp
                });
              }
            });
            
            if (validPoints.length < 2) return null;
            
            const pathData = validPoints.map((point, index) => 
              `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            ).join(' ');
            
            return (
              <g key={topicKey}>
                <path
                  d={pathData}
                  stroke={color}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {validPoints.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={color}
                    stroke="white"
                    strokeWidth="1"
                  >
                    <title>
                      {formatearValorTiempoReal(point.value, topicKey.split('_')[0])} - {formatearFechaCorta(point.timestamp)}
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}
          
          {/* Marcadores de alertas críticas en el gráfico */}
          {realTimeData.size > 0 && Array.from(realTimeData.entries()).map(([key, data], index) => {
            if (data.analysis && data.analysis.category === 'critical') {
              const x = 50 + (index * (700 / Math.max(1, realTimeData.size - 1)));
              return (
                <g key={`alert-${key}`}>
                  <circle
                    cx={x}
                    cy={30}
                    r="8"
                    fill="#dc2626"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={35}
                    fontSize="10"
                    fill="white"
                    textAnchor="middle"
                  >
                    🚨
                  </text>
                  <title>Alerta Crítica: {data.analysis.message}</title>
                </g>
              );
            }
            return null;
          })}
        </svg>
      </div>
    );
  };

  if (loading) return <Loading message="Cargando revisiones..." />;

  return (
    <div className="revisiones-container">
      {/* Header con controles mejorados */}
      <div className="page-header">
        <div className="header-left">
          <h2>Sistema de Revisiones y Alertas</h2>
          <p className="page-subtitle">
            Monitoreo en tiempo real con detección automática de alertas críticas
          </p>
        </div>
        <div className="header-right">
          <div className="header-controls">
            {/* Indicador de alertas críticas */}
            {criticalAlerts.length > 0 && (
              <div className="critical-alerts-indicator">
                <span className="pulse-dot"></span>
                <span className="alert-count">{criticalAlerts.length}</span>
                🚨 Alertas Críticas
              </div>
            )}
            
            {/* Toggle para mostrar solo críticas */}
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showOnlyCritical}
                onChange={(e) => setShowOnlyCritical(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              Solo Críticas
            </label>
            
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              🔄 Actualizar
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleOpenFilterModal}
            >
              🔍 Filtros
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleCreateMensaje}
            >
              ➕ Nuevo Mensaje
            </button>
            <button
              className="btn btn-warning btn-sm"
              onClick={generateSampleData}
              disabled={isGeneratingData}
            >
              {isGeneratingData ? '⏳' : '🎲'} Simular Datos
            </button>
          </div>
        </div>
      </div>

      {/* Panel de estadísticas de alertas */}
      {Object.keys(alertStats).length > 0 && (
        <div className="alert-stats-panel">
          <div className="stats-grid">
            <div className="stat-card critical">
              <div className="stat-icon">🚨</div>
              <div className="stat-info">
                <div className="stat-number">{alertStats.critical || 0}</div>
                <div className="stat-label">Críticas</div>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <div className="stat-number">{alertStats.warning || 0}</div>
                <div className="stat-label">Preventivas</div>
              </div>
            </div>
            <div className="stat-card normal">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-number">{alertStats.normal || 0}</div>
                <div className="stat-label">Normales</div>
              </div>
            </div>
            <div className="stat-card efficiency">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-number">
                  {alertStats.total ? 
                    Math.round(((alertStats.normal || 0) / alertStats.total) * 100) : 0}%
                </div>
                <div className="stat-label">Eficiencia</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de alertas críticas recientes */}
      {criticalAlerts.length > 0 && (
        <Card 
          title="🚨 Alertas Críticas Recientes" 
          className="critical-alerts-card"
        >
          <div className="critical-alerts-list">
            {criticalAlerts.slice(0, 5).map((alert) => (
              <div 
                key={alert.id} 
                className="critical-alert-item"
                onClick={() => handleOpenAlertModal(alert)}
              >
                <div className="alert-icon">
                  {alert.analysis.icon}
                </div>
                <div className="alert-content">
                  <div className="alert-message">
                    <strong>{alert.analysis.message}</strong>
                  </div>
                  <div className="alert-details">
                    Nodo #{alert.nodo_id} • {alert.topico} • {alert.payload}
                  </div>
                  <div className="alert-time">
                    {formatearFecha(alert.fecha)}
                  </div>
                </div>
                <div className="alert-priority">
                  <span className={`priority-badge priority-${alert.analysis.priority}`}>
                    {alert.analysis.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
            
            {criticalAlerts.length > 5 && (
              <div className="more-alerts">
                + {criticalAlerts.length - 5} alertas críticas más
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Alertas */}
      {alertMessage && (
        <Alert
          type={alertMessage.type}
          title={alertMessage.title}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {/* Dashboard de estadísticas */}
      <div className="stats-grid">
        <Card title="📊 Estadísticas Generales">
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-label">Total de mensajes:</span>
              <span className="stat-value">{estadisticas.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Última hora:</span>
              <span className="stat-value">{estadisticas.ultimaHora}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Nodos activos:</span>
              <span className="stat-value">{Object.keys(estadisticas.porNodo).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tópicos únicos:</span>
              <span className="stat-value">{Object.keys(estadisticas.porTopico).length}</span>
            </div>
          </div>
        </Card>

        <Card title="🏷️ Por Tópico">
          <div className="topic-stats">
            {Object.entries(estadisticas.porTopico).map(([topico, count]) => {
              const badge = getTopicoBadge(topico);
              return (
                <div key={topico} className="topic-stat-item">
                  <span className={`badge ${badge.class}`}>
                    {badge.icon} {topico}
                  </span>
                  <span className="count">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="🔌 Por Nodo">
          <div className="node-stats">
            {Object.entries(estadisticas.porNodo).map(([nodoId, count]) => (
              <div key={nodoId} className="node-stat-item">
                <span>Nodo #{nodoId}</span>
                <span className="count">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Gráfico en tiempo real */}
      <Card title="📈 Datos en Tiempo Real">
        <div className="chart-controls">
          <div className="chart-info">
            <span>Actualizaciones: {realTimeData.size} sensores</span>
            <span>Puntos: {chartData.length}</span>
            {realTimeData.size > 0 && (
              <span>
                Último: {formatearFechaCorta(
                  Math.max(...Array.from(realTimeData.values()).map(d => d.timestamp))
                )}
              </span>
            )}
          </div>
          
          <div className="chart-scale-controls">
            <label>Escala:</label>
            <select
              value={chartTimeScale}
              onChange={(e) => setChartTimeScale(e.target.value)}
              className="form-select"
            >
              <option value="segundo">Por segundo</option>
              <option value="minuto">Por minuto</option>
              <option value="hora">Por hora</option>
              <option value="dia">Por día</option>
            </select>
          </div>
        </div>
        
        {renderChart()}
        
        {/* Leyenda del gráfico con alertas */}
        {realTimeData.size > 0 && (
          <div className="chart-legend">
            {Array.from(realTimeData.entries()).map(([key, data], index) => {
              const color = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 5];
              const [topico, nodoId] = key.split('_');
              
              return (
                <div key={key} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: color }}></div>
                  <span className="legend-label">
                    {topico} (Nodo #{nodoId})
                  </span>
                  <span className="legend-value">
                    {formatearValorTiempoReal(data.value, topico)}
                  </span>
                  {/* Indicador de alerta en la leyenda */}
                  {data.analysis && data.analysis.category === 'critical' && (
                    <span className="legend-alert">🚨</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Lista de mensajes */}
      <Card 
        title={`💬 Mensajes Recientes (${filteredMensajes.length})`}
        subtitle={showOnlyCritical ? "Mostrando solo alertas críticas" : "Todos los mensajes"}
      >
        {filteredMensajes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No hay mensajes</h3>
            <p>
              {showOnlyCritical 
                ? "No se encontraron alertas críticas con los filtros actuales"
                : "No se encontraron mensajes con los filtros actuales"
              }
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowOnlyCritical(false);
                handleClearFilters();
              }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="mensajes-list">
            {filteredMensajes.map((mensaje) => {
              const analysis = analyzeMessage(mensaje.topico, mensaje.payload);
              const badge = getTopicoBadge(mensaje.topico, mensaje.payload);
              const nodoInfo = getNodoInfo(mensaje.nodo_id);
              
              return (
                <div 
                  key={mensaje.id} 
                  className={`mensaje-card ${analysis.category === 'critical' ? 'critical-alert' : ''}`}
                  onClick={() => handleOpenDetailModal(mensaje)}
                >
                  {/* Banner de alerta crítica */}
                  {analysis.category === 'critical' && (
                    <div className="critical-banner">
                      <span className="critical-icon">{analysis.icon}</span>
                      <span className="critical-text">ALERTA CRÍTICA</span>
                    </div>
                  )}
                  
                  <div className="mensaje-header">
                    <div className="mensaje-id">
                      <span className="id-label">#{mensaje.id}</span>
                      <span className="nodo-info">
                        Nodo #{mensaje.nodo_id} - {nodoInfo.descripcion}
                      </span>
                    </div>
                    <div className="mensaje-time">
                      {formatearFechaCorta(mensaje.fecha)}
                    </div>
                  </div>
                  
                  <div className="mensaje-content">
                    <div className="topico-section">
                      <span className={`badge ${badge.class}`}>
                        {badge.icon} {mensaje.topico}
                      </span>
                      {/* Indicador de estado de alerta */}
                      <span className={`alert-indicator alert-${analysis.category}`}>
                        {analysis.icon}
                      </span>
                    </div>
                    
                    <div className="payload-section">
                      <span 
                        className="payload-value"
                        style={{ 
                          color: analysis.color,
                          fontWeight: analysis.category === 'critical' ? 'bold' : 'normal'
                        }}
                      >
                        {mensaje.payload}
                      </span>
                      {/* Mensaje de alerta */}
                      {(analysis.category === 'critical' || analysis.category === 'warning') && (
                        <div className="alert-message" style={{ color: analysis.color }}>
                          {analysis.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mensaje-footer">
                    <span className="tipo-nodo">{nodoInfo.tipo}</span>
                    <span className="fecha-completa">
                      {formatearFecha(mensaje.fecha)}
                    </span>
                    <div className="mensaje-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetailModal(mensaje);
                        }}
                      >
                        👁️ Ver
                      </button>
                      {analysis.category === 'critical' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAlertModal({
                              ...mensaje,
                              analysis,
                              alertMessage: generateAlertMessage(mensaje.nodo_id, mensaje.topico, analysis)
                            });
                          }}
                        >
                          🚨 Alerta
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMensaje(mensaje.id, mensaje.topico);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal de Alerta Crítica */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={handleCloseAlertModal}
        title="🚨 ALERTA CRÍTICA DETECTADA"
        size="lg"
      >
        {selectedAlert && (
          <div>
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '2px solid #fecaca', 
              borderRadius: '0.5rem', 
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem', marginRight: '1rem' }}>
                  {selectedAlert.analysis.icon}
                </span>
                <div>
                  <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.25rem' }}>
                    {selectedAlert.analysis.message}
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', color: '#7f1d1d' }}>
                    Nodo #{selectedAlert.nodo_id} - {selectedAlert.topico.toUpperCase()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-2 mb-4">
                <div>
                  <strong>Valor detectado:</strong>
                  <p style={{ margin: '0.25rem 0 0', fontFamily: 'monospace', fontSize: '1.1rem', color: '#dc2626' }}>
                    {selectedAlert.payload}
                  </p>
                </div>
                <div>
                  <strong>Rango crítico:</strong>
                  <p style={{ margin: '0.25rem 0 0', color: '#7f1d1d' }}>
                    {selectedAlert.analysis.range}
                  </p>
                </div>
              </div>
              
              <div>
                <strong>Fecha de detección:</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                  {formatearFecha(selectedAlert.fecha)}
                </p>
              </div>
            </div>

            {selectedAlert.analysis.suggestions && selectedAlert.analysis.suggestions.length > 0 && (
              <div>
                <h4 style={{ 
                  color: '#dc2626', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>💡</span>
                  ACCIONES RECOMENDADAS
                </h4>
                
                <div style={{ 
                  backgroundColor: '#fffbeb', 
                  border: '1px solid #fed7aa', 
                  borderRadius: '0.5rem', 
                  padding: '1rem' 
                }}>
                  <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {selectedAlert.analysis.suggestions.map((suggestion, index) => (
                      <li key={index} style={{ 
                        marginBottom: '0.75rem',
                        color: '#92400e',
                        lineHeight: '1.5'
                      }}>
                        {suggestion}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            <div className="flex flex-gap flex-center mt-6">
              <button
                className="btn btn-secondary"
                onClick={handleCloseAlertModal}
              >
                Cerrar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleCloseAlertModal();
                }}
              >
                Marcar como Atendida
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Crear Mensaje */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Nuevo Mensaje"
        size="md"
      >
        <form onSubmit={handleSubmitMensaje}>
          <div className="form-group">
            <label className="form-label">Nodo *</label>
            <select
              className={`form-select ${formErrors.nodo_id ? 'error' : ''}`}
              value={formData.nodo_id}
              onChange={(e) => setFormData({...formData, nodo_id: e.target.value})}
              disabled={isSubmitting}
            >
              <option value="">Selecciona un nodo</option>
              {nodosList.map((nodo) => (
                <option key={nodo.id} value={nodo.id}>
                  Nodo #{nodo.id} - {nodo.descripcion}
                </option>
              ))}
            </select>
            {formErrors.nodo_id && (
              <div className="error-message">{formErrors.nodo_id}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tópico *</label>
            <select
              className={`form-select ${formErrors.topico ? 'error' : ''}`}
              value={formData.topico}
              onChange={(e) => setFormData({...formData, topico: e.target.value})}
              disabled={isSubmitting}
            >
              <option value="">Selecciona un tópico</option>
              <option value="temperatura">🌡️ Temperatura</option>
              <option value="humedad">💧 Humedad</option>
              <option value="peso">⚙️ Peso</option>
            </select>
            {formErrors.topico && (
              <div className="error-message">{formErrors.topico}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Payload/Valor *</label>
            <input
              type="text"
              className={`form-input ${formErrors.payload ? 'error' : ''}`}
              value={formData.payload}
              onChange={(e) => {
                setFormData({...formData, payload: e.target.value});
              }}
              placeholder="Ej: 25.5°C, 80%, ON/OFF, etc."
              disabled={isSubmitting}
            />
            {formErrors.payload && (
              <div className="error-message">{formErrors.payload}</div>
            )}
            
            {/* Preview de alerta */}
            {formData.topico && formData.payload && (
              <div style={{ marginTop: '0.5rem' }}>
                {(() => {
                  const analysis = analyzeMessage(formData.topico, formData.payload);
                  return (
                    <div style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: analysis.category === 'critical' ? '#fef2f2' :
                                      analysis.category === 'warning' ? '#fffbeb' : '#f0fdf4',
                      border: `1px solid ${analysis.color}`,
                      color: analysis.color
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>{analysis.icon}</span>
                      <strong>Preview:</strong> {analysis.message}
                      {analysis.category === 'critical' && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
                          ⚠️ Este valor generará una alerta crítica
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Ejemplos: "25.5°C", "80%", "ON", "1024", "Normal"
            </div>
          </div>

          <div className="flex flex-gap flex-between mt-6">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseCreateModal}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Mensaje'}
            </button>
          </div>
        </form>
      </Modal>

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

          {/* Filtros de alertas */}
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Categoría de Alerta</label>
              <select
                className="form-select"
                value={filters.categoria}
                onChange={(e) => setFilters({...filters, categoria: e.target.value})}
              >
                <option value="">Todas las categorías</option>
                <option value="critical">🚨 Críticas</option>
                <option value="warning">⚠️ Preventivas</option>
                <option value="normal">✅ Normales</option>
                <option value="unknown">❓ Desconocidas</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select
                className="form-select"
                value={filters.prioridad}
                onChange={(e) => setFilters({...filters, prioridad: e.target.value})}
              >
                <option value="">Todas las prioridades</option>
                <option value="urgent">🔥 Urgente</option>
                <option value="high">⬆️ Alta</option>
                <option value="medium">➡️ Media</option>
                <option value="normal">⬇️ Normal</option>
              </select>
            </div>
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
            {(() => {
              const analysis = analyzeMessage(selectedMensaje.topico, selectedMensaje.payload);
              return (
                <>
                  {/* Banner de alerta si es crítica */}
                  {analysis.category === 'critical' && (
                    <div style={{ 
                      backgroundColor: '#fef2f2', 
                      border: '2px solid #fecaca', 
                      borderRadius: '0.5rem', 
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {analysis.icon}
                      </div>
                      <h4 style={{ margin: 0, color: '#dc2626' }}>
                        ALERTA CRÍTICA DETECTADA
                      </h4>
                      <p style={{ margin: '0.25rem 0 0', color: '#7f1d1d' }}>
                        {analysis.message}
                      </p>
                    </div>
                  )}

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
                          const badge = getTopicoBadge(selectedMensaje.topico, selectedMensaje.payload);
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
                        backgroundColor: analysis.category === 'critical' ? '#fef2f2' : '#f9fafb',
                        borderRadius: '0.375rem',
                        border: `2px solid ${analysis.color}`,
                        fontFamily: 'monospace',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: analysis.color
                      }}>
                        {selectedMensaje.payload}
                      </div>
                    </div>

                    {/* Información de la alerta */}
                    <div>
                      <strong>Estado de Alerta:</strong>
                      <div style={{ margin: '0.5rem 0 0' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1.25rem' }}>{analysis.icon}</span>
                          <span 
                            className={`badge ${
                              analysis.category === 'critical' ? 'badge-danger' :
                              analysis.category === 'warning' ? 'badge-warning' :
                              'badge-success'
                            }`}
                          >
                            {analysis.category.toUpperCase()}
                          </span>
                          <span style={{ color: analysis.color, fontWeight: '600' }}>
                            {analysis.message}
                          </span>
                        </div>
                        
                        {analysis.range && (
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Rango de alerta: {analysis.range}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <strong>Fecha y Hora:</strong>
                      <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
                        {formatearFecha(selectedMensaje.fecha)}
                      </p>
                    </div>

                    {/* Sugerencias si hay alerta */}
                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                      <div>
                        <strong style={{ color: analysis.color }}>
                          💡 Recomendaciones:
                        </strong>
                        <div style={{ 
                          margin: '0.5rem 0 0',
                          padding: '1rem',
                          backgroundColor: '#fffbeb',
                          borderRadius: '0.375rem',
                          border: '1px solid #fed7aa'
                        }}>
                          <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
                            {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                              <li key={index} style={{ 
                                marginBottom: '0.5rem',
                                color: '#92400e',
                                fontSize: '0.875rem'
                              }}>
                                {suggestion}
                              </li>
                            ))}
                          </ol>
                          {analysis.suggestions.length > 3 && (
                            <p style={{ 
                              margin: '0.5rem 0 0', 
                              fontSize: '0.75rem', 
                              color: '#6b7280' 
                            }}>
                              ... y {analysis.suggestions.length - 3} recomendaciones más
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

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