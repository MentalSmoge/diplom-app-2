"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLElementRepository = void 0;
exports.createElementPool = createElementPool;
const pg_1 = require("pg");
class PostgreSQLElementRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async initialize() {
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS elements (
                id VARCHAR(36) PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                board_id VARCHAR(36) NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
    }
    async loadInitialState() {
        const result = await this.pool.query(`
            SELECT id, type, board_id, data
            FROM elements
        `);
        console.log(result.rows.map(row => (Object.assign({ id: row.id, type: row.type, boardId: row.board_id }, row.data))), "INIT");
        return result.rows.map(row => (Object.assign({ id: row.id, type: row.type, boardId: row.board_id }, row.data)));
    }
    async saveElement(element) {
        const { id, type, boardId } = element, data = __rest(element, ["id", "type", "boardId"]);
        await this.pool.query(`
            INSERT INTO elements (id, type, board_id, data)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE
            SET type = $2, board_id = $3, data = $4, updated_at = NOW()
        `, [id, type, boardId, data]);
    }
    async deleteElement(elementId) {
        await this.pool.query(`
            DELETE FROM elements
            WHERE id = $1
        `, [elementId]);
    }
}
exports.PostgreSQLElementRepository = PostgreSQLElementRepository;
function createElementPool() {
    return new pg_1.Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || "element_db",
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || "5432"),
    });
}
