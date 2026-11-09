import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DailyTimelinePoint } from "../../types";
import { TrendingUp, Sparkles, CalendarDays } from "lucide-react";

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

  // Format date display
  const formatDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      return dateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-pastel-lavender px-4 py-3 text-xs border border-[#D5CEF5] text-[#342D38] animate-in fade-in duration-150">
      <div className="flex items-center gap-1.5 font-bold text-[#4E3E8C] pb-2 border-b border-[#E8E5FA]">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>{formatDateDisplay(data.date)}</span>
      </div>

      {hasValue ? (
        <div className="mt-2.5 space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#2E5436] tracking-tight">
              {data.average}
            </span>
            <span className="text-xs font-bold text-[#342D38]/60 uppercase tracking-wider">
              mg/dL
            </span>
            <span className="text-[10px] font-bold text-[#2E5436] bg-[#E3F0E5] px-2 py-0.5 rounded-full border border-[#C6E2CB] ml-1">
              daily mean
            </span>
          </div>
          <div className="text-[11px] font-medium text-[#342D38]/70">
            {data.count} {data.count === 1 ? "reading recorded" : "readings recorded"}
          </div>
        </div>
      ) : (
        <div className="text-[#342D38]/60 text-xs mt-2 italic font-medium">
          No readings logged on this day
        </div>
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
    <div className="bg-[#E8E5FA]/60 rounded-[2rem] border border-[#D5CEF5] p-6 sm:p-7 shadow-pastel-lavender transition-all duration-300">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-[#D5CEF5] flex items-center justify-center text-[#4E3E8C] shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-base font-extrabold text-[#342D38] tracking-tight">{title}</h4>
          </div>
          <p className="text-xs font-semibold text-[#342D38]/70 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#4E3E8C] bg-white/90 px-3.5 py-1.5 rounded-2xl border border-[#D5CEF5] self-start sm:self-auto shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E5436] inline-block shadow-xs"></span>
          <span>Daily Mean (mg/dL)</span>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="py-16 text-center bg-white/60 rounded-2xl border border-dashed border-[#D5CEF5]">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#4E3E8C] border border-[#D5CEF5] flex items-center justify-center mx-auto mb-3 shadow-warm-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#342D38]">No monthly readings to chart yet</p>
          <p className="text-xs text-[#342D38]/60 mt-1 max-w-sm mx-auto font-medium">
            Log your daily measurement slots to watch your monthly glucose rhythm take shape.
          </p>
        </div>
      ) : (
        <>
          <div className="h-64 sm:h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  {/* Rich Mint/Sage Area Fill */}
                  <linearGradient id="pastelMintGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E5436" stopOpacity={0.28} />
                    <stop offset="85%" stopColor="#E3F0E5" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#E3F0E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#D5CEF5" vertical={false} />

                <XAxis
                  dataKey="day"
                  stroke="#8C7CA6"
                  tick={{ fontSize: 11, fill: "#4E3E8C", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: "#D5CEF5" }}
                  interval="preserveStartEnd"
                  tickMargin={10}
                />

                <YAxis
                  stroke="#8C7CA6"
                  tick={{ fontSize: 11, fill: "#4E3E8C", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: "#D5CEF5" }}
                  domain={["auto", "auto"]}
                  unit=" mg"
                  tickMargin={8}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="#2E5436"
                  strokeWidth={3}
                  fill="url(#pastelMintGradient)"
                  connectNulls={false}
                  dot={(props: any) => {
                    if (props.payload.average === null) {
                      return <React.Fragment key={props.key || `empty-${props.index}`} />;
                    }
                    return (
                      <circle
                        key={props.key || `dot-${props.index}`}
                        cx={props.cx}
                        cy={props.cy}
                        r={4.5}
                        fill="#FFFFFF"
                        stroke="#2E5436"
                        strokeWidth={2.75}
                      />
                    );
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#2E5436",
                    stroke: "#FFFFFF",
                    strokeWidth: 3.5,
                  }}
                  isAnimationActive={true}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#D5CEF5]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] font-bold text-[#4E3E8C]">
            <span>Horizontal: Calendar Day of Month &bull; Vertical: Blood Glucose (mg/dL)</span>
            <span>Gaps denote unrecorded days (no artificial data interpolation)</span>
          </div>
        </>
      )}
    </div>
  );
};
