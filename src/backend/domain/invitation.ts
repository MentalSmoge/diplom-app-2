export interface Invitation {
    id: number;
    from_user_id: number;
    from_email: string;
    to_user_email: string;
    project_id: number;
    project_name: string;
    role: number;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: Date;
}

export interface CreateInvitationCommand {
    from_user_id: number;
    to_user_email: string;
    project_id: number;
    role: number;
}

export interface UpdateInvitationCommand {
    invitation_id: number;
    status: 'accepted' | 'rejected';
}

export interface InvitationRepository {
    createInvitation(command: CreateInvitationCommand): Promise<Invitation>;
    getInvitationById(invitation_id: number): Promise<Invitation | null>;
    getInvitationsByEmail(email: string): Promise<Invitation[]>;
    // getInvitationsById(email: string): Promise<Invitation[]>;
    updateInvitation(command: UpdateInvitationCommand): Promise<Invitation | null>;
    deleteInvitation(invitation_id: number): Promise<boolean>;
}