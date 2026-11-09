import React from "react";
import { Sunrise, Coffee, Sun, Moon, Plus, Edit2, Trash2, CheckCircle2, CircleDashed } from "lucide-react";
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

  // Coordinated Pastel Slot Palettes
  const getSlotDetails = (s: Slot) => {
    switch (s) {
      case "MORNING_FASTING":
        return {
          bg: "bg-[#FCE8E6]",
          bgPending: "bg-[#FCE8E6]/40",
          border: "border-[#F7CCD0]",
          shadow: "shadow-pastel-blush",
          textColor: "text-[#8E3737]",
          iconColor: "text-[#8E3737]",
          iconBg: "bg-white/90",
          icon: <Sunrise className="w-5 h-5 text-[#8E3737]" />,
        };
      case "AFTER_BREAKFAST":
        return {
          bg: "bg-[#FBE8C9]",
          bgPending: "bg-[#FBE8C9]/40",
          border: "border-[#F6D39D]",
          shadow: "shadow-pastel-yellow",
          textColor: "text-[#825712]",
          iconColor: "text-[#825712]",
          iconBg: "bg-white/90",
          icon: <Coffee className="w-5 h-5 text-[#825712]" />,
        };
      case "AFTER_LUNCH":
        return {
          bg: "bg-[#E3F0E5]",
          bgPending: "bg-[#E3F0E5]/40",
          border: "border-[#C6E2CB]",
          shadow: "shadow-pastel-mint",
          textColor: "text-[#2E5436]",
          iconColor: "text-[#2E5436]",
          iconBg: "bg-white/90",
          icon: <Sun className="w-5 h-5 text-[#2E5436]" />,
        };
      case "AFTER_DINNER":
        return {
          bg: "bg-[#E8E5FA]",
          bgPending: "bg-[#E8E5FA]/40",
          border: "border-[#D5CEF5]",
          shadow: "shadow-pastel-lavender",
          textColor: "text-[#4E3E8C]",
          iconColor: "text-[#4E3E8C]",
          iconBg: "bg-white/90",
          icon: <Moon className="w-5 h-5 text-[#4E3E8C]" />,
        };
    }
  };

  const sd = getSlotDetails(slot);

  return (
    <div
      className={`relative rounded-[1.8rem] border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5 ${
        logged
          ? `${sd.bg} ${sd.border} ${sd.shadow}`
          : `${sd.bgPending} border-dashed ${sd.border} hover:bg-white/70`
      }`}
    >
      <div>
        {/* Slot Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl ${sd.iconBg} ${sd.border} border flex items-center justify-center shrink-0 shadow-xs`}
            >
              {sd.icon}
            </div>
            <div>
              <h4 className={`font-extrabold text-sm tracking-tight ${sd.textColor}`}>{label}</h4>
              <p className="text-[11px] font-semibold text-[#342D38]/60 mt-0.5">{config?.timing}</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
              logged
                ? "bg-white/90 text-[#2E5436] border border-[#C6E2CB] shadow-xs"
                : "bg-white/60 text-[#342D38]/50 border border-black/5"
            }`}
          >
            {logged ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5436]" />
                <span>Logged</span>
              </>
            ) : (
              <>
                <CircleDashed className="w-3.5 h-3.5 text-[#342D38]/40" />
                <span>Pending</span>
              </>
            )}
          </span>
        </div>

        {/* Reading Value or Empty Prompt */}
        {logged && reading ? (
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#342D38] tracking-tight">
                {reading.value}
              </span>
              <span className="text-xs font-bold text-[#342D38]/60 uppercase tracking-wider">
                mg/dL
              </span>
            </div>
            {reading.notes && (
              <p className="mt-2 text-xs text-[#342D38]/80 bg-white/70 p-2.5 rounded-xl border border-black/5 italic font-medium leading-relaxed">
                "{reading.notes}"
              </p>
            )}
          </div>
        ) : (
          <div className="my-5 text-center py-2">
            <p className="text-xs text-[#342D38]/50 font-semibold">No measurement recorded</p>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-black/5 mt-2 flex items-center justify-end gap-1.5">
        {logged && reading ? (
          <>
            <button
              onClick={() => onEdit(reading.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-[#342D38] hover:text-black bg-white/80 hover:bg-white rounded-xl transition-all border border-black/5 shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(reading.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-[#8E3737] bg-white/80 hover:bg-white rounded-xl transition-all border border-[#F7CCD0] shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onLog(slot)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-extrabold text-[#342D38] bg-white/90 hover:bg-white rounded-xl transition-all border border-black/5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log {label}</span>
          </button>
        )}
      </div>
    </div>
  );
};
