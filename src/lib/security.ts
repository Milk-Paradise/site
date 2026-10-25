import { createHash } from 'node:crypto';
import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;
let connecting: Promise<unknown> | null = null;
export async function getRedis() {
  if (!process.env.REDIS_URL) throw new Error('REDIS_UNCONFIGURED');
  if (!redisClient) {
    redisClient = createClient({url:process.env.REDIS_URL,socket:{connectTimeout:3000,reconnectStrategy:false},disableOfflineQueue:true});
    redisClient.on('error',()=>console.error('Lead security storage unavailable'));
  }
  if (!redisClient.isOpen) {
    connecting ??= redisClient.connect().finally(()=>{connecting=null;});
    await connecting;
  }
  return redisClient;
}
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export async function rateLimit(key: string, max: number, seconds: number) {
  const redis = await getRedis();
  const result = await redis.eval("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",{keys:[`milkshake:rate:${key}`],arguments:[String(seconds)]});
  return Number(result)<=max;
}
