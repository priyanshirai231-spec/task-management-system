const { redisClient } = require('../config/redis');

const clearUserTaskCache = async (userId) => {
  if (!redisClient || !redisClient.isReady) return;

  try {
    let cursor = 0;
    const matchPattern = `tasks:${userId}:*`;
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: matchPattern,
        COUNT: 100
      });
      cursor = reply.cursor;
      const keys = reply.keys;

      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } while (cursor !== 0);

    const singleTaskPattern = `task:${userId}:*`;
    cursor = 0;
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: singleTaskPattern,
        COUNT: 100
      });
      cursor = reply.cursor;
      const keys = reply.keys;

      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } while (cursor !== 0);
  } catch (err) {
    console.error(`[Redis Invalidation Error]: ${err.message}`);
  }
};

module.exports = { clearUserTaskCache };
