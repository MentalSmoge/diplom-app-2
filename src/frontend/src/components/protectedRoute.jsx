import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { checkAuth } from '../api/auth';
import { observer } from 'mobx-react';
import { userStore } from '../stores/userStore';

const ProtectedRoute = observer(() => {
    useEffect(() => {
        if (!userStore.isAuthenticated) {
            userStore.checkAuth();
        }
    }, []);
    if (userStore.isLoading) {
        return <div>Checking authentication...</div>;
    }
    const isAuthenticated = checkAuth(); // Функция проверки аутентификации

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;

});


export default ProtectedRoute;