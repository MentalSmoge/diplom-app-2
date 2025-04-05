import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const isAuthenticated = checkAuth(); // Функция проверки аутентификации

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Функция для проверки аутентификации
export const checkAuth = async () => {
    try {
        const response = await fetch('http://localhost:8080/check-auth', {
            credentials: 'include', // Отправляем куки
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export default ProtectedRoute;