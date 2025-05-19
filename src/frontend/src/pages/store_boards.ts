/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable } from "mobx"

class BoardsStore {
    boards: any[] = []

    constructor() {
        makeAutoObservable(this)
    }

    setBoards(boards: any[]) {
        this.boards = boards
    }
    addBoard(project: any) {
        this.boards.push(project)
    }
    deleteBoard(id: number) {
        this.boards = this.boards.filter(project => project.id !== id)
    }
}

export default new BoardsStore()
