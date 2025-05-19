"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRouter = createAuthRouter;
const express = __importStar(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const middleware_1 = require("./auth/middleware");
function createAuthRouter(userService, authService, boardService) {
    const router = express.Router();
    router.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;
            const token = await authService.login(email, password);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 день
            });
            const user = await userService.getUserByEmail(email);
            await res.status(200).json({ message: 'Login successful', name: user === null || user === void 0 ? void 0 : user.name, email: user === null || user === void 0 ? void 0 : user.email });
        }
        catch (error) {
            res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' });
        }
    });
    router.post("/registration", async (req, res) => {
        try {
            console.log(req);
            const { name, email, password } = req.body;
            // Хеширование пароля
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Создание пользователя через UserService
            const userDTO = await userService.createUser({
                name,
                email,
                password: hashedPassword
            });
            // Генерация токена для автоматического входа после регистрации
            const token = authService.generateToken({
                id: userDTO.id,
                name: userDTO.name,
                email: userDTO.email,
                password: hashedPassword
            });
            res.status(201).json({
                user: userDTO,
                token
            });
        }
        catch (error) {
            console.log(error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Registration failed'
            });
        }
    });
    router.get('/check-auth', middleware_1.authenticateJWT, async (req, res) => {
        var _a;
        // @ts-ignore
        const user_data = await userService.getUserById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        res.status(200).json({ authenticated: true, data: user_data });
    });
    router.get('/check-board-access/:boardId', middleware_1.authenticateJWT, async (req, res) => {
        var _a, _b;
        // @ts-ignore
        console.log((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        console.log(req.params.boardId);
        // @ts-ignore
        const access_level = await boardService.checkUserAccessToBoard((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId, parseInt(req.params.boardId));
        res.status(200).json({ data: access_level });
    });
    router.post('/logout', (req, res) => {
        res.clearCookie('jwt');
        res.status(200).json({ success: true });
    });
    return router;
}
