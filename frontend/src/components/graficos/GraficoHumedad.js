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

const GraficoHumedad = ({ colmenaId, periodo = 'semana' }) => {
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
      const response = await colmenasAPI.obtenerSensores(colmenaId, periodo, 'humedad');
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
    const humedadInterna = [];
    const humedadExterna = [];
    
    const puntos = periodo === 'dia' ? 24 : periodo === 'semana' ? 7 : periodo === 'mes' ? 30 : 12;
    
    for (let i = 0; i < puntos; i++) {
      if (periodo === 'dia') {
        labels.push(`${i}:00`);
        humedadInterna.push(55 + Math.random() * 10 - 5);
        humedadExterna.push(65 + Math.random() * 20 - 10 + Math.sin(i * Math.PI / 12) * 10);
      } else if (periodo === 'semana') {
        const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        labels.push(dias[i]);
        humedadInterna.push(55 + Math.random() * 8 - 4);
        humedadExterna.push(70 + Math.random() * 15 - 7.5);
      } else if (periodo === 'mes') {
        labels.push(`${i + 1}`);
        humedadInterna.push(55 + Math.random() * 10 - 5);
        humedadExterna.push(65 + Math.random() * 20 - 10);
      } else {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        labels.push(meses[i]);
        humedadInterna.push(55 + Math.sin(i * Math.PI / 6) * 5);
        humedadExterna.push(70 + Math.sin(i * Math.PI / 6) * 15);
      }
    }
    
    return { labels, humedadInterna, humedadExterna };
  };

  const prepararDatosGrafico = () => {
    const datosSimulados = generarDatosSimulados();
    
    return {
      labels: datosSimulados.labels,
      datasets: [
        {
          label: '💧 Humedad Interna',
          data: datosSimulados.humedadInterna,
          borderColor: 'rgb(52, 152, 219)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgb(52, 152, 219)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: '🌧️ Humedad Externa',
          data: datosSimulados.humedadExterna,
          borderColor: 'rgb(155, 89, 182)',
          backgroundColor: 'rgba(155, 89, 182, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgb(155, 89, 182)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
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
        text: `Humedad Relativa - ${periodo.charAt(0).toUpperCase() + periodo.slice(1)}`,
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
        borderColor: 'rgba(52, 152, 219, 0.8)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
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
          text: 'Humedad Relativa (%)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        min: 0,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
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
        hoverRadius: 6
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
          <p>Cargando datos de humedad...</p>
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
    <div className="grafico-humedad">
      <div className="grafico-container">
        <Line data={prepararDatosGrafico()} options={opciones} />
      </div>
      
      <div className="grafico-info">
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">💧</div>
            <div className="info-content">
              <span className="info-label">Humedad Interna Promedio</span>
              <span className="info-value">55.3%</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🌧️</div>
            <div className="info-content">
              <span className="info-label">Humedad Externa Promedio</span>
              <span className="info-value">68.7%</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📊</div>
            <div className="info-content">
              <span className="info-label">Diferencia Promedio</span>
              <span className="info-value">13.4%</span>
            </div>
          </div>
        </div>
        
        <div className="grafico-observaciones">
          <h4>💡 Observaciones</h4>
          <ul>
            <li>🎯 Humedad interna óptima: 50-60%</li>
            <li>💧 Las abejas controlan la humedad ventilando</li>
            <li>⚠️ Humedad alta puede causar fermentación de miel</li>
            <li>🌬️ Humedad baja puede deshidratar a las larvas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GraficoHumedad;