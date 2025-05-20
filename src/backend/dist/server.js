"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
// import * as r from "rethinkdb";
// import { RethinkDBElementRepository } from "./infrastructure/elements_repository";
const element_service_1 = require("./application/element_service");
const websocket_controller_1 = require("./framework/websocket_controller");
const board_service_1 = require("./application/board_service");
const users_repository_1 = require("./infrastructure/users_repository");
const user_service_1 = require("./application/user_service");
const user_routes_1 = require("./framework/user_routes");
const redis_client_1 = require("./infrastructure/redis_client");
const auth_routes_1 = require("./framework/auth_routes");
const auth_service_1 = require("./application/auth_service");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const boards_repository_1 = require("./infrastructure/boards_repository");
const board_routes_1 = require("./framework/board_routes");
const projects_routes_1 = require("./framework/projects_routes");
const elements_repository_postgre_1 = require("./infrastructure/elements_repository_postgre");
const projects_repository_1 = require("./infrastructure/projects_repository");
const project_service_1 = require("./application/project_service");
const port = process.env.USERS_PORT || 8080;
const app = (0, express_1.default)();
const corsOptions = {
    origin: 'http://45.143.92.185:3000', // Указываем конкретный origin
    credentials: true, // Разрешаем передачу кук
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Разрешенные методы
    allowedHeaders: ['Content-Type', 'Authorization'] // Разрешенные заголовки
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: corsOptions });
async function startUsersServer() {
    app.use((0, cookie_parser_1.default)());
    // Инициализация PostgreSQL
    const pool = (0, users_repository_1.createPool)();
    // Инициализация RethinkDB
    // const rethinkConnection = await r.connect({
    //     host: process.env.RETHINKDB_HOST || "45.143.92.185",
    //     port: process.env.RETHINKDB_PORT
    //         ? Number(process.env.RETHINKDB_PORT)
    //         : 28015,
    // });
    // Репозитории
    // const elementRepository_old = new RethinkDBElementRepository(rethinkConnection); //СТАРЫЙ
    const elementRepository_new = new elements_repository_postgre_1.PostgreSQLElementRepository(pool); //НОВЫЙ
    const userRepository = new users_repository_1.PostgreSQLUserRepository(pool);
    const boardRepository = new boards_repository_1.PostgreSQLBoardRepository(pool);
    const projectRepository = new projects_repository_1.PostgreSQLProjectRepository(pool);
    // Сервисы
    const userService = new user_service_1.UserService(userRepository, redis_client_1.redisClient);
    const projectService = new project_service_1.ProjectService(projectRepository, boardRepository);
    const boardService = new board_service_1.BoardService(boardRepository, projectService);
    const authService = new auth_service_1.AuthService(userRepository);
    const elementService = new element_service_1.ElementService(elementRepository_new);
    await elementService.initialize();
    new websocket_controller_1.WebSocketController(io, elementService, boardService);
    app.use("/", (0, user_routes_1.createUserRouter)(userService));
    app.use("/", (0, auth_routes_1.createAuthRouter)(userService, authService, boardService));
    app.use("/", (0, board_routes_1.createBoardRouter)(boardService));
    app.use("/", (0, projects_routes_1.createProjectRouter)(projectService));
    // Запуск сервера
    app.listen(port, () => console.log(`Users server running on port ${port}`));
    server.listen(8082, () => console.log(`Editor server running on port 8082`));
}
startUsersServer().catch((err) => {
    console.error("Failed to start users server:", err);
});
