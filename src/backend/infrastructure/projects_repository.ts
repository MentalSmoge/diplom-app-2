import { Pool } from "pg";
import { Project, ProjectDTO, ProjectRepository } from "../domain/project";

export class PostgreSQLProjectRepository implements ProjectRepository {
    constructor(private pool: InstanceType<typeof Pool>) { }

    async createProject(project: Project): Promise<void> {
        await this.pool.query(
            "WITH new_project AS (INSERT INTO projects(title, description, creation_date) VALUES($1, $2, $3)RETURNING id) INSERT INTO project_users(user_id, project_id, role) SELECT $4, id, 3 FROM new_project;",
            [project.title, project.description, project.creation_date, project.creator_id]
        );
    }

    async getProjectById(id: number): Promise<Project | null> {
        const result = await this.pool.query(
            "SELECT id, title, description, creation_date FROM projects WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async getProjectsByUserId(userId: number): Promise<ProjectDTO[] | null> {
        const result = await this.pool.query(
            `SELECT p.id, p.title, p.description, pu.role
             FROM projects p
             JOIN project_users pu ON p.id = pu.project_id
             WHERE pu.user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows;
    }

    async updateProject(project: Project): Promise<void> {
        await this.pool.query(
            "UPDATE projects SET title = $1, description = $2 WHERE id = $3",
            [project.title, project.description, project.id]
        );
    }

    async deleteProject(id: number): Promise<boolean> {
        const result = await this.pool.query(
            "DELETE FROM projects WHERE id = $1",
            [id]
        );
        return result.rowCount! > 0;
    }

    async addUserToProject(userId: number, projectId: number, role: number): Promise<void> {
        await this.pool.query(
            "INSERT INTO project_users(user_id, project_id, role) VALUES($1, $2, $3)",
            [userId, projectId, role]
        );
    }

    async removeUserFromProject(userId: number, projectId: number): Promise<boolean> {
        const result = await this.pool.query(
            "DELETE FROM project_users WHERE user_id = $1 AND project_id = $2",
            [userId, projectId]
        );
        return result.rowCount! > 0;
    }

    async getUserRoleInProject(userId: number, projectId: number): Promise<number> {
        const result = await this.pool.query(
            "SELECT role FROM project_users WHERE user_id = $1 AND project_id = $2",
            [userId, projectId]
        );

        if (result.rows.length === 0) {
            return 0;
        }

        return result.rows[0].role;
    }
}

export function createProjectPool(): InstanceType<typeof Pool> {
    return new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || "project_db",
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT!),
    });
}