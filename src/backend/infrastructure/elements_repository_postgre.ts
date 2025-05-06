import { Pool } from "pg";
import { ElementRepository, Element } from "../domain/element";

export class PostgreSQLElementRepository implements ElementRepository {
    constructor(private pool: InstanceType<typeof Pool>) { }

    async initialize(): Promise<void> {
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

    async loadInitialState(): Promise<Element[]> {
        const result = await this.pool.query(`
            SELECT id, type, board_id as boardId, data
            FROM elements
        `);
        return result.rows.map(row => ({
            id: row.id,
            type: row.type,
            boardId: row.board_id,
            ...row.data
        }));
    }

    async saveElement(element: Element): Promise<void> {
        const { id, type, boardId, ...data } = element;
        await this.pool.query(`
            INSERT INTO elements (id, type, board_id, data)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE
            SET type = $2, board_id = $3, data = $4, updated_at = NOW()
        `, [id, type, boardId, data]);
    }

    async deleteElement(elementId: string): Promise<void> {
        await this.pool.query(`
            DELETE FROM elements
            WHERE id = $1
        `, [elementId]);
    }
}

export function createElementPool(): InstanceType<typeof Pool> {
    return new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || "element_db",
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || "5432"),
    });
}