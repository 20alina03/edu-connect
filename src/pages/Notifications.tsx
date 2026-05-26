import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { PageBackButton } from "@/components/PageBackButton";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { notificationsApi, type Notification } from "@/lib/api/notifications";

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    notificationsApi.list().then(({ notifications }) => setItems(notifications)).catch(() => {});

    // Realtime stays direct — RLS scopes to current user
    const ch = supabase.channel("notifs")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (p) => setItems((cur) => [p.new as Notification, ...cur]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setItems((c) => c.map((i) => (i.id === id ? { ...i, read_at: new Date().toISOString() } : i)));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setItems((c) => c.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Notifications</h1>
          {items.some((i) => !i.read_at) && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs sm:text-sm">Mark all read</Button>
          )}
          <PageBackButton />
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12 sm:py-16 text-muted-foreground">
            <Bell className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div key={n.id} className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border transition ${n.read_at ? "bg-card border-border" : "bg-primary/5 border-primary/30"}`}>
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base">{n.title}</div>
                    {n.body && <div className="text-xs sm:text-sm text-muted-foreground mt-1">{n.body}</div>}
                    <div className="text-[11px] sm:text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {!n.read_at && (
                    <button onClick={() => markRead(n.id)} className="text-primary text-xs flex items-center gap-1 whitespace-nowrap flex-shrink-0 hover:opacity-70">
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
