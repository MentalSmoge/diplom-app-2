"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
class ProjectService {
    constructor(projectRepository, boardRepository) {
        this.projectRepository = projectRepository;
        this.boardRepository = boardRepository;
    }
    async createProject(command) {
        const project = {
            id: Date.now(), // Temporary ID generation
            title: command.title,
            description: command.description,
            creation_date: new Date(),
            creator_id: command.creator_id
        };
        const created_id = await this.projectRepository.createProject(project);
        project.id = created_id;
        return project;
    }
    async getProjectById(projectId) {
        return this.projectRepository.getProjectById(projectId);
    }
    async getProjectsByUserId(userId) {
        const projects = await this.projectRepository.getProjectsByUserId(userId);
        return projects || [];
    }
    async updateProject(projectId, updates) {
        const project = await this.projectRepository.getProjectById(projectId);
        if (!project) {
            return null;
        }
        const updatedProject = Object.assign(Object.assign({}, project), updates);
        await this.projectRepository.updateProject(updatedProject);
        return updatedProject;
    }
    async deleteProject(projectId) {
        // const boards = await this.boardRepository.getBoardsByProjectId(projectId);
        // for (const board of boards) {
        //     await this.boardRepository.deleteBoard(board.id);
        // }
        return this.projectRepository.deleteProject(projectId);
    }
    async addUserToProject(projectId, userId, role) {
        await this.projectRepository.addUserToProject(userId, projectId, role);
    }
    async removeUserFromProject(projectId, userId) {
        return this.projectRepository.removeUserFromProject(userId, projectId);
    }
    async getUserRoleInProject(userId, projectId) {
        console.log(userId, projectId, "SSS");
        return this.projectRepository.getUserRoleInProject(userId, projectId);
    }
}
exports.ProjectService = ProjectService;
