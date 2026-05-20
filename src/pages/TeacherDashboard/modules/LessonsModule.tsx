import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  BookOpen, Plus, X, Link2, ExternalLink, Users, Globe,
  Lock, Trash2, GraduationCap, Edit2, Check, Info, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { teachersApi, TeacherLessonItem } from "@/lib/api/teachers";
import { toast } from "sonner";
import { StudentProfile, StudentSummary, initials } from "../TeacherDashboard";

interface LessonsModuleProps {
  user: any;
  bookings: any[];
  studentProfiles: Record<string, StudentProfile>;
  studentSummaries: StudentSummary[];
  onReload: () => void;
}

interface NoteLink {
  id: string;
  title: string;
  driveUrl: string;
  description: string;
  assignedStudents: string[]; // empty = all
  createdAt: string;
}

interface TemplateLesson {
  id: string;
  title: string;
  driveUrl: string;
  subject: string;
  description: string;
  createdAt: string;
  isPublic: true;
}

const MAX_TEMPLATES = 5;
const DRIVE_REGEX   = /https?:\/\/(drive|docs)\.google\.com\/.+/i;

const validateUrl = (url: string) => {
  try { new URL(url); return true; } catch { return false; }
};

const toStoredLesson = (item: NoteLink | TemplateLesson): TeacherLessonItem => ({
  id: item.id,
  title: item.title,
  subject: "subject" in item ? item.subject : undefined,
  driveUrl: item.driveUrl,
  description: item.description,
  assignedStudents: "assignedStudents" in item ? item.assignedStudents : [],
  createdAt: item.createdAt,
});

const toNoteCard = (item: TeacherLessonItem): NoteLink => ({
  id: item.id ?? crypto.randomUUID(),
  title: item.title,
  driveUrl: item.driveUrl,
  description: item.description,
  assignedStudents: item.assignedStudents ?? [],
  createdAt: item.createdAt ?? new Date().toISOString(),
});

const toTemplateCard = (item: TeacherLessonItem): TemplateLesson => ({
  id: item.id ?? crypto.randomUUID(),
  title: item.title,
  driveUrl: item.driveUrl,
  subject: item.subject ?? "",
  description: item.description,
  createdAt: item.createdAt ?? new Date().toISOString(),
  isPublic: true,
});

