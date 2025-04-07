import React, { useEffect, useState } from "react";
import { checkAuth } from "../api/auth";
import { useNavigate } from "react-router-dom";

function Boards() {
    const [boards, setBoards] = useState([]);
    const navigate = useNavigate();


    const handleBoardButton = (boardId) => {
        navigate(`/boards/${boardId}`);
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

        verifyAuth().then((data) => fetch(`http://localhost:8080/boards/${data.id}`))
            .then((response) => response.json())
            .then((data) => { console.log(data); setBoards(data) })
            .catch((error) => console.error("Error fetching Boards:", error));
    }, []);

    return (
        <div>
            <h1>Boards</h1>
            <ul>
                {boards.map((board) => (
                    <li key={board.id}>id = {board.id}, title = {board.title}, access level = {board.access_level}<button onClick={() => handleBoardButton(board.id)}>Open</button></li>
                ))}
            </ul>
        </div>
    );
}

export default Boards;
