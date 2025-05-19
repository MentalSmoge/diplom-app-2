"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({
    // url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    url: `redis://redis:6379`,
});
exports.redisClient.on("error", (err) => console.error("Redis error:", err));
exports.redisClient.connect().then(() => console.log("Connected to Redis"));
