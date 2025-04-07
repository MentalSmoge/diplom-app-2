export class Board {
    constructor(public id: number, public title: string, public project_id: string,) { }
}
export interface BoardRepository {
    addBoard(board: Board): Promise<void>;
    getBoardById(id: number): Promise<Board | null>;
    getBoardsByUserId(userId: number): Promise<Board[] | null>;
    getUserAccessToBoard(userId: number, boardId: number): Promise<string>;
    getAllBoards(): Promise<Board[]>;
    updateBoard(Board: Board): Promise<void>;
    deleteBoard(id: number): Promise<boolean>;
}

export class CreateBoardCommand {
    constructor(public title: string) { }
}

export class UpdateBoardCommand {
    constructor(public id: number, public title: string) { }
}
export interface BoardDTO {
    id: number;
    title: string;
    projectId: number;
}