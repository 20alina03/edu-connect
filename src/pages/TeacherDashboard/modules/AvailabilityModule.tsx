import { useState, useMemo } from "react";
import { addDays, format, startOfDay } from "date-fns";
import { Calendar, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teachersApi } from "@/lib/api/teachers";
import { toast } from "sonner";
import { AvailabilityRow } from "../TeacherDashboard";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const newSlot = (): AvailabilityRow => ({ day_of_week: 1, start_time: "16:00", end_time: "18:00" });

interface AvailabilityModuleProps {
  user: any;
  availability: AvailabilityRow[];
  setAvailability: React.Dispatch<React.SetStateAction<AvailabilityRow[]>>;
  onReload: () => void;
}

export const AvailabilityModule = ({ user, availability, setAvailability, onReload }: AvailabilityModuleProps) => {
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(0);

  const updateAvailability = (idx: number, field: keyof AvailabilityRow, val: string | number) =>
    setAvailability((c) => { const n = [...c]; n[idx] = { ...n[idx], [field]: val } as AvailabilityRow; return n; });

  const addAvailability    = () => {
    setAvailability((c) => [...c, newSlot()]);
    setEditingIndex(availability.length);
  };
  const removeAvailability = (idx: number) =>
    setAvailability((c) => { const n = c.filter((_, i) => i !== idx); return n.length > 0 ? n : [newSlot()]; });

  const saveAvailability = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const slots = availability
        .filter((s) => Number.isFinite(Number(s.day_of_week)) && s.start_time && s.end_time)
        .map((s) => ({ teacher_id: user.id, day_of_week: Number(s.day_of_week), start_time: s.start_time, end_time: s.end_time }));
      await teachersApi.saveAvailability(slots.map((slot) => ({
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
      })));
      toast.success("Availability updated");
      void onReload();
    } catch (e: any) { toast.error(e?.message ?? "Failed to save availability"); }
    finally         { setSaving(false); }
  };

  const nextAvailabilityLabel = useMemo(() => {
    if (availability.length === 0) return "Add your weekly availability";
    const next = [...availability].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))[0];
    const today = startOfDay(new Date());
    const offset = (next.day_of_week - today.getDay() + 7) % 7;
    const nextDate = addDays(today, offset);
    return `${format(nextDate, "EEE, MMM d")} · ${next.start_time} - ${next.end_time}`;
  }, [availability]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold font-display">Weekly Availability</h1>
        <p className="text-sm text-muted-foreground mt-1">Set the days and time windows students can book sessions with you.</p>
      </div>

      <div className="td-form-section">
        <div className="td-card-header">
          <div>
            <h2 className="td-card-title flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Schedule
            </h2>
            <p className="td-card-sub">Add or remove time slots for each day of the week.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addAvailability}><Plus className="mr-2 h-4 w-4" /> Add slot</Button>
            <Button onClick={saveAvailability} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {availability.map((slot, idx) => (
            <div key={`${slot.day_of_week}-${slot.start_time}-${idx}`} className={editingIndex === idx ? "td-avail-slot ring-2 ring-primary/30" : "td-avail-slot"}>
              <div className="space-y-1.5">
                <Label className="text-xs">Day</Label>
                <Select value={String(slot.day_of_week)} onValueChange={(v) => updateAvailability(idx, "day_of_week", Number(v))} disabled={editingIndex !== idx}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map((d, di) => <SelectItem key={d} value={String(di)}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Start time</Label>
                <Input type="time" value={slot.start_time} onChange={(e) => updateAvailability(idx, "start_time", e.target.value)} disabled={editingIndex !== idx} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End time</Label>
                <Input type="time" value={slot.end_time} onChange={(e) => updateAvailability(idx, "end_time", e.target.value)} disabled={editingIndex !== idx} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant={editingIndex === idx ? "default" : "outline"} onClick={() => setEditingIndex(idx)} className="text-xs">
                  Edit
                </Button>
                <Button type="button" variant="ghost" onClick={() => removeAvailability(idx)} className="text-xs text-red-500 hover:text-red-600">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          Next slot: <span className="font-medium text-foreground">{nextAvailabilityLabel}</span>
        </div>
      </div>
    </div>
  );
};