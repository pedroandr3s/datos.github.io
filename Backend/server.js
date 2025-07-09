const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/database');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const apiarioRoutes = require('./routes/apiarios');
const colmenaRoutes = require('./routes/colmenas');
const revisionRoutes = require('./routes/revisiones');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: ['http://localhost:3000', 'https://datos-github-io-gamma.vercel.app/'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/apiarios', apiarioRoutes);
app.use('/api/colmenas', colmenaRoutes);
app.use('/api/revisiones', revisionRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'SmartBee API funcionando correctamente',
        timestamp: new Date().toISOString(),
        database: 'Railway MySQL'
    });
});

// Ruta para probar conexión a base de datos
app.get('/api/test-db', async (req, res) => {
    const isConnected = await testConnection();
    res.json({ 
        connected: isConnected,
        database: 'Railway MySQL',
        timestamp: new Date().toISOString()
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a base de datos
        const dbConnected = await testConnection();
        
        if (dbConnected) {
            app.listen(PORT, () => {
                console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
                console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
                console.log(`🗄️  Base de datos: Railway MySQL`);
            });
        } else {
            console.error('❌ No se pudo conectar a la base de datos. Servidor no iniciado.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
};

startServer();