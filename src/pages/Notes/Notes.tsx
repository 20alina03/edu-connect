import { useEffect, useState } from "react";
import { ArrowRight, FileText, LayoutGrid, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { PageBackButton } from "@/components/PageBackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { studentsApi, type StudentResourceItem } from "@/lib/api/students";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const NotesPage = () => {
  const { role } = useAuth();
  const [notes, setNotes] = useState<StudentResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentsApi.getAssignments()
      .then(({ resources }) => setNotes(resources.lesson_notes ?? []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  if (role && role !== "student") {
    return <Navigate to={role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" /> Session notes
              </div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Teacher Notes</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Notes from teachers you have already booked appear here. Each card shows the teacher name, the note description, and the original Drive link.
              </p>
            </div>
            <PageBackButton fallbackTo="/dashboard/student" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Unlocked notes</div>
              <div className="mt-2 text-2xl font-bold font-display">{notes.length}</div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Access rule</div>
              <div className="mt-2 text-sm font-semibold">Booked sessions only</div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Source</div>
              <div className="mt-2 text-sm font-semibold">Teacher shared resources</div>
            </div>
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Available notes</h2>
              <p className="text-sm text-muted-foreground">Open any note to view the teacher's shared material.</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/assignments">
                <LayoutGrid className="mr-2 h-4 w-4" /> Assignments
              </a>
            </Button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">Loading notes…</div>
          ) : notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
              No notes available yet. Book a session with a teacher to unlock their notes.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Teacher note
                      </div>
                      <h3 className="mt-3 text-lg font-semibold line-clamp-2">{note.title}</h3>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                      {note.portal}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      Teacher: {note.teacher}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground">
                      Description: {note.description || "Teacher notes"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.description || "Teacher notes and handouts are available here."}
                    </p>
                    <a href={note.driveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-semibold text-primary hover:underline shrink-0">
                      Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default NotesPage;
