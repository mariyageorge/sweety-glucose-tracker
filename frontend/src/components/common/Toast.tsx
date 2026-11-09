import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-white border-teal-200 text-teal-900 shadow-teal-500/5"
              : toast.type === "error"
              ? "bg-white border-rose-200 text-rose-900 shadow-rose-500/5"
              : "bg-white border-slate-200 text-slate-800 shadow-slate-500/5"
          }`}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

