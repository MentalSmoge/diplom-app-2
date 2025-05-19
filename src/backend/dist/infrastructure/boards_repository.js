"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLBoardRepository = void 0;
exports.createBoardPool = createBoardPool;
const pg_1 = require("pg");
class PostgreSQLBoardRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async addBoard(board) {
        const result = await this.pool.query("INSERT INTO boards(title, project_id) VALUES($1, $2) RETURNING id", [board.title, board.project_id]);
        return result.rows[0].id;
    }
    async getBoardById(id) {
        const result = await this.pool.query("SELECT id, title, project_id FROM boards WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async getBoardsByProjectId(projectId) {
        const result = await this.pool.query("SELECT id, title, project_id FROM boards WHERE project_id = $1", [projectId]);
        if (result.rows.length === 0) {
            return [];
        }
        return result.rows;
    }
    // async getBoardsByUserId(userId: number): Promise<Board[] | null> {
    //     const result = await this.pool.query(
    //         `SELECT b.id, b.title, b.project_id, ba.access_level
    //          FROM boards b
    //          JOIN board_accesses ba ON b.id = ba.board_id
    //          WHERE ba.user_id = $1`,
    //         [userId]
    //     );
    //     if (result.rows.length === 0) {
    //         return null;
    //     }
    //     return result.rows;
    // }
    // async getUserAccessToBoard(userId: number, boardId: number): Promise<string> {
    //     const result = await this.pool.query(
    //         `SELECT access_level
    //         FROM board_accesses
    //         WHERE user_id = $1 AND board_id = $2;
    //         `,
    //         [userId, boardId]
    //     );
    //     if (result.rows.length === 0) {
    //         return "no";
    //     }
    //     return result.rows[0].access_level;
    // }
    // async getAllBoards(): Promise<Board[]> {
    //     const result = await this.pool.query(
    //         'SELECT id, title, project_id FROM boards'
    //     );
    //     return result.rows;
    // }
    async updateBoard(board) {
        await this.pool.query("UPDATE boards SET title = $1, project_id = $2 WHERE id = $3", [board.title, board.project_id, board.id]);
    }
    async deleteBoard(id) {
        const result = await this.pool.query("DELETE FROM boards WHERE id = $1", [id]);
        return result.rowCount > 0;
    }
}
exports.PostgreSQLBoardRepository = PostgreSQLBoardRepository;
function createBoardPool() {
    return new pg_1.Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || "board_db",
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
    });
}
