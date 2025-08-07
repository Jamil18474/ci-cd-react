const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ debug: false });
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

/**
 * Health check endpoint
 * @returns {Object} API status and basic information
 */
app.get('/', (req, res) => {
  res.json({
    message: 'API User Management',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});



/**
 * Connects to MongoDB database
 * @async
 * @returns {Promise<boolean>} Connection success status
 */
async function connectMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI non définie dans les variables d\'environnement');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    return false;
  }
}

/**
 * Starts the Express server
 * @async
 * @returns {Promise<Server>} Express server instance
 */
async function startServer() {
  try {
    const mongoConnected = await connectMongoDB();

    if (!mongoConnected) {
      process.exit(1);
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });

    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    return server;
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 * @async
 */
async function gracefulShutdown() {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non gérée:', error.message);
  gracefulShutdown();
});

startServer();