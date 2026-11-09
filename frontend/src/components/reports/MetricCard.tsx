import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconBg = "bg-teal-50",
  iconColor = "text-teal-600",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value !== null && value !== undefined ? value : "—"}
        </span>
        {unit && value !== null && value !== undefined && (
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {unit}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};

