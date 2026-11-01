/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import Notification from "@/shared/ui/notification/Notification";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const hideToast = useCallback(
    (id) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
      );
      // Wait for CSS animation before removing
      setTimeout(() => {
        removeToast(id);
      }, 400);
    },
    [removeToast],
  );

  const showNotification = useCallback(
    (typeOrConfig, maybeMessage, maybeDescription) => {
      const isObject = typeof typeOrConfig === "object" && typeOrConfig !== null;
      const type = (isObject ? typeOrConfig.type : typeOrConfig) || "success";
      const message =
        (isObject
          ? typeOrConfig.title || typeOrConfig.message
          : maybeMessage) || "";
      const description =
        (isObject
          ? typeOrConfig.description ||
            (typeOrConfig.title ? typeOrConfig.message : "")
          : maybeDescription) || "";
      const duration = (isObject ? typeOrConfig.duration : 3500) ?? 3500;

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast = {
        id,
        type,
        message,
        description,
        visible: true,
        duration,
      };

      setToasts((prev) => {
        // Keep at most 3 simultaneous toasts
        const next = [...prev, newToast];
        return next.slice(-3);
      });

      // Auto dismiss timer
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast(id);
        }, duration);
        timersRef.current[id] = timer;
      }
    },
    [hideToast],
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed right-4 bottom-4 z-9999 flex flex-col items-end gap-3 pointer-events-none md:right-6 md:bottom-6">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Notification
                type={toast.type}
                message={toast.message}
                description={toast.description}
                visible={toast.visible}
                duration={toast.duration}
                onClose={() => hideToast(toast.id)}
              />
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      showNotification: () => {},
    };
  }
  return context;
};
