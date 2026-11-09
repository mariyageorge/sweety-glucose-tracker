import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-warm-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-3 ${toast.type === "success"
              ? "bg-white/95 border-sage-200/90 text-stone-800"
              : toast.type === "error"
                ? "bg-white/95 border-peach-200/90 text-stone-800"
                : "bg-white/95 border-stone-200/90 text-stone-800"
            }`}
        >
          {toast.type === "success" && (
            <div className="w-6 h-6 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center shrink-0 mt-0.5 border border-sage-200/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {toast.type === "error" && (
            <div className="w-6 h-6 rounded-xl bg-peach-50 text-peach-600 flex items-center justify-center shrink-0 mt-0.5 border border-peach-200/60">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {toast.type === "info" && (
            <div className="w-6 h-6 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
          )}
          <p className="text-xs font-semibold leading-relaxed flex-1 text-stone-700 pt-0.5">
            {toast.message}
          </p>
          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
