const REDIS_URL = process.env.REDIS_URL;
const { createClient } = require('redis');

const cacheClient = createClient({
    url: REDIS_URL,
    socket: {
        // This function decides how long to wait before trying again
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                console.error('Redis: Max retries reached. Stopping reconnection.');
                return new Error('Redis connection lost permanently'); 
            }
            // Wait progressively longer: 500ms, 1000ms, 2000ms... up to 3 seconds
            return Math.min(retries * 1000, 60000);
        }
    }
});

cacheClient.on('connect', () => console.log('Redis: Connecting... 🟡'));
cacheClient.on('ready', () => console.log('Redis: Ready and Connected! 🟢'));
cacheClient.on('error', (err) => console.error('Redis: Connection Error 🔴', err.code ));
cacheClient.on('reconnecting', () => console.log('Redis: Reconnecting... 🟠'));
cacheClient.on('end', () => console.log('Redis: Connection Closed ⚪'));

// Use a self-invoking function or export a setup function
(async () => {
    try {
        await cacheClient.connect();
    } catch (err) {
        console.error('Could not connect to Redis:', JSON.stringify(err));
    }
})();

module.exports = cacheClient;