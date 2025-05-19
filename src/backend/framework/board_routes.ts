import * as express from "express";
import { BoardService } from "../application/board_service";
import { CreateBoardCommand } from "../domain/board";

export function createBoardRouter(boardService: BoardService) {
	const router = express.Router();

	// Создание доски
	router.post("/boards", async (req, res) => {
		try {
			const board = await boardService.createBoard(new CreateBoardCommand(
				req.body.title,
				req.body.project_id,
				req.body.user_id));
			res.status(201).json(board);
		} catch (error) {
			res.status(500).json({ error: `${error}` });
		}
	});

	// Получение доски по ID
	router.get("/board/:id", async (req, res) => {
		try {
			const boardId = req.params.id;
			const board = await boardService.getBoardById(parseInt(boardId), req.body.user.id); //TODO Сделать проверку на строку
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
	router.get('/boards/:projectId', async (req, res) => {
		try {
			const userId = req.query.userId;
			const projectId = req.params.projectId;
			if (!userId || typeof userId !== 'string') {
				res.status(400).json({ error: "Invalid userId" });
			}
			else {
				const boards = await boardService.getBoardsByProject(parseInt(projectId), parseInt(userId)); //TODO Сделать проверку на строку
				res.status(200).json(boards);
			}
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

	// Удаление доски
	router.delete("/boards/:id", async (req, res) => {
		try {
			console.log(req.params.id, req.body.user_id, "DELETE")
			const boardId = req.params.id;
			const success = await boardService.deleteBoard(req.body.user_id, parseInt(boardId));
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
