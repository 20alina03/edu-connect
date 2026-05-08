import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Msg {
  id: string; sender_id: string; recipient_id: string; body: string; created_at: string;
}
interface ProfileLite { id: string; full_name: string | null; }

const Messages = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const [threads, setThreads] = useState<{ other: ProfileLite; last: Msg }[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [other, setOther] = useState<ProfileLite | null>(null);
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

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
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
        setThreads(ids.map((id) => ({
          other: profs?.find((p) => p.id === id) ?? { id, full_name: null },
          last: map.get(id)!,
        })));
      } else setThreads([]);
    })();
  }, [user]);

  // load thread + realtime
  useEffect(() => {
    if (!user || !userId) { setMessages([]); setOther(null); return; }
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
  }, [user, userId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userId || !body.trim()) return;
    const text = body;
    setBody("");
    await supabase.from("messages").insert({ sender_id: user.id, recipient_id: userId, body: text });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4 h-[calc(100vh-9rem)]">
        <aside className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-semibold">Inbox</div>
          {threads.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No conversations yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {threads.map((t) => (
                <Link key={t.other.id} to={`/messages/${t.other.id}`}
                  className={`block px-4 py-3 hover:bg-muted ${userId === t.other.id ? "bg-muted" : ""}`}>
                  <div className="font-medium text-sm">{t.other.full_name || "User"}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.last.body}</div>
                </Link>
              ))}
            </div>
          )}
        </aside>

        <section className="bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          {other ? (
            <>
              <div className="px-4 py-3 border-b border-border font-semibold">{other.full_name || "User"}</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <div>{m.body}</div>
                      <div className="text-[10px] opacity-70 mt-1">
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
                <Input placeholder="Write a message..." value={body} onChange={(e) => setBody(e.target.value)} />
                <Button type="submit" size="icon"><Send className="w-4 h-4" /></Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Messages;
