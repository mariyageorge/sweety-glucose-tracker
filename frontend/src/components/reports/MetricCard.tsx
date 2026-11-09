import React from "react";
import { LucideIcon } from "lucide-react";

export type MetricTheme = "blue" | "mint" | "pink" | "yellow" | "lavender" | "rose" | "ivory";

interface MetricCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  theme?: MetricTheme;
  iconBg?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  theme = "blue",
}) => {
  const themeConfig: Record<
    MetricTheme,
    { bg: string; border: string; iconBg: string; iconColor: string; shadow: string; labelColor: string }
  > = {
    blue: {
      bg: "bg-[#DDECFB]",
      border: "border-[#BCDDF8]",
      iconBg: "bg-white/80",
      iconColor: "text-[#25588C]",
      shadow: "shadow-pastel-blue",
      labelColor: "text-[#25588C]",
    },
    mint: {
      bg: "bg-[#E3F0E5]",
      border: "border-[#C6E2CB]",
      iconBg: "bg-white/80",
      iconColor: "text-[#2E5436]",
      shadow: "shadow-pastel-mint",
      labelColor: "text-[#2E5436]",
    },
    pink: {
      bg: "bg-[#FCE8E6]",
      border: "border-[#F7CCD0]",
      iconBg: "bg-white/80",
      iconColor: "text-[#8E3737]",
      shadow: "shadow-pastel-blush",
      labelColor: "text-[#8E3737]",
    },
    yellow: {
      bg: "bg-[#FBE8C9]",
      border: "border-[#F6D39D]",
      iconBg: "bg-white/80",
      iconColor: "text-[#825712]",
      shadow: "shadow-pastel-yellow",
      labelColor: "text-[#825712]",
    },
    lavender: {
      bg: "bg-[#E8E5FA]",
      border: "border-[#D5CEF5]",
      iconBg: "bg-white/80",
      iconColor: "text-[#4E3E8C]",
      shadow: "shadow-pastel-lavender",
      labelColor: "text-[#4E3E8C]",
    },
    rose: {
      bg: "bg-[#F8DDE8]",
      border: "border-[#F2BFD6]",
      iconBg: "bg-white/80",
      iconColor: "text-[#8A345C]",
      shadow: "shadow-pastel-rose",
      labelColor: "text-[#8A345C]",
    },
    ivory: {
      bg: "bg-[#FFF8F3]",
      border: "border-[#F5E6DA]",
      iconBg: "bg-white/80",
      iconColor: "text-[#8A5230]",
      shadow: "shadow-pastel-card",
      labelColor: "text-[#8A5230]",
    },
  };

  const currentTheme = themeConfig[theme] || themeConfig.blue;

  return (
    <div
      className={`${currentTheme.bg} ${currentTheme.border} ${currentTheme.shadow} rounded-[1.8rem] border p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <span
            className={`text-[11px] font-extrabold uppercase tracking-wider ${currentTheme.labelColor}`}
          >
            {title}
          </span>
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-white/60 ${currentTheme.iconBg} ${currentTheme.iconColor}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#342D38] tracking-tight">
            {value !== null && value !== undefined ? value : "—"}
          </span>
          {unit && value !== null && value !== undefined && (
            <span className="text-xs font-bold text-[#342D38]/60 uppercase tracking-wider">
              {unit}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-[#342D38]/70 mt-3 font-semibold leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
