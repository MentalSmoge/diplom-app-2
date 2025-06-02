import React, { useEffect, useState } from "react";
import { checkAuth } from "../api/auth";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../components/projectCard";
import AddProjectModal from "../components/modals/modal_addProject"
import AddProjectModalStore from '../components/modals/modal_addProject/store_addProject';
import ProjectsStore from "./store_projects"
import DeleteModal from "../components/modals/modal_delete"
import DeleteModalStore from "../components/modals/modal_delete/DeleteModalStore"
import RenameModal from "../components/modals/modal_rename"
import InviteModal from "../components/modals/modal_invite";
import { observer } from 'mobx-react-lite';

import './ProjectsGrid.css';

function Projects() {
    const navigate = useNavigate();


    const handleProjectButton = (projectId) => {
        navigate(`/project/${projectId}`);
    }
    const handleCreateButton = () => {
        AddProjectModalStore.openEditor()
    }
    const handleDeleteButton = (projectId) => {
        DeleteModalStore.openEditor("Project", projectId)
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
            .then((data) => { console.log(data); ProjectsStore.setProjects(data) })
            .catch((error) => console.error("Error fetching Projects:", error));
    }, []);

    return (
        <div className="projects-container">
            <AddProjectModal />
            <DeleteModal type="Project" />
            <RenameModal type="Project" showDesc={true} />
            <InviteModal />
            <div className="projects-header">
                <h2 className="projects-title">Проекты</h2>
                <button className="create-project-btn" onClick={() => handleCreateButton()}>
                    Создать проект
                </button>
            </div>
            <div className="projects-grid">
                {ProjectsStore.projects.map((project) => (
                    // <li key={project.id}>id = {project.id}, title = {project.title}, access level = {project.role}<button onClick={() => handleProjectButton(project.id)}>Open</button></li>
                    <ProjectCard
                        title={project.title}
                        description={project.description}
                        onOpen={() => handleProjectButton(project.id)}
                        onDelete={() => handleDeleteButton(project.id)}
                        key={project.id}
                        projectId={project.id}
                    />
                ))}
            </div>
        </div>
    );
}

export default observer(Projects);
