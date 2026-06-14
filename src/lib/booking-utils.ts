export const ALLOWED_SESSION_DURATIONS = [30, 60, 90, 120] as const;
export type AllowedSessionDuration = (typeof ALLOWED_SESSION_DURATIONS)[number];

export const SLOT_STEP_MINUTES = 30;
export const BOOKING_CUTOFF_MINUTES = 60;

export type AvailabilitySlot = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  available_date?: string | null;
};

export type BookedSlot = {
  start_at: string;
  duration_min: number;
  status?: "pending" | "confirmed" | "completed" | "cancelled" | null;
};

export type SlotState = {
  time: string;
  start: Date;
  end: Date;
  status: "available" | "booked";
};

export const dateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Price scales linearly with duration.
 * 30 min = rate * 0.5, 60 min = rate * 1.0, 90 min = rate * 1.5, 120 min = rate * 2.0
 */
export const priceForDuration = (baseHourlyRate: number, durationMin: AllowedSessionDuration) =>
  Number(((baseHourlyRate * durationMin) / 60).toFixed(2));

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours * 60) + minutes;
};

const overlaps = (startA: Date, endA: Date, startB: Date, endB: Date) => (
  startA.getTime() < endB.getTime() && startB.getTime() < endA.getTime()
);

/**
 * Merge overlapping/adjacent availability windows for a day so duplicate
 * teacher slots don't produce duplicate time entries in the UI.
 * e.g. [16:00-18:00, 16:00-18:00, 16:00-18:00] → [16:00-18:00]
 */
const mergeWindows = (slots: AvailabilitySlot[]): { start: number; end: number }[] => {
  if (slots.length === 0) return [];
  const windows = slots
    .map((s) => ({ start: timeToMinutes(s.start_time), end: timeToMinutes(s.end_time) }))
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [{ ...windows[0] }];
  for (let i = 1; i < windows.length; i++) {
    const last = merged[merged.length - 1];
    if (windows[i].start <= last.end) {
      last.end = Math.max(last.end, windows[i].end);
    } else {
      merged.push({ ...windows[i] });
    }
  }
  return merged;
};

/**
 * Build slot states for a given date and duration.
 * - Merges duplicate/overlapping availability windows first (fixes duplicate slots)
 * - Filters out slots that start within BOOKING_CUTOFF_MINUTES from now
 * - Marks overlapping existing bookings as "booked"
 * - Only generates slots of exactly the selected duration (30/60/90/120 min)
 */
export const buildSlotStates = ({
  date,
  duration,
  availability,
  bookedSlots,
  now = new Date(),
}: {
  date: Date;
  duration: AllowedSessionDuration;
  availability: AvailabilitySlot[];
  bookedSlots: BookedSlot[];
  now?: Date;
}): SlotState[] => {
  const targetDateKey = dateKey(date);
  const exactDateSlots = availability.filter((slot) => slot.available_date === targetDateKey);
  const rawDaySlots = exactDateSlots.length > 0
    ? exactDateSlots
    : availability.filter((slot) => !slot.available_date && slot.day_of_week === date.getDay());

  // ── KEY FIX: merge duplicate/overlapping windows before generating slots ──
  const mergedWindows = mergeWindows(rawDaySlots);

  const cutoffAt = now.getTime() + (BOOKING_CUTOFF_MINUTES * 60_000);

  return mergedWindows.flatMap((window) => {
    // Skip entire window if it ends before cutoff
    const windowEndDate = new Date(date);
    windowEndDate.setHours(Math.floor(window.end / 60), window.end % 60, 0, 0);
    if (windowEndDate.getTime() <= cutoffAt) return [];

    const nextSlots: SlotState[] = [];

    for (let minute = window.start; minute + duration <= window.end; minute += SLOT_STEP_MINUTES) {
      const start = new Date(date);
      start.setHours(Math.floor(minute / 60), minute % 60, 0, 0);

      if (start.getTime() <= cutoffAt) continue;

      const end = new Date(start.getTime() + (duration * 60_000));

      const isBooked = bookedSlots.some((booking) => {
        if (booking.status === "cancelled") return false;
        const bookingStart = new Date(booking.start_at);
        const bookingEnd = new Date(bookingStart.getTime() + (booking.duration_min * 60_000));
        return overlaps(start, end, bookingStart, bookingEnd);
      });

      nextSlots.push({
        time: `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`,
        start,
        end,
        status: isBooked ? "booked" : "available",
      });
    }

    return nextSlots;
  });
};