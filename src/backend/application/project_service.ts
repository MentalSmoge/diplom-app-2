import { ProjectRepository, Project, CreateProjectCommand, ProjectDTO } from '../domain/project';
import { BoardRepository } from '../domain/board';
import { CreateInvitationCommand, Invitation, InvitationRepository, UpdateInvitationCommand } from '../domain/invitation';
import { UserRepository } from '../domain/user';

export class ProjectService {
    constructor(
        private projectRepository: ProjectRepository,
        private boardRepository: BoardRepository,
        private invitationRepository: InvitationRepository,
        private userRepository: UserRepository
    ) { }

    async createProject(command: CreateProjectCommand): Promise<Project> {
        const project: Project = {
            id: Date.now(), // Temporary ID generation
            title: command.title,
            description: command.description,
            creation_date: new Date(),
            creator_id: command.creator_id
        };

        const created_id = await this.projectRepository.createProject(project);
        project.id = created_id

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
        console.log(userId, projectId, "SSS")
        return this.projectRepository.getUserRoleInProject(userId, projectId);
    }
    async createInvitation(command: CreateInvitationCommand): Promise<Invitation> {
        // Проверяем, что пользователь, создающий приглашение, имеет права на проект
        const userRole = await this.getUserRoleInProject(command.from_user_id, command.project_id);
        if (userRole < 2) {
            throw new Error('Insufficient permissions to invite users');
        }

        // Проверяем, что пользователь с такой почтой существует
        const user = await this.userRepository.getUserByEmail(command.to_user_email);
        console.log(user)
        if (!user) {
            throw new Error('User with this email does not exist');
        }

        // Проверяем, что пользователь еще не в проекте
        const existingMember = await this.projectRepository.getUserRoleInProject(
            parseInt(user.id),
            command.project_id
        );
        console.log(existingMember)
        if (existingMember > 0) {
            throw new Error('User is already a member of this project');
        }

        // Проверяем, что нет активного приглашения для этого пользователя
        const existingInvitations = await this.invitationRepository.getInvitationsByEmail(
            command.to_user_email
        );
        const hasPendingInvitation = existingInvitations.some(
            inv => inv.project_id === command.project_id && inv.status === 'pending'
        );
        if (hasPendingInvitation) {
            throw new Error('User already has a pending invitation to this project');
        }

        return this.invitationRepository.createInvitation(command);
    }

    async respondToInvitation(
        user_id: number,
        command: UpdateInvitationCommand
    ): Promise<Project | null> {
        const invitation = await this.invitationRepository.getInvitationById(command.invitation_id);
        if (!invitation) {
            throw new Error('Invitation not found');
        }

        // Проверяем, что приглашение адресовано текущему пользователю
        const user = await this.userRepository.getUserById(user_id.toString());
        if (user?.email !== invitation.to_user_email) {
            throw new Error('This invitation is not addressed to you');
        }

        // Обновляем статус приглашения
        const updatedInvitation = await this.invitationRepository.updateInvitation(command);
        if (!updatedInvitation) {
            throw new Error('Failed to update invitation');
        }

        // Если приглашение принято, добавляем пользователя в проект
        if (command.status === 'accepted') {
            await this.addUserToProject(
                updatedInvitation.project_id,
                user_id,
                updatedInvitation.role
            );
        }

        return this.getProjectById(updatedInvitation.project_id);
    }

    async getUserInvitations(user_email: string): Promise<Invitation[]> {
        return this.invitationRepository.getInvitationsByEmail(user_email);
    }
}