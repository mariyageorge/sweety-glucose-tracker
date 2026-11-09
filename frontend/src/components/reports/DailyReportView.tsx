import React from "react";
import { CheckCircle2, CircleDashed, Activity, ArrowDown, ArrowUp, Calendar } from "lucide-react";
import { DailyReport, SLOT_CONFIG } from "../../types";
import { MetricCard } from "./MetricCard";

interface DailyReportViewProps {
  report: DailyReport;
  onLogClick?: (slot: any) => void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({ report }) => {
  const { summary, slots, date, hasReadings } = report;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Slots Completed"
          value={`${summary.totalLogged} / 4`}
          subtitle={`${summary.completionRate}% daily completion`}
          icon={Calendar}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <MetricCard
          title="Daily Average"
          value={summary.average}
          unit="mg/dL"
          subtitle={summary.average ? "Average of logged slots" : "No readings recorded"}
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Lowest Reading"
          value={summary.min}
          unit="mg/dL"
          subtitle={summary.min ? "Lowest measured value" : "—"}
          icon={ArrowDown}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Highest Reading"
          value={summary.max}
          unit="mg/dL"
          subtitle={summary.max ? "Highest measured value" : "—"}
          icon={ArrowUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Slots Breakdown Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daily Slot Breakdown — {date}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Readings mapped across all 4 mandatory measurement slots.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {summary.totalLogged} of 4 logged
          </span>
        </div>

        {!hasReadings ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No readings on {date}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No glucose readings have been recorded for this calendar day. Select another date or log a new reading from the dashboard.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {slots.map((s) => {
              const config = SLOT_CONFIG[s.slot];
              return (
                <div
                  key={s.slot}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        s.logged
                          ? "bg-teal-50 text-teal-600 border border-teal-200"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {s.logged ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <CircleDashed className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                      <p className="text-xs text-slate-400">{config.timing}</p>
                    </div>
                  </div>

                  {s.logged && s.reading ? (
                    <div className="flex items-center gap-4 sm:text-right">
                      {s.reading.notes && (
                        <span className="text-xs text-slate-500 italic max-w-xs truncate hidden md:inline">
                          "{s.reading.notes}"
                        </span>
                      )}
                      <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <span className="text-base font-bold text-slate-900">
                          {s.reading.value}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 ml-1">
                          mg/dL
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 w-fit">
                      Not logged
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

