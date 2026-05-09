import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { teachersApi } from "@/lib/api/teachers";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const SUBJECTS = ["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies", "Maths", "English", "Biology", "Chemistry", "Physics", "IELTS"];

const TeacherOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [rate, setRate] = useState<number>(20);
  const [mode, setMode] = useState<"online" | "home_visit" | "both">("online");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState<number>(1);
  const [quranLevel, setQuranLevel] = useState("");

  useEffect(() => {
    if (!user) return;
    teachersApi.get(user.id).then(({ teacher: data }) => {
      if (data) {
        setBio(data.bio ?? "");
        setSubjects(data.subjects ?? []);
        setRate(Number(data.hourly_rate_usd) || 20);
        setMode((data.mode as any) ?? "online");
        setGender((data.gender as any) ?? "male");
        setCountry(data.country ?? "");
        setCity(data.city ?? "");
        setExperience(data.experience_years ?? 1);
        setQuranLevel(data.quran_level ?? "");
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const toggle = (s: string) =>
    setSubjects((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const save = async () => {
    if (!user) return;
    if (subjects.length === 0) return toast.error("Pick at least one subject");
    setSaving(true);
    try {
      await teachersApi.onboarding({
        subjects, hourly_rate_usd: rate, mode, bio, gender, country, city,
        experience_years: experience, quran_level: quranLevel || undefined,
      } as any);
      toast.success("Profile saved!");
      navigate("/dashboard/teacher");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-display mb-2">Set up your teaching profile</h1>
        <p className="text-muted-foreground mb-8">Students can find and book you once this is filled out.</p>

        <div className="space-y-6 bg-card border border-border rounded-2xl p-6">
          <div>
            <Label>Subjects you teach</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
              {SUBJECTS.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={subjects.includes(s)} onCheckedChange={() => toggle(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Hourly rate (USD)</Label>
              <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} min={5} />
            </div>
            <div>
              <Label>Years of experience</Label>
              <Input type="number" value={experience} onChange={(e) => setExperience(Number(e.target.value))} min={0} />
            </div>
            <div>
              <Label>Teaching mode</Label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="home_visit">Home visit</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="UK" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="London" />
            </div>
          </div>

          {subjects.some((s) => ["Quran", "Tajweed", "Hifz"].includes(s)) && (
            <div>
              <Label>Quran qualification (optional)</Label>
              <Input value={quranLevel} onChange={(e) => setQuranLevel(e.target.value)} placeholder="Ijazah Hafs" />
            </div>
          )}

          <div>
            <Label>Bio</Label>
            <Textarea rows={5} value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students about your teaching style, qualifications, and approach..." />
          </div>

          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherOnboarding;
