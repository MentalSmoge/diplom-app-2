import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userStore } from '../stores/userStore';

export function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await fetch('http://localhost:8080/logout', {
                    method: 'POST',
                    credentials: 'include',
                });
                userStore.clearUser()
                navigate('/login');
            } catch (error) {
                console.error('Logout failed:', error);
            }
        };

        performLogout();
    }, [logout, navigate]);

    return <div>Logging out...</div>;
}