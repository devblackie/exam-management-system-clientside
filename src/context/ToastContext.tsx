// src/context/ToastContext.tsx

"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning"; // 1. Updated interface
}

interface ToastContextType {
  addToast: (message: string, type?: "success" | "error" | "warning") => void; // 2. Updated context type
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    message: string,
    type: "success" | "error" | "warning" = "success" // 3. Updated function signature
  ) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const getToastClasses = (type: "success" | "error" | "warning") => {
    switch (type) {
      case "success":
        return "bg-green-600 text-white"; // Changed success color for clarity/consistency
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-gray-900"; // 4. New warning style
      default:
        return "bg-gray-700 text-white";
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-7 right-5 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              // 5. Applied dynamic class based on type
              className={`px-4 py-2 rounded shadow font-semibold ${getToastClasses(
                toast.type
              )}`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}