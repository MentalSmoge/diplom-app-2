import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as r from "rethinkdb";
import { RethinkDBElementRepository } from "./infrastructure/elements_repository";
import { ElementService } from "./application/element_service";
import { WebSocketController } from "./framework/websocket_controller";
import { RethinkDBBoardRepository } from "./infrastructure/boards_repository";
import { BoardService } from "./application/board_service";

import {
    createPool,
    PostgreSQLUserRepository,
} from "./infrastructure/userdb_repository";
import { UserService } from "./application/user_service";
import { createUserRouter } from "./framework/routes";
import { redisClient } from "./infrastructure/redis_client";
import { createAuthRouter } from "./framework/auth_routes";
import { AuthService } from "./application/auth_service";

const port = process.env.USERS_PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
async function startUsersServer() {
    // Инициализация PostgreSQL
    const pool = createPool();
    const userRepository = new PostgreSQLUserRepository(pool);

    // Инициализация RethinkDB
    const rethinkConnection = await r.connect({
        host: process.env.RETHINKDB_HOST || "localhost",
        port: process.env.RETHINKDB_PORT
            ? Number(process.env.RETHINKDB_PORT)
            : 28015,
    });
    // Репозитории
    const elementRepository = new RethinkDBElementRepository(rethinkConnection);
    const boardRepository = new RethinkDBBoardRepository(rethinkConnection);
    // Сервисы
    const userService = new UserService(userRepository, redisClient);
    const authService = new AuthService(userRepository);
    const elementService = new ElementService(elementRepository);
    const boardService = new BoardService(boardRepository);
    await elementService.initialize();
    await boardService.initialize();

    new WebSocketController(io, elementService, boardService);
    app.use("/", createUserRouter(userService));
    app.use("/", createAuthRouter(userService, authService)); // или другой путь, соответствующий вашему API

    // Запуск сервера
    app.listen(port, () => console.log(`Users server running on port ${port}`));
    server.listen(8082, () =>
        console.log(`Editor server running on port 8082`)
    );
}

startUsersServer().catch((err) => {
    console.error("Failed to start users server:", err);
});
