import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { communityApi, type CommunityPortal, type CommunityPost } from "@/lib/api/community";
import { teachersApi } from "@/lib/api/teachers";
import { cn } from "@/lib/utils";
import { ArrowLeft, Edit3, FileImage, Globe, Loader2, MessageSquare, PlusCircle, Send, School2, Sparkles, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const portalMeta: Record<CommunityPortal, { label: string; icon: React.ElementType; tone: string }> = {
  islamic: { label: "Islamic Community", icon: School2, tone: "from-emerald-500/15 to-primary/10" },
  school: { label: "School Community", icon: Globe, tone: "from-blue-500/15 to-cyan-500/10" },
};

const ISLAMIC_SUBJECTS = ["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"];

const inferCommunityPortals = (subjects?: string[] | null) => {
  const subjectList = subjects ?? [];
  const hasIslamic = subjectList.some((subject) => ISLAMIC_SUBJECTS.includes(subject));
  const hasSchool = subjectList.some((subject) => !ISLAMIC_SUBJECTS.includes(subject));
  const portals: CommunityPortal[] = [];
  if (hasIslamic) portals.push("islamic");
  if (hasSchool || portals.length === 0) portals.push("school");
  return portals;
};

const filterPortalPosts = (posts: CommunityPost[], portal: CommunityPortal) =>
  posts.filter((post) => post.portal === portal);

const dataUrlFromFile = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result ?? ""));
  reader.onerror = () => reject(new Error("Could not read file"));
  reader.readAsDataURL(file);
});

