const Redis = require('ioredis');
const url = process.env.REDIS_URL;
if (!url) {
  console.error('REDIS_URL not set');
  process.exit(1);
}
console.log('Testing REDIS_URL:', url ? '[provided]' : '[missing]');
const opts = {};
if (url.startsWith('rediss://')) opts.tls = {};
const redis = new Redis(url, opts);
redis.on('connect', () => console.log('connect event'));
redis.on('ready', async () => {
  console.log('ready');
  try {
    const r = await redis.ping();
    console.log('ping response:', r);
    await redis.quit();
    process.exit(0);
  } catch (e) {
    console.error('ping failed', e);
    process.exit(2);
  }
});
redis.on('error', (e) => {
  console.error('ERROR', e);
  process.exit(3);
});
