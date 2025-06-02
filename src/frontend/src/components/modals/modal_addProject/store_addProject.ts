import { makeAutoObservable } from "mobx"
import store_projects from "../../../pages/store_projects"

class AddProjectModalStore {
  isOpen = false

  currentNewName = ""
  currentDescription = ""

  constructor() {
    makeAutoObservable(this)
  }

  async addProject(userId: unknown) {
    const response = await fetch('http://45.143.92.185:8080/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: this.currentNewName,
        description: this.currentDescription,
        user_id: userId
      })
    });
    const j = await response.json()
    console.log(j)

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    store_projects.addProject(j)
    this.closeEditor()
  }

  openEditor() {
    this.currentNewName = "Проект"
    this.currentDescription = "Описание"
    this.isOpen = true
  }

  closeEditor() {
    this.isOpen = false
    this.currentNewName = ""
    this.currentDescription = ""
  }

  changeName(newName: string) {
    this.currentNewName = newName
  }

  changeDescription(value: string): void {
    this.currentDescription = value
  }
}

export default new AddProjectModalStore()
