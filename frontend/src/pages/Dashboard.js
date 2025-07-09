import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';

const Dashboard = () => {
  const { dashboard, loading } = useApi();
  const [stats, setStats] = useState({
    usuarios: 0,
    apiarios: 0,
    colmenas: 0,
    revisiones: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, recentData] = await Promise.all([
        dashboard.getStats(),
        dashboard.getRecent()
      ]);
      setStats(statsData);
      setRecentActivities(recentData);
    } catch (error) {
      console.log('Error cargando dashboard:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`card p-6 text-center ${color}`}>
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-2xl font-bold text-black mb-1">
        {loading ? '...' : value}
      </h3>
      <p className="text-black text-opacity-80 text-sm font-medium">
        {title}
      </p>
    </div>
  );

  const ActivityCard = ({ activity }) => (
    <div className="card p-4 border-l-4 border-yellow-400">
      <div className="flex items-start">
        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
          <span className="text-lg">📝</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            Revisión - {activity.colmena_nombre}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Inspector: {activity.usuario_nombre}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(activity.fecha_revision).toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🐝 Dashboard SmartBee
        </h1>
        <p className="text-gray-600">
          Resumen general de tu sistema apícola
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuarios Registrados"
          value={stats.usuarios}
          icon="👥"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Apiarios Activos"
          value={stats.apiarios}
          icon="🏠"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Colmenas Monitoreadas"
          value={stats.colmenas}
          icon="🏺"
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Revisiones Realizadas"
          value={stats.revisiones}
          icon="📝"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Estado del Sistema */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Estado del Sistema
            </h2>
            <div className="flex items-center text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="font-medium">Sistema funcionando correctamente</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {new Date().toLocaleString('es-ES')}
            </p>
          </div>
          <div className="text-6xl opacity-20">
            🍯
          </div>
        </div>
      </div>

      {/* Actividades Recientes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Actividades Recientes
          </h2>
          <button
            onClick={loadDashboardData}
            className="btn btn-secondary text-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin mr-2">⟳</span>
            ) : (
              <span className="mr-2">🔄</span>
            )}
            Actualizar
          </button>
        </div>

        {loading && recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin text-3xl mb-2">⟳</div>
            <p className="text-gray-600">Cargando actividades...</p>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-600 mb-2">No hay actividades recientes</p>
            <p className="text-sm text-gray-500">Las revisiones aparecerán aquí una vez que comiences a registrarlas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Información de la aplicación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🎯 Acciones Rápidas
          </h3>
          <div className="space-y-2">
            <button className="w-full btn btn-primary text-left">
              <span className="mr-2">👥</span>
              Gestionar Usuarios
            </button>
            <button className="w-full btn btn-secondary text-left">
              <span className="mr-2">🏠</span>
              Agregar Apiario
            </button>
            <button className="w-full btn btn-secondary text-left">
              <span className="mr-2">🏺</span>
              Registrar Colmena
            </button>
            <button className="w-full btn btn-secondary text-left">
              <span className="mr-2">📝</span>
              Nueva Revisión
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            📊 Estadísticas de la Semana
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revisiones esta semana:</span>
              <span className="font-semibold text-purple-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nuevas colmenas:</span>
              <span className="font-semibold text-yellow-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Alertas activas:</span>
              <span className="font-semibold text-red-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Productividad:</span>
              <span className="font-semibold text-green-600">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips y consejos */}
      <div className="card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
        <div className="flex items-start">
          <div className="text-2xl mr-3">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Consejo del Día
            </h3>
            <p className="text-gray-700">
              La mejor hora para revisar las colmenas es entre las 10:00 AM y 2:00 PM, 
              cuando la mayoría de las abejas pecoreadoras están fuera trabajando.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;