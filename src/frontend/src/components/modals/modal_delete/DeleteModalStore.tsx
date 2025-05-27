import { makeAutoObservable } from "mobx"
import ProjectsStore from "../../../pages/store_projects"
import BoardsStore from "../../../pages/store_boards"
// import CharacterStore from "../../../../store/CharacterStore"
// import VariablesStore from "../../../../store/VariablesStore"

class DeleteModalStore {
  isOpen = false
  currentType = ""
  currentId = -1

  constructor() {
    makeAutoObservable(this)
  }

  openEditor(type: string, id: number) {
    this.isOpen = true
    this.currentType = type
    this.currentId = id
    console.log(this.currentType, this.currentId)
  }

  async delete(user_id: number) {
    switch (this.currentType) {
      case "Project":
        {
          console.log(this.currentId)
          const response = await fetch(`http://localhost:8080/project/${this.currentId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          ProjectsStore.deleteProject(this.currentId)

          break;
        }
      case "Board":
        {
          console.log(this.currentId, user_id)
          const response = await fetch(`http://localhost:8080/boards/${this.currentId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user_id
            })
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          BoardsStore.deleteBoard(this.currentId)

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

export default new DeleteModalStore()
