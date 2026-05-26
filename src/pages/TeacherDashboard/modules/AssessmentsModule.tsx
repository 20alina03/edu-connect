import { useEffect, useState, useRef } from "react";
import { addDays, format } from "date-fns";
import {
  FileText, Plus, Upload, X, Send, Star, CheckCircle,
  Eye, ChevronDown, ChevronUp, Paperclip, Users, Loader2, Clock3,
  Award, MessageSquare, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { teachersApi, TeacherAssessmentItem } from "@/lib/api/teachers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StudentProfile, StudentSummary, initials } from "../TeacherDashboard";

interface AssessmentsModuleProps {
  user: any;
  bookings: any[];
  studentProfiles: Record<string, StudentProfile>;
  studentSummaries: StudentSummary[];
  onReload: () => void;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  fileUrl: string | null;
  fileName: string | null;
  fileType: "pdf" | "image" | null;
  createdAt: string;
  dueAt: string;
  assignedStudents: string[];
  solutions: Solution[];
}

interface Solution {
  id: string;
  assessmentId: string;
  studentId: string;
  fileUrl: string;
  fileName: string;
  submittedAt: string;
  marks: number | null;
  maxMarks: number;
  feedback: string | null;
  gradedAt: string | null;
}

const MAX_FILE_MB = 10;

const toAssessmentCard = (item: TeacherAssessmentItem): Assessment => ({
  id: item.id ?? crypto.randomUUID(),
  title: item.title,
  description: item.description,
  fileUrl: item.fileUrl ?? null,
  fileName: item.fileName ?? null,
  fileType: item.fileType ?? null,
  createdAt: item.createdAt ?? new Date().toISOString(),
  dueAt: item.dueAt ?? new Date(Date.now() + (7 * 86400000)).toISOString(),
  assignedStudents: item.assignedStudents ?? [],
  solutions: (item.solutions ?? []).map((solution) => ({
    id: solution.id ?? crypto.randomUUID(),
    assessmentId: solution.assessmentId ?? item.id ?? crypto.randomUUID(),
    studentId: solution.studentId,
    fileUrl: solution.fileUrl,
    fileName: solution.fileName,
    submittedAt: solution.submittedAt ?? new Date().toISOString(),
    marks: solution.marks ?? null,
    maxMarks: solution.maxMarks ?? 100,
    feedback: solution.feedback ?? null,
    gradedAt: solution.gradedAt ?? null,
  })),
});

const toStoredAssessment = (item: Assessment): TeacherAssessmentItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  fileUrl: item.fileUrl,
  fileName: item.fileName,
  fileType: item.fileType,
  createdAt: item.createdAt,
  dueAt: item.dueAt,
  assignedStudents: item.assignedStudents,
  solutions: item.solutions.map((solution) => ({
    id: solution.id,
    assessmentId: solution.assessmentId,
    studentId: solution.studentId,
    fileUrl: solution.fileUrl,
    fileName: solution.fileName,
    submittedAt: solution.submittedAt,
    marks: solution.marks,
    maxMarks: solution.maxMarks,
    feedback: solution.feedback,
    gradedAt: solution.gradedAt,
  })),
});

