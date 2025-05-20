import * as r from "rethinkdb";
import { ElementRepository, Element } from "../domain/element";

const rethinkConfig = {
    host: process.env.RETHINKDB_HOST || "45.143.92.185",
    port: process.env.RETHINKDB_PORT ? Number(process.env.RETHINKDB_PORT) : 28015,
    db: process.env.RETHINKDB_NAME || "rethink",
    table: "elements",
};

export class RethinkDBElementRepository implements ElementRepository {
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

    async loadInitialState(): Promise<Element[]> {
        const cursor = await r.db(rethinkConfig.db).table(rethinkConfig.table).run(this.connection);
        return cursor.toArray() as Promise<Element[]>;
    }

    async saveElement(element: Element): Promise<void> {
        console.log(element)
        await r.db(rethinkConfig.db).table(rethinkConfig.table).insert(element, { conflict: "replace" }).run(this.connection);
    }

    async deleteElement(elementId: string): Promise<void> {
        await r.db(rethinkConfig.db).table(rethinkConfig.table).get(elementId).delete().run(this.connection);
    }
}