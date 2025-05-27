import React from 'react';
import { Link } from 'react-router-dom';
import { userStore } from '../stores/userStore';
import { observer } from 'mobx-react';
import '../styles.css';
export const Header = observer(() => {

    const handleLogout = async () => {
        const response = await fetch('http://localhost:8080/logout', {
            method: 'POST',
            credentials: 'include',
        });
        userStore.clearUser();
        navigate('/login');
    };

    return (
        <header>
            <nav>
                <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem' }}>
                    <li><Link to="/projects">Projects</Link></li>
                    {/* <li><Link to="/boards">Board</Link></li> */}
                    {/* <li><Link to="/user">Users</Link></li> */}
                    {!userStore.isAuthenticated && <li><Link to="/login">Login</Link></li>}
                    {!userStore.isAuthenticated && <li><Link to="/register">Register</Link></li>}
                    {userStore.isAuthenticated && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
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
                </ul>
            </nav>


        </header>
    );
})