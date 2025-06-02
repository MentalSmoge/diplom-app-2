import { makeAutoObservable } from "mobx"
import { checkAuth } from "../../../api/auth";

class InviteModalStore {
    isOpen = false;
    email = "";
    projectId: number | null = null;
    role = 3;
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setProjectId(projectId: number | null) {
        this.projectId = projectId
    }

    async sendInvite() {
        this.isLoading = true;
        this.error = null;

        try {
            const authData = await checkAuth();
            if (!authData) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`http://45.143.92.185:8080/projects/${this.projectId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: this.email,
                    role: this.role
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send invitation');
            }

            this.closeModal();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }

    openModal(projectId: number) {
        this.projectId = projectId;
        this.isOpen = true;
        this.email = "";
        this.role = 1;
        this.error = null;
    }

    closeModal() {
        this.isOpen = false;
        this.projectId = null;
    }

    setEmail(value: string) {
        this.email = value;
    }

    setRole(value: number) {
        this.role = value;
    }
}

export default new InviteModalStore();