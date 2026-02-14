import { useState, useCallback } from 'react';

export function useNotification() {
    const [notifications, setNotifications] = useState([]);

    const showSuccess = useCallback((message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type: 'success', message }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

    const showError = useCallback((message) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type: 'error', message }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return {
        notifications,
        showSuccess,
        showError,
        removeNotification
    };
}
