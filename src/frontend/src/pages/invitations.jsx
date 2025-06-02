import React, { useEffect, useState } from "react";
import { checkAuth } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import './ProjectsGrid.css';

function Invitations() {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const authData = await checkAuth();
                if (!authData) {
                    navigate('/login');
                    return;
                }
                console.log(authData)

                const response = await fetch(`http://45.143.92.185:8080/invitations`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                console.log(data)
                setInvitations(data);
            } catch (error) {
                console.error("Error fetching invitations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvitations();
    }, [navigate]);

    const handleResponse = async (invitationId, status) => {
        try {
            const authData = await checkAuth();
            if (!authData) return;

            const response = await fetch(`http://45.143.92.185:8080/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: status,
                    user_id: authData.data.id
                })
            });

            if (response.ok) {
                // Обновляем список приглашений
                setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            }
        } catch (error) {
            console.error("Error responding to invitation:", error);
        }
    };

    if (isLoading) {
        return <div className="projects-container">Loading...</div>;
    }

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h2 className="projects-title">Pending Invitations</h2>
            </div>
            <div className="projects-grid">
                {invitations.length === 0 ? (
                    <p>No pending invitations</p>
                ) : (
                    invitations.map((invitation) => (
                        <InvitationCard
                            key={invitation.id}
                            invitation={invitation}
                            onAccept={() => handleResponse(invitation.id, 'accepted')}
                            onReject={() => handleResponse(invitation.id, 'rejected')}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

const InvitationCard = ({ invitation, onAccept, onReject }) => {
    return (
        <div className="project-card">
            <div className="card-header">
                <h3 className="card-title">Приглашение в проект "{invitation.project_name}"</h3>
            </div>
            <p className="card-description">
                От: {invitation.from_email}<br />
                {/* Role: {getRoleName(invitation.role)} */}
            </p>
            <div className="card-actions">
                <button className="open-btn" onClick={onAccept}>Accept</button>
                <button className="delete-btn" onClick={onReject}>Reject</button>
            </div>
        </div>
    );
};

const getRoleName = (role) => {
    switch (role) {
        case 1: return 'Пользователь';
        case 2: return 'Комментатор';
        case 3: return 'Редактор';
        default: return 'Unknown';
    }
};

export default observer(Invitations);