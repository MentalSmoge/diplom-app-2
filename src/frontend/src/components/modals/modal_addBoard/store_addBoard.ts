import { makeAutoObservable } from "mobx"
import store_boards from "../../../pages/store_boards"

class AddBoardModalStore {
  isOpen = false

  currentNewName = ""

  constructor() {
    makeAutoObservable(this)
  }

  async addBoard(userId: unknown, projectId: unknown) {
    const response = await fetch('http://localhost:8080/boards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: this.currentNewName,
        project_id: projectId,
        user_id: userId
      })
    });
    const j = await response.json()
    console.log(j)

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    store_boards.addBoard(j)
    this.closeEditor()
  }

  openEditor() {
    this.currentNewName = "Доска"
    this.isOpen = true
  }

  closeEditor() {
    this.isOpen = false
    this.currentNewName = ""
  }

  changeName(newName: string) {
    this.currentNewName = newName
  }
}

export default new AddBoardModalStore()
