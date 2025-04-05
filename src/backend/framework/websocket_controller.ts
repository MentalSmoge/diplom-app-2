import { Server, Socket } from "socket.io";
import { ElementService, ElementDTO } from "../application/element_service";
import { BoardService } from "../application/board_service";

export class WebSocketController {
	constructor(
		private io: Server,
		private elementService: ElementService,
		private boardService: BoardService
	) {
		this.setupHandlers();
	}

	private setupHandlers(): void {
		console.log("I LIVVVEEEE")
		console.log(this.io)
		this.io.on("connection", (socket: Socket) => {
			console.log("User connected:", socket.id);
			socket.on("join-board", async (boardId: string) => {
				socket.join(boardId);
				console.log(`User ${socket.id} joined board ${boardId}`);

				// Отправка текущего состояния доски
				const elements = await this.elementService.getElementsByBoard(boardId);
				socket.emit("board-state", elements);
			});

			// Создание элемента на доске
			socket.on("element-create", async (data: { boardId: string; element: ElementDTO }) => {
				const { boardId, element } = data;
				await this.elementService.createElement(element);
				// Отправка только участникам этой доски
				this.io.to(boardId).emit("element-created", element);
			});

			// Обновление элемента на доске
			socket.on("element-update", async (data: { boardId: string; element: ElementDTO }) => {
				const { boardId, element } = data;
				await this.elementService.updateElement(element);
				this.io.to(boardId).emit("element-updated", element);
			});

			// Удаление элемента с доски
			socket.on("element-delete", async (data: { boardId: string; elementId: string }) => {
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
