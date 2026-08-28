/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Notification from "@/shared/ui/notification/Notification";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const [visible, setVisible] = useState(false);

    const showNotification = useCallback((type, message, description) => {
        setNotification({
        type,
        message,
        description,
        });

        setVisible(true);

        setTimeout(() => {
        setVisible(false);
        }, 3000);
    },[]);

    const handleClose = useCallback(() => {setVisible(false);}, []);

    // Unmount sau khi animation ẩn chạy xong (400ms = khớp CSS transition)
    useEffect(() => {
        if (!visible && notification) {
            const timer = setTimeout(() => setNotification(null), 400);
            return () => clearTimeout(timer);
        }
    }, [visible, notification]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <div className="fixed bottom-5 right-5 z-9999">
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        description={notification.description}
                        onClose={handleClose}
                        visible={visible}
                    />
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
