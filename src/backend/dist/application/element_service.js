"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementService = void 0;
class ElementService {
    constructor(elementRepository) {
        this.elementRepository = elementRepository;
        this.elements = [];
    }
    async initialize() {
        await this.elementRepository.initialize();
        this.elements = await this.elementRepository.loadInitialState();
        console.log(this.elements, "THIS ELEMENTS");
    }
    getElements() {
        return this.elements;
    }
    async getElementsByBoard(boardId) {
        const existingElements = this.elements.filter((el) => el.boardId === Number(boardId));
        console.log(this.elements);
        console.log(existingElements, "THIS EXISTING ELEMENTS");
        return existingElements;
    }
    async createElement(element) {
        this.elements.push(element);
        await this.elementRepository.saveElement(element);
    }
    async updateElement(element) {
        const existingElement = this.elements.find((el) => el.id === element.id);
        if (!existingElement) {
            throw new Error('Element not found');
        }
        this.elements = this.elements.map((el) => (el.id === element.id ? element : el));
        await this.elementRepository.saveElement(element);
    }
    async deleteElement(elementId) {
        const existingElement = this.elements.find((el) => el.id === elementId);
        // if (!existingElement) {
        //     throw new Error('Element not found');
        // }
        this.elements = this.elements.filter((el) => el.id !== elementId);
        await this.elementRepository.deleteElement(elementId);
    }
}
exports.ElementService = ElementService;
