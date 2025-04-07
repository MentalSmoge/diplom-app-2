import { Pool } from "pg";
import { Board, BoardRepository } from "../domain/board";

export class PostgreSQLBoardRepository implements BoardRepository {
    constructor(private pool: InstanceType<typeof Pool>) { }

    async addBoard(board: Board): Promise<void> {
        await this.pool.query(
            "INSERT INTO boards(id, title, project_id) VALUES($1, $2, $3)",
            [board.id, board.title, board.project_id]
        );
    }

    async getBoardById(id: number): Promise<Board | null> {
        const result = await this.pool.query(
            "SELECT id, title, project_id FROM boards WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async getBoardsByUserId(userId: number): Promise<Board[] | null> {
        const result = await this.pool.query(
            `SELECT b.id, b.title, b.project_id, ba.access_level
             FROM boards b
             JOIN board_accesses ba ON b.id = ba.board_id
             WHERE ba.user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows;
    }

    async getAllBoards(): Promise<Board[]> {
        const result = await this.pool.query(
            'SELECT id, title, project_id FROM boards'
        );

        return result.rows;
    }

    async updateBoard(board: Board): Promise<void> {
        await this.pool.query(
            "UPDATE boards SET title = $1, project_id = $2 WHERE id = $3",
            [board.title, board.project_id, board.id]
        );
    }

    async deleteBoard(id: number): Promise<boolean> {
        const result = await this.pool.query(
            "DELETE FROM boards WHERE id = $1",
            [id]
        );
        return result.rowCount! > 0;
    }
}

export function createBoardPool(): InstanceType<typeof Pool> {
    return new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || "board_db",
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT!),
    });
}