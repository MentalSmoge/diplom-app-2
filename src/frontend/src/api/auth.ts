export const checkAuth = async () => {
    try {
        const response = await fetch('http://localhost:8080/check-auth', {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Not authenticated');
        }

        return await response.json();
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
};

export const logout = async () => {
    try {
        await fetch('http://localhost:8080/logout', {
            method: 'POST',
            credentials: 'include',
        });
        return true;
    } catch (error) {
        console.error('Logout failed:', error);
        return false;
    }
};