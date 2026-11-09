import React, { useState, useEffect } from "react";
import { X, AlertCircle, Sunrise, Coffee, Sun, Moon, Calendar, Activity } from "lucide-react";
import { Slot, Reading, SLOT_CONFIG } from "../../types";
import { readingsApi, getErrorMessage } from "../../services/api";

interface ReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialReading?: Reading | null;
  defaultDate?: string;
  defaultSlot?: Slot;
}

export const ReadingModal: React.FC<ReadingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialReading,
  defaultDate,
  defaultSlot,
}) => {
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [date, setDate] = useState<string>(defaultDate || getTodayString());
  const [slot, setSlot] = useState<Slot>(defaultSlot || "MORNING_FASTING");
  const [value, setValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (initialReading) {
      setDate(initialReading.recordedDate);
      setSlot(initialReading.slot);
      setValue(initialReading.value.toString());
      setNotes(initialReading.notes || "");
    } else {
      setDate(defaultDate || getTodayString());
      setSlot(defaultSlot || "MORNING_FASTING");
      setValue("");
      setNotes("");
    }
    setError(null);
  }, [initialReading, defaultDate, defaultSlot, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-side validation
    const numValue = Number(value);
    if (!value || isNaN(numValue)) {
      setError("Please enter a valid blood glucose level.");
      return;
    }
    if (!Number.isInteger(numValue)) {
      setError("Blood glucose level must be a whole number (no decimals).");
      return;
    }
    if (numValue < 40 || numValue > 600) {
      setError("Blood glucose level must be between 40 and 600 mg/dL.");
      return;
    }
    if (date > getTodayString()) {
      setError("Readings cannot be recorded for future dates.");
      return;
    }

    setLoading(true);
    try {
      if (initialReading) {
        // Edit mode (PATCH)
        await readingsApi.updateReading(initialReading.id, {
          value: numValue,
          slot,
          recordedDate: date,
          notes: notes.trim() || undefined,
        });
      } else {
        // Create mode (POST)
        await readingsApi.createReading({
          value: numValue,
          slot,
          recordedDate: date,
          notes: notes.trim() || undefined,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isEdit = Boolean(initialReading);

  const slotOptions: Array<{ id: Slot; label: string; icon: React.ReactNode; bg: string; border: string; text: string }> = [
    { id: "MORNING_FASTING", label: "Fasting", icon: <Sunrise className="w-4 h-4 text-[#8E3737]" />, bg: "bg-[#FCE8E6]", border: "border-[#F7CCD0]", text: "text-[#8E3737]" },
    { id: "AFTER_BREAKFAST", label: "Breakfast", icon: <Coffee className="w-4 h-4 text-[#825712]" />, bg: "bg-[#FBE8C9]", border: "border-[#F6D39D]", text: "text-[#825712]" },
    { id: "AFTER_LUNCH", label: "Lunch", icon: <Sun className="w-4 h-4 text-[#2E5436]" />, bg: "bg-[#E3F0E5]", border: "border-[#C6E2CB]", text: "text-[#2E5436]" },
    { id: "AFTER_DINNER", label: "Dinner", icon: <Moon className="w-4 h-4 text-[#4E3E8C]" />, bg: "bg-[#E8E5FA]", border: "border-[#D5CEF5]", text: "text-[#4E3E8C]" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-pastel-lavender border border-[#D5CEF5] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E8E5FA] border border-[#D5CEF5] flex items-center justify-center text-[#4E3E8C] shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#342D38] tracking-tight">
                {isEdit ? "Edit Glucose Reading" : "Log Glucose Reading"}
              </h3>
              <p className="text-xs text-[#342D38]/70 font-semibold mt-0.5">
                Record your blood glucose level and measurement slot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 bg-[#FCE8E6] border border-[#F7CCD0] rounded-2xl flex items-start gap-2.5 text-xs text-[#8E3737] animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-[#8E3737] shrink-0 mt-0.5" />
            <p className="font-extrabold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-extrabold text-[#342D38] uppercase tracking-wider mb-1.5">
              Reading Date
            </label>
            <div className="relative">
              <input
                type="date"
                max={getTodayString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-xs font-bold bg-[#FAF6F0] border border-[#E5DCF5] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5CEF5] focus:border-[#4E3E8C] transition-all text-[#342D38] cursor-pointer"
              />
              <Calendar className="w-4 h-4 text-[#4E3E8C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Slot Selection Buttons in Pastels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-extrabold text-[#342D38] uppercase tracking-wider">
                Measurement Slot
              </label>
              <span className="text-[11px] font-bold text-[#8A7D91]">
                {SLOT_CONFIG[slot]?.timing}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {slotOptions.map((opt) => {
                const isSelected = slot === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSlot(opt.id)}
                    className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-extrabold transition-all ${
                      isSelected
                        ? `${opt.bg} ${opt.text} ${opt.border} ring-2 ring-black/10 shadow-xs scale-[1.02]`
                        : `${opt.bg}/40 ${opt.text} ${opt.border} hover:opacity-100 opacity-70`
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glucose Value */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-[#342D38] uppercase tracking-wider">
                Glucose Level
              </label>
              <span className="text-[11px] text-[#8A7D91] font-bold">40 – 600 mg/dL</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="40"
                max="600"
                step="1"
                placeholder="e.g. 110"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full pl-4 pr-16 py-3 text-lg font-extrabold bg-[#FAF6F0] border border-[#E5DCF5] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5CEF5] focus:border-[#4E3E8C] transition-all text-[#342D38] placeholder:text-stone-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#8A7D91] uppercase tracking-wider pointer-events-none">
                mg/dL
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-extrabold text-[#342D38] uppercase tracking-wider mb-1.5">
              Personal Notes <span className="text-stone-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={250}
              placeholder="e.g. 30 min morning walk, feeling relaxed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#FAF6F0] border border-[#E5DCF5] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5CEF5] focus:border-[#4E3E8C] transition-all text-[#342D38] resize-none placeholder:text-stone-400 font-semibold"
            />
            <p className="text-[10px] text-[#8A7D91] text-right mt-1 font-bold">
              {notes.length}/250 characters
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-extrabold text-[#342D38] hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#4E3E8C] hover:bg-[#3D2E73] active:bg-[#30225E] rounded-2xl shadow-pastel-lavender transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Reading" : "Save Reading"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
