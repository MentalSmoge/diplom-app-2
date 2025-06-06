import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
// import * as r from "rethinkdb";
// import { RethinkDBElementRepository } from "./infrastructure/elements_repository";
import { ElementService } from "./application/element_service";
import { WebSocketController } from "./framework/websocket_controller";
import { BoardService } from "./application/board_service";

import {
    createPool,
    PostgreSQLUserRepository,
} from "./infrastructure/users_repository";
import { UserService } from "./application/user_service";
import { createUserRouter } from "./framework/user_routes";
import { redisClient } from "./infrastructure/redis_client";
import { createAuthRouter } from "./framework/auth_routes";
import { AuthService } from "./application/auth_service";
import cookieParser from 'cookie-parser';
import { PostgreSQLBoardRepository } from "./infrastructure/boards_repository";
import { createBoardRouter } from "./framework/board_routes";
import { createProjectRouter } from "./framework/projects_routes";
import { PostgreSQLElementRepository } from "./infrastructure/elements_repository_postgre";
import { PostgreSQLProjectRepository } from "./infrastructure/projects_repository";
import { ProjectService } from "./application/project_service";
import { createImageRouter } from './framework/image_routes';
import path from "path";
import { InvitationRepositoryPostgres } from "./infrastructure/invitations_repository";

const port = process.env.USERS_PORT || 8080;
const app = express();
const corsOptions = {
    origin: 'http://45.143.92.185:3000', // Указываем конкретный origin
    credentials: true, // Разрешаем передачу кук
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Разрешенные методы
    allowedHeaders: ['Content-Type', 'Authorization'] // Разрешенные заголовки
};
app.use(cors(corsOptions));
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });
async function startUsersServer() {
    app.use(cookieParser());
    // Инициализация PostgreSQL
    const pool = createPool();

    // Инициализация RethinkDB
    // const rethinkConnection = await r.connect({
    //     host: process.env.RETHINKDB_HOST || "45.143.92.185",
    //     port: process.env.RETHINKDB_PORT
    //         ? Number(process.env.RETHINKDB_PORT)
    //         : 28015,
    // });
    // Репозитории
    // const elementRepository_old = new RethinkDBElementRepository(rethinkConnection); //СТАРЫЙ
    const elementRepository_new = new PostgreSQLElementRepository(pool); //НОВЫЙ
    const userRepository = new PostgreSQLUserRepository(pool);
    const boardRepository = new PostgreSQLBoardRepository(pool);
    const projectRepository = new PostgreSQLProjectRepository(pool);
    const invitationRepository = new InvitationRepositoryPostgres(pool);
    // Сервисы
    const userService = new UserService(userRepository, redisClient);
    const projectService = new ProjectService(projectRepository, boardRepository, invitationRepository, userRepository);
    const boardService = new BoardService(boardRepository, projectService);
    const authService = new AuthService(userRepository);
    const elementService = new ElementService(elementRepository_new);
    await elementService.initialize();

    new WebSocketController(io, elementService, boardService);
    app.use("/", createUserRouter(userService));
    app.use("/", createAuthRouter(userService, authService, boardService));
    app.use("/", createBoardRouter(boardService));
    app.use("/", createProjectRouter(projectService, userService));
    app.use('/', createImageRouter());
    app.use('/images', express.static(path.join(__dirname, '../public/images'), {
        setHeaders: (res) => {
            res.set('Access-Control-Allow-Origin', '*');
        }
    }));



    // Запуск сервера
    app.listen(port, () => console.log(`Users server running on port ${port}`));
    server.listen(8082, () =>
        console.log(`Editor server running on port 8082`)
    );
}

startUsersServer().catch((err) => {
    console.error("Failed to start users server:", err);
});