export const AssessmentsModule = ({
  user, studentProfiles, studentSummaries, onReload,
}: AssessmentsModuleProps) => {
  const [assessments, setAssessments]     = useState<Assessment[]>([]);
  const [showForm, setShowForm]           = useState(false);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [gradingId, setGradingId]         = useState<string | null>(null); // solution id
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [portfolioNotes, setPortfolioNotes] = useState<any[]>([]);
  const [portfolioTemplates, setPortfolioTemplates] = useState<any[]>([]);

  /* Form state */
  const [formTitle, setFormTitle]         = useState("");
  const [formDesc, setFormDesc]           = useState("");
  const [formFile, setFormFile]           = useState<File | null>(null);
  const [formExistingFileUrl, setFormExistingFileUrl] = useState<string | null>(null);
  const [formExistingFileName, setFormExistingFileName] = useState<string | null>(null);
  const [formExistingFileType, setFormExistingFileType] = useState<Assessment["fileType"]>(null);
  const [formStudents, setFormStudents]   = useState<string[]>([]);
  const [formDueAt, setFormDueAt]         = useState(format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"));
  const [submitting, setSubmitting]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Grading state */
  const [gradeMarks, setGradeMarks]       = useState<string>("");
  const [gradeMaxMarks, setGradeMaxMarks] = useState<string>("100");
  const [gradeFeedback, setGradeFeedback] = useState("");

  const allStudents = studentSummaries;

  const persistAssessments = async (nextAssessments: Assessment[]) => {
    await teachersApi.savePortfolio({
      lesson_notes: portfolioNotes,
      template_lessons: portfolioTemplates,
      assessments: nextAssessments.map(toStoredAssessment),
    });
  };

  useEffect(() => {
    teachersApi.getPortfolio().then(({ lesson_notes, template_lessons, assessments: saved }) => {
      setPortfolioNotes(lesson_notes ?? []);
      setPortfolioTemplates(template_lessons ?? []);
      setAssessments((saved ?? []).map(toAssessmentCard));
    }).catch(() => {});
  }, []);

  const toggleStudent = (id: string) =>
    setFormStudents((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_FILE_MB}MB.`);
      return;
    }
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, PNG, or JPEG files allowed.");
      return;
    }
    setFormFile(file);
  };

  const createAssessment = async () => {
    if (!formTitle.trim()) { toast.error("Please enter a title."); return; }
    if (formStudents.length === 0) { toast.error("Select at least one student."); return; }
    setSubmitting(true);
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: Assessment["fileType"] = null;

      if (formFile) {
        const safeName = formFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${user.id}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage.from("assessments").upload(storagePath, formFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("assessments").getPublicUrl(storagePath);
        fileUrl = data.publicUrl;
        fileName = formFile.name;
        fileType = formFile.type === "application/pdf" ? "pdf" : "image";
      } else if (editingAssessmentId) {
        fileUrl = formExistingFileUrl;
        fileName = formExistingFileName;
        fileType = formExistingFileType;
      }

      const newAssessment: Assessment = {
        id: editingAssessmentId ?? crypto.randomUUID(),
        title: formTitle.trim(),
        description: formDesc.trim(),
        fileUrl,
        fileName,
        fileType,
        createdAt: new Date().toISOString(),
        dueAt: new Date(formDueAt).toISOString(),
        assignedStudents: formStudents,
        solutions: [],
      };

      const nextAssessments = editingAssessmentId
        ? assessments.map((existing) => (existing.id === editingAssessmentId ? newAssessment : existing))
        : [newAssessment, ...assessments];
      setAssessments(nextAssessments);
      setShowForm(false);
      setFormTitle(""); setFormDesc(""); setFormFile(null); setFormStudents([]); setFormDueAt(format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"));
      setFormExistingFileUrl(null);
      setFormExistingFileName(null);
      setFormExistingFileType(null);
      setEditingAssessmentId(null);
      void persistAssessments(nextAssessments);
      toast.success(editingAssessmentId ? "Assessment updated" : "Assessment created & assigned!");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssessment = (id: string) => {
    const nextAssessments = assessments.filter((a) => a.id !== id);
    setAssessments(nextAssessments);
    void persistAssessments(nextAssessments);
    toast.success("Assessment deleted");
  };

  const startEditAssessment = (assessment: Assessment) => {
    setEditingAssessmentId(assessment.id);
    setFormTitle(assessment.title);
    setFormDesc(assessment.description);
    setFormStudents(assessment.assignedStudents);
    setFormDueAt(format(new Date(assessment.dueAt), "yyyy-MM-dd'T'HH:mm"));
    setShowForm(true);
    setFormFile(null);
    setFormExistingFileUrl(assessment.fileUrl);
    setFormExistingFileName(assessment.fileName);
    setFormExistingFileType(assessment.fileType);
  };

  /* Simulate student solution upload (teacher-side demo) */
  const simulateSolutionUpload = (assessmentId: string, studentId: string) => {
    const solution: Solution = {
      id: crypto.randomUUID(),
      assessmentId,
      studentId,
      fileUrl: "#",
      fileName: `solution_${studentProfiles[studentId]?.full_name?.split(" ")[0] ?? "student"}.pdf`,
      submittedAt: new Date().toISOString(),
      marks: null,
      maxMarks: 100,
      feedback: null,
      gradedAt: null,
    };
    setAssessments((prev) =>
      prev.map((a) => a.id === assessmentId ? { ...a, solutions: [...a.solutions, solution] } : a)
    );
    toast.success("Solution uploaded (demo)");
  };

  const saveGrade = (assessmentId: string, solutionId: string) => {
    const marks = parseFloat(gradeMarks);
    const max   = parseFloat(gradeMaxMarks);
    if (isNaN(marks) || isNaN(max) || marks < 0 || marks > max) {
      toast.error("Enter valid marks.");
      return;
    }
    setAssessments((prev) =>
      prev.map((a) =>
        a.id !== assessmentId ? a : {
          ...a,
          solutions: a.solutions.map((s) =>
            s.id !== solutionId ? s : {
              ...s, marks, maxMarks: max, feedback: gradeFeedback, gradedAt: new Date().toISOString(),
            }
          ),
        }
      )
    );
    setGradingId(null);
    setGradeMarks(""); setGradeMaxMarks("100"); setGradeFeedback("");
    toast.success("Grade saved!");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display">Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload assessments, assign to students, and grade solutions.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Assessment
        </Button>
      </div>

      {/* ── Create form ── */}
      {showForm && (
        <div className="td-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">{editingAssessmentId ? "Edit Assessment" : "New Assessment"}</h2>
            <button onClick={() => { setShowForm(false); setEditingAssessmentId(null); }}><X className="h-4 w-4" /></button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title *</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Chapter 3 – Algebra Quiz" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Explain what this assessment covers, instructions, deadline, etc." />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Due date *</Label>
              <Input type="datetime-local" value={formDueAt} onChange={(e) => setFormDueAt(e.target.value)} />
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>Attach File (PDF or Image, max {MAX_FILE_MB}MB)</Label>
            <div
              className={cn(
                "td-upload-zone",
                formFile && "td-upload-zone-filled"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              {formFile ? (
                <div className="flex items-center gap-3">
                  <Paperclip className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium truncate">{formFile.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFormFile(null); }}
                    className="ml-auto text-muted-foreground hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Click to upload PDF or image</p>
                  <p className="text-xs text-muted-foreground opacity-60">.pdf, .png, .jpg – max {MAX_FILE_MB}MB</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Assign students */}
          <div className="space-y-2">
            <Label>Assign to Students *</Label>
            {allStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students yet. They appear after the first booking.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {allStudents.map((s) => (
                  <label key={s.id} className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                    formStudents.includes(s.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  )}>
                    <Checkbox checked={formStudents.includes(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                    <div className="td-student-avatar bg-primary/10 text-primary h-7 w-7 text-xs flex-shrink-0 rounded-lg flex items-center justify-center font-bold">
                      {initials(s.full_name)}
                    </div>
                    <span className="text-sm font-medium truncate">{s.full_name || "Student"}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={createAssessment} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {submitting ? "Saving…" : editingAssessmentId ? "Save Changes" : "Create & Assign"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Assessment list ── */}
      {assessments.length === 0 && !showForm ? (
        <div className="td-empty">
          <FileText className="h-10 w-10 opacity-25" />
          <span className="font-semibold">No assessments yet</span>
          <span className="text-xs">Click "New Assessment" to get started.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => {
            const isExpanded = expandedId === a.id;
            const pendingCount = a.assignedStudents.length - a.solutions.length;

            return (
              <div key={a.id} className="td-card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base">{a.title}</h3>
                      {a.fileType && (
                        <span className={cn("td-badge", a.fileType === "pdf" ? "td-badge-confirmed" : "td-badge-completed")}>
                          {a.fileType.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>}
                    {a.fileUrl && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Attachment:</span>
                        <a href={a.fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                          {a.fileName || "Open file"}
                        </a>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {a.assignedStudents.length} assigned</span>
                      <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {a.solutions.length} solutions</span>
                      {pendingCount > 0 && <span className="text-amber-600 font-semibold">{pendingCount} pending</span>}
                      <span>{format(new Date(a.createdAt), "PP")}</span>
                      <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Due {format(new Date(a.dueAt), "PP p")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditAssessment(a)}
                      className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deleteAssessment(a.id)}
                      className="rounded-lg p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-4 border-t border-border pt-4">
                    {/* Assigned students + solution status */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Students & Solutions</h4>
                      {a.assignedStudents.map((sid) => {
                        const solution = a.solutions.find((s) => s.studentId === sid);
                        const name     = studentProfiles[sid]?.full_name ?? "Student";
                        const isGrading = gradingId === solution?.id;

                        return (
                          <div key={sid} className="rounded-xl border border-border bg-background/50 p-3 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {initials(name)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{name}</p>
                                  {solution ? (
                                    <p className="text-xs text-muted-foreground">
                                      Submitted {format(new Date(solution.submittedAt), "PP")}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-amber-600">Awaiting submission</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {solution ? (
                                  <>
                                    <a href={solution.fileUrl} target="_blank" rel="noreferrer">
                                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                        <Eye className="mr-1 h-3 w-3" /> View
                                      </Button>
                                    </a>
                                    {solution.gradedAt ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                                        <Award className="h-3.5 w-3.5" /> {solution.marks}/{solution.maxMarks}
                                      </span>
                                    ) : (
                                      <Button size="sm" className="h-7 px-2 text-xs"
                                        onClick={() => { setGradingId(solution.id); setGradeMarks(""); setGradeFeedback(""); }}>
                                        <Star className="mr-1 h-3 w-3" /> Grade
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  /* Demo: simulate student uploading */
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs opacity-60"
                                    onClick={() => simulateSolutionUpload(a.id, sid)}>
                                    <Upload className="mr-1 h-3 w-3" /> Demo: upload solution
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Grade form */}
                            {solution && isGrading && (
                              <div className="bg-muted/30 rounded-xl p-3 space-y-3 border border-border">
                                <h5 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Grade Solution</h5>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Marks Obtained</Label>
                                    <Input type="number" value={gradeMarks} onChange={(e) => setGradeMarks(e.target.value)} placeholder="e.g. 85" className="h-8 text-sm" />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Max Marks</Label>
                                    <Input type="number" value={gradeMaxMarks} onChange={(e) => setGradeMaxMarks(e.target.value)} placeholder="100" className="h-8 text-sm" />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Feedback & Comments</Label>
                                  <Textarea rows={3} value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)}
                                    placeholder="Great work on question 2! Need to revise algebra basics…" className="text-sm" />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => saveGrade(a.id, solution.id)}>
                                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Save Grade
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setGradingId(null)}>Cancel</Button>
                                </div>
                              </div>
                            )}

                            {/* Show existing grade */}
                            {solution?.gradedAt && !isGrading && (
                              <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 mb-1">
                                  <Award className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                    {solution.marks}/{solution.maxMarks} marks
                                  </span>
                                  <button onClick={() => { setGradingId(solution.id); setGradeMarks(String(solution.marks)); setGradeMaxMarks(String(solution.maxMarks)); setGradeFeedback(solution.feedback ?? ""); }}
                                    className="ml-auto text-xs text-muted-foreground hover:text-foreground">Edit</button>
                                </div>
                                {solution.feedback && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <MessageSquare className="h-3 w-3 inline mr-1" />{solution.feedback}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};