import React, { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Filter, X, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Reading, SLOT_CONFIG, PaginationMetadata } from "../types";
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
      addToast("success", "Reading deleted successfully.");
      setDeleteModalOpen(false);
      fetchReadings();
    } catch (err) {
      addToast("error", getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Reading Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review, filter, update, or remove your recorded blood glucose entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              max={getTodayString()}
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => {
                  setDateFilter("");
                  setPage(1);
                }}
                title="Clear filter"
                className="text-slate-400 hover:text-slate-600"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Reading
          </button>
        </div>
      </div>

      {/* Readings Table / Card List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label="Loading readings..." />
          </div>
        ) : readings.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No readings found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {dateFilter
                ? `No readings recorded on ${dateFilter}. Clear the date filter to see all readings.`
                : "You haven't logged any glucose readings yet. Click below to add your first reading."}
            </p>
            {dateFilter ? (
              <button
                onClick={() => setDateFilter("")}
                className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
              >
                Clear Date Filter
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingReading(null);
                  setModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
              >
                Add First Reading
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Measurement Slot</th>
                  <th className="py-3 px-6">Glucose Level</th>
                  <th className="py-3 px-6">Notes</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {readings.map((r) => {
                  const config = SLOT_CONFIG[r.slot];
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {r.recordedDate}
                      </td>
                      <td className="py-3.5 px-6">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {config?.label || r.slot}
                          </p>
                          <p className="text-[11px] text-slate-400">{config?.timing}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-baseline gap-1 bg-slate-100/80 px-2.5 py-1 rounded-lg font-bold text-slate-900">
                          {r.value}
                          <span className="text-[11px] font-semibold text-slate-400 uppercase">
                            mg/dL
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-500 max-w-xs">
                        {r.notes ? (
                          <span className="italic">"{r.notes}"</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(r)}
                            title="Edit reading"
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Delete reading"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-50/70 border-t border-slate-100 text-xs">
            <div className="text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{pagination.total}</span> readings
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                  pagination.hasPrevPage
                    ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs"
                    : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="px-3 py-1.5 bg-white text-slate-700 font-bold border border-slate-200 rounded-xl shadow-xs">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                  pagination.hasNextPage
                    ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs"
                    : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
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
        message="Are you sure you want to delete this reading? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

