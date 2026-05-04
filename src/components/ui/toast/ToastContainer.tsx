"use client";
import React from "react";
import { ToastMessage, removeToast } from "@/context/ToastContext";
import Toast from "./Toast";

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[400px] pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default ToastContainer;
