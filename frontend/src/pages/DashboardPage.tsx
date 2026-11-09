import React, { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Activity, ArrowDown, ArrowUp, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Slot, DailyReport, Reading, SLOT_CONFIG } from "../types";
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
        readingsApi.getReadings(),
      ]);
      setDailyReport(report);
      setRecentReadings(readings.slice(0, 5));
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

  const firstName = user?.name ? user.name.split(" ")[0] : "Friend";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Top Welcome Header: Soft Lavender / Rose Pastel Container */}
      <div className="bg-[#E8E5FA] p-6 sm:p-7 rounded-[2rem] border border-[#D5CEF5] shadow-pastel-lavender flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#342D38] tracking-tight">
              Hello, {firstName}
            </h2>
            <Sparkles className="w-5 h-5 text-[#4E3E8C]" />
          </div>
          <p className="text-xs text-[#342D38]/80 font-bold mt-1">
            Here is your daily blood glucose rhythm and slots for{" "}
            <span className="underline decoration-[#4E3E8C]/40 underline-offset-2">{selectedDate}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Date Selector */}
          <div className="flex items-center gap-2 bg-white/90 px-3.5 py-2 rounded-2xl border border-[#D5CEF5] shadow-xs">
            <Calendar className="w-4 h-4 text-[#4E3E8C] shrink-0" />
            <input
              type="date"
              max={getTodayString()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[#342D38] focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setEditingReading(null);
              setTargetSlot(undefined);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold text-white bg-[#4E3E8C] hover:bg-[#3D2E73] rounded-2xl shadow-pastel-lavender transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Reading</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Gathering your daily rhythm..." />
        </div>
      ) : dailyReport ? (
        <>
          {/* Daily 4-Metric Summary Cards with Pastel Themes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Daily Slots"
              value={`${dailyReport.summary.totalLogged} / 4`}
              subtitle={`${dailyReport.summary.completionRate}% of daily rhythm logged`}
              icon={Calendar}
              theme="blue"
            />
            <MetricCard
              title="Daily Average"
              value={dailyReport.summary.average}
              unit="mg/dL"
              subtitle={
                dailyReport.summary.average
                  ? "Mean level across recorded slots"
                  : "No readings yet today"
              }
              icon={Activity}
              theme="mint"
            />
            <MetricCard
              title="Lowest Value"
              value={dailyReport.summary.min}
              unit="mg/dL"
              subtitle={dailyReport.summary.min ? "Lowest measured level" : "—"}
              icon={ArrowDown}
              theme="pink"
            />
            <MetricCard
              title="Highest Value"
              value={dailyReport.summary.max}
              unit="mg/dL"
              subtitle={dailyReport.summary.max ? "Highest measured level" : "—"}
              icon={ArrowUp}
              theme="yellow"
            />
          </div>

          {/* 4 Measurement Slot Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#342D38] tracking-tight">
                  Daily Rhythm &bull; {selectedDate}
                </h3>
                <p className="text-xs text-[#342D38]/70 font-semibold mt-0.5">
                  One reading per slot &bull; Maximum four readings daily
                </p>
              </div>
              <button
                onClick={fetchData}
                title="Refresh readings"
                className="p-2 text-[#342D38]/60 hover:text-[#342D38] bg-white/70 hover:bg-white rounded-xl transition-colors border border-black/5"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Recent Readings Feed: Soft Warm Pastel Card */}
          {recentReadings.length > 0 && (
            <div className="bg-[#FFF8F3] rounded-[2rem] border border-[#F5E6DA] p-6 sm:p-7 shadow-pastel-card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5E6DA]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8A5230]" />
                  <h3 className="text-sm font-extrabold text-[#342D38] tracking-tight">
                    Recent Readings
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#8A5230]">
                  Last {recentReadings.length} entries
                </span>
              </div>
              <div className="divide-y divide-[#F5E6DA]/70">
                {recentReadings.map((r) => {
                  const config = SLOT_CONFIG[r.slot];
                  return (
                    <div
                      key={r.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/60 rounded-xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#F5E6DA] text-[#8A5230] flex items-center justify-center text-xs font-extrabold shadow-xs">
                          {config?.label.charAt(0) || "R"}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#342D38]">
                            {config?.label || r.slot}
                          </p>
                          <p className="text-[11px] font-semibold text-[#342D38]/60">{r.recordedDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {r.notes && (
                          <span className="text-xs text-[#342D38]/70 italic max-w-xs truncate hidden sm:inline font-medium">
                            "{r.notes}"
                          </span>
                        )}
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-[#F5E6DA] font-extrabold text-[#342D38] text-xs shadow-xs">
                          {r.value} <span className="text-[10px] text-[#342D38]/60 font-bold uppercase">mg/dL</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        title="Delete Glucose Reading"
        message="Are you sure you want to remove this measurement? This action cannot be reversed."
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
