import React, { useState } from 'react';
import './projectCard.css';
import InviteModalStore from './modals/modal_invite/store_invite';
import renameModalStore from './modals/modal_rename/renameModalStore';

const ProjectCard = ({ title, description, onOpen, onDelete, projectId, boardId }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleInviteClick = () => {
        InviteModalStore.setProjectId(projectId)
        console.log(projectId)
        InviteModalStore.openModal(projectId);
        setIsMenuOpen(false);
    };
    const handleRenameClick = () => {
        // renameModalStore.setProjectId(projectId)
        // console.log(projectId)
        if (boardId) {
            renameModalStore.openEditor("Board", boardId);
        }
        else {
            renameModalStore.openEditor("Project", projectId);
        }
        setIsMenuOpen(false);
    };

    return (
        <div className="project-card">
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                <div className="dropdown">
                    <button className="dropdown-toggle" onClick={toggleMenu}>
                        <span className="dots">⋯</span>
                    </button>
                    {isMenuOpen && (
                        <div className="dropdown-menu">
                            {projectId &&
                                <button className="dropdown-item" onClick={handleInviteClick}>
                                    Пригласить
                                </button>
                            }
                            <button className="dropdown-item" onClick={handleRenameClick}>Редактировать</button>
                        </div>
                    )}
                </div>
            </div>

            <p className="card-description">{description}</p>

            <div className="card-actions">
                <button className="open-btn" onClick={onOpen}>Открыть</button>
                <button className="delete-btn" onClick={onDelete}>Удалить</button>
            </div>
        </div>
    );
};

export default ProjectCard;