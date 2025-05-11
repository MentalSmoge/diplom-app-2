import React, { useState } from 'react';
import './ProjectCard.css'; // Стили для компонента

const ProjectCard = ({ title, description, onOpen, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                            <button className="dropdown-item">Редактировать</button>
                            <button className="dropdown-item">Копировать</button>
                            <button className="dropdown-item">Поделиться</button>
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