"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastContextType = {
  showToast: (msg: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const showToast = useCallback((msg: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toastHost">
        {toasts.map((t) => (
          <div key={t.id} className="toast-custom">
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
