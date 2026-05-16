/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message, description) => {
        setNotification({ type, message, description });
        setTimeout(() => setNotification(null), 3000); // Hide after 3 seconds
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        description={notification.description}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);