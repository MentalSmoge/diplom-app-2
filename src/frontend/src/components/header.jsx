import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './userContext';

export function Header() {
    const { user, logout } = useUser();

    const handleLogout = () => {
        logout();
        // Дополнительно: вызвать API для выхода из системы
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: '#f0f0f0',
            borderBottom: '1px solid #ddd'
        }}>
            <nav>
                <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem' }}>
                    <li><Link to="/board">Board</Link></li>
                    <li><Link to="/user">Users</Link></li>
                    {!user && <li><Link to="/login">Login</Link></li>}
                    {!user && <li><Link to="/register">Register</Link></li>}
                </ul>
            </nav>

            {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>Hello, {user.username}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
        </header>
    );
}