import React from 'react';
import { Link } from 'react-router-dom';
import { userStore } from '../stores/userStore';
import { observer } from 'mobx-react';

export const Header = observer(() => {

    const handleLogout = async () => {
        const response = await fetch('http://localhost:8080/logout', {
            method: 'POST',
            credentials: 'include',
        });
        userStore.clearUser();
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
                    <li><Link to="/boards">Board</Link></li>
                    <li><Link to="/user">Users</Link></li>
                    {!userStore.isAuthenticated && <li><Link to="/login">Login</Link></li>}
                    {!userStore.isAuthenticated && <li><Link to="/register">Register</Link></li>}
                </ul>
            </nav>

            {userStore.isAuthenticated && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {userStore.isLoading ? (
                        <span>Loading...</span>
                    ) : (
                        <>
                            <span>Hello, {userStore.user?.name}</span>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
})