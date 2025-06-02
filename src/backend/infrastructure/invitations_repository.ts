import { Pool } from 'pg';
import { Invitation, InvitationRepository, CreateInvitationCommand, UpdateInvitationCommand } from '../domain/invitation';

export class InvitationRepositoryPostgres implements InvitationRepository {
    constructor(private pool: Pool) { }

    async createInvitation(command: CreateInvitationCommand): Promise<Invitation> {
        const { rows } = await this.pool.query<Invitation>(
            `INSERT INTO invitations (from_user_id, to_user_email, project_id, role)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [command.from_user_id, command.to_user_email, command.project_id, command.role]
        );
        return rows[0];
    }

    async getInvitationById(invitation_id: number): Promise<Invitation | null> {
        const { rows } = await this.pool.query<Invitation>(
            'SELECT * FROM invitations WHERE id = $1',
            [invitation_id]
        );
        return rows[0] || null;
    }

    async getInvitationsByEmail(email: string): Promise<Invitation[]> {
        console.log("getInvitationsByEmail", email)
        const { rows } = await this.pool.query<Invitation>(
            `SELECT 
            i.id,
            i.from_user_id,
            u.email as from_email,
            i.to_user_email,
            i.project_id,
            p.title as project_name,
            i.role,
            i.status,
            i.created_at
        FROM invitations i
        JOIN users u ON i.from_user_id = u.id
        JOIN projects p ON i.project_id = p.id
        WHERE i.to_user_email = $1 AND i.status = $2`,
            [email, 'pending']
        );
        return rows;
    }

    async updateInvitation(command: UpdateInvitationCommand): Promise<Invitation | null> {
        const { rows } = await this.pool.query<Invitation>(
            `UPDATE invitations
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [command.status, command.invitation_id]
        );
        return rows[0] || null;
    }

    async deleteInvitation(invitation_id: number): Promise<boolean> {
        const { rowCount } = await this.pool.query(
            'DELETE FROM invitations WHERE id = $1',
            [invitation_id]
        );
        return rowCount! > 0;
    }
}