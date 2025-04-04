import { createClient } from "redis";
import { IRedisClient } from './redis_client_interface';

export const redisClient: IRedisClient = createClient({
    // url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    url: `redis://redis:6379`,
});
redisClient.on("error", (err: unknown) => console.error("Redis error:", err));
redisClient.connect().then(() => console.log("Connected to Redis"));