export const LessonsModule = ({
  user, studentProfiles, studentSummaries, onReload,
}: LessonsModuleProps) => {
  const [tab, setTab] = useState<"notes" | "templates">("notes");

  /* Notes state */
  const [notes, setNotes]                   = useState<NoteLink[]>([]);
  const [showNoteForm, setShowNoteForm]     = useState(false);
  const [noteTitle, setNoteTitle]           = useState("");
  const [noteUrl, setNoteUrl]               = useState("");
  const [noteDesc, setNoteDesc]             = useState("");
  const [noteStudents, setNoteStudents]     = useState<string[]>([]);
  const [noteForAll, setNoteForAll]         = useState(false);
  const [expandedNote, setExpandedNote]     = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId]    = useState<string | null>(null);

  /* Templates state */
  const [templates, setTemplates]           = useState<TemplateLesson[]>([]);
  const [showTplForm, setShowTplForm]       = useState(false);
  const [tplTitle, setTplTitle]             = useState("");
  const [tplUrl, setTplUrl]                 = useState("");
  const [tplSubject, setTplSubject]         = useState("");
  const [tplDesc, setTplDesc]               = useState("");
  const [editingTplId, setEditingTplId]     = useState<string | null>(null);
  const [portfolioAssessments, setPortfolioAssessments] = useState<any[]>([]);

  const persistLessons = async (nextNotes: TeacherLessonItem[], nextTemplates: TeacherLessonItem[]) => {
    await teachersApi.savePortfolio({
      lesson_notes: nextNotes,
      template_lessons: nextTemplates,
      assessments: portfolioAssessments,
    });
  };

  useEffect(() => {
    teachersApi.getPortfolio().then(({ lesson_notes, template_lessons, assessments }) => {
      setNotes((lesson_notes ?? []).map(toNoteCard));
      setTemplates((template_lessons ?? []).map(toTemplateCard));
      setPortfolioAssessments(assessments ?? []);
    }).catch(() => {});
  }, []);

  const allStudents = studentSummaries;

  /* ── Notes handlers ── */
  const toggleNoteStudent = (id: string) =>
    setNoteStudents((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const createNote = () => {
    if (!noteTitle.trim())                           { toast.error("Enter a title."); return; }
    if (!noteUrl.trim() || !validateUrl(noteUrl))    { toast.error("Enter a valid URL."); return; }
    if (!noteForAll && noteStudents.length === 0)    { toast.error("Assign to at least one student or make available to all."); return; }

    const note: NoteLink = {
      id: editingNoteId ?? crypto.randomUUID(),
      title: noteTitle.trim(),
      driveUrl: noteUrl.trim(),
      description: noteDesc.trim(),
      assignedStudents: noteForAll ? [] : noteStudents,
      createdAt: new Date().toISOString(),
    };
    const nextNotes = editingNoteId
      ? notes.map((existing) => (existing.id === editingNoteId ? note : existing))
      : [note, ...notes];
    setNotes(nextNotes);
    setShowNoteForm(false);
    setEditingNoteId(null);
    setNoteTitle(""); setNoteUrl(""); setNoteDesc(""); setNoteStudents([]); setNoteForAll(false);
    void persistLessons(nextNotes.map(toStoredLesson), templates.map(toStoredLesson));
    toast.success(editingNoteId ? "Note updated!" : "Note link added!");
  };

  const deleteNote = (id: string) => {
    const nextNotes = notes.filter((n) => n.id !== id);
    setNotes(nextNotes);
    void persistLessons(nextNotes.map(toStoredLesson), templates.map(toStoredLesson));
    toast.success("Note removed");
  };

  const startEditNote = (note: NoteLink) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteUrl(note.driveUrl);
    setNoteDesc(note.description);
    setNoteStudents(note.assignedStudents);
    setNoteForAll(note.assignedStudents.length === 0);
    setShowNoteForm(true);
  };

  /* ── Template handlers ── */
  const createTemplate = () => {
    if (templates.length >= MAX_TEMPLATES) { toast.error(`Maximum ${MAX_TEMPLATES} template lessons allowed.`); return; }
    if (!tplTitle.trim())                  { toast.error("Enter a title."); return; }
    if (!tplUrl.trim() || !validateUrl(tplUrl)) { toast.error("Enter a valid URL."); return; }

    const tpl: TemplateLesson = {
      id: editingTplId ?? crypto.randomUUID(),
      title: tplTitle.trim(),
      driveUrl: tplUrl.trim(),
      subject: tplSubject.trim(),
      description: tplDesc.trim(),
      createdAt: new Date().toISOString(),
      isPublic: true,
    };
    const nextTemplates = editingTplId
      ? templates.map((existing) => (existing.id === editingTplId ? tpl : existing))
      : [...templates, tpl];
    setTemplates(nextTemplates);
    setShowTplForm(false);
    setEditingTplId(null);
    setTplTitle(""); setTplUrl(""); setTplSubject(""); setTplDesc("");
    void persistLessons(notes.map(toStoredLesson), nextTemplates.map(toStoredLesson));
    toast.success(editingTplId ? "Template updated" : "Template lesson added — visible to all students!");
  };

  const deleteTemplate = (id: string) => {
    const nextTemplates = templates.filter((t) => t.id !== id);
    setTemplates(nextTemplates);
    void persistLessons(notes.map(toStoredLesson), nextTemplates.map(toStoredLesson));
    toast.success("Template removed");
  };

  const startEditTemplate = (tpl: TemplateLesson) => {
    setEditingTplId(tpl.id);
    setTplTitle(tpl.title);
    setTplUrl(tpl.driveUrl);
    setTplSubject(tpl.subject);
    setTplDesc(tpl.description);
    setShowTplForm(true);
  };

  const studentName = (id: string) => studentProfiles[id]?.full_name ?? "Student";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold font-display">Lessons</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share Google Drive notes with specific students, and add public template lessons for everyone.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-full sm:w-auto sm:inline-flex">
        {[
          { id: "notes" as const,     label: "Notes",            icon: Link2        },
          { id: "templates" as const, label: "Template Lessons", icon: GraduationCap },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
              tab === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ NOTES TAB ══ */}
      {tab === "notes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Add Google Drive links and assign them to specific students.
            </p>
            <Button onClick={() => setShowNoteForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
          </div>

          {showNoteForm && (
            <div className="td-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Add Note Link</h2>
                <button onClick={() => setShowNoteForm(false)}><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Title *</Label>
                  <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="e.g. Chapter 5 – Fractions Notes" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Google Drive Link *</Label>
                  <Input value={noteUrl} onChange={(e) => setNoteUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..." />
                  <p className="text-xs text-muted-foreground">Make sure the file is set to "Anyone with link can view" in Drive.</p>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea rows={2} value={noteDesc} onChange={(e) => setNoteDesc(e.target.value)}
                    placeholder="Brief description of what this material covers…" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assign to</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={noteForAll} onCheckedChange={(v) => setNoteForAll(Boolean(v))} />
                  <span className="text-sm font-medium">All my students</span>
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
                {!noteForAll && (
                  allStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No students yet.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {allStudents.map((s) => (
                        <label key={s.id} className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                          noteStudents.includes(s.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        )}>
                          <Checkbox checked={noteStudents.includes(s.id)} onCheckedChange={() => toggleNoteStudent(s.id)} />
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials(s.full_name)}
                          </div>
                          <span className="text-sm font-medium truncate">{s.full_name || "Student"}</span>
                        </label>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNoteForm(false)}>Cancel</Button>
                <Button onClick={createNote}><Check className="mr-2 h-4 w-4" /> Save Note</Button>
              </div>
            </div>
          )}

          {notes.length === 0 && !showNoteForm ? (
            <div className="td-empty">
              <Link2 className="h-10 w-10 opacity-25" />
              <span className="font-semibold">No notes yet</span>
              <span className="text-xs">Add a Google Drive link to share with your students.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => {
                const isExpanded = expandedNote === note.id;
                const accessLabel = note.assignedStudents.length === 0
                  ? "All students"
                  : note.assignedStudents.map((id) => studentName(id)).join(", ");

                return (
                  <div key={note.id} className="td-card space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm">{note.title}</h3>
                        {note.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{note.description}</p>}
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                          {note.assignedStudents.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-primary font-medium"><Globe className="h-3 w-3" /> All students</span>
                          ) : (
                            <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> {note.assignedStudents.length} student(s)</span>
                          )}
                          <span>{format(new Date(note.createdAt), "PP")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={note.driveUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            <ExternalLink className="mr-1 h-3 w-3" /> Open
                          </Button>
                        </a>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => startEditNote(note)}>
                          <Edit2 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <button onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                          className="rounded-lg p-1.5 hover:bg-muted">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button onClick={() => deleteNote(note.id)}
                          className="rounded-lg p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && note.assignedStudents.length > 0 && (
                      <div className="border-t border-border pt-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned to</p>
                        <div className="flex flex-wrap gap-2">
                          {note.assignedStudents.map((sid) => (
                            <span key={sid} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold">
                                {initials(studentName(sid))}
                              </div>
                              {studentName(sid)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ TEMPLATES TAB ══ */}
      {tab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Upload up to <span className="font-bold text-foreground">{MAX_TEMPLATES}</span> template lessons as Google Drive links.
                These are <span className="font-bold text-foreground">public</span> — all students can access them.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-1.5">
                <Info className="h-3.5 w-3.5" />
                {templates.length}/{MAX_TEMPLATES} slots used
              </div>
            </div>
            {templates.length < MAX_TEMPLATES && (
              <Button onClick={() => setShowTplForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Template
              </Button>
            )}
          </div>

          {showTplForm && (
            <div className="td-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Add Template Lesson</h2>
                <button onClick={() => setShowTplForm(false)}><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Title *</Label>
                  <Input value={tplTitle} onChange={(e) => setTplTitle(e.target.value)} placeholder="e.g. Introduction to Algebra" />
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={tplSubject} onChange={(e) => setTplSubject(e.target.value)} placeholder="e.g. Maths" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Google Drive Link *</Label>
                  <Input value={tplUrl} onChange={(e) => setTplUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..." />
                  <p className="text-xs text-muted-foreground">Ensure the Drive file is shared publicly.</p>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea rows={2} value={tplDesc} onChange={(e) => setTplDesc(e.target.value)}
                    placeholder="What topics does this template lesson cover?" />
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
                <Globe className="h-4 w-4 flex-shrink-0" />
                This template will be <strong className="ml-1">publicly visible</strong> to all students.
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowTplForm(false)}>Cancel</Button>
                <Button onClick={createTemplate}><Check className="mr-2 h-4 w-4" /> Add Template</Button>
              </div>
            </div>
          )}

          {templates.length === 0 && !showTplForm ? (
            <div className="td-empty">
              <GraduationCap className="h-10 w-10 opacity-25" />
              <span className="font-semibold">No template lessons yet</span>
              <span className="text-xs">Add up to {MAX_TEMPLATES} public lessons as Google Drive links.</span>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl, idx) => (
                <div key={tpl.id} className="td-card relative group">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditTemplate(tpl)}
                        className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteTemplate(tpl.id)}
                        className="rounded-lg p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5">
                      <Globe className="h-2.5 w-2.5" /> Public
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-1 pr-6">{tpl.title}</h3>
                  {tpl.subject && <p className="text-xs text-primary font-semibold mb-1">{tpl.subject}</p>}
                  {tpl.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{tpl.description}</p>}
                  <a href={tpl.driveUrl} target="_blank" rel="noreferrer" className="block">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      <ExternalLink className="mr-1.5 h-3 w-3" /> Open in Drive
                    </Button>
                  </a>
                  <p className="text-[10px] text-muted-foreground mt-2">{format(new Date(tpl.createdAt), "PP")}</p>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: MAX_TEMPLATES - templates.length }).map((_, i) => (
                <div key={`empty-${i}`}
                  className="td-empty cursor-pointer min-h-[140px]"
                  onClick={() => { if (!showTplForm) setShowTplForm(true); }}>
                  <Plus className="h-6 w-6 opacity-30" />
                  <span className="text-xs">Slot {templates.length + i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};