import React from 'react';
import { Link } from 'react-router-dom';
import { userStore } from '../stores/userStore';
import { observer } from 'mobx-react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
export const Header = observer(() => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const response = await fetch('http://45.143.92.185:8080/logout', {
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
                    <Link to="/invitations">Invitations</Link>
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