import { createContext, useCallback, useContext, useState } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium max-w-xs ${
              t.type === "error"
                ? "bg-rose-500 text-white"
                : "bg-white text-gray-700 border border-accent"
            }`}
          >
            {t.type === "error" ? (
              <FaExclamationCircle className="shrink-0" />
            ) : (
              <FaCheckCircle className="shrink-0 text-accent" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
