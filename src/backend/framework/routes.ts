import * as express from "express";
import { UserService } from "../application/user_service";

export function createUserRouter(userService: UserService) {
	const router = express.Router();

	// Создание пользователя
	router.post("/users", async (req, res) => {
		try {
			const userDTO = await userService.createUser(req.body);
			res.status(201).json(userDTO);
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Получение пользователя по ID
	router.get("/users/:id", async (req, res) => {
		try {
			const userId = req.params.id;
			const user = await userService.getUserById(userId);
			if (user) {
				res.status(200).json(user);
			} else {
				res.status(404).json({ error: "User not found" });
			}
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Получение всех пользователей
	router.get('/users', async (req, res) => {
		try {
			const users = await userService.getAllUsers();
			res.status(200).json(users);
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Обновление пользователя
	router.put("/users/:id", async (req, res) => {
		try {
			const userId = req.params.id;
			const updatedUser = await userService.updateUser(userId, req.body);
			if (updatedUser) {
				res.status(200).json(updatedUser);
			} else {
				res.status(404).json({ error: "User not found" });
			}
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Удаление пользователя
	router.delete("/users/:id", async (req, res) => {
		try {
			const userId = req.params.id;
			const success = await userService.deleteUser(userId);
			if (success) {
				res.status(204).send();
			} else {
				res.status(404).json({ error: "User not found" });
			}
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	return router;
}
