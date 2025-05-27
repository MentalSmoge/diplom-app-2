"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RethinkDBElementRepository = void 0;
const r = __importStar(require("rethinkdb"));
const rethinkConfig = {
    host: process.env.RETHINKDB_HOST || "localhost",
    port: process.env.RETHINKDB_PORT ? Number(process.env.RETHINKDB_PORT) : 28015,
    db: process.env.RETHINKDB_NAME || "rethink",
    table: "elements",
};
class RethinkDBElementRepository {
    constructor(connection) {
        this.connection = connection;
    }
    async initialize() {
        const dbList = await r.dbList().run(this.connection);
        if (!dbList.includes(rethinkConfig.db)) {
            await r.dbCreate(rethinkConfig.db).run(this.connection);
        }
        const tableList = await r.db(rethinkConfig.db).tableList().run(this.connection);
        if (!tableList.includes(rethinkConfig.table)) {
            await r.db(rethinkConfig.db).tableCreate(rethinkConfig.table).run(this.connection);
        }
    }
    async loadInitialState() {
        const cursor = await r.db(rethinkConfig.db).table(rethinkConfig.table).run(this.connection);
        return cursor.toArray();
    }
    async saveElement(element) {
        console.log(element);
        await r.db(rethinkConfig.db).table(rethinkConfig.table).insert(element, { conflict: "replace" }).run(this.connection);
    }
    async deleteElement(elementId) {
        await r.db(rethinkConfig.db).table(rethinkConfig.table).get(elementId).delete().run(this.connection);
    }
}
exports.RethinkDBElementRepository = RethinkDBElementRepository;
