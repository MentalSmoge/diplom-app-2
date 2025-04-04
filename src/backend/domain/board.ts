export interface Board {
    id: string;
    title: string;
    projectId: string;
}
export interface BoardRepository {
    initialize(): Promise<void>;
    loadInitialState(): Promise<Board[]>;
    saveBoard(board: Board): Promise<void>;
    deleteBoard(boardId: string): Promise<void>;
}