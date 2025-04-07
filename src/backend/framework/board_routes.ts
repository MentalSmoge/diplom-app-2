import * as express from "express";
import { BoardService } from "../application/board_service";
import { CreateBoardCommand } from "../domain/board";

export function createBoardRouter(boardService: BoardService) {
	const router = express.Router();

	// Создание доски
	router.post("/boards", async (req, res) => {
		try {
			const board = await boardService.createBoard(new CreateBoardCommand(req.body.title));
			res.status(201).json(board);
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Получение доски по ID
	router.get("/board/:id", async (req, res) => {
		try {
			const boardId = req.params.id;
			const board = await boardService.getBoardById(parseInt(boardId)); //TODO Сделать проверку на строку
			if (board) {
				res.status(200).json(board);
			} else {
				res.status(404).json({ error: "Board not found" });
			}
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Получение всех досок пользователя
	router.get('/boards/:userId', async (req, res) => {
		try {
			const userId = req.params.userId;
			const boards = await boardService.getBoardsByUserId(parseInt(userId)); //TODO Сделать проверку на строку
			res.status(200).json(boards);
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Обновление доски
	router.put("/boards/:id", async (req, res) => {
		try {
			const boardId = req.params.id;
			const updatedBoard = await boardService.updateBoard(parseInt(boardId), req.body);//TODO Сделать проверку на строку
			if (updatedBoard) {
				res.status(200).json(updatedBoard);
			} else {
				res.status(404).json({ error: "Board not found" });
			}
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Удаление пользователя
	router.delete("/boards/:id", async (req, res) => {
		try {
			const boardId = req.params.id;
			const success = await boardService.deleteBoard(parseInt(boardId));
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
