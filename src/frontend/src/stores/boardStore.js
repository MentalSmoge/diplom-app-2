import { makeAutoObservable, runInAction } from "mobx";

class BoardStore {
    elements = []; // Массив элементов текущей доски
    currentBoardId = null;
    selectedIds = []; // Выбранные элементы (опционально)

    constructor() {
        makeAutoObservable(this);
    }

    // Устанавливаем текущую доску и очищаем элементы
    setCurrentBoard(boardId) {
        this.currentBoardId = boardId;
        this.elements = [];
        this.selectedIds = [];
    }

    // Полностью обновляем состояние элементов
    updateBoardState(elements) {
        this.elements = elements;
    }

    // Добавляем один элемент
    addElement(element) {
        this.elements.push(element);
    }

    // Обновляем конкретный элемент
    updateElement(element) {
        const index = this.elements.findIndex(el => el.id === element.id);
        if (index !== -1) {
            this.elements[index] = element;
        }
    }

    // Удаляем элемент
    removeElement(elementId) {
        this.elements = this.elements.filter(el => el.id !== elementId);
    }

    // Устанавливаем выбранные элементы (опционально)
    setSelectedIds(ids) {
        this.selectedIds = ids;
    }
}

export const boardStore = new BoardStore();