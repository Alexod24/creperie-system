"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { ToastType } from "@/context/ToastContext";

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, title, message, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgClasses = {
    success: "border-green-100 bg-white dark:bg-gray-800 dark:border-green-900/30",
    error: "border-red-100 bg-white dark:bg-gray-800 dark:border-red-900/30",
    warning: "border-amber-100 bg-white dark:bg-gray-800 dark:border-amber-900/30",
    info: "border-blue-100 bg-white dark:bg-gray-800 dark:border-blue-900/30",
  };

  return (
    <div
      className={`pointer-events-auto flex w-full flex-col overflow-hidden rounded-[24px] border shadow-2xl transition-all duration-300 ${
        bgClasses[type]
      } ${
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100 animate-in slide-in-from-right-8"
      }`}
    >
      <div className="flex items-start p-5 gap-4">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
            {title}
          </h4>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            {message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-1 bg-gray-100 dark:bg-gray-700/50 relative overflow-hidden">
        <div 
          className={`absolute inset-0 origin-left animate-toast-progress ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
          }`}
        />
      </div>
    </div>
  );
};

export default Toast;
