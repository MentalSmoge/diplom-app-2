import { ProjectRepository, Project, CreateProjectCommand, ProjectDTO } from '../domain/project';
import { BoardRepository } from '../domain/board';

export class ProjectService {
    constructor(
        private projectRepository: ProjectRepository,
        private boardRepository: BoardRepository
    ) { }

    async createProject(command: CreateProjectCommand): Promise<Project> {
        const project: Project = {
            id: Date.now(), // Temporary ID generation
            title: command.title,
            description: command.description,
            creation_date: new Date(),
            creator_id: command.creator_id
        };

        await this.projectRepository.createProject(project);

        // Add creator as editor
        await this.projectRepository.addUserToProject(
            command.creator_id,
            project.id,
            3
        );

        return project;
    }

    async getProjectById(projectId: number): Promise<Project | null> {
        return this.projectRepository.getProjectById(projectId);
    }

    async getProjectsByUserId(userId: number): Promise<ProjectDTO[]> {
        const projects = await this.projectRepository.getProjectsByUserId(userId);
        return projects || [];
    }

    async updateProject(projectId: number, updates: Partial<Project>): Promise<Project | null> {
        const project = await this.projectRepository.getProjectById(projectId);
        if (!project) {
            return null;
        }

        const updatedProject = {
            ...project,
            ...updates
        };

        await this.projectRepository.updateProject(updatedProject);
        return updatedProject;
    }

    async deleteProject(projectId: number): Promise<boolean> {
        // const boards = await this.boardRepository.getBoardsByProjectId(projectId);
        // for (const board of boards) {
        //     await this.boardRepository.deleteBoard(board.id);
        // }
        return this.projectRepository.deleteProject(projectId);
    }

    async addUserToProject(projectId: number, userId: number, role: number): Promise<void> {
        await this.projectRepository.addUserToProject(
            userId,
            projectId,
            role
        );
    }

    async removeUserFromProject(projectId: number, userId: number): Promise<boolean> {
        return this.projectRepository.removeUserFromProject(userId, projectId);
    }

    async getUserRoleInProject(userId: number, projectId: number): Promise<number> {
        return this.projectRepository.getUserRoleInProject(userId, projectId);
    }
}