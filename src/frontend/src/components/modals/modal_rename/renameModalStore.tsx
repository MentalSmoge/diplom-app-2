import { makeAutoObservable } from "mobx"
import ProjectsStore from "../../../pages/store_projects"
import BoardsStore from "../../../pages/store_boards"
// import CharacterStore from "../../../../store/CharacterStore"
// import VariablesStore from "../../../../store/VariablesStore"

class RenameModalStore {
  isOpen = false
  currentType = ""
  currentId = -1
  currentNewName = ""
  currentNewDescription = ""
  error: string | null = null;
  changeName(newName: string) {
    this.currentNewName = newName
  }
  changeDesc(newName: string) {
    this.currentNewDescription = newName
  }

  constructor() {
    makeAutoObservable(this)
  }

  openEditor(type: string, id: number) {
    this.isOpen = true
    this.currentType = type
    this.currentId = id
    console.log(this.currentType, this.currentId)
    this.error = null;
  }

  async rename(user_id: number, new_name: string, description: string = "") {
    if (new_name == "") {
      this.error = "Название не может быть пустым"
      return
    }

    switch (this.currentType) {
      case "Project":
        {
          console.log(this.currentId)
          const response = await fetch(`http://45.143.92.185:8080/project/${this.currentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: new_name,
              description: description
            })
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          ProjectsStore.renameProject(this.currentId, new_name, description)

          break;
        }
      case "Board":
        {
          console.log(this.currentId, user_id)
          const response = await fetch(`http://45.143.92.185:8080/boards/${this.currentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: new_name
            })
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          BoardsStore.renameBoard(this.currentId, new_name)

          break;
        }

      default:
        break;
    }
    this.closeEditor()
  }

  getName() {
    switch (this.currentType) {
      case "Project":
        return "проект"
      case "Board":
        return "доску"
      default:
        break;
    }
    return ""
  }

  closeEditor() {
    this.isOpen = false
    this.currentType = ""
    this.currentId = -1
  }
}

export default new RenameModalStore()
