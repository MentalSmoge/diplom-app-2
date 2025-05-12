export interface Project {
    id: number;
    title: string;
    description: string;
    creation_date: Date;
    creator_id: number;
}

export class CreateProjectCommand {
    constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly creator_id: number
    ) { }
}

export interface ProjectRepository {
    createProject(project: Project): Promise<number>;
    getProjectById(id: number): Promise<Project | null>;
    getProjectsByUserId(userId: number): Promise<ProjectDTO[] | null>;
    updateProject(project: Project): Promise<void>;
    deleteProject(id: number): Promise<boolean>;
    addUserToProject(userId: number, projectId: number, role: number): Promise<void>;
    removeUserFromProject(userId: number, projectId: number): Promise<boolean>;
    getUserRoleInProject(userId: number, projectId: number): Promise<number>;
}

export interface ProjectDTO {
    id: number;
    title: string;
    description: string;
    role: number;
}