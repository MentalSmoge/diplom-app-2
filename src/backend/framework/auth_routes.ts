import * as express from "express";
import bcrypt from 'bcryptjs';
import { UserService } from "../application/user_service";
import { AuthService } from "../application/auth_service";
import { User } from "../domain/user";
import { authenticateJWT } from "./auth/middleware";
import { BoardService } from "../application/board_service";

export function createAuthRouter(userService: UserService, authService: AuthService, boardService: BoardService) {
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
            const user = await userService.getUserByEmail(email)
            await res.status(200).json({ message: 'Login successful', name: user?.name, email: user?.email });
        } catch (error) {
            res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' });
        }
    });
    router.post("/registration", async (req, res) => {
        try {
            console.log(req)
            const { name, email, password } = req.body;

            // Хеширование пароля
            const hashedPassword = await bcrypt.hash(password, 10);

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
            } as User);

            res.status(201).json({
                user: userDTO,
                token
            });
        } catch (error) {
            console.log(error)
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Registration failed'
            });
        }
    });
    router.get('/check-auth', authenticateJWT, async (req, res) => {
        // @ts-ignore
        const user_data = await userService.getUserById(req.user?.userId)
        res.status(200).json({ authenticated: true, data: user_data });
    });
    router.get('/check-board-access/:boardId', authenticateJWT, async (req, res) => {
        // @ts-ignore
        console.log(req.user?.userId)
        console.log(req.params.boardId)
        // @ts-ignore
        const access_level = await boardService.checkUserAccessToBoard(req.user?.userId, parseInt(req.params.boardId))
        res.status(200).json({ data: access_level });
    });
    router.post('/logout', (req, res) => {
        res.clearCookie('jwt');
        res.status(200).json({ success: true });
    });
    return router;
}