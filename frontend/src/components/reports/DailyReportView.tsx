import React from "react";
import { CheckCircle2, CircleDashed, Activity, ArrowDown, ArrowUp, Calendar, Sunrise, Coffee, Sun, Moon } from "lucide-react";
import { DailyReport, SLOT_CONFIG, Slot } from "../../types";
import { MetricCard } from "./MetricCard";

interface DailyReportViewProps {
  report: DailyReport;
  onLogClick?: (slot: Slot) => void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({ report }) => {
  const { summary, slots, date } = report;

  const getSlotDetails = (slot: Slot) => {
    switch (slot) {
      case "MORNING_FASTING":
        return {
          bg: "bg-[#FCE8E6]",
          border: "border-[#F7CCD0]",
          text: "text-[#8E3737]",
          icon: <Sunrise className="w-5 h-5 text-[#8E3737]" />,
        };
      case "AFTER_BREAKFAST":
        return {
          bg: "bg-[#FBE8C9]",
          border: "border-[#F6D39D]",
          text: "text-[#825712]",
          icon: <Coffee className="w-5 h-5 text-[#825712]" />,
        };
      case "AFTER_LUNCH":
        return {
          bg: "bg-[#E3F0E5]",
          border: "border-[#C6E2CB]",
          text: "text-[#2E5436]",
          icon: <Sun className="w-5 h-5 text-[#2E5436]" />,
        };
      case "AFTER_DINNER":
        return {
          bg: "bg-[#E8E5FA]",
          border: "border-[#D5CEF5]",
          text: "text-[#4E3E8C]",
          icon: <Moon className="w-5 h-5 text-[#4E3E8C]" />,
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Slots Completed"
          value={`${summary.totalLogged} / 4`}
          subtitle={`${summary.completionRate}% daily rhythm completion`}
          icon={Calendar}
          theme="blue"
        />
        <MetricCard
          title="Daily Average"
          value={summary.average}
          unit="mg/dL"
          subtitle={summary.average ? "Average of recorded slots" : "No readings recorded"}
          icon={Activity}
          theme="mint"
        />
        <MetricCard
          title="Lowest Reading"
          value={summary.min}
          unit="mg/dL"
          subtitle={summary.min ? "Lowest measured value" : "—"}
          icon={ArrowDown}
          theme="pink"
        />
        <MetricCard
          title="Highest Reading"
          value={summary.max}
          unit="mg/dL"
          subtitle={summary.max ? "Highest measured value" : "—"}
          icon={ArrowUp}
          theme="yellow"
        />
      </div>

      {/* Slots Breakdown Section: Soft Lavender Card */}
      <div className="bg-[#E8E5FA]/50 rounded-[2rem] border border-[#D5CEF5] p-6 sm:p-7 shadow-pastel-lavender">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#D5CEF5]/60 mb-5">
          <div>
            <h3 className="text-base font-extrabold text-[#4E3E8C] tracking-tight">
              Daily Slot Breakdown &bull; {date}
            </h3>
            <p className="text-xs text-[#4E3E8C]/80 font-semibold mt-0.5">
              Readings mapped across all 4 mandatory measurement slots.
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#4E3E8C] bg-white/90 px-4 py-1.5 rounded-2xl border border-[#D5CEF5] self-start sm:self-auto shadow-xs">
            {summary.totalLogged} of 4 slots logged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((s) => {
            const config = SLOT_CONFIG[s.slot];
            const sd = getSlotDetails(s.slot);
            return (
              <div
                key={s.slot}
                className={`${sd.bg} ${sd.border} p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-xs hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/90 border border-white flex items-center justify-center shrink-0 shadow-xs">
                      {sd.icon}
                    </div>
                    <div>
                      <h4 className={`text-xs font-extrabold ${sd.text}`}>{s.label}</h4>
                      <p className="text-[11px] font-semibold text-[#342D38]/60">{config?.timing}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      s.logged
                        ? "bg-white/90 text-[#2E5436] border border-[#C6E2CB] shadow-xs"
                        : "bg-white/60 text-[#342D38]/50"
                    }`}
                  >
                    {s.logged ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5436]" />
                        <span>Logged</span>
                      </>
                    ) : (
                      <>
                        <CircleDashed className="w-3.5 h-3.5 text-[#342D38]/40" />
                        <span>Missing</span>
                      </>
                    )}
                  </span>
                </div>

                {s.logged && s.reading ? (
                  <div className="mt-2 pt-2.5 border-t border-black/5 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#342D38] tracking-tight">
                        {s.reading.value}
                      </span>
                      <span className="text-xs font-bold text-[#342D38]/60 uppercase">mg/dL</span>
                    </div>
                    {s.reading.notes && (
                      <span className="text-xs text-[#342D38]/70 italic max-w-xs truncate font-medium">
                        "{s.reading.notes}"
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 pt-2.5 border-t border-black/5">
                    <p className="text-xs text-[#342D38]/50 font-medium">No measurement recorded</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
