import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-warm-lg border border-stone-200/80">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                isDestructive
                  ? "bg-peach-50 text-peach-600 border-peach-200"
                  : "bg-sage-50 text-sage-600 border-sage-200"
              }`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">{title}</h3>
              <p className="text-xs text-stone-500 mt-0.5">Please confirm your decision</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/60 mb-6">
          <p className="text-xs text-stone-600 leading-relaxed font-medium">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-warm-sm transition-all disabled:opacity-50 ${
              isDestructive
                ? "bg-peach-500 hover:bg-peach-600 active:bg-peach-600"
                : "bg-sage-600 hover:bg-sage-700 active:bg-sage-800"
            }`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
