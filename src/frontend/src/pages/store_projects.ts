/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeAutoObservable } from "mobx"

class ProjectsStore {
    projects: any[] = []

    constructor() {
        makeAutoObservable(this)
    }

    setProjects(projects: any[]) {
        console.log(projects)
        this.projects = projects
    }
    addProject(project: any) {
        console.log(project)
        this.projects.push(project)
    }
    deleteProject(id: number) {
        this.projects = this.projects.filter(project => project.id !== id)
    }
}

export default new ProjectsStore()
