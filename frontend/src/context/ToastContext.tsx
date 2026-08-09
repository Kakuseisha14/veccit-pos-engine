"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import Alert from "@/components/ui/alert/Alert";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  message: string;
}

interface ToastContextValue {
  showToast: (variant: ToastVariant, title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (variant: ToastVariant, title: string, message: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, variant, title, message }]);

      // Auto ocultar después de 5 segundos
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast],
  );

  const showSuccess = useCallback(
    (title: string, message: string) => showToast("success", title, message),
    [showToast],
  );

  const showError = useCallback(
    (title: string, message: string) => showToast("error", title, message),
    [showToast],
  );

  const showWarning = useCallback(
    (title: string, message: string) => showToast("warning", title, message),
    [showToast],
  );

  const showInfo = useCallback(
    (title: string, message: string) => showToast("info", title, message),
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {/* Toast Container flotante superior derecho */}
      <div className="fixed top-5 right-5 z-99999 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto shadow-theme-lg transition-all duration-300 animate-fadeIn"
          >
            <Alert
              variant={toast.variant}
              title={toast.title}
              message={toast.message}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};