import React, { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Filter, X, Edit2, Trash2, ChevronLeft, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import { Reading, SLOT_CONFIG, Slot, PaginationMetadata } from "../types";
import { readingsApi, getErrorMessage } from "../services/api";
import { ReadingModal } from "../components/readings/ReadingModal";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Toast, ToastMessage } from "../components/common/Toast";

export const ReadingsPage: React.FC = () => {
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [readings, setReadings] = useState<Reading[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast state
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

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await readingsApi.getPaginatedReadings({
        date: dateFilter || undefined,
        page,
        limit,
      });
      setReadings(res.readings);
      setPagination(res.pagination);
    } catch (err) {
      addToast("error", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dateFilter, page, limit]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleEdit = (reading: Reading) => {
    setEditingReading(reading);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await readingsApi.deleteReading(deletingId);
      addToast("success", "Glucose entry removed successfully.");
      setDeleteModalOpen(false);
      fetchReadings();
    } catch (err) {
      addToast("error", getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  const getSlotBadge = (slot: Slot) => {
    switch (slot) {
      case "MORNING_FASTING":
        return "bg-[#FCE8E6] text-[#8E3737] border-[#F7CCD0]";
      case "AFTER_BREAKFAST":
        return "bg-[#FBE8C9] text-[#825712] border-[#F6D39D]";
      case "AFTER_LUNCH":
        return "bg-[#E3F0E5] text-[#2E5436] border-[#C6E2CB]";
      case "AFTER_DINNER":
        return "bg-[#E8E5FA] text-[#4E3E8C] border-[#D5CEF5]";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Page Header: Pastel Baby Blue Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-[#DDECFB] p-6 sm:p-7 rounded-[2rem] border border-[#BCDDF8] shadow-pastel-blue">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#25588C] tracking-tight">
              Glucose Journal
            </h2>
            <Sparkles className="w-5 h-5 text-[#25588C]" />
          </div>
          <p className="text-xs text-[#25588C]/80 font-bold mt-1">
            Review, filter, edit, or remove your recorded blood glucose measurements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white/90 px-3.5 py-2 rounded-2xl border border-[#BCDDF8] shadow-xs">
            <Filter className="w-3.5 h-3.5 text-[#25588C]" />
            <input
              type="date"
              max={getTodayString()}
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-extrabold text-[#342D38] focus:outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => {
                  setDateFilter("");
                  setPage(1);
                }}
                title="Clear filter"
                className="text-[#25588C] hover:text-black ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setEditingReading(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold text-white bg-[#25588C] hover:bg-[#1E4873] rounded-2xl shadow-pastel-blue transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reading</span>
          </button>
        </div>
      </div>

      {/* Readings Table / Card List */}
      <div className="bg-white rounded-[2rem] border border-stone-200/80 overflow-hidden shadow-pastel-card">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" label="Retrieving reading history..." />
          </div>
        ) : readings.length === 0 ? (
          <div className="py-20 text-center px-4 bg-[#FFF8F3]/60">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#F5E6DA] text-[#8A5230] flex items-center justify-center mx-auto mb-3.5 shadow-warm-sm">
              <BookOpen className="w-7 h-7" />
            </div>
            <h4 className="text-base font-extrabold text-[#342D38]">No entries recorded</h4>
            <p className="text-xs text-[#342D38]/70 max-w-sm mx-auto mt-1 mb-5 font-semibold leading-relaxed">
              {dateFilter
                ? `No readings found for ${dateFilter}. Clear the date filter to review all logged entries.`
                : "You haven't logged any glucose measurements yet. Start building your rhythm today."}
            </p>
            {dateFilter ? (
              <button
                onClick={() => {
                  setDateFilter("");
                  setPage(1);
                }}
                className="px-4 py-2 text-xs font-bold text-[#25588C] bg-[#DDECFB] hover:bg-[#DDECFB]/80 rounded-xl transition-colors border border-[#BCDDF8]"
              >
                Clear Date Filter
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingReading(null);
                  setModalOpen(true);
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#25588C] hover:bg-[#1E4873] rounded-2xl shadow-pastel-blue transition-colors"
              >
                Log First Reading
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 bg-[#DDECFB]/30 text-[11px] font-extrabold text-[#25588C] uppercase tracking-wider">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Measurement Slot</th>
                  <th className="py-4 px-6">Glucose Level</th>
                  <th className="py-4 px-6">Notes</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {readings.map((r) => {
                  const config = SLOT_CONFIG[r.slot];
                  const badgeClasses = getSlotBadge(r.slot);
                  return (
                    <tr key={r.id} className="hover:bg-[#FAF6F0] transition-colors">
                      <td className="py-4 px-6 font-extrabold text-[#342D38] text-xs">
                        {r.recordedDate}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold border shadow-xs ${badgeClasses}`}
                          >
                            {config?.label || r.slot}
                          </span>
                          <span className="text-[11px] font-semibold text-[#342D38]/50 hidden sm:inline">
                            {config?.timing}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-baseline gap-1 bg-[#FAF6F0] px-3.5 py-1.5 rounded-xl font-extrabold text-[#342D38] border border-stone-200/80 text-sm shadow-xs">
                          {r.value}
                          <span className="text-[10px] font-bold text-[#342D38]/60 uppercase">
                            mg/dL
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#342D38]/80 max-w-xs font-medium">
                        {r.notes ? (
                          <span className="italic bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-100 font-semibold">"{r.notes}"</span>
                        ) : (
                          <span className="text-stone-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(r)}
                            title="Edit reading"
                            className="p-2 text-[#342D38] hover:text-[#25588C] hover:bg-[#DDECFB]/50 rounded-xl transition-colors border border-transparent hover:border-[#BCDDF8]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Delete reading"
                            className="p-2 text-[#8E3737] hover:bg-[#FCE8E6] rounded-xl transition-colors border border-transparent hover:border-[#F7CCD0]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-[#DDECFB]/25 border-t border-[#BCDDF8]/60 text-xs">
            <div className="text-[#25588C] font-semibold">
              Showing{" "}
              <span className="font-extrabold text-[#342D38]">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-extrabold text-[#342D38]">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-extrabold text-[#342D38]">{pagination.total}</span> entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-extrabold border transition-all ${
                  pagination.hasPrevPage
                    ? "bg-white text-[#25588C] border-[#BCDDF8] hover:bg-[#DDECFB]/40 shadow-xs"
                    : "bg-white/50 text-stone-300 border-stone-200 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="px-4 py-1.5 bg-[#25588C] text-white font-extrabold rounded-xl shadow-pastel-blue">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-extrabold border transition-all ${
                  pagination.hasNextPage
                    ? "bg-white text-[#25588C] border-[#BCDDF8] hover:bg-[#DDECFB]/40 shadow-xs"
                    : "bg-white/50 text-stone-300 border-stone-200 cursor-not-allowed"
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reading Modal */}
      <ReadingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          addToast("success", editingReading ? "Reading updated successfully!" : "Reading added successfully!");
          fetchReadings();
        }}
        initialReading={editingReading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Blood Glucose Reading"
        message="Are you sure you want to remove this reading? This action cannot be reversed."
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
