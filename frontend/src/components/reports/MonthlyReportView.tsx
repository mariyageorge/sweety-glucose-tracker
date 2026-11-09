import React from "react";
import { Activity, Calendar, CheckCircle2, ArrowDown, ArrowUp, BarChart2 } from "lucide-react";
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
    <div className="space-y-6 animate-in fade-in">
      {/* Period Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 w-fit">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {period.startDate} &rarr; {period.endDate}
          </span>
          <span className="text-slate-400 font-normal">({period.totalDays} days)</span>
        </div>
      </div>

      {/* 4 Key Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Readings"
          value={summary.totalReadings}
          subtitle={`Target: ${period.expectedReadings} (${summary.complianceRate}% compliance)`}
          icon={CheckCircle2}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <MetricCard
          title="Period Average"
          value={summary.average}
          unit="mg/dL"
          subtitle={summary.average ? "Average across all logged slots" : "No readings recorded"}
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Active Days"
          value={`${summary.daysWithReadings} / ${period.totalDays}`}
          subtitle="Days with at least 1 reading"
          icon={Calendar}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <MetricCard
          title="Compliance Rate"
          value={`${summary.complianceRate}%`}
          subtitle="Of recommended 4 daily slots"
          icon={BarChart2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Range Extremes (Min & Max) */}
      {hasReadings && (summary.min || summary.max) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.min && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Lowest Reading Recorded
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {summary.min.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">mg/dL</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {SLOT_CONFIG[summary.min.slot]?.label || summary.min.slot} on{" "}
                  <span className="font-medium text-slate-700">{summary.min.recordedDate}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowDown className="w-5 h-5" />
              </div>
            </div>
          )}

          {summary.max && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Highest Reading Recorded
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {summary.max.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">mg/dL</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {SLOT_CONFIG[summary.max.slot]?.label || summary.max.slot} on{" "}
                  <span className="font-medium text-slate-700">{summary.max.recordedDate}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ArrowUp className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Timeline Chart */}
      <MonthlyGlucoseChart
        timeline={report.dailyTimeline || []}
        title={isMtd ? "Month-to-Date Glucose Trend" : "Previous Month Glucose Trend"}
      />

      {/* Per-Slot Averages Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1">
          Slot Average Glucose Breakdown
        </h4>
        <p className="text-xs text-slate-500 mb-5">
          Mean glucose levels calculated independently for each time slot over this period.
        </p>

        {!hasReadings ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-semibold text-slate-800">No readings recorded</h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no glucose readings logged for this period. As readings are recorded,
              slot averages and compliance statistics will populate here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(slotAverages) as Slot[]).map((slotKey) => {
              const item = slotAverages[slotKey];
              const config = SLOT_CONFIG[slotKey];
              return (
                <div
                  key={slotKey}
                  className="bg-slate-50/80 rounded-xl border border-slate-200/70 p-4 flex flex-col justify-between"
                >
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800">{item.label}</h5>
                    <p className="text-[11px] text-slate-400 mb-3">{config.timing}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {item.average !== null ? item.average : "—"}
                      </span>
                      {item.average !== null && (
                        <span className="text-xs font-bold text-slate-400">mg/dL</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      {item.count} {item.count === 1 ? "reading" : "readings"} logged
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

