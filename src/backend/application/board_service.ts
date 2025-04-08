import { BoardRepository, Board, CreateBoardCommand, BoardDTO, UpdateBoardCommand } from '../domain/board';

export class BoardService {
    constructor(private boardRepository: BoardRepository) { }

    async createBoard(command: CreateBoardCommand): Promise<void> {
        const board = new Board(0, command.title, "sas");
        // await this.redisClient.del("boards:all");
        await this.boardRepository.addBoard(board);
    }

    async getBoardById(boardId: number): Promise<Board | null> {
        // const cacheKey = `board:${boardId}`;
        // const cachedBoard = await this.redisClient.get(cacheKey);
        // if (cachedBoard) {
        //     console.log("Cached " + boardId)
        //     return JSON.parse(cachedBoard);
        // }
        const board = await this.boardRepository.getBoardById(boardId);
        if (!board) return null;
        // await this.redisClient.setEx(cacheKey, 300, JSON.stringify(board));
        return board;
    }

    async checkUserAccessToBoard(userId: number, boardId: number): Promise<number> {
        const access_level = await this.boardRepository.getUserAccessToBoard(userId, boardId);
        console.log("access_level")
        console.log(access_level)
        if (access_level === "no") {
            return 0;
        }
        if (access_level === "editor") {
            return 3;
        }
        return 0
    } //TODO Выкинуть со страницы если разлогинишься


    async getBoardsByUserId(userId: number): Promise<Board[] | null> {
        const boards = await this.boardRepository.getBoardsByUserId(userId);
        if (!boards) return null;
        return boards;
    }

    // Обновление пользователя
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

    // Удаление пользователя
    async deleteBoard(boardId: number): Promise<boolean> {
        return this.boardRepository.deleteBoard(boardId);
    }
}
