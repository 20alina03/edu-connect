import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PortalNav } from "@/components/PortalNav";
import { TeacherCard } from "@/components/TeacherCard";
import { teachers, Portal } from "@/data/teachers";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const ISLAMIC_SUBJECTS = ["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"];
const SCHOOL_SUBJECTS = ["Maths", "English", "Biology", "Chemistry", "Physics", "IELTS"];

const TeachersList = ({ portal }: { portal: Portal }) => {
  const isIslamic = portal === "islamic";
  const allSubjects = isIslamic ? ISLAMIC_SUBJECTS : SCHOOL_SUBJECTS;
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("s") || "");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [gender, setGender] = useState<string>("any");
  const [mode, setMode] = useState<string>(params.get("mode") || "any");
  const [maxPrice, setMaxPrice] = useState<number>(isIslamic ? 60 : 100);

  const toggleSubject = (s: string) =>
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const filtered = useMemo(() => {
    return teachers.filter(t => {
      if (t.portal !== portal) return false;
      if (query && !`${t.name} ${t.subjects.join(" ")} ${t.tagline}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (subjects.length && !subjects.some(s => t.subjects.includes(s))) return false;
      if (gender !== "any" && t.gender !== gender) return false;
      if (mode !== "any" && t.mode !== mode && t.mode !== "both") return false;
      if (t.rate > maxPrice) return false;
      return true;
    });
  }, [portal, query, subjects, gender, mode, maxPrice]);

  const activeChips = [
    ...subjects.map(s => ({ label: s, clear: () => toggleSubject(s) })),
    ...(gender !== "any" ? [{ label: gender, clear: () => setGender("any") }] : []),
    ...(mode !== "any" ? [{ label: mode.replace("_", " "), clear: () => setMode("any") }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <PortalNav portal={portal} />

      <div className={cn("border-b border-border", isIslamic ? "bg-forest" : "bg-navy")}>
        <div className="container py-5">
          <div className="bg-white/[.06] border border-white/10 rounded-full flex items-center gap-2 px-4 py-2.5 max-w-2xl">
            <Search className="w-4 h-4 text-white/40"/>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder={isIslamic ? "Search Tajweed, Hifz, female teacher..." : "Search GCSE Maths, A-Level Biology..."}
              className="bg-transparent text-sm text-white placeholder:text-white/40 flex-1 outline-none"/>
          </div>
        </div>
      </div>

      <div className="container py-8 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* SIDEBAR */}
        <aside className="bg-card border border-border rounded-2xl p-5 h-fit lg:sticky lg:top-4">
          <h3 className="font-display font-bold mb-4">Filters</h3>

          <div className="mb-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Subject</div>
            <div className="space-y-2">
              {allSubjects.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox checked={subjects.includes(s)} onCheckedChange={() => toggleSubject(s)}/>
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Gender</div>
            {["any", "male", "female"].map(g => (
              <label key={g} className="flex items-center gap-2 cursor-pointer text-sm capitalize py-0.5">
                <input type="radio" name="g" checked={gender === g} onChange={() => setGender(g)}
                  className={isIslamic ? "accent-primary" : "accent-secondary"}/>
                <span>{g === "male" ? (isIslamic ? "Male (Ustadh)" : "Male") : g === "female" ? (isIslamic ? "Female (Sister)" : "Female") : "Any"}</span>
              </label>
            ))}
          </div>

          <div className="mb-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Mode</div>
            {[["any","Any"],["online","Online"],["home_visit","Home Visit"]].map(([v,l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                <input type="radio" name="m" checked={mode === v} onChange={() => setMode(v)}
                  className={isIslamic ? "accent-primary" : "accent-secondary"}/>
                <span>{l}</span>
              </label>
            ))}
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Max price · ${maxPrice}/hr</div>
            <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} min={10} max={isIslamic ? 60 : 100} step={5}/>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>$10</span><span>${isIslamic ? 60 : 100}</span>
            </div>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap gap-2 mb-3 min-h-6">
            {activeChips.map(c => (
              <button key={c.label} onClick={c.clear}
                className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 capitalize",
                  isIslamic ? "bg-primary text-white" : "bg-secondary text-white")}>
                {c.label} <X className="w-3 h-3"/>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {filtered.length} {isIslamic ? "Quran teachers" : "school tutors"} found
            </h2>
            <select className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card">
              <option>Best Match</option>
              <option>Price: Low to High</option>
              <option>Top Rated</option>
            </select>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No teachers match your filters. Try widening the price range or removing a subject.
              </div>
            ) : filtered.map(t => <TeacherCard key={t.id} teacher={t}/>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachersList;
