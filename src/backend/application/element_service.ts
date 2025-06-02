import axios from 'axios';
import { ElementRepository, Element } from '../domain/element';

export class ElementService {
    private elements: Element[] = [];
    constructor(private elementRepository: ElementRepository) { }

    async initialize(): Promise<void> {
        await this.elementRepository.initialize();
        this.elements = await this.elementRepository.loadInitialState();
        // console.log(this.elements, "THIS ELEMENTS")
    }

    getElements(): Element[] {
        return this.elements;
    }
    async getElementsByBoard(boardId: string): Promise<Element[]> {
        const existingElements = this.elements.filter((el) => el.boardId === Number(boardId));
        // console.log(this.elements)
        // console.log(existingElements, "THIS EXISTING ELEMENTS")
        return existingElements;
    }

    async createElement(element: Element): Promise<void> {
        this.elements.push(element);
        await this.elementRepository.saveElement(element);
    }

    async updateElement(element: Element): Promise<void> {
        const existingElement = this.elements.find((el) => el.id === element.id);
        if (!existingElement) {
            return
            // throw new Error('Element not found');
        }
        this.elements = this.elements.map((el) => (el.id === element.id ? element : el));
        await this.elementRepository.saveElement(element);
    }

    async deleteElement(elementId: string): Promise<void> {
        const existingElement = this.elements.find((el) => el.id === elementId);
        if (!existingElement) {
            return
            // throw new Error('Element not found');
        }
        console.log("delete", existingElement)
        // @ts-ignore
        if (existingElement.type === 'image' && existingElement.imageUrl) {
            try {
                // @ts-ignore
                const filename = existingElement.imageUrl.split('/').pop();
                await axios.delete(`http://45.143.92.185:8080/delete/${filename}`);
            } catch (error) {
                console.error('Failed to delete image file:', error);
            }
        }
        this.elements = this.elements.filter((el) => el.id !== elementId);
        await this.elementRepository.deleteElement(elementId);
    }
}

export interface ElementDTO {
    id: string;
    type: string;
    boardId: number;
}