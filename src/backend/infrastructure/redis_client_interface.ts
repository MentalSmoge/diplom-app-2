/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IRedisClient {
    [x: string]: any;
    on(event: string, callback: Function): void;
    get(key: string): Promise<string | null>;
    setEx(key: string, seconds: number, value: string): Promise<string>;
    del(key: string): Promise<number>;
}