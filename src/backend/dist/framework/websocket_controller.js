"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketController = void 0;
class WebSocketController {
    constructor(io, elementService, boardService) {
        this.io = io;
        this.elementService = elementService;
        this.boardService = boardService;
        this.setupHandlers();
    }
    setupHandlers() {
        this.io.on("connection", (socket) => {
            console.log("User connected:", socket.id);
            socket.on("join-board", async (boardId) => {
                socket.join(boardId);
                console.log(`User ${socket.id} joined board ${boardId}`);
                // Отправка текущего состояния доски
                const elements = await this.elementService.getElementsByBoard(boardId);
                socket.emit("board-state", elements);
            });
            // Создание элемента на доске
            socket.on("element-create", async (data) => {
                console.log(data);
                const { boardId, element } = data;
                console.log(data);
                await this.elementService.createElement(element);
                // Отправка только участникам этой доски
                this.io.to(boardId.toString()).emit("element-created", element);
            });
            // Обновление элемента на доске
            socket.on("element-update", async (data) => {
                const { boardId, element } = data;
                await this.elementService.updateElement(element);
                this.io.to(boardId).emit("element-updated", element);
            });
            // Удаление элемента с доски
            socket.on("element-delete", async (data) => {
                const { boardId, elementId } = data;
                await this.elementService.deleteElement(elementId);
                this.io.to(boardId).emit("element-deleted", elementId);
            });
            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });
    }
}
exports.WebSocketController = WebSocketController;
