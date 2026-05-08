import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface N {
  id: string; type: string; title: string; body: string | null;
  read_at: string | null; created_at: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<N[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? []));

    const ch = supabase.channel("notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (p) => setItems((cur) => [p.new as N, ...cur]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setItems((c) => c.map((i) => (i.id === id ? { ...i, read_at: new Date().toISOString() } : i)));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id).is("read_at", null);
    setItems((c) => c.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-display">Notifications</h1>
          {items.some((i) => !i.read_at) && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No notifications yet
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div key={n.id} className={`p-4 rounded-xl border ${n.read_at ? "bg-card border-border" : "bg-primary/5 border-primary/30"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{n.title}</div>
                    {n.body && <div className="text-sm text-muted-foreground mt-1">{n.body}</div>}
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {!n.read_at && (
                    <button onClick={() => markRead(n.id)} className="text-primary text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> mark
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
