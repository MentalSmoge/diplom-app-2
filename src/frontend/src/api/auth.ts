export const checkAuth = async () => {
    try {
        const response = await fetch('http://45.143.92.185:8080/check-auth', {
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

export const checkBoardAccess = async (boardId: number) => {
    try {
        const response = await fetch(`http://45.143.92.185:8080/check-board-access/${boardId}`, {
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
        await fetch('http://45.143.92.185:8080/logout', {
            method: 'POST',
            credentials: 'include',
        });
        return true;
    } catch (error) {
        console.error('Logout failed:', error);
        return false;
    }
};