import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow-sm',
  hover = true,
  border = true,
  background = 'bg-white'
}) => {
  const baseClasses = `
    ${background} 
    rounded-xl 
    ${shadow}
    ${border ? 'border border-gray-200' : ''}
    ${padding}
    transition-all duration-300
    ${hover ? 'hover:shadow-md hover:transform hover:scale-[1.02]' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses.trim()}>
      {children}
    </div>
  );
};

// Componente Card con header
export const CardWithHeader = ({ 
  title, 
  subtitle, 
  headerAction,
  children, 
  icon: Icon,
  ...props 
}) => {
  return (
    <Card padding="p-0" {...props}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {Icon && <Icon className="h-5 w-5 text-gray-600 mr-2" />}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {headerAction && (
            <div>
              {headerAction}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </Card>
  );
};

// Componente de estadística
export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon,
  color = 'blue',
  ...props 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card 
      className={`bg-gradient-to-br ${colorClasses[color]} text-white`}
      background=""
      border={false}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-80 text-sm font-medium">
            {title}
          </p>
          <p className="text-3xl font-bold mt-1">
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[changeType]}`}>
              {changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'} {change}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <Icon className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
    </Card>
  );
};

// Componente Card vacío (estado empty)
export const EmptyCard = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  ...props 
}) => {
  return (
    <Card className="text-center py-12" {...props}>
      {Icon && <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 mb-6">
          {description}
        </p>
      )}
      {action && action}
    </Card>
  );
};

export default Card;