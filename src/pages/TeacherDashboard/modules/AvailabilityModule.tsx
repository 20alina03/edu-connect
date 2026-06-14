import { useState, useMemo, useEffect } from "react";
import { addDays, format, startOfDay } from "date-fns";
import { Calendar, Plus, Save, Copy, Trash2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teachersApi } from "@/lib/api/teachers";
import { toast } from "sonner";
import { AvailabilityRow } from "../TeacherDashboard";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const newSlot = (overrides?: Partial<AvailabilityRow>): AvailabilityRow => ({
  day_of_week: 1,
  start_time: "09:00",
  end_time: "11:00",
  available_date: null,
  ...overrides,
});

const dateKeyToDay = (dateKey: string) => new Date(`${dateKey}T00:00:00`).getDay();
const toDateInput = (date: Date) => format(date, "yyyy-MM-dd");

/** Returns a dedup key for a slot */
const slotKey = (s: AvailabilityRow) =>
  `${s.available_date ?? ""}_${s.day_of_week}_${s.start_time}_${s.end_time}`;

/** Remove past date-specific slots and return cleaned list */
const removePastSlots = (slots: AvailabilityRow[]): AvailabilityRow[] => {
  const todayKey = toDateInput(startOfDay(new Date()));
  return slots.filter((s) => {
    if (!s.available_date) return true; // weekly slots never expire
    return s.available_date >= todayKey;
  });
};

