import { BoardRepository, Board } from '../domain/board';

export class BoardService {
    private boards: Board[] = [];
    constructor(private boardRepository: BoardRepository) { }

    async initialize(): Promise<void> {
        await this.boardRepository.initialize();
        this.boards = await this.boardRepository.loadInitialState();
    }


    async getBoard(boardId: string): Promise<Board | null> {
        const existingBoard = this.boards.find((el) => el.id === boardId);
        if (!existingBoard) {
            throw new Error('Board not found');
        }
        return existingBoard
    }

    async createBoard(board: Board, projectId: string): Promise<void> {
        this.boards.push(board);
        await this.boardRepository.saveBoard(board);
    }

    async updateBoard(board: Board): Promise<void> {
        const existingBoard = this.boards.find((el) => el.id === board.id);
        if (!existingBoard) {
            throw new Error('Board not found');
        }
        this.boards = this.boards.map((el) => (el.id === board.id ? board : el));
        await this.boardRepository.saveBoard(board);
    }

    async deleteBoard(boardId: string): Promise<void> {
        const existingBoard = this.boards.find((el) => el.id === boardId);
        if (!existingBoard) {
            throw new Error('Board not found');
        }
        this.boards = this.boards.filter((el) => el.id !== boardId);
        await this.boardRepository.deleteBoard(boardId);
    }
}

export interface BoardDTO {
    id: string;
    title: string;
    projectId: string;
}