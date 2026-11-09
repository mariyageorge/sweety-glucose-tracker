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
import { TrendingUp, Activity } from "lucide-react";

interface MonthlyGlucoseChartProps {
  timeline?: DailyTimelinePoint[];
  title?: string;
  subtitle?: string;
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
    <div className="bg-slate-900/95 backdrop-blur-xs text-white rounded-xl shadow-xl px-3.5 py-2.5 text-xs border border-slate-800">
      <div className="font-semibold text-slate-200">{data.date}</div>
      {hasValue ? (
        <div className="mt-1 space-y-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-teal-400 font-extrabold text-base">{data.average}</span>
            <span className="text-[11px] text-slate-400 font-semibold">mg/dL</span>
            <span className="text-[10px] text-slate-400">(daily mean)</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {data.count} {data.count === 1 ? "reading logged" : "readings logged"}
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-[11px] mt-1 italic">No readings logged on this day</div>
      )}
    </div>
  );
};

export const MonthlyGlucoseChart: React.FC<MonthlyGlucoseChartProps> = ({
  timeline = [],
  title = "Monthly Glucose Trend",
  subtitle = "Day-by-day mean blood glucose progression across the selected monthly period.",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block shadow-xs"></span>
          <span>Daily Mean (mg/dL)</span>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="py-14 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-800">No trend data available</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Log readings to visualize your daily glucose averages across this calendar period.
          </p>
        </div>
      ) : (
        <>
          <div className="h-64 sm:h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  interval="preserveStartEnd"
                  tickMargin={8}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  domain={["auto", "auto"]}
                  unit=" mg"
                  tickMargin={6}
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
                  isAnimationActive={true}
                  animationDuration={600}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
            <span>X-axis: Day of Month &bull; Y-axis: Blood Glucose (mg/dL)</span>
            <span>Unconnected gaps denote days without recorded readings (no interpolation)</span>
          </div>
        </>
      )}
    </div>
  );
};
