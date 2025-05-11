import { BoardRepository, Board, CreateBoardCommand, BoardDTO, UpdateBoardCommand } from '../domain/board';
import { ProjectService } from './project_service';

export class BoardService {
    constructor(
        private boardRepository: BoardRepository,
        private projectService: ProjectService
    ) { }

    async createBoard(command: CreateBoardCommand): Promise<void> {
        // Проверяем, есть ли у пользователя доступ к проекту
        const userRole = await this.projectService.getUserRoleInProject(command.user_id, command.project_id);
        if (!userRole || userRole < 3) { // 3 - минимальный уровень доступа
            throw new Error("User doesn't have permission to create boards in this project");
        }
        const board = new Board(0, command.title, command.project_id);
        // await this.redisClient.del("boards:all");
        await this.boardRepository.addBoard(board);
    }

    async getBoardById(boardId: number, userId: number): Promise<Board | null> {
        // const cacheKey = `board:${boardId}`;
        // const cachedBoard = await this.redisClient.get(cacheKey);
        // if (cachedBoard) {
        //     console.log("Cached " + boardId)
        //     return JSON.parse(cachedBoard);
        // }
        const board = await this.boardRepository.getBoardById(boardId);
        if (!board) return null;
        const accessLevel = await this.projectService.getUserRoleInProject(userId, boardId);
        if (accessLevel === 0) {
            throw new Error("User doesn't have permission to view this board");
        }
        // await this.redisClient.setEx(cacheKey, 300, JSON.stringify(board));
        return board;
    }

    async checkUserAccessToBoard(userId: number, boardId: number): Promise<number> {
        const accessLevel = await this.projectService.getUserRoleInProject(userId, boardId);
        console.log("access_level")
        console.log(accessLevel)
        if (accessLevel === null) return 0
        return accessLevel
    } //TODO Выкинуть со страницы если разлогинишься

    async getBoardsByProject(projectId: number, userId: number): Promise<Board[]> {
        // Проверяем доступ пользователя к проекту
        const userRole = await this.projectService.getUserRoleInProject(userId, projectId);
        if (!userRole) {
            throw new Error("User doesn't have permission to view boards in this project");
        }

        return this.boardRepository.getBoardsByProjectId(projectId);
    }

    // Обновление доски
    async updateBoard(
        boardId: number,
        command: UpdateBoardCommand
    ): Promise<Board | null> {
        const board = await this.boardRepository.getBoardById(boardId);
        if (!board) {
            return null;
        }

        board.title = command.title;
        await this.boardRepository.updateBoard(board);
        // await this.redisClient.del(`board:${boardId}`);
        // await this.redisClient.del("boards:all");

        return board;
    }

    // Удаление доски
    async deleteBoard(userId: number, boardId: number): Promise<boolean> {
        // Проверяем доступ пользователя
        const accessLevel = await this.checkUserAccessToBoard(userId, boardId);
        if (accessLevel < 3) { // 3 - уровень доступа для удаления
            throw new Error("User doesn't have permission to delete this board");
        }

        return this.boardRepository.deleteBoard(boardId);
    }
}
