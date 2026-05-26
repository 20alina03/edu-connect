import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { PageBackButton } from "@/components/PageBackButton";
import { Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Msg {
  id: string; sender_id: string; recipient_id: string; body: string; created_at: string;
}
interface ProfileLite { id: string; full_name: string | null; }

const Messages = () => {
  const { user, role } = useAuth();
  const { userId } = useParams();
  const [threads, setThreads] = useState<{ other: ProfileLite; last: Msg }[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [other, setOther] = useState<ProfileLite | null>(null);
  const [body, setBody] = useState("");
  const [allowedStudentIds, setAllowedStudentIds] = useState<string[]>([]);
  const [teacherStudentsLoaded, setTeacherStudentsLoaded] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || role !== "teacher") {
      setAllowedStudentIds([]);
      setTeacherStudentsLoaded(true);
      return;
    }

    setTeacherStudentsLoaded(false);
    (async () => {
      const { data } = await supabase.from("bookings").select("student_id").eq("teacher_id", user.id);
      setAllowedStudentIds([...new Set((data ?? []).map((booking) => booking.student_id))]);
      setTeacherStudentsLoaded(true);
    })();
  }, [user, role]);
  // load threads
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("messages").select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      const map = new Map<string, Msg>();
      (data ?? []).forEach((m) => {
        const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        if (!map.has(otherId)) map.set(otherId, m);
      });
      const ids = [...map.keys()];
      if (role === "teacher" && !teacherStudentsLoaded) {
        setThreads([]);
        return;
      }
      const filteredIds = role === "teacher" ? ids.filter((id) => allowedStudentIds.includes(id)) : ids;
      if (filteredIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", filteredIds);
        setThreads(filteredIds.map((id) => ({
          other: profs?.find((p) => p.id === id) ?? { id, full_name: null },
          last: map.get(id)!,
        })));
      } else setThreads([]);
    })();
  }, [user, role, allowedStudentIds, teacherStudentsLoaded]);
  // load thread + realtime
  useEffect(() => {
    if (!user || !userId) { setMessages([]); setOther(null); setAccessDenied(false); return; }

    const teacherBlocked = role === "teacher" && teacherStudentsLoaded && !allowedStudentIds.includes(userId);
    if (teacherBlocked) {
      setMessages([]);
      setOther(null);
      setAccessDenied(true);
      return;
    }

    setAccessDenied(false);
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("id, full_name").eq("id", userId).maybeSingle();
      setOther(prof ?? { id: userId, full_name: "User" });
      const { data } = await supabase.from("messages").select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
        .order("created_at");
      setMessages(data ?? []);
    })();

    const ch = supabase.channel(`msg-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        (p) => {
          const m = p.new as Msg;
          if ((m.sender_id === user.id && m.recipient_id === userId) ||
              (m.sender_id === userId && m.recipient_id === user.id)) {
            setMessages((c) => [...c, m]);
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, userId, role, allowedStudentIds, teacherStudentsLoaded]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userId || !body.trim() || accessDenied) return;
    const text = body;
    setBody("");
    await supabase.from("messages").insert({ sender_id: user.id, recipient_id: userId, body: text });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-4 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
        {/* Threads List */}
        <div className={cn(
          "w-full md:w-72 bg-card border border-border rounded-lg md:rounded-xl overflow-hidden",
          userId && "hidden md:flex md:flex-col"
        )}>
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border font-semibold text-sm sm:text-base">Inbox</div>
          {threads.length === 0 ? (
            <div className="p-4 sm:p-6 text-sm text-muted-foreground text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No conversations yet
            </div>
          ) : (
            <div className="divide-y divide-border overflow-y-auto max-h-[calc(100vh-12rem)]">
              {threads.map((t) => (
                <Link key={t.other.id} to={`/messages/${t.other.id}`}
                  className={cn("block px-3 sm:px-4 py-2 sm:py-3 hover:bg-muted transition text-sm", userId === t.other.id ? "bg-muted" : "")}>
                  <div className="font-medium truncate">{t.other.full_name || "User"}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.last.body}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className={cn(
          "flex-1 bg-card border border-border rounded-lg md:rounded-xl flex flex-col overflow-hidden",
          !userId && "hidden md:flex"
        )}>
          {accessDenied ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-6 text-center">
              <div>
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">You can only message students you have taught.</p>
              </div>
            </div>
          ) : other ? (
            <>
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border font-semibold text-sm sm:text-base flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PageBackButton />
                  <div>{other.full_name || "User"}</div>
                </div>
                <Link to="/messages" className="md:hidden text-xs text-muted-foreground hover:text-foreground">Back</Link>
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs sm:max-w-sm rounded-lg sm:rounded-2xl px-3 sm:px-4 py-2 text-sm ${
                      m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <div className="break-words">{m.body}</div>
                      <div className="text-[10px] opacity-70 mt-1">
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="p-3 sm:p-3 border-t border-border flex gap-2">
                <Input placeholder="Write a message..." value={body} onChange={(e) => setBody(e.target.value)} className="text-sm" />
                <Button type="submit" size="icon" disabled={!body.trim()}><Send className="w-4 h-4" /></Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile empty state */}
        {!userId && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground md:hidden">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
