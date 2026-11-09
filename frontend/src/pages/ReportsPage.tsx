import React, { useState, useEffect, useCallback } from "react";
import { Calendar, RefreshCw, Sparkles } from "lucide-react";
import { DailyReport, MonthToDateReport, PreviousMonthReport } from "../types";
import { reportsApi, getErrorMessage } from "../services/api";
import { DailyReportView } from "../components/reports/DailyReportView";
import { MonthlyReportView } from "../components/reports/MonthlyReportView";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Toast, ToastMessage } from "../components/common/Toast";

type ReportTab = "daily" | "mtd" | "prev";

export const ReportsPage: React.FC = () => {
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [activeTab, setActiveTab] = useState<ReportTab>("daily");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Report States
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [mtdReport, setMtdReport] = useState<MonthToDateReport | null>(null);
  const [prevReport, setPrevReport] = useState<PreviousMonthReport | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Report based on active tab and selectedDate
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "daily") {
        const data = await reportsApi.getDailyReport(selectedDate);
        setDailyReport(data);
      } else if (activeTab === "mtd") {
        const data = await reportsApi.getMonthToDateReport(selectedDate);
        setMtdReport(data);
      } else if (activeTab === "prev") {
        const data = await reportsApi.getPreviousMonthReport(selectedDate);
        setPrevReport(data);
      }
    } catch (err) {
      addToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Header Section: Soft Lavender Background */}
      <div className="bg-[#E8E5FA] p-6 sm:p-7 rounded-[2rem] border border-[#D5CEF5] shadow-pastel-lavender flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#342D38] tracking-tight">
              Glucose Reports & Rhythm
            </h2>
            <Sparkles className="w-5 h-5 text-[#4E3E8C]" />
          </div>
          <p className="text-xs text-[#342D38]/80 font-bold mt-1">
            Review daily slot tracking, month-to-date compliance, and previous calendar month patterns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Tab Buttons */}
          <div className="bg-white/80 p-1.5 rounded-2xl flex items-center border border-[#D5CEF5] shadow-xs">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === "daily"
                  ? "bg-[#4E3E8C] text-white shadow-pastel-lavender"
                  : "text-[#4E3E8C] hover:bg-white/70"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab("mtd")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === "mtd"
                  ? "bg-[#4E3E8C] text-white shadow-pastel-lavender"
                  : "text-[#4E3E8C] hover:bg-white/70"
              }`}
            >
              Month to Date
            </button>
            <button
              onClick={() => setActiveTab("prev")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === "prev"
                  ? "bg-[#4E3E8C] text-white shadow-pastel-lavender"
                  : "text-[#4E3E8C] hover:bg-white/70"
              }`}
            >
              Previous Month
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-white/90 px-3.5 py-2 rounded-2xl border border-[#D5CEF5] shadow-xs">
            <Calendar className="w-4 h-4 text-[#4E3E8C]" />
            <input
              type="date"
              max={getTodayString()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#342D38] focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={fetchReport}
            title="Refresh report"
            className="p-2.5 text-[#4E3E8C] bg-white/90 hover:bg-white rounded-2xl transition-all border border-[#D5CEF5] shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Report Body */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Analyzing glucose patterns..." />
        </div>
      ) : (
        <>
          {activeTab === "daily" && dailyReport && (
            <DailyReportView report={dailyReport} />
          )}

          {activeTab === "mtd" && mtdReport && (
            <MonthlyReportView
              report={mtdReport}
              title="Month-to-Date Health Rhythm"
              subtitle={`Analysis from ${mtdReport.period.startDate} through ${mtdReport.period.endDate} (${mtdReport.period.totalDays} days)`}
            />
          )}

          {activeTab === "prev" && prevReport && (
            <MonthlyReportView
              report={prevReport}
              title={`Full Calendar Summary &bull; ${prevReport.period.monthName}`}
              subtitle={`Complete previous calendar month from ${prevReport.period.startDate} to ${prevReport.period.endDate}`}
            />
          )}
        </>
      )}
    </div>
  );
};
