import React, { useState, useEffect, useCallback } from "react";
import { Calendar, RefreshCw } from "lucide-react";
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
    <div className="space-y-6 animate-in fade-in">
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Header Card with Segmented Controls & Date Filter */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Glucose Reports & Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review daily slot tracking, month-to-date compliance, and previous month trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Tab Buttons */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "daily"
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab("mtd")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "mtd"
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Month-to-Date
            </button>
            <button
              onClick={() => setActiveTab("prev")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "prev"
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Previous Month
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              max={getTodayString()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={fetchReport}
            title="Refresh Report"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Generating glucose analytics..." />
        </div>
      ) : (
        <>
          {activeTab === "daily" && dailyReport && (
            <DailyReportView report={dailyReport} />
          )}

          {activeTab === "mtd" && mtdReport && (
            <MonthlyReportView
              report={mtdReport}
              title="Month-to-Date Performance"
              subtitle={`Detailed analytics from the 1st of the month through ${selectedDate}.`}
            />
          )}

          {activeTab === "prev" && prevReport && (
            <MonthlyReportView
              report={prevReport}
              title="Previous Month Performance"
              subtitle={`Complete monthly analytics for ${prevReport.period.monthName}.`}
            />
          )}
        </>
      )}
    </div>
  );
};

