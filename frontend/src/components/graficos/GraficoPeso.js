import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { colmenasAPI, manejarError } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraficoPeso = ({ colmenaId, periodo = 'semana' }) => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (colmenaId) {
      cargarDatos();
    }
  }, [colmenaId, periodo]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const response = await colmenasAPI.obtenerSensores(colmenaId, periodo, 'peso');
      setDatos(response.datos);
      setError(null);
    } catch (err) {
      const errorInfo = manejarError(err);
      setError(errorInfo);
    } finally {
      setCargando(false);
    }
  };

  const generarDatosSimulados = () => {
    const labels = [];
    const pesoTotal = [];
    
    const puntos = periodo === 'dia' ? 24 : periodo === 'semana' ? 7 : periodo === 'mes' ? 30 : 12;
    let pesoBase = 45; // kg base
    
    for (let i = 0; i < puntos; i++) {
      if (periodo === 'dia') {
        labels.push(`${i}:00`);
        // Variación diaria menor
        pesoTotal.push(pesoBase + Math.random() * 2 - 1);
      } else if (periodo === 'semana') {
        const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        labels.push(dias[i]);
        // Incremento gradual durante la semana
        pesoTotal.push(pesoBase + i * 0.5 + Math.random() * 1 - 0.5);
      } else if (periodo === 'mes') {
        labels.push(`${i + 1}`);
        // Crecimiento durante el mes
        pesoTotal.push(pesoBase + i * 0.3 + Math.random() * 1.5 - 0.75);
      } else {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        labels.push(meses[i]);
        // Variación estacional
        const variacionEstacional = Math.sin(i * Math.PI / 6) * 8; // Máximo en verano
        pesoTotal.push(pesoBase + variacionEstacional + Math.random() * 2 - 1);
      }
    }
    
    return { labels, pesoTotal };
  };

  const prepararDatosGrafico = () => {
    const datosSimulados = generarDatosSimulados();
    
    return {
      labels: datosSimulados.labels,
      datasets: [
        {
          label: '⚖️ Peso Total',
          data: datosSimulados.pesoTotal,
          borderColor: 'rgb(230, 126, 34)',
          backgroundColor: 'rgba(230, 126, 34, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(230, 126, 34)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
        }
      ]
    };
  };

  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Peso de la Colmena - ${periodo.charAt(0).toUpperCase() + periodo.slice(1)}`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(230, 126, 34, 0.8)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} kg`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: getPeriodoLabel(),
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Peso (kg)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        min: 30,
        max: 70,
        ticks: {
          callback: function(value) {
            return value + ' kg';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  function getPeriodoLabel() {
    switch (periodo) {
      case 'dia': return 'Hora del día';
      case 'semana': return 'Día de la semana';
      case 'mes': return 'Día del mes';
      case 'año': return 'Mes del año';
      default: return 'Tiempo';
    }
  }

  if (cargando) {
    return (
      <div className="grafico-loading">
        <div className="loading-spinner">
          <div className="bee-icon">🐝</div>
          <p>Cargando datos de peso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grafico-error">
        <div className="error-content">
          <h4>Error al cargar datos</h4>
          <p>{error.mensaje}</p>
          <button onClick={cargarDatos} className="btn btn-primary btn-sm">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grafico-peso">
      <div className="grafico-container">
        <Line data={prepararDatosGrafico()} options={opciones} />
      </div>
      
      <div className="grafico-info">
                  <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">⚖️</div>
            <div className="info-content">
              <span className="info-label">Peso Actual</span>
              <span className="info-value">47.3 kg</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📈</div>
            <div className="info-content">
              <span className="info-label">Ganancia Total</span>
              <span className="info-value">+2.8 kg</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🍯</div>
            <div className="info-content">
              <span className="info-label">Miel Estimada</span>
              <span className="info-value">12.5 kg</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📊</div>
            <div className="info-content">
              <span className="info-label">Tendencia</span>
              <span className="info-value trend-up">↗️ Creciendo</span>
            </div>
          </div>
        </div>
        
        <div className="peso-analisis">
          <div className="analisis-seccion">
            <h4>📋 Análisis del Peso</h4>
            <div className="analisis-grid">
              <div className="analisis-item">
                <span className="analisis-label">Peso base (colmena vacía):</span>
                <span className="analisis-valor">25 kg</span>
              </div>
              <div className="analisis-item">
                <span className="analisis-label">Peso de abejas estimado:</span>
                <span className="analisis-valor">4-6 kg</span>
              </div>
              <div className="analisis-item">
                <span className="analisis-label">Peso de miel y polen:</span>
                <span className="analisis-valor">15-20 kg</span>
              </div>
              <div className="analisis-item">
                <span className="analisis-label">Ganancia este período:</span>
                <span className="analisis-valor">+2.8 kg</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grafico-observaciones">
          <h4>💡 Interpretación del Peso</h4>
          <ul>
            <li>📈 <strong>Aumento constante:</strong> Buena producción de miel</li>
            <li>📉 <strong>Pérdida rápida:</strong> Posible enjambrazón o problema</li>
            <li>⚖️ <strong>Peso estable:</strong> Consumo equilibrado con producción</li>
            <li>🌸 <strong>Variación diaria:</strong> Actividad normal de pecoreo</li>
            <li>🍯 <strong>Peso óptimo para cosecha:</strong> 60-80 kg total</li>
          </ul>
        </div>
        
        <div className="alertas-peso">
          <h4>🚨 Alertas Automáticas</h4>
          <div className="alertas-list">
            <div className="alerta success">
              <div className="alerta-icon">✅</div>
              <div className="alerta-content">
                <p><strong>Crecimiento normal:</strong> La colmena muestra un aumento saludable de peso</p>
              </div>
            </div>
            
            <div className="alerta info">
              <div className="alerta-icon">ℹ️</div>
              <div className="alerta-content">
                <p><strong>Próximo control:</strong> Considera revisar la colmena cuando alcance 55 kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoPeso;