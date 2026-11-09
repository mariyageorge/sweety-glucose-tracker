import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DailyTimelinePoint } from "../../types";
import { TrendingUp, AlertCircle } from "lucide-react";

interface MonthlyGlucoseChartProps {
  timeline?: DailyTimelinePoint[];
  title?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number | null; payload: DailyTimelinePoint & { dayLabel: string } }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const hasValue = data.average !== null;

  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-lg px-3.5 py-2.5 text-xs border border-slate-800">
      <div className="font-semibold text-slate-200">{data.date}</div>
      {hasValue ? (
        <div className="mt-1 space-y-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-teal-400 font-bold text-sm">{data.average}</span>
            <span className="text-[11px] text-slate-400 font-medium">mg/dL</span>
            <span className="text-[11px] text-slate-400">(daily avg)</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {data.count} {data.count === 1 ? "reading logged" : "readings logged"}
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-[11px] mt-1">No readings logged</div>
      )}
    </div>
  );
};

export const MonthlyGlucoseChart: React.FC<MonthlyGlucoseChartProps> = ({
  timeline = [],
  title = "Monthly Daily Average Trend",
}) => {
  const chartData = React.useMemo(() => {
    return timeline.map((pt) => ({
      ...pt,
      dayLabel: `Day ${pt.day}`,
    }));
  }, [timeline]);

  const hasAnyData = React.useMemo(() => {
    return timeline.some((pt) => pt.average !== null);
  }, [timeline]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Day-by-day mean glucose values across the period. Days without readings are left unplotted.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
          <span>Daily Mean (mg/dL)</span>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="py-12 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No trend data available</p>
          <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
            Log readings to observe your daily average progression over this month.
          </p>
        </div>
      ) : (
        <>
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  domain={["auto", "auto"]}
                  unit=" mg"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  connectNulls={false}
                  dot={{ r: 3, fill: "#0d9488", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#0f766e", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>X-axis: Day of Month</span>
            <span>Unconnected gaps reflect days without logged readings</span>
          </div>
        </>
      )}
    </div>
  );
};
