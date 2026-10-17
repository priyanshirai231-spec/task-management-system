const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.warn('[Redis] Stopped reconnecting. Running in DB-only mode.');
        return false;
      }
      return 1000;
    }
  }
});

redisClient.on('connect', () => console.log('[Redis] Client Connecting...'));
redisClient.on('ready', () => console.log('[Redis] Client Ready & Connected'));
redisClient.on('error', (err) => {
  console.warn('[Redis Warning]:', err.message);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.warn('[Redis Connection Failed]: Cache bypassed.');
  }
};

module.exports = { redisClient, connectRedis };