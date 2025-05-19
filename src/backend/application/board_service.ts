import { BoardRepository, Board, CreateBoardCommand, BoardDTO, UpdateBoardCommand } from '../domain/board';
import { Project } from '../domain/project';
import { ProjectService } from './project_service';

export class BoardService {
    constructor(
        private boardRepository: BoardRepository,
        private projectService: ProjectService
    ) { }

    async createBoard(command: CreateBoardCommand): Promise<Board> {
        // Проверяем, есть ли у пользователя доступ к проекту
        console.log("ВЫЗЫВАЮ ИЗ CREATE")
        const userRole = await this.projectService.getUserRoleInProject(command.user_id, command.project_id);
        console.log(userRole, "ROLE")
        if (!userRole || userRole < 3) { // 3 - минимальный уровень доступа
            throw new Error("User doesn't have permission to create boards in this project");
        }
        const board = new Board(0, command.title, command.project_id);
        // await this.redisClient.del("boards:all");
        const created_id = await this.boardRepository.addBoard(board);
        board.id = created_id

        return board;

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
        console.log("ВЫЗЫВАЮ ИЗ getBoardById")
        const accessLevel = await this.projectService.getUserRoleInProject(userId, board.project_id);
        if (accessLevel === 0) {
            throw new Error("User doesn't have permission to view this board");
        }
        // await this.redisClient.setEx(cacheKey, 300, JSON.stringify(board));
        return board;
    }

    async checkUserAccessToBoard(userId: number, boardId: number): Promise<number> {
        console.log("ВЫЗЫВАЮ ИЗ checkUserAccessToBoard")
        const board = await this.boardRepository.getBoardById(boardId);
        if (!board) {
            return 0;
        }
        console.log("ВЫЗЫВАЮ ИЗ getProjectByBoardId")
        const userRole = await this.projectService.getUserRoleInProject(userId, board.project_id);
        if (!userRole) {
            throw new Error("User doesn't have permission to view this project");
        }
        console.log(userRole)
        if (userRole === null) return 0
        return userRole
    } //TODO Выкинуть со страницы если разлогинишься

    async getBoardsByProject(projectId: number, userId: number): Promise<Board[]> {
        console.log("ВЫЗЫВАЮ ИЗ getBoardsByProject")
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
        console.log(userId, boardId, "ADSDA")
        // Проверяем доступ пользователя
        const project = await this.getProjectByBoardId(boardId, userId)
        if (project === null) throw new Error("Project not found");
        const accessLevel = await this.checkUserAccessToBoard(userId, boardId);
        if (accessLevel < 3) { // 3 - уровень доступа для удаления
            throw new Error("User doesn't have permission to delete this board");
        }

        return this.boardRepository.deleteBoard(boardId);
    }
    async getProjectByBoardId(boardId: number, userId: number): Promise<Project | null> {
        const board = await this.boardRepository.getBoardById(boardId);
        if (!board) {
            return null;
        }
        console.log("ВЫЗЫВАЮ ИЗ getProjectByBoardId")
        const userRole = await this.projectService.getUserRoleInProject(userId, board.project_id);
        if (!userRole) {
            throw new Error("User doesn't have permission to view this project");
        }

        // Получаем проект через projectService
        return this.projectService.getProjectById(board.project_id);
    }
}
