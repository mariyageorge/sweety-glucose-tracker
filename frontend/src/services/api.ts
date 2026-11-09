import axios from "axios";
import {
  User,
  Reading,
  DailyReport,
  MonthToDateReport,
  PreviousMonthReport,
  ApiResponse,
  PaginationMetadata,
  Slot,
} from "../types";

/**
 * Sweety Centralized API Client
 * 
 * SECURITY BEST PRACTICE:
 * `withCredentials: true` ensures that the browser automatically attaches
 * the HttpOnly session cookie (`jwt`) to all outgoing requests.
 * The token is never read or stored in localStorage.
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for HttpOnly session cookie delivery
});

// Helper to extract clean user-friendly error messages from backend responses
export function getErrorMessage(error: any): string {
  if (error.response?.data?.error) {
    if (error.response.data.details && Array.isArray(error.response.data.details)) {
      return error.response.data.details.map((d: any) => d.message).join(". ");
    }
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected network error occurred. Please try again.";
}

// ----------------------------------------------------
// Authentication API
// ----------------------------------------------------
export const authApi = {
  async signup(data: { name: string; email: string; password: string }): Promise<User> {
    const res = await api.post<ApiResponse<User>>("/auth/signup", data);
    return res.data.data!;
  },

  async login(data: { email: string; password: string }): Promise<User> {
    const res = await api.post<ApiResponse<User>>("/auth/login", data);
    return res.data.data!;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data!;
  },
};

// ----------------------------------------------------
// Readings API
// ----------------------------------------------------
export interface CreateReadingPayload {
  value: number;
  slot: Slot;
  recordedDate: string;
  notes?: string;
}

export interface UpdateReadingPayload {
  value?: number;
  slot?: Slot;
  recordedDate?: string;
  notes?: string;
}

export interface GetReadingsParams {
  date?: string;
  page?: number;
  limit?: number;
}

export const readingsApi = {
  async getReadings(paramsOrDate?: string | GetReadingsParams): Promise<Reading[]> {
    const params = typeof paramsOrDate === "string" ? { date: paramsOrDate } : (paramsOrDate || {});
    const res = await api.get<ApiResponse<Reading[]>>("/readings", { params });
    return res.data.data || [];
  },

  async getPaginatedReadings(params?: GetReadingsParams): Promise<{ readings: Reading[]; pagination: PaginationMetadata }> {
    const res = await api.get<ApiResponse<Reading[]>>("/readings", { params });
    return {
      readings: res.data.data || [],
      pagination: res.data.pagination || {
        total: res.data.data?.length || 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  async getReadingById(id: string): Promise<Reading> {
    const res = await api.get<ApiResponse<Reading>>(`/readings/${id}`);
    return res.data.data!;
  },

  async createReading(payload: CreateReadingPayload): Promise<Reading> {
    const res = await api.post<ApiResponse<Reading>>("/readings", payload);
    return res.data.data!;
  },

  async updateReading(id: string, payload: UpdateReadingPayload): Promise<Reading> {
    const res = await api.patch<ApiResponse<Reading>>(`/readings/${id}`, payload);
    return res.data.data!;
  },

  async deleteReading(id: string): Promise<void> {
    await api.delete(`/readings/${id}`);
  },
};

// ----------------------------------------------------
// Reports API
// ----------------------------------------------------
export const reportsApi = {
  async getDailyReport(date?: string): Promise<DailyReport> {
    const params = date ? { date } : {};
    const res = await api.get<ApiResponse<DailyReport>>("/reports/daily", { params });
    return res.data.data!;
  },

  async getMonthToDateReport(date?: string): Promise<MonthToDateReport> {
    const params = date ? { date } : {};
    const res = await api.get<ApiResponse<MonthToDateReport>>("/reports/month-to-date", { params });
    return res.data.data!;
  },

  async getPreviousMonthReport(date?: string): Promise<PreviousMonthReport> {
    const params = date ? { date } : {};
    const res = await api.get<ApiResponse<PreviousMonthReport>>("/reports/previous-month", { params });
    return res.data.data!;
  },
};

