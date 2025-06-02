import React, { useEffect, useState } from "react";
import { checkAuth } from "../api/auth";
import { useParams, useNavigate } from "react-router-dom";
import ProjectCard from "../components/projectCard";
import AddBoardModal from "../components/modals/modal_addBoard"
import AddBoardModalStore from "../components/modals/modal_addBoard/store_addBoard"
import RenameModal from "../components/modals/modal_rename"
import BoardsStore from "./store_boards"
import DeleteModal from "../components/modals/modal_delete"
import DeleteModalStore from "../components/modals/modal_delete/DeleteModalStore"
import { observer } from 'mobx-react-lite';
import { boardStore } from "../stores/boardStore";

function Boards() {
    const { projectId } = useParams(); // Получаем ID проекта из URL
    const navigate = useNavigate();


    const handleBoardButton = (boardId, title) => {
        boardStore.setCurrentTitle(title)
        navigate(`/boards/${boardId}`);
    }
    const handleCreateButton = () => {
        AddBoardModalStore.openEditor()
    }
    const handleDeleteButton = (projectId) => {
        DeleteModalStore.openEditor("Board", projectId)
    }
    useEffect(() => {
        const verifyAuth = async () => {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
            return isAuthenticated.data
        };

        verifyAuth().then((data) => fetch(`http://45.143.92.185:8080/boards/${projectId}?userId=${data.id}`))
            .then((response) => response.json())
            .then((data) => { console.log(data); BoardsStore.setBoards(data) })
            .catch((error) => console.error("Error fetching Boards:", error));
    }, []);

    return (
        <div className="projects-container">
            <AddBoardModal projectId={projectId} />
            <DeleteModal type="Board" />
            <RenameModal type="Board" />

            {/* <DeleteModal type="Project" /> */}
            <div className="projects-header">
                <h2 className="projects-title">Доски в проекте</h2>
                <button className="create-project-btn" onClick={() => handleCreateButton()}>
                    Создать доску
                </button>
            </div>
            <div className="projects-grid">
                {BoardsStore.boards.map((project) => (
                    <ProjectCard
                        title={project.title}
                        description=""
                        onOpen={() => handleBoardButton(project.id, project.title)}
                        onDelete={() => handleDeleteButton(project.id)}
                        key={project.id}
                        boardId={project.id}
                    />
                ))}
            </div>
        </div>
        // <div>
        //     <h1>Boards</h1>
        //     <ul>
        //         {boards.map((board) => (
        //             <li key={board.id}>id = {board.id}, title = {board.title}, access level = {board.access_level}<button onClick={() => handleBoardButton(board.id)}>Open</button></li>
        //         ))}
        //     </ul>
        // </div>
    );
}

export default observer(Boards);
