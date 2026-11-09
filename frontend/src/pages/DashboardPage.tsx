import React, { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Activity, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Slot, DailyReport, Reading } from "../types";
import { reportsApi, readingsApi, getErrorMessage } from "../services/api";
import { SlotCard } from "../components/readings/SlotCard";
import { ReadingModal } from "../components/readings/ReadingModal";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { MetricCard } from "../components/reports/MetricCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Toast, ToastMessage } from "../components/common/Toast";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [recentReadings, setRecentReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [targetSlot, setTargetSlot] = useState<Slot | undefined>(undefined);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toasts
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

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [report, readings] = await Promise.all([
        reportsApi.getDailyReport(selectedDate),
        readingsApi.getReadings(), // fetches all recent readings
      ]);
      setDailyReport(report);
      setRecentReadings(readings.slice(0, 5)); // top 5 recent readings
    } catch (err) {
      addToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Log on specific slot
  const handleLogSlot = (slot: Slot) => {
    setEditingReading(null);
    setTargetSlot(slot);
    setModalOpen(true);
  };

  // Handle Edit on specific reading ID
  const handleEditReading = async (readingId: string) => {
    try {
      const reading = await readingsApi.getReadingById(readingId);
      setEditingReading(reading);
      setTargetSlot(reading.slot);
      setModalOpen(true);
    } catch (err) {
      addToast("error", getErrorMessage(err));
    }
  };

  // Handle Delete trigger
  const handleDeleteTrigger = (readingId: string) => {
    setDeletingId(readingId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await readingsApi.deleteReading(deletingId);
      addToast("success", "Glucose reading deleted successfully.");
      setDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      addToast("error", getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Welcome & Date Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.name.split(" ")[0]} 👋
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track and monitor your daily glucose readings across all 4 slots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Interactive Date Selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="date"
              max={getTodayString()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setEditingReading(null);
              setTargetSlot(undefined);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Reading
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading daily readings..." />
        </div>
      ) : dailyReport ? (
        <>
          {/* Daily 4-Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Daily Slots"
              value={`${dailyReport.summary.totalLogged} / 4`}
              subtitle={`${dailyReport.summary.completionRate}% completion`}
              icon={Calendar}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
            />
            <MetricCard
              title="Daily Average"
              value={dailyReport.summary.average}
              unit="mg/dL"
              subtitle={
                dailyReport.summary.average
                  ? "Average across logged slots"
                  : "No readings yet"
              }
              icon={Activity}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Lowest"
              value={dailyReport.summary.min}
              unit="mg/dL"
              subtitle={dailyReport.summary.min ? "Lowest measured value" : "—"}
              icon={ArrowDown}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <MetricCard
              title="Highest"
              value={dailyReport.summary.max}
              unit="mg/dL"
              subtitle={dailyReport.summary.max ? "Highest measured value" : "—"}
              icon={ArrowUp}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
          </div>

          {/* 4 Measurement Slot Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daily Slots for {selectedDate}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  One reading per slot per day • Max four readings daily
                </p>
              </div>
              <button
                onClick={fetchData}
                title="Refresh readings"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dailyReport.slots.map((status) => (
                <SlotCard
                  key={status.slot}
                  status={status}
                  selectedDate={selectedDate}
                  onLog={handleLogSlot}
                  onEdit={handleEditReading}
                  onDelete={handleDeleteTrigger}
                />
              ))}
            </div>
          </div>

          {/* Recent Readings Feed */}
          {recentReadings.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Recent Readings</h3>
                <span className="text-xs font-semibold text-slate-400">
                  Last {recentReadings.length} entries
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {recentReadings.map((r) => (
                  <div
                    key={r.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-teal-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {r.slot.replace("_", " ")}
                        </p>
                        <p className="text-xs text-slate-400">{r.recordedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {r.notes && (
                        <span className="text-xs text-slate-500 italic max-w-xs truncate hidden sm:inline">
                          "{r.notes}"
                        </span>
                      )}
                      <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-bold text-slate-900 text-sm">
                        {r.value} <span className="text-xs text-slate-400 font-medium">mg/dL</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Reading Modal (Add/Edit) */}
      <ReadingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          addToast("success", editingReading ? "Reading updated successfully!" : "Reading recorded successfully!");
          fetchData();
        }}
        initialReading={editingReading}
        defaultDate={selectedDate}
        defaultSlot={targetSlot}
      />

      {/* Confirmation Modal (Delete) */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Blood Glucose Reading"
        message="Are you sure you want to delete this glucose reading? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

