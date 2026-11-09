export type Slot =
  | "MORNING_FASTING"
  | "AFTER_BREAKFAST"
  | "AFTER_LUNCH"
  | "AFTER_DINNER";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Reading {
  id: string;
  userId: string;
  value: number; // in mg/dL
  slot: Slot;
  recordedDate: string; // YYYY-MM-DD
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SlotStatus {
  slot: Slot;
  label: string;
  logged: boolean;
  reading: {
    id: string;
    value: number;
    notes?: string | null;
    createdAt: string;
  } | null;
}

export interface DailyReport {
  date: string;
  summary: {
    totalLogged: number;
    totalSlots: number;
    completionRate: number; // 0 - 100
    average: number | null;
    min: number | null;
    max: number | null;
    unit: string;
  };
  slots: SlotStatus[];
  hasReadings: boolean;
}

export interface SlotAverageItem {
  label: string;
  count: number;
  average: number | null;
}

export interface DailyTimelinePoint {
  day: number;
  date: string;
  average: number | null;
  count: number;
}

export interface MonthToDateReport {
  period: {
    type: "month-to-date";
    startDate: string;
    endDate: string;
    selectedDate: string;
    totalDays: number;
    expectedReadings: number;
  };
  summary: {
    totalReadings: number;
    average: number | null;
    min: { value: number; slot: Slot; recordedDate: string } | null;
    max: { value: number; slot: Slot; recordedDate: string } | null;
    unit: string;
    daysWithReadings: number;
    complianceRate: number;
  };
  slotAverages: Record<Slot, SlotAverageItem>;
  dailyTimeline?: DailyTimelinePoint[];
  hasReadings: boolean;
}

export interface PreviousMonthReport {
  period: {
    type: "previous-month";
    startDate: string;
    endDate: string;
    year: number;
    month: number;
    monthName: string;
    totalDays: number;
    expectedReadings: number;
  };
  summary: {
    totalReadings: number;
    average: number | null;
    min: { value: number; slot: Slot; recordedDate: string } | null;
    max: { value: number; slot: Slot; recordedDate: string } | null;
    unit: string;
    daysWithReadings: number;
    complianceRate: number;
  };
  slotAverages: Record<Slot, SlotAverageItem>;
  dailyTimeline?: DailyTimelinePoint[];
  hasReadings: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

export const SLOT_CONFIG: Record<
  Slot,
  { label: string; timing: string; description: string }
> = {
  MORNING_FASTING: {
    label: "Morning (fasting)",
    timing: "Wake up / Before food",
    description: "Fasting blood glucose before breakfast",
  },
  AFTER_BREAKFAST: {
    label: "After breakfast",
    timing: "1-2 hours post-breakfast",
    description: "Postprandial morning check",
  },
  AFTER_LUNCH: {
    label: "After lunch",
    timing: "1-2 hours post-lunch",
    description: "Midday post-meal check",
  },
  AFTER_DINNER: {
    label: "After dinner",
    timing: "1-2 hours post-dinner",
    description: "Evening post-meal check",
  },
};

