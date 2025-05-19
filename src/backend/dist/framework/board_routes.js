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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBoardRouter = createBoardRouter;
const express = __importStar(require("express"));
const board_1 = require("../domain/board");
function createBoardRouter(boardService) {
    const router = express.Router();
    // Создание доски
    router.post("/boards", async (req, res) => {
        try {
            const board = await boardService.createBoard(new board_1.CreateBoardCommand(req.body.title, req.body.project_id, req.body.user_id));
            res.status(201).json(board);
        }
        catch (error) {
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
            }
            else {
                res.status(404).json({ error: "Board not found" });
            }
        }
        catch (error) {
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
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    // Обновление доски
    router.put("/boards/:id", async (req, res) => {
        try {
            const boardId = req.params.id;
            const updatedBoard = await boardService.updateBoard(parseInt(boardId), req.body); //TODO Сделать проверку на строку
            if (updatedBoard) {
                res.status(200).json(updatedBoard);
            }
            else {
                res.status(404).json({ error: "Board not found" });
            }
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    // Удаление доски
    router.delete("/boards/:id", async (req, res) => {
        try {
            console.log(req.params.id, req.body.user_id, "DELETE");
            const boardId = req.params.id;
            const success = await boardService.deleteBoard(req.body.user_id, parseInt(boardId));
            if (success) {
                res.status(204).send();
            }
            else {
                res.status(404).json({ error: "User not found" });
            }
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    return router;
}
