import * as r from "rethinkdb";
import { BoardRepository, Board } from "../domain/board";

const rethinkConfig = {
    host: process.env.RETHINKDB_HOST || "localhost",
    port: process.env.RETHINKDB_PORT ? Number(process.env.RETHINKDB_PORT) : 28015,
    db: process.env.RETHINKDB_NAME || "rethink",
    table: "boards",
};

export class RethinkDBBoardRepository implements BoardRepository {
    constructor(private connection: r.Connection) { }

    async initialize(): Promise<void> {
        const dbList = await r.dbList().run(this.connection);
        if (!dbList.includes(rethinkConfig.db)) {
            await r.dbCreate(rethinkConfig.db).run(this.connection);
        }

        const tableList = await r.db(rethinkConfig.db).tableList().run(this.connection);
        if (!tableList.includes(rethinkConfig.table)) {
            await r.db(rethinkConfig.db).tableCreate(rethinkConfig.table).run(this.connection);
        }
    }

    async loadInitialState(): Promise<Board[]> {
        const cursor = await r.db(rethinkConfig.db).table(rethinkConfig.table).run(this.connection);
        return cursor.toArray() as Promise<Board[]>;
    }

    async saveBoard(board: Board): Promise<void> {
        await r.db(rethinkConfig.db).table(rethinkConfig.table).insert(board, { conflict: "replace" }).run(this.connection);
    }

    async deleteBoard(boardId: string): Promise<void> {
        await r.db(rethinkConfig.db).table(rethinkConfig.table).get(boardId).delete().run(this.connection);
    }
}