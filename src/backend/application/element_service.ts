import { ElementRepository, Element } from '../domain/element';

export class ElementService {
    private elements: Element[] = [];
    constructor(private elementRepository: ElementRepository) { }

    async initialize(): Promise<void> {
        await this.elementRepository.initialize();
        this.elements = await this.elementRepository.loadInitialState();
    }

    getElements(): Element[] {
        return this.elements;
    }
    async getElementsByBoard(boardId: string): Promise<Element[]> {
        const existingElements = this.elements.filter((el) => el.boardId === boardId);
        return existingElements;
    }

    async createElement(element: Element): Promise<void> {
        this.elements.push(element);
        await this.elementRepository.saveElement(element);
    }

    async updateElement(element: Element): Promise<void> {
        const existingElement = this.elements.find((el) => el.id === element.id);
        if (!existingElement) {
            throw new Error('Element not found');
        }
        this.elements = this.elements.map((el) => (el.id === element.id ? element : el));
        await this.elementRepository.saveElement(element);
    }

    async deleteElement(elementId: string): Promise<void> {
        const existingElement = this.elements.find((el) => el.id === elementId);
        if (!existingElement) {
            throw new Error('Element not found');
        }
        this.elements = this.elements.filter((el) => el.id !== elementId);
        await this.elementRepository.deleteElement(elementId);
    }
}

export interface ElementDTO {
    id: string;
    type: string;
    boardId: string;
}