import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
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
  // Get today's ISO date string YYYY-MM-DD
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
      setError("Please enter a valid blood glucose number.");
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
      setError("Readings cannot be logged for future dates.");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEdit ? "Edit Blood Glucose Reading" : "Log Blood Glucose Reading"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your measured reading value and time slot.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reading Date
            </label>
            <input
              type="date"
              max={getTodayString()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium text-slate-800"
            />
          </div>

          {/* Slot Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Measurement Slot
            </label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value as Slot)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium text-slate-800"
            >
              {(Object.keys(SLOT_CONFIG) as Slot[]).map((key) => (
                <option key={key} value={key}>
                  {SLOT_CONFIG[key].label} ({SLOT_CONFIG[key].timing})
                </option>
              ))}
            </select>
          </div>

          {/* Glucose Value */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Glucose Level
              </label>
              <span className="text-xs text-slate-400 font-medium">40 – 600 mg/dL</span>
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
                className="w-full pl-3.5 pr-16 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-medium text-slate-900"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none uppercase">
                mg/dL
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={250}
              placeholder="e.g. 30 min walk before measurement, heavy dinner..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-800 resize-none placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-400 text-right mt-1">
              {notes.length}/250 characters
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Reading" : "Save Reading"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

