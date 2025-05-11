import React, { useEffect, useState } from "react";
import { checkAuth } from "../api/auth";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../components/projectCard";
import './ProjectsGrid.css';

function Projects() {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();


    const handleProjectButton = (projectId) => {
        navigate(`/project/${projectId}`);
    }
    const handleCreateButton = () => {
        console.log("create")
    }
    useEffect(() => {
        const verifyAuth = async () => {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
            console.log(isAuthenticated.data)
            return isAuthenticated.data
        };

        verifyAuth().then((data) => fetch(`http://localhost:8080/projects/${data.id}`))
            .then((response) => { return response.json() })
            .then((data) => { console.log(data); setProjects(data) })
            .catch((error) => console.error("Error fetching Projects:", error));
    }, []);

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h2 className="projects-title">Проекты</h2>
                <button className="create-project-btn" onClick={() => handleCreateButton()}>
                    Создать проект
                </button>
            </div>
            <div className="projects-grid">
                {projects.map((project) => (
                    // <li key={project.id}>id = {project.id}, title = {project.title}, access level = {project.role}<button onClick={() => handleProjectButton(project.id)}>Open</button></li>
                    <ProjectCard
                        title={project.title}
                        description={project.description}
                        onOpen={() => handleProjectButton(project.id)}
                        onDelete={() => console.log('Удалить проект')}
                        key={project.id}
                    />
                ))}
            </div>
        </div>
    );
}

export default Projects;
