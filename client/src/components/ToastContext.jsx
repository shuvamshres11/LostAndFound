import React, { createContext, useContext, useState, useCallback } from "react";
import "./Toast.css";

const ToastContext = createContext();

export const useToast = () => {
    return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast-message toast-${toast.type}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <span className="toast-icon">
                            {toast.type === "success" && "✅"}
                            {toast.type === "error" && "❌"}
                            {toast.type === "info" && "ℹ️"}
                        </span>
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
