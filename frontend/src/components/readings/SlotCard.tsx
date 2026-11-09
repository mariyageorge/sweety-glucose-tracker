import React from "react";
import { Sunrise, Coffee, Sun, Moon, Plus, Edit2, Trash2 } from "lucide-react";
import { Slot, SlotStatus, SLOT_CONFIG } from "../../types";

interface SlotCardProps {
  status: SlotStatus;
  selectedDate: string;
  onLog: (slot: Slot) => void;
  onEdit: (readingId: string) => void;
  onDelete: (readingId: string) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  status,
  onLog,
  onEdit,
  onDelete,
}) => {
  const { slot, label, logged, reading } = status;
  const config = SLOT_CONFIG[slot];

  // Slot icon selection
  const getSlotIcon = (s: Slot) => {
    switch (s) {
      case "MORNING_FASTING":
        return <Sunrise className="w-5 h-5 text-amber-500" />;
      case "AFTER_BREAKFAST":
        return <Coffee className="w-5 h-5 text-orange-500" />;
      case "AFTER_LUNCH":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "AFTER_DINNER":
        return <Moon className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col justify-between ${
        logged
          ? "border-slate-200 hover:border-slate-300 hover:shadow-md"
          : "border-dashed border-slate-200 bg-slate-50/50"
      }`}
    >
      <div>
        {/* Slot Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
              {getSlotIcon(slot)}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{label}</h4>
              <p className="text-xs text-slate-400">{config.timing}</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
              logged
                ? "bg-teal-50 text-teal-700 border border-teal-200/60"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {logged ? "Logged" : "Missing"}
          </span>
        </div>

        {/* Reading Value or Empty Prompt */}
        {logged && reading ? (
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {reading.value}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                mg/dL
              </span>
            </div>
            {reading.notes && (
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                "{reading.notes}"
              </p>
            )}
          </div>
        ) : (
          <div className="my-5 text-center">
            <p className="text-xs text-slate-400">No reading recorded for this slot.</p>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-end gap-2">
        {logged && reading ? (
          <>
            <button
              onClick={() => onEdit(reading.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-slate-200 hover:border-teal-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => onDelete(reading.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={() => onLog(slot)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Log Reading
          </button>
        )}
      </div>
    </div>
  );
};

