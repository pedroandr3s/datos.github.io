import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Esperar a que termine la animación
  };

  if (!isVisible) {
    return null;
  }

  const alertTypes = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    }
  };

  const config = alertTypes[type] || alertTypes.info;
  const Icon = config.icon;

  return (
    <div className={`
      ${config.bgColor} 
      ${config.borderColor} 
      ${config.textColor} 
      border rounded-lg p-4 mb-4 
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${className}
    `}>
      <div className="flex items-start">
        <Icon className={`${config.iconColor} h-5 w-5 mt-0.5 flex-shrink-0`} />
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm">
              {message}
            </p>
          )}
        </div>

        {onClose && (
          <button
            onClick={handleClose}
            className={`${config.iconColor} hover:opacity-75 ml-3 flex-shrink-0`}
            aria-label="Cerrar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Barra de progreso para auto-close */}
      {autoClose && duration > 0 && (
        <div className="mt-2 bg-gray-200 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full ${config.iconColor.replace('text-', 'bg-')} transition-all ease-linear`}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Hook para usar alertas fácilmente
export const useAlert = () => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (alert) => {
    const id = Date.now() + Math.random();
    const newAlert = { ...alert, id };
    
    setAlerts(prev => [...prev, newAlert]);
    
    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showSuccess = (message, title = 'Éxito') => {
    return addAlert({ type: 'success', title, message });
  };

  const showError = (message, title = 'Error') => {
    return addAlert({ type: 'error', title, message });
  };

  const showWarning = (message, title = 'Advertencia') => {
    return addAlert({ type: 'warning', title, message });
  };

  const showInfo = (message, title = 'Información') => {
    return addAlert({ type: 'info', title, message });
  };

  const AlertContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          {...alert}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );

  return {
    alerts,
    addAlert,
    removeAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    AlertContainer
  };
};

export default Alert;