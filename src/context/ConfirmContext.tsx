"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle, Info, HelpCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolve, setResolve] = useState<(value: boolean) => void>(() => {});

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((res) => {
      setResolve(() => res);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolve(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolve(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal isOpen={isOpen} onClose={handleCancel} className="max-w-md">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl ${
              options?.type === 'danger' ? 'bg-red-50 text-red-600' :
              options?.type === 'warning' ? 'bg-amber-50 text-amber-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {options?.type === 'danger' ? <AlertTriangle className="w-6 h-6" /> :
               options?.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
               <HelpCircle className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              {options?.title || "Confirmar Acción"}
            </h3>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            {options?.message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700"
            >
              {options?.cancelText || "Cancelar"}
            </button>
            <Button
              onClick={handleConfirm}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold shadow-lg transition-all ${
                options?.type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                options?.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' :
                'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
              }`}
            >
              {options?.confirmText || "Confirmar"}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};