/** Deduplicate slots — keeps first occurrence */
const deduplicateSlots = (slots: AvailabilityRow[]): AvailabilityRow[] => {
  const seen = new Set<string>();
  return slots.filter((s) => {
    const k = slotKey(s);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const PRESETS = [
  { label: "Weekdays 4–6 PM", slots: [1,2,3,4,5].map((d) => newSlot({ day_of_week: d, start_time: "16:00", end_time: "18:00" })) },
  { label: "Weekends 10 AM–12 PM", slots: [0,6].map((d) => newSlot({ day_of_week: d, start_time: "10:00", end_time: "12:00" })) },
  { label: "Mon/Wed/Fri 5–7 PM", slots: [1,3,5].map((d) => newSlot({ day_of_week: d, start_time: "17:00", end_time: "19:00" })) },
  { label: "Every day 9–11 AM", slots: [0,1,2,3,4,5,6].map((d) => newSlot({ day_of_week: d, start_time: "09:00", end_time: "11:00" })) },
];

interface AvailabilityModuleProps {
  user: any;
  availability: AvailabilityRow[];
  setAvailability: React.Dispatch<React.SetStateAction<AvailabilityRow[]>>;
  onReload: () => void;
}

export const AvailabilityModule = ({ user, availability, setAvailability, onReload }: AvailabilityModuleProps) => {
  const [saving, setSaving] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Bulk add state
  const [bulkDays, setBulkDays] = useState<number[]>([1]); // multi-select days
  const [bulkDates, setBulkDates] = useState<string[]>([]); // multi-select specific dates
  const [bulkStart, setBulkStart] = useState("09:00");
  const [bulkEnd, setBulkEnd] = useState("11:00");
  const [bulkWeeks, setBulkWeeks] = useState(1); // repeat for N weeks (weekly slots)
  const [bulkMode, setBulkMode] = useState<"weekly" | "dates">("weekly");

  const today = startOfDay(new Date());
  const minDate = toDateInput(today);
  const maxDate = toDateInput(addDays(today, 60));

  // Auto-remove past date-specific slots on load
  useEffect(() => {
    const cleaned = removePastSlots(availability);
    if (cleaned.length !== availability.length) {
      setAvailability(cleaned);
      toast.info(`${availability.length - cleaned.length} past slot(s) removed automatically.`);
    }
  }, []); // run once on mount

  const weeklySlots = useMemo(() => availability.filter((s) => !s.available_date), [availability]);
  const dateSlots = useMemo(() => availability.filter((s) => s.available_date), [availability]);

  // Count duplicates in current list for warning display
  const duplicateCount = useMemo(() => {
    const seen = new Set<string>();
    let count = 0;
    for (const s of availability) {
      const k = slotKey(s);
      if (seen.has(k)) count++;
      else seen.add(k);
    }
    return count;
  }, [availability]);

  const updateSlot = (idx: number, field: keyof AvailabilityRow, val: string | number | null) =>
    setAvailability((prev) => {
      const next = [...prev];
      const updated = { ...next[idx], [field]: val } as AvailabilityRow;
      if (field === "available_date") {
        updated.available_date = typeof val === "string" && val ? val : null;
        if (updated.available_date) updated.day_of_week = dateKeyToDay(updated.available_date);
      }
      next[idx] = updated;
      return next;
    });

  const addSingle = () => {
    setAvailability((prev) => [...prev, newSlot()]);
    setExpandedIndex(availability.length);
  };

  const duplicateSlot = (idx: number) => {
    const copy = { ...availability[idx] };
    setAvailability((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setExpandedIndex(idx + 1);
  };

  const removeSlot = (idx: number) =>
    setAvailability((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length > 0 ? next : [];
    });

  const applyPreset = (slots: AvailabilityRow[]) => {
    setAvailability((prev) => {
      const combined = deduplicateSlots([...prev, ...slots]);
      const added = combined.length - prev.length;
      const skipped = slots.length - added;
      setTimeout(() => {
        if (skipped > 0) {
          toast.success(`Added ${added} slot(s) from preset. ${skipped} duplicate(s) skipped.`);
        } else {
          toast.success(`Added ${added} slot(s) from preset.`);
        }
      }, 0);
      return combined;
    });
    setShowPresets(false);
  };

  // Toggle a day in bulk days selection
  const toggleBulkDay = (d: number) =>
    setBulkDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  // Toggle a date in bulk dates selection
  const toggleBulkDate = (dateStr: string) =>
    setBulkDates((prev) => prev.includes(dateStr) ? prev.filter((x) => x !== dateStr) : [...prev, dateStr]);

  const addBulk = () => {
    if (bulkStart >= bulkEnd) {
      toast.error("Start time must be before end time.");
      return;
    }

    let newSlots: AvailabilityRow[] = [];

    if (bulkMode === "weekly") {
      if (bulkDays.length === 0) { toast.error("Select at least one day."); return; }
      // For each selected day, repeat for bulkWeeks weeks
      for (const day of bulkDays) {
        for (let w = 0; w < bulkWeeks; w++) {
          newSlots.push(newSlot({ day_of_week: day, start_time: bulkStart, end_time: bulkEnd }));
        }
      }
    } else {
      // Date-specific mode
      if (bulkDates.length === 0) { toast.error("Select at least one date."); return; }
      for (const dateStr of bulkDates) {
        newSlots.push(newSlot({
          day_of_week: dateKeyToDay(dateStr),
          start_time: bulkStart,
          end_time: bulkEnd,
          available_date: dateStr,
        }));
      }
    }

    // Merge with existing and deduplicate
    const combined = deduplicateSlots([...availability, ...newSlots]);
    const added = combined.length - availability.length;
    const skipped = newSlots.length - added;

    setAvailability(combined);

    if (skipped > 0) {
      toast.success(`Added ${added} slot(s). ${skipped} duplicate(s) skipped.`);
    } else {
      toast.success(`Added ${added} slot(s).`);
    }

    // Reset bulk dates selection
    setBulkDates([]);
  };

  const removeDuplicates = () => {
    const deduped = deduplicateSlots(availability);
    const removed = availability.length - deduped.length;
    setAvailability(deduped);
    toast.success(`Removed ${removed} duplicate slot(s).`);
  };

  const saveAvailability = async () => {
    if (!user) return;

    for (const slot of availability) {
      if (slot.start_time >= slot.end_time) {
        toast.error("Each slot's start time must be before end time.");
        return;
      }
    }

    // Auto-deduplicate before saving
    const deduped = deduplicateSlots(removePastSlots(availability));
    setAvailability(deduped);

    setSaving(true);
    try {
      const slots = deduped
        .filter((s) => Number.isFinite(Number(s.day_of_week)) && s.start_time && s.end_time)
        .map((s) => ({
          day_of_week: Number(s.day_of_week),
          start_time: s.start_time,
          end_time: s.end_time,
          available_date: s.available_date ?? null,
        }));
      await teachersApi.saveAvailability(slots);
      toast.success("Availability saved!");
      void onReload();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Generate next 60 days for date picker grid
  const next60Days = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => {
      const d = addDays(today, i);
      return toDateInput(d);
    }), []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold font-display">Availability</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set recurring weekly slots or one-off dates. Past slots are removed automatically.
        </p>
      </div>

      {/* Duplicate warning */}
      {duplicateCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300/50 bg-amber-50/10 px-4 py-3 text-sm text-amber-600">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{duplicateCount} duplicate slot(s) detected.</span>
          <button onClick={removeDuplicates} className="ml-auto font-semibold underline text-amber-700 hover:text-amber-900">
            Remove duplicates
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={addSingle} variant="outline" size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add single slot
        </Button>
        <Button onClick={() => { setShowBulk((v) => !v); setShowPresets(false); }} variant="outline" size="sm">
          <Calendar className="mr-1.5 h-4 w-4" />
          Add many
          {showBulk ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
        </Button>
        <Button onClick={() => { setShowPresets((v) => !v); setShowBulk(false); }} variant="outline" size="sm">
          Presets
          {showPresets ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
        </Button>
        <div className="flex-1" />
        <Button onClick={saveAvailability} disabled={saving} size="sm">
          <Save className="mr-1.5 h-4 w-4" /> {saving ? "Saving…" : "Save all"}
        </Button>
      </div>

      {/* ── Presets panel ── */}
      {showPresets && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-semibold">Quick presets — replaces current slots</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.slots)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bulk add panel ── */}
      {showBulk && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <p className="text-sm font-semibold">Bulk add slots</p>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setBulkMode("weekly")}
              className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition ${bulkMode === "weekly" ? "bg-primary text-white border-primary" : "border-border bg-card"}`}
            >
              Weekly (recurring)
            </button>
            <button
              onClick={() => setBulkMode("dates")}
              className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition ${bulkMode === "dates" ? "bg-primary text-white border-primary" : "border-border bg-card"}`}
            >
              Specific dates
            </button>
          </div>

          {/* Time range — shared for both modes */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-[10px]">Start time</Label>
              <Input type="time" value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} className="h-8 w-28 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">End time</Label>
              <Input type="time" value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} className="h-8 w-28 text-xs" />
            </div>
            {bulkMode === "weekly" && (
              <div className="space-y-1">
                <Label className="text-[10px]">Repeat (weeks)</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={bulkWeeks}
                  onChange={(e) => setBulkWeeks(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                  className="h-8 w-20 text-xs"
                />
              </div>
            )}
          </div>

          {/* Day multi-select (weekly mode) */}
          {bulkMode === "weekly" && (
            <div>
              <Label className="text-[10px] mb-2 block">Select days (multiple allowed)</Label>
              <div className="flex flex-wrap gap-2">
                {FULL_DAYS.map((name, idx) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleBulkDay(idx)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      bulkDays.includes(idx)
                        ? "bg-primary text-white border-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    {DAYS[idx]}
                  </button>
                ))}
              </div>
              {bulkDays.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Will add {bulkDays.length} day(s) × {bulkWeeks} week(s) = {bulkDays.length * bulkWeeks} slot(s)
                </p>
              )}
            </div>
          )}

          {/* Date multi-select (dates mode) */}
          {bulkMode === "dates" && (
            <div>
              <Label className="text-[10px] mb-2 block">Select dates (tap to toggle, next 60 days)</Label>
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-7 gap-1">
                  {next60Days.map((dateStr) => {
                    const d = new Date(`${dateStr}T00:00:00`);
                    const selected = bulkDates.includes(dateStr);
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => toggleBulkDate(dateStr)}
                        className={`rounded-lg border py-1.5 text-center transition ${
                          selected
                            ? "bg-primary text-white border-primary"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="text-[9px] opacity-70 leading-none">{format(d, "EEE")}</div>
                        <div className="text-xs font-bold leading-tight">{format(d, "d")}</div>
                        <div className="text-[9px] opacity-60 leading-none">{format(d, "MMM")}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {bulkDates.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {bulkDates.length} date(s) selected
                </p>
              )}
            </div>
          )}

          <Button size="sm" onClick={addBulk} className="mt-1">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add slots
          </Button>
        </div>
      )}

      {/* ── Slot list ── */}
      {availability.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          No slots yet. Add a single slot, use Bulk add, or pick a Preset above.
        </div>
      ) : (
        <div className="space-y-2">
          {weeklySlots.length > 0 && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Weekly recurring ({weeklySlots.length})
            </p>
          )}

          {availability.map((slot, idx) => {
            const isExpanded = expandedIndex === idx;
            const isDateSpecific = Boolean(slot.available_date);
            const label = isDateSpecific
              ? `${format(new Date(`${slot.available_date}T00:00:00`), "EEE, MMM d yyyy")} · ${slot.start_time} – ${slot.end_time}`
              : `${DAYS[slot.day_of_week]} · ${slot.start_time} – ${slot.end_time}`;

            const prevSlot = availability[idx - 1];
            const showDateGroupLabel = isDateSpecific && (!prevSlot || !prevSlot.available_date);

            // Check if this slot is a duplicate
            const isDuplicate = availability.findIndex((s) => slotKey(s) === slotKey(slot)) !== idx;

            return (
              <div key={`${slotKey(slot)}-${idx}`}>
                {showDateGroupLabel && (
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1 pt-3 pb-1">
                    Specific dates ({dateSlots.length})
                  </p>
                )}
                <div className={`rounded-xl border bg-card transition ${
                  isDuplicate ? "border-amber-400/50 bg-amber-50/5" :
                  isExpanded ? "border-primary/40 shadow-sm" : "border-border"
                }`}>
                  {/* Collapsed row */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <button className="flex-1 text-left text-sm font-medium" onClick={() => setExpandedIndex(isExpanded ? null : idx)}>
                      {label}
                      {isDuplicate && (
                        <span className="ml-2 rounded-full bg-amber-500/15 text-amber-600 px-2 py-0.5 text-[10px] font-bold">
                          DUPLICATE
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <button onClick={() => duplicateSlot(idx)} title="Duplicate" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeSlot(idx)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setExpandedIndex(isExpanded ? null : idx)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition">
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded editor */}
                  {isExpanded && (
                    <div className="border-t border-border px-3 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="col-span-2 sm:col-span-1 space-y-1">
                        <Label className="text-xs">Specific date (optional)</Label>
                        <Input
                          type="date"
                          value={slot.available_date ?? ""}
                          min={minDate}
                          max={maxDate}
                          onChange={(e) => updateSlot(idx, "available_date", e.target.value || null)}
                          className="text-xs"
                        />
                        {slot.available_date && (
                          <button onClick={() => updateSlot(idx, "available_date", null)} className="text-[10px] text-muted-foreground hover:text-destructive">
                            Clear (use weekly)
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Day</Label>
                        <select
                          value={String(slot.day_of_week)}
                          onChange={(e) => updateSlot(idx, "day_of_week", Number(e.target.value))}
                          disabled={Boolean(slot.available_date)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                        >
                          {DAYS.map((d, di) => <option key={d} value={String(di)}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start time</Label>
                        <Input type="time" value={slot.start_time} onChange={(e) => updateSlot(idx, "start_time", e.target.value)} className="text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End time</Label>
                        <Input type="time" value={slot.end_time} onChange={(e) => updateSlot(idx, "end_time", e.target.value)} className="text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary bar */}
      {availability.length > 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center justify-between gap-3">
          <span>
            <span className="font-medium text-foreground">{availability.length}</span> slot{availability.length !== 1 ? "s" : ""}
            {weeklySlots.length > 0 && ` · ${weeklySlots.length} weekly`}
            {dateSlots.length > 0 && ` · ${dateSlots.length} date-specific`}
            {duplicateCount > 0 && <span className="text-amber-600"> · {duplicateCount} duplicate(s)</span>}
          </span>
          <Button size="sm" onClick={saveAvailability} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
};