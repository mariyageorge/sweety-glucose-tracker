import React from "react";
import { Activity, Calendar, CheckCircle2, ArrowDown, ArrowUp, BarChart2, Sparkles } from "lucide-react";
import { MonthToDateReport, PreviousMonthReport, Slot, SLOT_CONFIG } from "../../types";
import { MetricCard } from "./MetricCard";
import { MonthlyGlucoseChart } from "./MonthlyGlucoseChart";

interface MonthlyReportViewProps {
  report: MonthToDateReport | PreviousMonthReport;
  title: string;
  subtitle: string;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  report,
  title,
  subtitle,
}) => {
  const { summary, slotAverages, period, hasReadings } = report;
  const isMtd = period.type === "month-to-date";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Month-to-date Summary Header Card: Pale Mint Background */}
      <div className="bg-[#E3F0E5] rounded-[2rem] border border-[#C6E2CB] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-pastel-mint">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-[#2E5436] tracking-tight">{title}</h3>
            <Sparkles className="w-4 h-4 text-[#2E5436]" />
          </div>
          <p className="text-xs text-[#2E5436]/80 font-bold mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-2xl border border-[#C6E2CB] text-xs font-extrabold text-[#2E5436] w-fit shadow-xs">
          <Calendar className="w-4 h-4 text-[#2E5436]" />
          <span>
            {period.startDate} &rarr; {period.endDate}
          </span>
          <span className="text-[#2E5436]/70 font-semibold">({period.totalDays} days)</span>
        </div>
      </div>

      {/* 4 Pastel Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Readings"
          value={summary.totalReadings}
          subtitle={`Target: ${period.expectedReadings} (${summary.complianceRate}% compliance)`}
          icon={CheckCircle2}
          theme="blue"
        />
        <MetricCard
          title="Period Average"
          value={summary.average}
          unit="mg/dL"
          subtitle={summary.average ? "Mean level across period" : "No readings recorded"}
          icon={Activity}
          theme="yellow"
        />
        <MetricCard
          title="Active Days"
          value={`${summary.daysWithReadings} / ${period.totalDays}`}
          subtitle="Days with at least 1 reading"
          icon={Calendar}
          theme="pink"
        />
        <MetricCard
          title="Compliance Rate"
          value={`${summary.complianceRate}%`}
          subtitle="Of recommended 4 daily slots"
          icon={BarChart2}
          theme="rose"
        />
      </div>

      {/* Range Extremes (Min: Mint, Max: Peach/Blush) */}
      {hasReadings && (summary.min || summary.max) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.min && (
            <div className="bg-[#E3F0E5] rounded-[1.8rem] border border-[#C6E2CB] p-6 shadow-pastel-mint flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2E5436]">
                  Lowest Reading Recorded
                </span>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#342D38] tracking-tight">
                    {summary.min.value}
                  </span>
                  <span className="text-xs font-bold text-[#342D38]/60 uppercase">mg/dL</span>
                </div>
                <p className="text-xs text-[#2E5436] font-bold mt-2">
                  {SLOT_CONFIG[summary.min.slot]?.label || summary.min.slot} on{" "}
                  <span className="underline decoration-[#2E5436]/40 underline-offset-2">{summary.min.recordedDate}</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/90 text-[#2E5436] border border-[#C6E2CB] flex items-center justify-center shrink-0 shadow-xs">
                <ArrowDown className="w-6 h-6" />
              </div>
            </div>
          )}

          {summary.max && (
            <div className="bg-[#FCE8E6] rounded-[1.8rem] border border-[#F7CCD0] p-6 shadow-pastel-blush flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8E3737]">
                  Highest Reading Recorded
                </span>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#342D38] tracking-tight">
                    {summary.max.value}
                  </span>
                  <span className="text-xs font-bold text-[#342D38]/60 uppercase">mg/dL</span>
                </div>
                <p className="text-xs text-[#8E3737] font-bold mt-2">
                  {SLOT_CONFIG[summary.max.slot]?.label || summary.max.slot} on{" "}
                  <span className="underline decoration-[#8E3737]/40 underline-offset-2">{summary.max.recordedDate}</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/90 text-[#8E3737] border border-[#F7CCD0] flex items-center justify-center shrink-0 shadow-xs">
                <ArrowUp className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Timeline Chart (Lavender Pastel Card) */}
      <MonthlyGlucoseChart
        timeline={report.dailyTimeline || []}
        title={isMtd ? "Month-to-Date Glucose Rhythm" : "Previous Month Glucose Rhythm"}
        subtitle={
          isMtd
            ? "Daily mean blood glucose from the 1st through the selected date."
            : "Complete daily glucose rhythm across the preceding calendar month."
        }
      />

      {/* Per-Slot Averages Breakdown: Pastel Baby Blue Background */}
      <div className="bg-[#DDECFB]/50 rounded-[2rem] border border-[#BCDDF8] p-6 sm:p-7 shadow-pastel-blue">
        <h4 className="text-base font-extrabold text-[#25588C] tracking-tight mb-1">
          Slot Average Glucose Breakdown
        </h4>
        <p className="text-xs text-[#25588C]/80 font-bold mb-5">
          Mean glucose levels calculated independently for each time slot over this calendar period.
        </p>

        {!hasReadings ? (
          <div className="py-12 text-center bg-white/60 rounded-2xl border border-dashed border-[#BCDDF8]">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#25588C] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-bold text-[#342D38]">No readings recorded</h5>
            <p className="text-xs text-[#342D38]/70 max-w-sm mx-auto mt-1 font-semibold">
              There are no glucose readings logged for this period. As readings are recorded,
              slot averages and compliance statistics will populate here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(slotAverages) as Slot[]).map((slotKey) => {
              const item = slotAverages[slotKey];
              const config = SLOT_CONFIG[slotKey];

              const slotThemes: Record<Slot, { bg: string; border: string; text: string }> = {
                MORNING_FASTING: { bg: "bg-[#FCE8E6]", border: "border-[#F7CCD0]", text: "text-[#8E3737]" },
                AFTER_BREAKFAST: { bg: "bg-[#FBE8C9]", border: "border-[#F6D39D]", text: "text-[#825712]" },
                AFTER_LUNCH: { bg: "bg-[#E3F0E5]", border: "border-[#C6E2CB]", text: "text-[#2E5436]" },
                AFTER_DINNER: { bg: "bg-[#E8E5FA]", border: "border-[#D5CEF5]", text: "text-[#4E3E8C]" },
              };

              const st = slotThemes[slotKey];

              return (
                <div
                  key={slotKey}
                  className={`${st.bg} ${st.border} rounded-2xl border p-5 flex flex-col justify-between shadow-xs transition-all hover:-translate-y-0.5`}
                >
                  <div>
                    <h5 className={`font-extrabold text-xs ${st.text}`}>{item.label}</h5>
                    <p className="text-[11px] text-[#342D38]/60 font-semibold mb-3">{config?.timing}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#342D38] tracking-tight">
                        {item.average !== null ? item.average : "—"}
                      </span>
                      {item.average !== null && (
                        <span className="text-xs font-bold text-[#342D38]/60 uppercase">mg/dL</span>
                      )}
                    </div>
                    <p className={`text-[11px] font-bold mt-1 ${st.text}`}>
                      {item.count} {item.count === 1 ? "entry" : "entries"} logged
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
