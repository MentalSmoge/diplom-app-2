"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLUserRepository = void 0;
exports.createPool = createPool;
const pg_1 = require("pg");
const user_1 = require("../domain/user");
class PostgreSQLUserRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async checkConnection() {
        try {
            const res = await this.pool.query("SELECT NOW()");
            console.log("Database connected:", res.rows[0]);
        }
        catch (err) {
            console.error("Database connection error:", err);
        }
    }
    async addUser(user) {
        await this.pool.query("INSERT INTO users(name, email, password) VALUES($1, $2, $3)", [user.name, user.email, user.password]);
    }
    async getUserById(id) {
        const result = await this.pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const userData = result.rows[0];
        return (0, user_1.toUserDTO)(userData);
    }
    async getUserByIdAuth(id) {
        const result = await this.pool.query("SELECT id, name, email, password FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const userData = result.rows[0];
        return new user_1.User(userData.id, userData.name, userData.email, userData.password);
    }
    async getUserByName(name) {
        const result = await this.pool.query("SELECT id, name, email FROM users WHERE name = $1", [name]);
        if (result.rows.length === 0) {
            return null;
        }
        const userData = result.rows[0];
        return (0, user_1.toUserDTO)(userData);
    }
    async getUserByEmailAuth(name) {
        const result = await this.pool.query("SELECT id, name, email, password FROM users WHERE email = $1", [name]);
        if (result.rows.length === 0) {
            return null;
        }
        const userData = result.rows[0];
        return new user_1.User(userData.id, userData.name, userData.email, userData.password);
    }
    async getUserByEmail(email) {
        const result = await this.pool.query("SELECT id, name, email FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return null;
        }
        const userData = result.rows[0];
        return (0, user_1.toUserDTO)(userData);
    }
    async getUserByNameAuth(name) {
        const result = await this.pool.query("SELECT id, name, email, password FROM users WHERE name = $1", [name]);
        if (result.rows.length === 0) {
            return null;
        }
        const userData = result.rows[0];
        return new user_1.User(userData.id, userData.name, userData.email, userData.password);
    }
    async getAllUsers() {
        const result = await this.pool.query('SELECT id, name, email FROM users');
        return result.rows.map(row => (0, user_1.toUserDTO)(row));
    }
    // Обновление пользователя
    async updateUser(user) {
        await this.pool.query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [user.name, user.email, user.id]);
    }
    async updateUserAuth(user) {
        await this.pool.query("UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4", [user.name, user.email, user.password, user.id]);
    }
    // Удаление пользователя
    async deleteUser(id) {
        const result = await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
        return result.rowCount > 0;
    }
}
exports.PostgreSQLUserRepository = PostgreSQLUserRepository;
function createPool() {
    return new pg_1.Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || "user_db",
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
    });
}
