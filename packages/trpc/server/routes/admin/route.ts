import { z } from "zod";
import { adminProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { zodUndefinedModel } from "../../schema";
import { db, eq, and, sql, desc, ne } from "@repo/database";
import { forms, responses, formAnalytics, formViews, users } from "@repo/database/schema";
import { TRPCError } from "@trpc/server";

const TAGS = ["Admin"];
const getPath = generatePath("/admin");

export const adminRouter = router({
  // 1. Get Platform-wide General Analytics & Trends
  getAdminStats: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/stats"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(
      z.object({
        totalUsers: z.number(),
        totalForms: z.number(),
        totalSubmissions: z.number(),
        totalViews: z.number(),
        globalConversionRate: z.number(),
        dailyTrends: z.array(
          z.object({
            date: z.string(),
            views: z.number(),
            submissions: z.number(),
          }),
        ),
      }),
    )
    .query(async () => {
      // Aggregate total counts
      const [usersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
      const [formsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(forms);
      const [responsesCount] = await db.select({ count: sql<number>`count(*)::int` }).from(responses);
      const [viewsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(formViews);

      const totalUsers = usersCount?.count || 0;
      const totalForms = formsCount?.count || 0;
      const totalSubmissions = responsesCount?.count || 0;
      const totalViews = viewsCount?.count || 0;

      const globalConversionRate =
        totalViews > 0 ? parseFloat(((totalSubmissions / totalViews) * 100).toFixed(1)) : 0;

      // Global trends for the past 30 days
      const trends = await db
        .select({
          date: formAnalytics.date,
          views: sql<number>`sum(${formAnalytics.views})::int`,
          submissions: sql<number>`sum(${formAnalytics.submissions})::int`,
        })
        .from(formAnalytics)
        .groupBy(formAnalytics.date)
        .orderBy(formAnalytics.date)
        .limit(30);

      const dailyTrends = trends.map((t) => ({
        date: t.date ? t.date.toISOString().split("T")[0]! : new Date().toISOString().split("T")[0]!,
        views: t.views || 0,
        submissions: t.submissions || 0,
      }));

      // If trends is empty, inject a default trend item so charts render cleanly
      if (dailyTrends.length === 0) {
        dailyTrends.push({
          date: new Date().toISOString().split("T")[0]!,
          views: totalViews,
          submissions: totalSubmissions,
        });
      }

      return {
        totalUsers,
        totalForms,
        totalSubmissions,
        totalViews,
        globalConversionRate,
        dailyTrends,
      };
    }),

  // 2. Get Captains (Users) Roster
  getUsers: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/users"), tags: TAGS } })
    .input(
      z.object({
        search: z.string().optional().describe("Search term matching name/email"),
        page: z.number().default(1).describe("Pagination page number"),
        limit: z.number().default(10).describe("Pagination size limit"),
      }),
    )
    .output(
      z.object({
        users: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string(),
            avatar: z.string().nullable(),
            role: z.string(),
            createdAt: z.date(),
            formCount: z.number(),
          }),
        ),
        total: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const page = Math.max(1, input.page);
      const limit = Math.max(1, input.limit);
      const offset = (page - 1) * limit;

      const filters: any[] = [];
      if (input.search) {
        filters.push(
          sql`(${users.name} ILIKE ${`%${input.search}%`} OR ${users.email} ILIKE ${`%${input.search}%`})`,
        );
      }

      const queryFilter = filters.length > 0 ? and(...filters) : undefined;

      const items = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
          createdAt: users.createdAt,
          formCount: sql<number>`(select count(*)::int from ${forms} where ${forms.userId} = ${users.id})`,
        })
        .from(users)
        .where(queryFilter)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(queryFilter);

      return {
        users: items.map((u) => ({
          ...u,
          role: u.role as string,
        })),
        total: countResult?.count || 0,
      };
    }),

  // 3. Promote / Demote User Role
  toggleUserRole: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/users/toggle-role"), tags: TAGS } })
    .input(
      z.object({
        userId: z.string().uuid().describe("Target User UUID"),
        role: z.enum(["user", "admin"]).describe("New Role"),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Guard: Prevent self demotion
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Naval protocols prevent you from demoting yourself, Fleet Admiral!",
        });
      }

      const [user] = await db.select().from(users).where(eq(users.id, input.userId));
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pirate captain not found in user files.",
        });
      }

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));

      return {
        success: true,
        message: `Successfully set ${user.name}'s rank to ${input.role.toUpperCase()}.`,
      };
    }),

  // 4. Get Grand Line Maps (All Forms)
  getForms: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("/forms"), tags: TAGS } })
    .input(
      z.object({
        search: z.string().optional().describe("Search term matching title/slug/owner name"),
        page: z.number().default(1).describe("Pagination page number"),
        limit: z.number().default(10).describe("Pagination size limit"),
      }),
    )
    .output(
      z.object({
        forms: z.array(
          z.object({
            id: z.string().uuid(),
            title: z.string(),
            slug: z.string(),
            status: z.enum(["draft", "published", "unpublished"]),
            visibility: z.enum(["public", "unlisted"]),
            createdAt: z.date(),
            isArchived: z.boolean(),
            responseCount: z.number(),
            ownerName: z.string(),
            ownerEmail: z.string(),
          }),
        ),
        total: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const page = Math.max(1, input.page);
      const limit = Math.max(1, input.limit);
      const offset = (page - 1) * limit;

      const filters: any[] = [];
      if (input.search) {
        filters.push(
          sql`(${forms.title} ILIKE ${`%${input.search}%`} OR ${forms.slug} ILIKE ${`%${input.search}%`} OR ${users.name} ILIKE ${`%${input.search}%`})`,
        );
      }

      const queryFilter = filters.length > 0 ? and(...filters) : undefined;

      const items = await db
        .select({
          id: forms.id,
          title: forms.title,
          slug: forms.slug,
          status: forms.status,
          visibility: forms.visibility,
          createdAt: forms.createdAt,
          isArchived: forms.isArchived,
          responseCount: sql<number>`(select count(*)::int from ${responses} where ${responses.formId} = ${forms.id})`,
          ownerName: users.name,
          ownerEmail: users.email,
        })
        .from(forms)
        .innerJoin(users, eq(forms.userId, users.id))
        .where(queryFilter)
        .orderBy(desc(forms.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(forms)
        .innerJoin(users, eq(forms.userId, users.id))
        .where(queryFilter);

      return {
        forms: items.map((f) => ({
          ...f,
          status: f.status as "draft" | "published" | "unpublished",
          visibility: f.visibility as "public" | "unlisted",
        })),
        total: countResult?.count || 0,
      };
    }),

  // 5. Admin Update Any Form Status
  adminUpdateFormStatus: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forms/status"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID"),
        status: z.enum(["draft", "published", "unpublished"]).describe("New Status"),
      }),
    )
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Charted island not found." });
      }

      await db.update(forms).set({ status: input.status }).where(eq(forms.id, input.formId));
      return {
        success: true,
        message: `Successfully set form status to ${input.status.toUpperCase()}.`,
      };
    }),

  // 6. Admin Toggle Archive on Any Form
  adminToggleArchiveForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forms/archive"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID"),
        isArchived: z.boolean().describe("Whether to archive"),
      }),
    )
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Charted island not found." });
      }

      await db.update(forms).set({ isArchived: input.isArchived }).where(eq(forms.id, input.formId));
      return {
        success: true,
        message: input.isArchived ? "Form successfully archived." : "Form successfully restored.",
      };
    }),

  // 7. Admin Delete Any Form Permanently
  adminDeleteForm: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forms/delete"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid().describe("Form UUID") }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Charted island not found." });
      }

      await db.delete(forms).where(eq(forms.id, input.formId));
      return {
        success: true,
        message: "Form was permanently erased from the Grand Line archives.",
      };
    }),
});
