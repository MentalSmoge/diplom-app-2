import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../userContext';

export function Logout() {
    const { logout } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await fetch('http://localhost:8080/logout', {
                    method: 'POST',
                    credentials: 'include',
                });
                logout();
                navigate('/login');
            } catch (error) {
                console.error('Logout failed:', error);
            }
        };

        performLogout();
    }, [logout, navigate]);

    return <div>Logging out...</div>;
}