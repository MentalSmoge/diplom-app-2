export interface Element {
    id: string;
    type: string;
    boardId: string;
}
export interface ElementRepository {
    initialize(): Promise<void>;
    loadInitialState(): Promise<Element[]>;
    saveElement(element: Element): Promise<void>;
    deleteElement(elementId: string): Promise<void>;
}