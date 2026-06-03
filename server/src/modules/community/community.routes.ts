import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { badRequest, forbidden } from "../../lib/http-error.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

export const communityRouter = Router();

const ISLAMIC_SUBJECTS = new Set(["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"]);
const CommunityPortalSchema = z.enum(["islamic", "school"]);

const CreateSchema = z.object({
  portal: CommunityPortalSchema,
  body: z.string().max(4000).optional().default(""),
  image_url: z.string().url().optional().nullable(),
  caption: z.string().max(240).optional().nullable(),
});

const UpdateSchema = z.object({
  body: z.string().max(4000).optional(),
  image_url: z.string().url().optional().nullable(),
  caption: z.string().max(240).optional().nullable(),
});

const inferTeacherPortals = (subjects: string[] | null | undefined) => {
  const subjectList = subjects ?? [];
  const hasIslamic = subjectList.some((subject) => ISLAMIC_SUBJECTS.has(subject));
  const hasSchool = subjectList.some((subject) => !ISLAMIC_SUBJECTS.has(subject));
  const portals: Array<"islamic" | "school"> = [];
  if (hasIslamic) portals.push("islamic");
  if (hasSchool || portals.length === 0) portals.push("school");
  return portals;
};

communityRouter.use(requireAuth);

communityRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = CommunityPortalSchema.optional().safeParse(req.query.portal);
    if (!parsed.success) throw badRequest("Invalid portal");

    let query = supabaseAdmin
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (parsed.data) {
      query = query.eq("portal", parsed.data);
    }

    const { data, error } = await query;
    if (error) {
      const missingTable = /community_posts|relation .* does not exist|does not exist/i.test(error.message ?? "");
      if (missingTable) {
        return res.json({ posts: [], available: false });
      }

      throw badRequest(error.message);
    }
    res.json({ posts: data ?? [], available: true });
  }),
);

communityRouter.post(
  "/",
  requireRole("teacher"),
  validate({ body: CreateSchema }),
  asyncHandler(async (req, res) => {
    const teacherId = req.user!.id;

    const { error: tableCheckError } = await supabaseAdmin.from("community_posts").select("id").limit(1);
    if (tableCheckError) {
      const missingTable = /community_posts|relation .* does not exist|does not exist/i.test(tableCheckError.message ?? "");
      if (missingTable) {
        throw badRequest("Community feed is not initialized yet. Apply the community_posts migration first.");
      }

      throw badRequest(tableCheckError.message);
    }

    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("teacher_profiles")
      .select("subjects")
      .eq("user_id", teacherId)
      .maybeSingle();
    if (teacherError) throw badRequest(teacherError.message);

    const allowedPortals = inferTeacherPortals(teacher?.subjects ?? []);
    if (!allowedPortals.includes(req.body.portal)) {
      throw forbidden("You can only post to the community that matches your teaching profile");
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", teacherId)
      .maybeSingle();
    if (profileError) throw badRequest(profileError.message);

    const { data, error } = await supabaseAdmin
      .from("community_posts")
      .insert({
        portal: req.body.portal,
        author_id: teacherId,
        author_name: profile?.full_name ?? req.user!.email?.split("@")[0] ?? "Teacher",
        author_avatar: profile?.avatar_url ?? null,
        body: req.body.body ?? "",
        image_url: req.body.image_url ?? null,
        caption: req.body.caption ?? null,
      })
      .select()
      .single();
    if (error) throw badRequest(error.message);

    res.status(201).json({ post: data });
  }),
);

communityRouter.patch(
  "/:id",
  requireRole("teacher"),
  validate({ params: z.object({ id: z.string().uuid() }), body: UpdateSchema }),
  asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const teacherId = req.user!.id;

    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from("community_posts")
      .select("id, author_id")
      .eq("id", postId)
      .maybeSingle();
    if (fetchError) throw badRequest(fetchError.message);
    if (!existingPost) throw badRequest("Community post not found");
    if (existingPost.author_id !== teacherId) {
      throw forbidden("You can only edit your own posts");
    }

    const updatePayload: Record<string, unknown> = {};
    if (req.body.body !== undefined) updatePayload.body = req.body.body;
    if (req.body.image_url !== undefined) updatePayload.image_url = req.body.image_url;
    if (req.body.caption !== undefined) updatePayload.caption = req.body.caption;

    const { data, error } = await supabaseAdmin
      .from("community_posts")
      .update(updatePayload)
      .eq("id", postId)
      .select()
      .single();
    if (error) throw badRequest(error.message);

    res.json({ post: data });
  }),
);

communityRouter.delete(
  "/:id",
  requireRole("teacher"),
  validate({ params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const teacherId = req.user!.id;

    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from("community_posts")
      .select("id, author_id")
      .eq("id", postId)
      .maybeSingle();
    if (fetchError) throw badRequest(fetchError.message);
    if (!existingPost) throw badRequest("Community post not found");
    if (existingPost.author_id !== teacherId) {
      throw forbidden("You can only delete your own posts");
    }

    const { error } = await supabaseAdmin.from("community_posts").delete().eq("id", postId);
    if (error) throw badRequest(error.message);

    res.status(204).send();
  }),
);