const Community = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isTeacher = role === "teacher";
  const [allowedPortals, setAllowedPortals] = useState<CommunityPortal[]>(["islamic", "school"]);
  const [activePortal, setActivePortal] = useState<CommunityPortal>("islamic");
  const [posts, setPosts] = useState<Record<CommunityPortal, CommunityPost[]>>({ islamic: [], school: [] });
  const [communityAvailable, setCommunityAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<CommunityPost | null>(null);
  const [draftPortal, setDraftPortal] = useState<CommunityPortal>(activePortal);
  const [draftBody, setDraftBody] = useState("");
  const [draftCaption, setDraftCaption] = useState("");
  const [draftImageUrl, setDraftImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const loadPosts = async () => {
      const [islamic, school] = await Promise.all([
        communityApi.list("islamic").catch(() => ({ posts: [] as CommunityPost[] })),
        communityApi.list("school").catch(() => ({ posts: [] as CommunityPost[] })),
      ]);
      if (!active) return;
      setPosts({
        islamic: filterPortalPosts(islamic.posts ?? [], "islamic"),
        school: filterPortalPosts(school.posts ?? [], "school"),
      });
      setCommunityAvailable(Boolean(islamic.available ?? school.available ?? true));
      setLoading(false);
    };

    loadPosts();

    if (isTeacher) {
      teachersApi.getDashboard()
        .then(({ teacher }) => {
          if (!active) return;
          const nextPortals = teacher.portals?.length ? teacher.portals : inferCommunityPortals(teacher.subjects);
          setAllowedPortals(nextPortals);
          setActivePortal(nextPortals[0]);
        })
        .catch(() => {
          if (!active) return;
          const fallbackPortals = inferCommunityPortals();
          setAllowedPortals(fallbackPortals);
          setActivePortal(fallbackPortals[0]);
        });
    }

    return () => { active = false; };
  }, [isTeacher]);

  const activePosts = useMemo(() => filterPortalPosts(posts[activePortal] ?? [], activePortal), [posts, activePortal]);
  const myPosts = useMemo(
    () => activePosts.filter((post) => post.author_id === user?.id),
    [activePosts, user?.id],
  );
  const composerPortals = useMemo(() => allowedPortals.filter((portal) => portalMeta[portal]), [allowedPortals]);
  const canChooseComposerPortal = composerPortals.length > 1;

  const canManagePosts = isTeacher;

  const openComposer = (portal: CommunityPortal = activePortal) => {
    setDraftPortal(portal);
    setDraftBody("");
    setDraftCaption("");
    setDraftImageUrl(null);
    setEditingPost(null);
    setComposerOpen(true);
  };

  const openEditComposer = (post: CommunityPost) => {
    setDraftPortal(post.portal);
    setDraftBody(post.body ?? "");
    setDraftCaption(post.caption ?? "");
    setDraftImageUrl(post.image_url ?? null);
    setEditingPost(post);
    setComposerOpen(true);
  };

  const resetComposer = () => {
    setComposerOpen(false);
    setEditingPost(null);
    setDraftBody("");
    setDraftCaption("");
    setDraftImageUrl(null);
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB.");
      return;
    }
    setDraftImageUrl(await dataUrlFromFile(file));
  };

  const submitPost = async () => {
    if (!communityAvailable) {
      toast.error("Community feed is not initialized yet. Apply the migration first.");
      return;
    }
    if (!draftBody.trim() && !draftImageUrl) {
      toast.error("Add text or an image before posting.");
      return;
    }
    setPosting(true);
    try {
      if (editingPost) {
        const { post } = await communityApi.update(editingPost.id, {
          body: draftBody.trim(),
          caption: draftCaption.trim() || null,
          image_url: draftImageUrl,
        });
        setPosts((current) => ({
          ...current,
          [post.portal]: current[post.portal].map((item) => (item.id === post.id ? post : item)),
        }));
        toast.success("Post updated");
      } else {
        const { post } = await communityApi.create({
          portal: draftPortal,
          body: draftBody.trim(),
          caption: draftCaption.trim() || null,
          image_url: draftImageUrl,
        });
        setPosts((current) => ({
          ...current,
          [post.portal]: [post, ...current[post.portal].filter((item) => item.id !== post.id)],
        }));
        toast.success("Posted to community");
      }
      resetComposer();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const deletePost = async () => {
    if (!deletingPost) return;
    setPosting(true);
    try {
      await communityApi.delete(deletingPost.id);
      setPosts((current) => ({
        islamic: current.islamic.filter((post) => post.id !== deletingPost.id),
        school: current.school.filter((post) => post.id !== deletingPost.id),
      }));
      toast.success("Post deleted");
      setDeletingPost(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to delete post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        <section className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_28%)] space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Button variant="outline" onClick={() => navigate(role === "teacher" ? "/dashboard/teacher" : "/dashboard/student")} className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              {isTeacher && (
                <Button onClick={() => openComposer(activePortal)} disabled={!communityAvailable} className="rounded-full">
                  <PlusCircle className="w-4 h-4 mr-2" /> Add post
                </Button>
              )}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5 text-primary" /> Community feed
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mt-3">Community</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
              Browse Islamic and school posts. Teachers can publish, students can view.
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
          <section className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {(["islamic", "school"] as CommunityPortal[]).map((portal) => {
                const meta = portalMeta[portal];
                const active = activePortal === portal;
                return (
                  <button
                    key={portal}
                    onClick={() => setActivePortal(portal)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted/70"
                    )}
                  >
                    <meta.icon className="w-4 h-4" />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground animate-pulse">Loading community posts…</div>
            ) : activePosts.length === 0 ? (
              <div className={cn("rounded-3xl border border-border bg-card p-8 text-center space-y-2", `bg-gradient-to-br ${portalMeta[activePortal].tone}`)}>
                <Sparkles className="w-6 h-6 mx-auto text-primary" />
                <div className="font-semibold">No posts yet in this community.</div>
                <div className="text-sm text-muted-foreground">Teachers can start the conversation here.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {activePosts.map((post) => (
                  <article key={post.id} className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                          {(post.author_name?.[0] ?? "T").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{post.author_name}</div>
                          <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", post.portal === "islamic" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-blue-500/10 text-blue-700 border-blue-500/20")}>{post.portal}</span>
                        {canManagePosts && post.author_id === user?.id && (
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="h-8 rounded-full px-3" onClick={() => openEditComposer(post)}>
                              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-destructive hover:text-destructive" onClick={() => setDeletingPost(post)}>
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {post.body && <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>}
                    {post.image_url && (
                      <div className="overflow-hidden rounded-2xl border border-border">
                        <img src={post.image_url} alt={post.caption || "Community post image"} className="w-full max-h-[420px] object-cover" />
                      </div>
                    )}
                    {post.caption && <p className="text-xs sm:text-sm text-muted-foreground">{post.caption}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>

          {isTeacher && (
            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Publishing</div>
                  <h2 className="font-display font-bold text-xl mt-1">Open post editor</h2>
                </div>

                {!communityAvailable ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    Community posting is disabled until the <span className="font-semibold text-foreground">community_posts</span> migration is applied.
                  </div>
                ) : (
                  <Button onClick={() => openComposer(activePortal)} className="w-full rounded-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Open post editor
                  </Button>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">My posts</div>
                    <h2 className="font-display font-bold text-xl mt-1">Manage your posts</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">{myPosts.length} in this community</span>
                </div>

                {myPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                    Your posts in the {portalMeta[activePortal].label.toLowerCase()} will appear here.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myPosts.map((post) => (
                      <div key={post.id} className="rounded-2xl border border-border bg-background/60 p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{portalMeta[post.portal].label}</div>
                            <p className="text-sm mt-1 line-clamp-3 text-foreground/90">{post.body || "Image-only post"}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="outline" size="sm" className="h-8 rounded-full px-3" onClick={() => openEditComposer(post)}>
                              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-destructive hover:text-destructive" onClick={() => setDeletingPost(post)}>
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                            </Button>
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
                <div className="font-semibold">How it works</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Select Islamic to view Islamic posts only.</li>
                  <li>Select School to view school posts only.</li>
                  <li>Teachers with both subject groups can post to either tab.</li>
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>

      <Dialog open={composerOpen} onOpenChange={(open) => (open ? setComposerOpen(true) : resetComposer())}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit post" : "Add post"}</DialogTitle>
            <DialogDescription>
              {editingPost ? "Update your community post and keep the conversation current." : "Create a new community post for your students and peers."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Community</div>
              {canChooseComposerPortal ? (
                <div className="flex gap-2 flex-wrap">
                  {composerPortals.map((portal) => (
                    <button
                      key={portal}
                      type="button"
                      disabled={Boolean(editingPost) && editingPost.portal !== portal}
                      onClick={() => setDraftPortal(portal)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all",
                        draftPortal === portal ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40",
                        Boolean(editingPost) && editingPost.portal !== portal && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {portalMeta[portal].label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm font-semibold text-foreground">
                  {portalMeta[draftPortal].label}
                </div>
              )}
              {editingPost && <p className="text-xs text-muted-foreground">Post community is locked while editing.</p>}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Text</div>
              <Textarea rows={5} placeholder="Share an update, reminder, resource, or question..." value={draftBody} onChange={(e) => setDraftBody(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Caption (optional)</div>
              <Textarea rows={2} placeholder="Short caption for the image" value={draftCaption} onChange={(e) => setDraftCaption(e.target.value)} />
            </div>

            <label className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <FileImage className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm">Add an image</div>
                  <div className="text-xs text-muted-foreground truncate">PNG, JPG, WEBP up to 2MB</div>
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            {draftImageUrl && (
              <div className="rounded-2xl border border-border overflow-hidden">
                <img src={draftImageUrl} alt="Preview" className="w-full max-h-64 object-cover" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetComposer}>Cancel</Button>
            <Button onClick={submitPost} disabled={posting} className="rounded-full">
              {posting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {posting ? "Saving…" : editingPost ? "Save changes" : "Publish post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingPost)} onOpenChange={(open) => !open && setDeletingPost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your community post from the feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingPost(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Community;