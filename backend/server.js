const path = require('path');
// 1. Load .env directly from backend root
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
let authRoutes;
let taskRoutes;
try {
  authRoutes = require('./routes/authRoutes');
  taskRoutes = require('./routes/taskRoutes');
} catch (err) {
  try {
    authRoutes = require('./src/routes/authRoutes');
    taskRoutes = require('./src/routes/taskRoutes');
  } catch (innerErr) {
    console.warn('[Routes Warning]: Could not auto-detect route paths. Check folder structure.');
  }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize MONGO_URI to remove Windows CRLF (\r\n), trailing spaces, or quotes
const rawUri = process.env.MONGO_URI || '';
const cleanMongoUri = rawUri.trim().replace(/[\r\n]/g, '').replace(/^["']|["']$/g, '');

console.log('--------------------------------------------------');
console.log('[Environment Check]:');
console.log(' - PORT:', process.env.PORT || 5000);
console.log(' - MONGO_URI Loaded?:', cleanMongoUri ? 'YES' : 'NO');
if (cleanMongoUri) {
  const maskedUri = cleanMongoUri.replace(/:([^:@]+)@/, ':****@');
  console.log(' - Sanitized Target:', maskedUri);
}
console.log(' - REDIS_URL Loaded?:', process.env.REDIS_URL ? 'YES' : 'NO');
console.log('--------------------------------------------------');

// 2. Safe Redis Initialization (Non-blocking fallback)
let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    const { createClient } = require('redis');
    redisClient = createClient({
      url: process.env.REDIS_URL.trim().replace(/[\r\n]/g, ''),
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 1) {
            return false; // Stop spamming logs after 1 retry
          }
          return 500;
        },
      },
    });

    redisClient.on('connect', () => console.log('[Redis]: Connected successfully.'));
    redisClient.on('error', (err) => {
      // Keep warnings concise
    });

    redisClient.connect().catch(() => {
      console.warn('[Redis]: Inactive. Operating on Direct DB mode.');
    });
  } catch (err) {
    console.warn('[Redis]: Module init skipped.');
  }
}

// Attach Redis client to req object
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// API Routes
if (authRoutes) app.use('/api/auth', authRoutes);
if (taskRoutes) app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/error',
    redis: redisClient && redisClient.isOpen ? 'connected' : 'disabled',
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 3. Keep Server Alive & Connect DB with Retry
const PORT = process.env.PORT || 5000;

// Start HTTP Server immediately so Nodemon stays active and responsive
const server = app.listen(PORT, () => {
  console.log(`[Server]: Actively running on http://localhost:${PORT}`);
});

const connectMongoDB = async () => {
  if (!cleanMongoUri) {
    console.error('[Fatal Error]: MONGO_URI is missing from your .env file!');
    return;
  }

  try {
    await mongoose.connect(cleanMongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[MongoDB]: Connected successfully.');
  } catch (err) {
    console.error(`[MongoDB Error]: ${err.message}`);
    console.log('[MongoDB]: Will retry connection in 8 seconds...');
    setTimeout(connectMongoDB, 8000);
  }
};

connectMongoDB();