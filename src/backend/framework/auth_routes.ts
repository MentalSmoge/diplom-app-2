import * as express from "express";
import bcrypt from 'bcryptjs';
import { UserService } from "../application/user_service";
import { AuthService } from "../application/auth_service";
import { User } from "../domain/user";

export function createAuthRouter(userService: UserService, authService: AuthService) {
    const router = express.Router();

    router.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body;
            const token = await authService.login(email, password);

            res.status(200).json({ token });
        } catch (error) {
            res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' });
        }
    });
    router.post("/register", async (req, res) => {
        try {
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
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Registration failed'
            });
        }
    });

    return router;
}