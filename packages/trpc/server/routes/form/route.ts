import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { zodUndefinedModel } from "../../schema";
import { db, eq, and, like, sql, desc, notInArray } from "@repo/database";
import {
  forms,
  fields,
  fieldOptions,
  responses,
  responseAnswers,
  responseMetadata,
  formAnalytics,
  formViews,
  formThemes,
  emailNotifications,
  emailLogs,
  users,
  formCollaborators,
} from "@repo/database/schema";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendNotificationEmail } from "../../services/email";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");
const FORM_PASSWORD_SALT_ROUNDS = 12;

async function hashFormPassword(password: string): Promise<string> {
  return bcrypt.hash(password, FORM_PASSWORD_SALT_ROUNDS);
}

async function verifyFormPasswordHash(password: string, passwordHash: string): Promise<boolean> {
  if (
    passwordHash.startsWith("$2a$") ||
    passwordHash.startsWith("$2b$") ||
    passwordHash.startsWith("$2y$")
  ) {
    return bcrypt.compare(password, passwordHash);
  }

  // Backward compatibility for forms protected before bcrypt hashing was introduced.
  const legacySha256Hash = crypto.createHash("sha256").update(password).digest("hex");
  return legacySha256Hash === passwordHash;
}

// Zod schemas for our endpoints
const FieldTypeEnum = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "rating",
  "date",
]);

const LogicValidationInput = z
  .object({
    fieldId: z.string().uuid().describe("Field UUID that controls conditional visibility"),
    value: z.union([z.string(), z.number(), z.boolean()]).describe("Value that reveals the field"),
  })
  .strict();

const FieldValidationInput = z
  .object({
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    logic: LogicValidationInput.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.minLength !== undefined &&
      value.maxLength !== undefined &&
      value.minLength > value.maxLength
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minLength"],
        message: "minLength cannot be greater than maxLength",
      });
    }

    if (value.min !== undefined && value.max !== undefined && value.min > value.max) {
      ctx.addIssue({
        code: "custom",
        path: ["min"],
        message: "min cannot be greater than max",
      });
    }

    if (value.pattern !== undefined) {
      try {
        new RegExp(value.pattern);
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["pattern"],
          message: "pattern must be a valid regular expression",
        });
      }
    }
  });

const FieldOptionInput = z
  .object({
    label: z.string().min(1).describe("Option display label"),
    value: z.string().min(1).describe("Option value stored"),
    order: z.number().int().min(0).describe("Display order"),
    color: z.string().optional().describe("Optional branding color"),
  })
  .strict();

const FieldSaveInput = z
  .object({
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Provide existing ID to update, otherwise creates field"),
    type: FieldTypeEnum.describe("Field input type"),
    label: z.string().min(1).describe("Label of the input field"),
    placeholder: z.string().optional().describe("Input placeholder"),
    required: z.boolean().default(false).describe("Whether field input is required"),
    order: z.number().int().min(0).describe("Display order of the field"),
    validations: FieldValidationInput.optional().describe(
      "Field constraints such as min/max, pattern, or conditional logic",
    ),
    options: z
      .array(FieldOptionInput)
      .optional()
      .describe("List of select options (required for single/multi select)"),
  })
  .strict()
  .superRefine((field, ctx) => {
    const hasOptions = field.type === "single_select" || field.type === "multi_select";

    if (hasOptions && (!field.options || field.options.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Select fields require at least one option",
      });
    }

    if (!hasOptions && field.options !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Options are only allowed for select fields",
      });
    }

    const optionValues = field.options?.map((option) => option.value) ?? [];
    if (new Set(optionValues).size !== optionValues.length) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Option values must be unique within a field",
      });
    }
  });

const AnswerValueInput = z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]);

export const formRouter = router({
  // 1. Create a Form
  createForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create"), tags: TAGS } })
    .input(
      z.object({
        title: z.string().min(1).describe("Title of the form"),
        description: z.string().optional().describe("Optional form description"),
        themeName: z.string().optional().describe("Pre-selected theme name"),
      }),
    )
    .output(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        slug: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Generate a unique random slug based on title
      const slugBase = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const uniqueSlug = `${slugBase}-${crypto.randomBytes(3).toString("hex")}`;

      const [newForm] = await db
        .insert(forms)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          slug: uniqueSlug,
          status: "draft",
          visibility: "public",
          themeName: input.themeName || "wano",
        })
        .returning();

      if (!newForm) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create form",
        });
      }

      return {
        id: newForm.id,
        title: newForm.title,
        slug: newForm.slug,
      };
    }),

  // 2. Configure/Update Form metadata & Visibility
  updateForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/update"), tags: TAGS } })
    .input(
      z.object({
        id: z.string().uuid().describe("Form UUID"),
        title: z.string().optional().describe("Updated title"),
        description: z.string().optional().describe("Updated description"),
        slug: z.string().optional().describe("Custom form slug"),
        status: z.enum(["draft", "published", "unpublished"]).optional().describe("Form status"),
        visibility: z.enum(["public", "unlisted"]).optional().describe("Form visibility mode"),
        submitButtonText: z.string().optional().describe("Custom submit text"),
        successMessage: z.string().optional().describe("Custom submission success message"),
        redirectUrl: z.string().optional().describe("Optional redirect link after submission"),
        requireEmail: z
          .boolean()
          .optional()
          .describe("Whether submission requires respondent's email"),
        allowMultipleResponses: z
          .boolean()
          .optional()
          .describe("Whether same user can submit multiple times"),
        password: z.string().optional().describe("Optional password protection for the form"),
        responseLimit: z.number().nullable().optional().describe("Optional submission cap limit"),
        expiresAt: z.string().nullable().optional().describe("Optional expiry date string (ISO)"),
        themeName: z.string().optional().describe("Optional aesthetic theme name"),
        isMultiPage: z.boolean().optional().describe("Optional multi-page toggle status"),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Validate form exists and belongs to user
      const [form] = await db.select().from(forms).where(eq(forms.id, input.id));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this form",
        });
      }

      // Build update data
      const updateData: Partial<typeof forms.$inferInsert> = {
        title: input.title,
        description: input.description,
        status: input.status,
        visibility: input.visibility,
        submitButtonText: input.submitButtonText,
        successMessage: input.successMessage,
        redirectUrl: input.redirectUrl,
        requireEmail: input.requireEmail,
        allowMultipleResponses: input.allowMultipleResponses,
        themeName: input.themeName,
        responseLimit: input.responseLimit,
        isMultiPage: input.isMultiPage,
        expiresAt:
          input.expiresAt === undefined
            ? undefined
            : input.expiresAt
              ? new Date(input.expiresAt)
              : null,
      };

      if (input.password !== undefined) {
        updateData.passwordHash = input.password ? await hashFormPassword(input.password) : null;
      }

      if (input.slug) {
        // Validate slug uniqueness
        const existing = await db
          .select()
          .from(forms)
          .where(and(eq(forms.slug, input.slug), sql`${forms.id} != ${input.id}`));
        if (existing.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Slug "${input.slug}" is already in use by another form`,
          });
        }
        updateData.slug = input.slug;
      }

      await db.update(forms).set(updateData).where(eq(forms.id, input.id));

      return {
        success: true,
        message: "Form updated successfully",
      };
    }),

  // 3. Save Form Fields & Dynamic Options (Sync Sync)
  saveFormFields: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/save-fields"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID"),
        fields: z.array(FieldSaveInput).describe("List of dynamic fields to configure"),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        count: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Validate form exists and belongs to user
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to modify this form's fields",
        });
      }

      // Sync operation wrapped in a clean Transaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.transaction(async (tx: any) => {
        const inputFieldIds = input.fields
          .map((f) => f.id)
          .filter((id): id is string => typeof id === "string");

        // Step A: Delete fields not in our input array anymore
        if (inputFieldIds.length > 0) {
          await tx
            .delete(fields)
            .where(and(eq(fields.formId, input.formId), notInArray(fields.id, inputFieldIds)));
        } else {
          await tx.delete(fields).where(eq(fields.formId, input.formId));
        }

        // Step B: Update or insert each field
        for (const fieldInput of input.fields) {
          let fieldId = fieldInput.id;

          const valuesToSet = {
            formId: input.formId,
            type: fieldInput.type,
            label: fieldInput.label,
            placeholder: fieldInput.placeholder,
            required: fieldInput.required,
            order: fieldInput.order,
            validations: fieldInput.validations || null,
          };

          if (fieldId) {
            // Update
            await tx.update(fields).set(valuesToSet).where(eq(fields.id, fieldId));
          } else {
            // Insert
            const [newField] = await tx.insert(fields).values(valuesToSet).returning();
            fieldId = newField.id;
          }

          // Step C: Delete old options for the field and rebuild if it's select options
          await tx.delete(fieldOptions).where(eq(fieldOptions.fieldId, fieldId as string));

          if (
            (fieldInput.type === "single_select" || fieldInput.type === "multi_select") &&
            fieldInput.options
          ) {
            for (const option of fieldInput.options) {
              await tx.insert(fieldOptions).values({
                fieldId: fieldId as string,
                label: option.label,
                value: option.value,
                order: option.order,
                color: option.color,
              });
            }
          }
        }
      });

      return {
        success: true,
        count: input.fields.length,
      };
    }),

  // 4. Public explore listing (Public Forms only, draft and unlisted forms excluded)
  getPublicExploreForms: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/explore"), tags: TAGS } })
    .input(
      z.object({
        search: z.string().optional().describe("Search term matching title/description"),
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
            description: z.string().nullable(),
            slug: z.string(),
            createdAt: z.date(),
          }),
        ),
        total: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const page = Math.max(1, input.page);
      const limit = Math.max(1, input.limit);
      const offset = (page - 1) * limit;

      // Construct filter conditions
      const filters = [eq(forms.status, "published"), eq(forms.visibility, "public")];

      if (input.search) {
        filters.push(
          sql`(${forms.title} ILIKE ${`%${input.search}%`} OR ${forms.description} ILIKE ${`%${input.search}%`})`,
        );
      }

      const queryFilter = and(...filters);

      const items = await db
        .select({
          id: forms.id,
          title: forms.title,
          description: forms.description,
          slug: forms.slug,
          createdAt: forms.createdAt,
        })
        .from(forms)
        .where(queryFilter)
        .orderBy(desc(forms.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(forms)
        .where(queryFilter);

      return {
        forms: items,
        total: countResult?.count || 0,
      };
    }),

  // 5. Get Form details by slug (Public or Unlisted forms support direct slugs)
  getFormBySlug: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/by-slug"), tags: TAGS } })
    .input(
      z.object({
        slug: z.string().describe("Direct slug of the form"),
        password: z.string().optional().describe("Password lock entry validation"),
        isPreview: z
          .boolean()
          .default(false)
          .describe("Whether creator is fetching preview in editor"),
      }),
    )
    .output(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        description: z.string().nullable(),
        slug: z.string(),
        status: z.string(),
        visibility: z.string(),
        submitButtonText: z.string().nullable(),
        successMessage: z.string().nullable(),
        redirectUrl: z.string().nullable(),
        requireEmail: z.boolean(),
        themeName: z.string(),
        allowMultipleResponses: z.boolean(),
        isPasswordProtected: z.boolean(),
        passwordLocked: z.boolean(),
        responseLimitReached: z.boolean(),
        expired: z.boolean(),
        isArchived: z.boolean(),
        isMultiPage: z.boolean(),
        notifyRespondent: z.boolean(),
        fields: z.array(
          z.object({
            id: z.string().uuid(),
            type: FieldTypeEnum,
            label: z.string(),
            placeholder: z.string().nullable(),
            required: z.boolean(),
            order: z.number(),
            validations: z.any().nullable(),
            options: z
              .array(
                z.object({
                  id: z.string().uuid(),
                  label: z.string(),
                  value: z.string(),
                  order: z.number(),
                }),
              )
              .optional(),
          }),
        ),
      }),
    )
    .query(async ({ input }) => {
      // Fetch form
      const [form] = await db.select().from(forms).where(eq(forms.slug, input.slug));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Fetch email settings
      const [notifSettings] = await db
        .select()
        .from(emailNotifications)
        .where(eq(emailNotifications.formId, form.id));
      const notifyRespondent = notifSettings?.notifyRespondent ?? false;

      // Check draft / preview / unpublished permissions
      if (form.status === "draft" && !input.isPreview) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Form is currently a draft and is not public yet",
        });
      }

      if (form.status === "unpublished" && !input.isPreview) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Form is currently unpublished and is closed to submissions",
        });
      }

      if (form.isArchived && !input.isPreview) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Form has been archived and is no longer accepting responses",
        });
      }

      // Expiry constraint check
      const expired = form.expiresAt ? new Date() > form.expiresAt : false;

      // Response limits constraint check
      let responseLimitReached = false;
      if (form.responseLimit) {
        const [responseCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(responses)
          .where(eq(responses.formId, form.id));
        if ((responseCount?.count || 0) >= form.responseLimit) {
          responseLimitReached = true;
        }
      }

      // Password security check
      const isPasswordProtected = !!form.passwordHash;
      let passwordLocked = isPasswordProtected;

      if (form.passwordHash && input.password) {
        if (await verifyFormPasswordHash(input.password, form.passwordHash)) {
          passwordLocked = false;
        }
      }

      // If password is correct or not set, load the dynamic schema fields & choices
      let schemaFields: any[] = [];
      if (!passwordLocked) {
        const dbFields = await db
          .select()
          .from(fields)
          .where(eq(fields.formId, form.id))
          .orderBy(fields.order);

        for (const f of dbFields) {
          const dbOptions = await db
            .select({
              id: fieldOptions.id,
              label: fieldOptions.label,
              value: fieldOptions.value,
              order: fieldOptions.order,
            })
            .from(fieldOptions)
            .where(eq(fieldOptions.fieldId, f.id))
            .orderBy(fieldOptions.order);

          schemaFields.push({
            id: f.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            required: f.required,
            order: f.order,
            validations: f.validations,
            options: dbOptions.length > 0 ? dbOptions : undefined,
          });
        }
      }

      // Register form views statistic increment if not previewing
      if (!input.isPreview && !passwordLocked && !expired && !responseLimitReached) {
        // Log a visitor view
        await db.insert(formViews).values({
          formId: form.id,
          visitorId: "anonymous-visitor",
          userAgent: "trpc-api-client",
        });

        // Daily aggregate tracking view
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [dailyAnalytics] = await db
          .select()
          .from(formAnalytics)
          .where(and(eq(formAnalytics.formId, form.id), eq(formAnalytics.date, today)));

        if (dailyAnalytics) {
          await db
            .update(formAnalytics)
            .set({ views: dailyAnalytics.views + 1 })
            .where(eq(formAnalytics.id, dailyAnalytics.id));
        } else {
          await db.insert(formAnalytics).values({
            formId: form.id,
            date: today,
            views: 1,
            submissions: 0,
            dropoffs: 0,
          });
        }
      }

      return {
        id: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
        status: form.status,
        visibility: form.visibility,
        submitButtonText: form.submitButtonText,
        successMessage: form.successMessage,
        redirectUrl: form.redirectUrl,
        themeName: form.themeName,
        requireEmail: form.requireEmail,
        allowMultipleResponses: form.allowMultipleResponses,
        isPasswordProtected,
        passwordLocked,
        responseLimitReached,
        expired,
        isArchived: form.isArchived,
        isMultiPage: form.isMultiPage,
        notifyRespondent,
        fields: schemaFields,
      };
    }),

  // 6. Direct password validation check endpoint
  verifyFormPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/verify-password"), tags: TAGS } })
    .input(
      z.object({
        slug: z.string().describe("Direct form slug"),
        password: z.string().describe("Form entry password"),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [form] = await db.select().from(forms).where(eq(forms.slug, input.slug));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (!form.passwordHash) {
        return {
          success: true,
          message: "Form is not password protected",
        };
      }

      const passwordMatches = await verifyFormPasswordHash(input.password, form.passwordHash);
      if (!passwordMatches) {
        return {
          success: false,
          message: "Incorrect password",
        };
      }

      return {
        success: true,
        message: "Password verified successfully",
      };
    }),

  // 7. Dynamic schema Zod submission endpoint
  submitFormResponse: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/submit"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID to submit to"),
        password: z.string().optional().describe("Password for password-protected forms"),
        respondentEmail: z.string().email().optional().describe("Respondent email"),
        emailMeCopy: z
          .boolean()
          .optional()
          .default(false)
          .describe("Whether to email a copy to respondent"),
        answers: z
          .array(
            z.object({
              fieldId: z.string().uuid().describe("Question Field UUID"),
              value: AnswerValueInput.describe(
                "Submittal value (string, string[], number, boolean)",
              ),
            }),
          )
          .describe("Submission answers lists"),
        metadata: z
          .object({
            ipHash: z.string().default("test-ip-hash"),
            userAgent: z.string().optional(),
            country: z.string().optional(),
            completionTime: z.number().optional(),
            referrer: z.string().optional(),
          })
          .default({ ipHash: "test-ip-hash" }),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        responseId: z.string().uuid(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Safeguards and constraints verification
      if (form.status === "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Form submissions are disabled in draft preview status",
        });
      }

      if (form.status === "unpublished") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submissions rejected: this form is currently unpublished",
        });
      }

      if (form.expiresAt && new Date() > form.expiresAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submissions rejected: this form has expired",
        });
      }

      if (form.passwordHash) {
        const passwordMatches = input.password
          ? await verifyFormPasswordHash(input.password, form.passwordHash)
          : false;

        if (!passwordMatches) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Password verification is required to submit this form",
          });
        }
      }

      if (form.requireEmail && !input.respondentEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is required to submit this form",
        });
      }

      if (form.responseLimit) {
        const [responseCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(responses)
          .where(eq(responses.formId, form.id));
        if ((responseCount?.count || 0) >= form.responseLimit) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Submissions rejected: response limit cap has been reached",
          });
        }
      }

      // Secure backend IP Hashing (Audit Item 2)
      const xForwardedFor = ctx.req.headers["x-forwarded-for"];
      const clientIp = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : typeof xForwardedFor === "string"
          ? xForwardedFor.split(",")[0]?.trim()
          : ctx.req.socket.remoteAddress || "unknown-ip";
      
      const secureIpHash = crypto.createHash("sha256").update(clientIp || "").digest("hex");

      // Enforce allowMultipleResponses Check (Audit Item 1)
      if (!form.allowMultipleResponses) {
        const existingConditions = [eq(responses.formId, form.id)];
        
        if (form.requireEmail && input.respondentEmail) {
          existingConditions.push(eq(responses.respondentEmail, input.respondentEmail));
        } else {
          // Fall back to secure IP hash check
          existingConditions.push(eq(responseMetadata.ipHash, secureIpHash));
        }

        const duplicateCheck = await db
          .select()
          .from(responses)
          .leftJoin(responseMetadata, eq(responses.id, responseMetadata.responseId))
          .where(and(...existingConditions))
          .limit(1);

        if (duplicateCheck.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Submissions rejected: You have already submitted a response for this form.",
          });
        }
      }

      // Fetch dynamic fields configuration
      const formFields = await db.select().from(fields).where(eq(fields.formId, form.id));

      const validationErrors: string[] = [];
      const validatedAnswers: Array<{ fieldId: string; value: any }> = [];

      // DYNAMIC VALIDATION PIPELINE
      for (const field of formFields) {
        const submitted = input.answers.find((a) => a.fieldId === field.id);
        const value = submitted?.value;

        // Required flag check
        const isBlank =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        // Conditional Logic branching check: if condition fails, the field should be skipped
        if (field.validations && typeof field.validations === "object") {
          const logic = (field.validations as any).logic;
          if (logic && typeof logic === "object") {
            const dependFieldId = logic.fieldId;
            const expectedValue = logic.value;
            const dependentAnswer = input.answers.find((a) => a.fieldId === dependFieldId);
            const conditionMet = Array.isArray(dependentAnswer?.value)
              ? dependentAnswer.value.includes(String(expectedValue))
              : dependentAnswer?.value !== undefined &&
                String(dependentAnswer.value) === String(expectedValue);

            // Skip validation & storage if dependency condition isn't met (i.e. field was hidden)
            if (!conditionMet) {
              continue;
            }
          }
        }

        if (field.required && isBlank) {
          validationErrors.push(`Field "${field.label}" is required.`);
          continue;
        }

        if (isBlank) {
          continue; // Optional field empty - valid
        }

        // Type-specific schema constraints check
        switch (field.type) {
          case "short_text":
          case "long_text": {
            if (typeof value !== "string") {
              validationErrors.push(`Field "${field.label}" must be a text string.`);
              break;
            }
            // Length checks
            const bounds = field.validations as any;
            if (bounds) {
              if (typeof bounds.minLength === "number" && value.length < bounds.minLength) {
                validationErrors.push(
                  `"${field.label}" length must be >= ${bounds.minLength} chars.`,
                );
              }
              if (typeof bounds.maxLength === "number" && value.length > bounds.maxLength) {
                validationErrors.push(
                  `"${field.label}" length must be <= ${bounds.maxLength} chars.`,
                );
              }
              if (typeof bounds.pattern === "string" && !new RegExp(bounds.pattern).test(value)) {
                validationErrors.push(
                  `"${field.label}" input does not match expected format pattern.`,
                );
              }
            }
            validatedAnswers.push({ fieldId: field.id, value });
            break;
          }

          case "email": {
            if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              validationErrors.push(`Field "${field.label}" must be a valid email address.`);
            } else {
              validatedAnswers.push({ fieldId: field.id, value });
            }
            break;
          }

          case "number": {
            const num = Number(value);
            if (isNaN(num)) {
              validationErrors.push(`Field "${field.label}" must be a valid number.`);
              break;
            }
            // Numeric range limits
            const bounds = field.validations as any;
            if (bounds) {
              if (typeof bounds.min === "number" && num < bounds.min) {
                validationErrors.push(`Field "${field.label}" value must be >= ${bounds.min}.`);
              }
              if (typeof bounds.max === "number" && num > bounds.max) {
                validationErrors.push(`Field "${field.label}" value must be <= ${bounds.max}.`);
              }
            }
            validatedAnswers.push({ fieldId: field.id, value: num });
            break;
          }

          case "single_select": {
            if (typeof value !== "string") {
              validationErrors.push(`Field "${field.label}" must select a single option.`);
              break;
            }
            // Validate it matches dynamic choices allowed
            const optExists = await db
              .select()
              .from(fieldOptions)
              .where(and(eq(fieldOptions.fieldId, field.id), eq(fieldOptions.value, value)));
            if (optExists.length === 0) {
              validationErrors.push(
                `"${value}" is not a valid selection for field "${field.label}".`,
              );
            } else {
              validatedAnswers.push({ fieldId: field.id, value });
            }
            break;
          }

          case "multi_select": {
            if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
              validationErrors.push(`Field "${field.label}" must select an array of choices.`);
              break;
            }
            // Validate options allowed
            const dbOpts = await db
              .select({ value: fieldOptions.value })
              .from(fieldOptions)
              .where(eq(fieldOptions.fieldId, field.id));
            const allowedValues = dbOpts.map((o: { value: string }) => o.value);

            const invalidChoices = value.filter((c) => !allowedValues.includes(c));
            if (invalidChoices.length > 0) {
              validationErrors.push(
                `Choices [${invalidChoices.join(", ")}] are invalid options for field "${field.label}".`,
              );
            } else {
              validatedAnswers.push({ fieldId: field.id, value });
            }
            break;
          }

          case "rating": {
            const valNum = Number(value);
            if (isNaN(valNum) || valNum < 1 || valNum > 5) {
              validationErrors.push(`Field "${field.label}" must be a rating between 1 and 5.`);
            } else {
              validatedAnswers.push({ fieldId: field.id, value: valNum });
            }
            break;
          }

          case "checkbox": {
            if (typeof value !== "boolean") {
              validationErrors.push(`Field "${field.label}" must be a true/false boolean.`);
            } else {
              validatedAnswers.push({ fieldId: field.id, value });
            }
            break;
          }

          case "date": {
            if (typeof value !== "string") {
              validationErrors.push(`Field "${field.label}" must be a valid date format string.`);
              break;
            }

            if (isNaN(Date.parse(value))) {
              validationErrors.push(`Field "${field.label}" must be a valid date format string.`);
            } else {
              validatedAnswers.push({ fieldId: field.id, value });
            }
            break;
          }
        }
      }

      // Throw bad request if validation failed
      if (validationErrors.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Submission validation failed:\n- ${validationErrors.join("\n- ")}`,
        });
      }

      // Insert response, answers, metadata
      const [newResponse] = await db
        .insert(responses)
        .values({
          formId: form.id,
          respondentEmail: input.respondentEmail || null,
        })
        .returning();

      if (!newResponse) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create response record",
        });
      }

      for (const ans of validatedAnswers) {
        await db.insert(responseAnswers).values({
          responseId: newResponse.id,
          fieldId: ans.fieldId,
          value: ans.value,
        });
      }

      await db.insert(responseMetadata).values({
        responseId: newResponse.id,
        ipHash: secureIpHash,
        userAgent: input.metadata.userAgent || null,
        country: input.metadata.country || null,
        completionTime: input.metadata.completionTime || null,
        referrer: input.metadata.referrer || null,
      });

      // Daily analytics incremental tracking
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [dailyAnalytics] = await db
        .select()
        .from(formAnalytics)
        .where(and(eq(formAnalytics.formId, form.id), eq(formAnalytics.date, today)));

      if (dailyAnalytics) {
        // Increment submissions
        await db
          .update(formAnalytics)
          .set({ submissions: dailyAnalytics.submissions + 1 })
          .where(eq(formAnalytics.id, dailyAnalytics.id));
      } else {
        await db.insert(formAnalytics).values({
          formId: form.id,
          date: today,
          views: 1,
          submissions: 1,
          dropoffs: 0,
        });
      }

      // Email notifications flow
      try {
        const [settings] = await db
          .select()
          .from(emailNotifications)
          .where(eq(emailNotifications.formId, form.id));

        if (settings) {
          // Prepare human-readable formatted answers list for inclusion in emails
          const formattedAnswers = validatedAnswers.map((ans) => {
            const f = formFields.find((field) => field.id === ans.fieldId);
            return {
              label: f ? f.label : "Question",
              value: ans.value,
              type: f ? f.type : "short_text",
            };
          });

          // 1. Notify Creator
          if (settings.notifyCreator) {
            const [creator] = await db
              .select({ email: users.email })
              .from(users)
              .where(eq(users.id, form.userId));

            if (creator) {
              const subject = `New submission for ${form.title}`;

              let emailStatus: "sent" | "failed" = "sent";
              try {
                await sendNotificationEmail({
                  to: creator.email,
                  subject,
                  formTitle: form.title,
                  themeName: form.themeName,
                  type: "creator",
                  answers: formattedAnswers,
                });
              } catch (emailErr) {
                console.error("Nodemailer failed for creator notification:", emailErr);
                emailStatus = "failed";
              }

              await db.insert(emailLogs).values({
                to: creator.email,
                subject,
                type: "creator_notification",
                status: emailStatus,
                formId: form.id,
                responseId: newResponse.id,
              });
            }
          }

          // 2. Notify Respondent
          if (settings.notifyRespondent && input.emailMeCopy && input.respondentEmail) {
            const subject = `Submission confirmation: ${form.title}`;

            let emailStatus: "sent" | "failed" = "sent";
            try {
              await sendNotificationEmail({
                to: input.respondentEmail,
                subject,
                formTitle: form.title,
                themeName: form.themeName,
                type: "respondent",
                answers: formattedAnswers,
              });
            } catch (emailErr) {
              console.error("Nodemailer failed for respondent confirmation:", emailErr);
              emailStatus = "failed";
            }

            await db.insert(emailLogs).values({
              to: input.respondentEmail,
              subject,
              type: "respondent_confirmation",
              status: emailStatus,
              formId: form.id,
              responseId: newResponse.id,
            });
          }
        }
      } catch (err) {
        console.error("Failed to run email notification flow:", err);
      }

      return {
        success: true,
        responseId: newResponse.id,
        message: form.successMessage || "Thank you! Your response has been submitted successfully.",
      };
    }),

  // 8. View Form responses with filtering & Pagination
  getFormResponses: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/responses"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID"),
        respondentEmail: z.string().optional().describe("Filter by respondent email"),
        page: z.number().default(1).describe("Pagination page"),
        limit: z.number().default(10).describe("Pagination size limit"),
      }),
    )
    .output(
      z.object({
        responses: z.array(
          z.object({
            id: z.string().uuid(),
            respondentEmail: z.string().nullable(),
            submittedAt: z.date(),
            answers: z.array(
              z.object({
                fieldLabel: z.string(),
                fieldType: z.string(),
                value: z.any(),
              }),
            ),
            metadata: z
              .object({
                country: z.string().nullable(),
                userAgent: z.string().nullable(),
                completionTime: z.number().nullable(),
              })
              .nullable(),
          }),
        ),
        total: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Validate form exists and belongs to user
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this form's responses",
        });
      }

      const page = Math.max(1, input.page);
      const limit = Math.max(1, input.limit);
      const offset = (page - 1) * limit;

      const filters = [eq(responses.formId, input.formId)];
      if (input.respondentEmail) {
        filters.push(like(responses.respondentEmail, `%${input.respondentEmail}%`));
      }

      const queryFilter = and(...filters);

      // Load responses
      const items = await db
        .select()
        .from(responses)
        .where(queryFilter)
        .orderBy(desc(responses.submittedAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(responses)
        .where(queryFilter);

      const responseDetails: any[] = [];

      for (const res of items) {
        const answersList = await db
          .select({
            fieldLabel: fields.label,
            fieldType: fields.type,
            value: responseAnswers.value,
          })
          .from(responseAnswers)
          .innerJoin(fields, eq(responseAnswers.fieldId, fields.id))
          .where(eq(responseAnswers.responseId, res.id));

        const [meta] = await db
          .select({
            country: responseMetadata.country,
            userAgent: responseMetadata.userAgent,
            completionTime: responseMetadata.completionTime,
          })
          .from(responseMetadata)
          .where(eq(responseMetadata.responseId, res.id));

        responseDetails.push({
          id: res.id,
          respondentEmail: res.respondentEmail,
          submittedAt: res.submittedAt,
          answers: answersList,
          metadata: meta || null,
        });
      }

      return {
        responses: responseDetails,
        total: countResult?.count || 0,
      };
    }),

  // 9. Export responses to CSV
  exportResponsesToCsv: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/export-csv"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID"),
      }),
    )
    .output(
      z.object({
        csvContent: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Load form and dynamic fields
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to export responses for this form",
        });
      }

      const formFields = await db
        .select()
        .from(fields)
        .where(eq(fields.formId, form.id))
        .orderBy(fields.order);

      const headers = [
        "Respondent Email",
        "Submitted At",
        ...formFields.map((f: typeof fields.$inferSelect) => f.label),
      ];

      // Fetch all submissions
      const submissions = await db
        .select()
        .from(responses)
        .where(eq(responses.formId, form.id))
        .orderBy(desc(responses.submittedAt));

      const rows: string[][] = [headers];

      for (const res of submissions) {
        const row: string[] = [res.respondentEmail || "Anonymous", res.submittedAt.toISOString()];

        const answersList = await db
          .select()
          .from(responseAnswers)
          .where(eq(responseAnswers.responseId, res.id));

        for (const field of formFields) {
          const ans = answersList.find(
            (a: typeof responseAnswers.$inferSelect) => a.fieldId === field.id,
          );
          if (ans) {
            const rawVal = ans.value;
            if (Array.isArray(rawVal)) {
              row.push(JSON.stringify(rawVal));
            } else {
              row.push(String(rawVal));
            }
          } else {
            row.push(""); // empty
          }
        }

        rows.push(row);
      }

      // Convert rows to double-quoted escaped CSV values
      const csvString = rows
        .map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))
        .join("\r\n");

      return {
        csvContent: csvString,
      };
    }),

  // 10. Dashboard Analytics statistics
  getFormAnalytics: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/analytics"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID"),
      }),
    )
    .output(
      z.object({
        totalViews: z.number(),
        totalSubmissions: z.number(),
        conversionRate: z.number(),
        averageCompletionTime: z.number(),
        dailyTrends: z.array(
          z.object({
            date: z.string(),
            views: z.number(),
            submissions: z.number(),
          }),
        ),
        fieldDistribution: z.array(
          z.object({
            fieldLabel: z.string(),
            fieldType: z.string(),
            stats: z.record(z.string(), z.unknown()),
          }),
        ),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Validate form exists and belongs to user
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this form's analytics",
        });
      }

      // 1. Compute views count and submissions aggregates
      const [viewsCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(formViews)
        .where(eq(formViews.formId, input.formId));

      const [submissionsCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(responses)
        .where(eq(responses.formId, input.formId));

      const totalViews = viewsCount?.count || 0;
      const totalSubmissions = submissionsCount?.count || 0;
      const conversionRate =
        totalViews > 0 ? parseFloat(((totalSubmissions / totalViews) * 100).toFixed(1)) : 0;

      // 2. Average completion time in seconds
      const [avgTimeResult] = await db
        .select({ avg: sql<number>`avg(${responseMetadata.completionTime})::float` })
        .from(responseMetadata)
        .innerJoin(responses, eq(responseMetadata.responseId, responses.id))
        .where(eq(responses.formId, input.formId));
      const averageCompletionTime = avgTimeResult?.avg ? Math.round(avgTimeResult.avg) : 0;

      // 3. Daily trends aggregates
      const trends = await db
        .select()
        .from(formAnalytics)
        .where(eq(formAnalytics.formId, input.formId))
        .orderBy(formAnalytics.date);

      const dailyTrends = trends.map((t: typeof formAnalytics.$inferSelect) => ({
        date: t.date.toISOString().split("T")[0]!,
        views: t.views,
        submissions: t.submissions,
      }));

      // 4. Multiple Choice options / rating answer distribution statistics
      const formFields = await db.select().from(fields).where(eq(fields.formId, input.formId));

      const fieldDistribution: any[] = [];

      for (const field of formFields) {
        const stats: Record<string, any> = {};

        if (field.type === "single_select" || field.type === "multi_select") {
          const answers = await db
            .select({ value: responseAnswers.value })
            .from(responseAnswers)
            .where(eq(responseAnswers.fieldId, field.id));

          answers.forEach((ans: { value: unknown }) => {
            const val = ans.value;
            if (Array.isArray(val)) {
              val.forEach((v) => {
                const str = String(v);
                stats[str] = (stats[str] || 0) + 1;
              });
            } else {
              const str = String(val);
              stats[str] = (stats[str] || 0) + 1;
            }
          });
        } else if (field.type === "rating") {
          const answers = await db
            .select({ value: responseAnswers.value })
            .from(responseAnswers)
            .where(eq(responseAnswers.fieldId, field.id));

          let sum = 0;
          let count = 0;
          answers.forEach((ans: { value: unknown }) => {
            const num = Number(ans.value);
            if (!isNaN(num)) {
              sum += num;
              count++;
              stats[num] = (stats[num] || 0) + 1;
            }
          });
          stats.average = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
        } else if (field.type === "checkbox") {
          const answers = await db
            .select({ value: responseAnswers.value })
            .from(responseAnswers)
            .where(eq(responseAnswers.fieldId, field.id));

          let yes = 0;
          let no = 0;
          answers.forEach((ans: { value: unknown }) => {
            if (ans.value === true || ans.value === "true") {
              yes++;
            } else {
              no++;
            }
          });
          stats.true = yes;
          stats.false = no;
        }

        fieldDistribution.push({
          fieldLabel: field.label,
          fieldType: field.type,
          stats,
        });
      }

      return {
        totalViews,
        totalSubmissions,
        conversionRate,
        averageCompletionTime,
        dailyTrends,
        fieldDistribution,
      };
    }),

  // 11. Dynamic QR Code generation payload
  getFormQrCode: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/qr-code"), tags: TAGS } })
    .input(
      z.object({
        slug: z.string().describe("Direct form slug to redirect to"),
      }),
    )
    .output(
      z.object({
        qrCodeUrl: z.string().describe("Interactive QR Code image URL"),
      }),
    )
    .query(async ({ input }) => {
      // Dynamic public QR Server image API with proper dimensions & redirection parameters
      const shareUrl = `https://local.drizzle.studio/form/${input.slug}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        shareUrl,
      )}`;

      return {
        qrCodeUrl,
      };
    }),

  // 12. Predefined Themes & Template galleries
  getThemesAndTemplates: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/templates-themes"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(
      z.object({
        themes: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string(),
            primaryColor: z.string(),
            backgroundColor: z.string(),
            fontFamily: z.string(),
            backgroundImage: z.string().nullable(),
          }),
        ),
        templates: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            fields: z.array(z.string()),
          }),
        ),
      }),
    )
    .query(async () => {
      // Retrieve themes
      let dbThemes = await db.select().from(formThemes);

      if (dbThemes.length === 0) {
        // Seed default themes
        await db.insert(formThemes).values([
          {
            name: "wano",
            primaryColor: "#C9A84C",
            backgroundColor: "#0A1628",
            fontFamily: "Noto Serif JP",
            isDefault: true,
          },
          {
            name: "stark",
            primaryColor: "#00f0ff",
            backgroundColor: "#070b13",
            fontFamily: "Courier New",
            isDefault: false,
          },
          {
            name: "batman",
            primaryColor: "#F5B921",
            backgroundColor: "#0B0C10",
            fontFamily: "Segoe UI",
            isDefault: false,
          },
        ]);
        dbThemes = await db.select().from(formThemes);
      }

      // Default fallback templates
      const defaultTemplates = [
        {
          title: "Startup Feedback Form",
          description: "Gather detailed developer metrics and customer feedback.",
          fields: ["Full Name", "Work Email", "Product Rating", "Comments"],
        },
        {
          title: "Anime Fan Club Poll",
          description: "Ask your community about their favorite series and genres.",
          fields: ["Nickname", "Favorite Series", "Hours Watched per Week", "Review"],
        },
      ];

      return {
        themes: dbThemes.map((t: typeof formThemes.$inferSelect) => ({
          id: t.id,
          name: t.name,
          primaryColor: t.primaryColor,
          backgroundColor: t.backgroundColor,
          fontFamily: t.fontFamily,
          backgroundImage: t.backgroundImage,
        })),
        templates: defaultTemplates,
      };
    }),

  // 13. Save Email Notification Settings (Protected)
  saveEmailNotificationSettings: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/notifications/settings"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID"),
        notifyCreator: z.boolean().describe("Whether to notify form creator"),
        notifyRespondent: z.boolean().describe("Whether to notify respondent"),
        creatorTemplate: z.string().optional().describe("Custom email template for creator"),
        respondentTemplate: z.string().optional().describe("Custom email template for respondent"),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to manage notification settings for this form",
        });
      }

      const [existing] = await db
        .select()
        .from(emailNotifications)
        .where(eq(emailNotifications.formId, input.formId));

      if (existing) {
        await db
          .update(emailNotifications)
          .set({
            notifyCreator: input.notifyCreator,
            notifyRespondent: input.notifyRespondent,
            creatorTemplate: input.creatorTemplate ?? null,
            respondentTemplate: input.respondentTemplate ?? null,
          })
          .where(eq(emailNotifications.formId, input.formId));
      } else {
        await db.insert(emailNotifications).values({
          formId: input.formId,
          notifyCreator: input.notifyCreator,
          notifyRespondent: input.notifyRespondent,
          creatorTemplate: input.creatorTemplate ?? null,
          respondentTemplate: input.respondentTemplate ?? null,
        });
      }

      return {
        success: true,
        message: "Email notification settings saved successfully",
      };
    }),

  // 14. Get Email Notification Settings (Protected)
  getEmailNotificationSettings: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/notifications/settings"), tags: TAGS } })
    .input(
      z.object({
        formId: z.string().uuid().describe("Form UUID"),
      }),
    )
    .output(
      z.object({
        formId: z.string().uuid(),
        notifyCreator: z.boolean(),
        notifyRespondent: z.boolean(),
        creatorTemplate: z.string().nullable(),
        respondentTemplate: z.string().nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view notification settings for this form",
        });
      }

      const [settings] = await db
        .select()
        .from(emailNotifications)
        .where(eq(emailNotifications.formId, input.formId));

      if (!settings) {
        return {
          formId: input.formId,
          notifyCreator: false,
          notifyRespondent: false,
          creatorTemplate: null,
          respondentTemplate: null,
        };
      }

      return {
        formId: settings.formId,
        notifyCreator: settings.notifyCreator,
        notifyRespondent: settings.notifyRespondent,
        creatorTemplate: settings.creatorTemplate,
        respondentTemplate: settings.respondentTemplate,
      };
    }),

  // 15. Get Form details by ID (Protected, only owner can fetch details in editor)
  getFormById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/by-id"), tags: TAGS } })
    .input(
      z.object({
        id: z.string().uuid().describe("UUID of the form"),
      }),
    )
    .output(
      z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string(),
        description: z.string().nullable(),
        slug: z.string(),
        status: z.string(),
        visibility: z.string(),
        submitButtonText: z.string().nullable(),
        successMessage: z.string().nullable(),
        redirectUrl: z.string().nullable(),
        themeName: z.string(),
        requireEmail: z.boolean(),
        allowMultipleResponses: z.boolean(),
        isArchived: z.boolean(),
        isMultiPage: z.boolean(),
        passwordHash: z.string().nullable(),
        responseLimit: z.number().nullable(),
        expiresAt: z.date().nullable(),
        fields: z.array(
          z.object({
            id: z.string().uuid(),
            type: FieldTypeEnum,
            label: z.string(),
            placeholder: z.string().nullable(),
            required: z.boolean(),
            order: z.number(),
            validations: z.any().nullable(),
            options: z
              .array(
                z.object({
                  id: z.string().uuid(),
                  label: z.string(),
                  value: z.string(),
                  order: z.number(),
                }),
              )
              .optional(),
          }),
        ),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Fetch form
      const [form] = await db.select().from(forms).where(eq(forms.id, input.id));
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this form",
        });
      }

      // Load the fields and choices
      const dbFields = await db
        .select()
        .from(fields)
        .where(eq(fields.formId, form.id))
        .orderBy(fields.order);

      const schemaFields: any[] = [];
      for (const f of dbFields) {
        const dbOptions = await db
          .select({
            id: fieldOptions.id,
            label: fieldOptions.label,
            value: fieldOptions.value,
            order: fieldOptions.order,
          })
          .from(fieldOptions)
          .where(eq(fieldOptions.fieldId, f.id))
          .orderBy(fieldOptions.order);

        schemaFields.push({
          id: f.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          order: f.order,
          validations: f.validations,
          options: dbOptions.length > 0 ? dbOptions : undefined,
        });
      }

      return {
        id: form.id,
        userId: form.userId,
        title: form.title,
        description: form.description,
        slug: form.slug,
        status: form.status,
        visibility: form.visibility,
        submitButtonText: form.submitButtonText,
        successMessage: form.successMessage,
        redirectUrl: form.redirectUrl,
        requireEmail: form.requireEmail,
        allowMultipleResponses: form.allowMultipleResponses,
        isArchived: form.isArchived,
        isMultiPage: form.isMultiPage,
        passwordHash: form.passwordHash,
        responseLimit: form.responseLimit,
        expiresAt: form.expiresAt,
        themeName: form.themeName,
        fields: schemaFields,
      };
    }),

  // 16. Get creator's own forms (Protected, lists all forms belonging to user, including draft/unpublished)
  getUserForms: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/user-forms"), tags: TAGS } })
    .input(
      z.object({
        search: z.string().optional().describe("Search term matching title/description"),
        filter: z
          .enum(["active", "archived", "all"])
          .default("active")
          .describe("Filter forms by status"),
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
            description: z.string().nullable(),
            slug: z.string(),
            status: z.enum(["draft", "published", "unpublished"]),
            visibility: z.enum(["public", "unlisted"]),
            expiresAt: z.date().nullable(),
            passwordHash: z.string().nullable(),
            isArchived: z.boolean(),
            isMultiPage: z.boolean(),
            createdAt: z.date(),
            responseCount: z.number(),
          }),
        ),
        total: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const page = Math.max(1, input.page);
      const limit = Math.max(1, input.limit);
      const offset = (page - 1) * limit;

      // Filter by current user
      const filters = [eq(forms.userId, ctx.user.id)];

      if (input.filter === "active") {
        filters.push(eq(forms.isArchived, false));
      } else if (input.filter === "archived") {
        filters.push(eq(forms.isArchived, true));
      }

      if (input.search) {
        filters.push(
          sql`(${forms.title} ILIKE ${`%${input.search}%`} OR ${forms.description} ILIKE ${`%${input.search}%`})`,
        );
      }

      const queryFilter = and(...filters);

      // Load user forms
      const items = await db
        .select({
          id: forms.id,
          title: forms.title,
          description: forms.description,
          slug: forms.slug,
          status: forms.status,
          visibility: forms.visibility,
          expiresAt: forms.expiresAt,
          passwordHash: forms.passwordHash,
          isArchived: forms.isArchived,
          isMultiPage: forms.isMultiPage,
          createdAt: forms.createdAt,
        })
        .from(forms)
        .where(queryFilter)
        .orderBy(desc(forms.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(forms)
        .where(queryFilter);

      // Fetch dynamic response count for each form
      const formsWithCounts = await Promise.all(
        items.map(async (formItem) => {
          const [respCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(responses)
            .where(eq(responses.formId, formItem.id));

          return {
            ...formItem,
            status: formItem.status as "draft" | "published" | "unpublished",
            visibility: formItem.visibility as "public" | "unlisted",
            expiresAt: formItem.expiresAt ? new Date(formItem.expiresAt) : null,
            isArchived: formItem.isArchived,
            isMultiPage: formItem.isMultiPage,
            responseCount: respCount?.count || 0,
          };
        }),
      );

      return {
        forms: formsWithCounts,
        total: countResult?.count || 0,
      };
    }),

  // 17. Archive a Form
  archiveForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/archive"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.id));
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      if (form.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden" });
      }
      await db.update(forms).set({ isArchived: true }).where(eq(forms.id, input.id));
      return { success: true, message: "Form archived successfully" };
    }),

  // 18. Unarchive a Form
  unarchiveForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/unarchive"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.id));
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      if (form.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden" });
      }
      await db.update(forms).set({ isArchived: false }).where(eq(forms.id, input.id));
      return { success: true, message: "Form restored successfully" };
    }),

  // 19. Clone a Form (duplicates settings, fields, field choices, notifications)
  cloneForm: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/clone"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(
      z.object({
        success: z.boolean(),
        id: z.string().uuid(),
        slug: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Fetch original form
      const [form] = await db.select().from(forms).where(eq(forms.id, input.id));
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      if (form.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden" });
      }

      // Generate a new slug based on title + copy + random bytes
      const slugBase = `${form.title}-copy`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const uniqueSlug = `${slugBase}-${crypto.randomBytes(3).toString("hex")}`;

      let clonedFormId = "";
      let clonedSlug = "";

      // 2. Clone operations in a Transaction
      await db.transaction(async (tx: any) => {
        // A. Insert cloned form
        const [newForm] = await tx
          .insert(forms)
          .values({
            userId: ctx.user.id,
            title: `${form.title} (Copy)`,
            description: form.description,
            slug: uniqueSlug,
            status: "draft", // Keeping it in draft is safer
            visibility: form.visibility,
            themeId: form.themeId,
            themeName: form.themeName,
            submitButtonText: form.submitButtonText,
            successMessage: form.successMessage,
            redirectUrl: form.redirectUrl,
            requireEmail: form.requireEmail,
            allowMultipleResponses: form.allowMultipleResponses,
            passwordHash: form.passwordHash,
            responseLimit: form.responseLimit,
            expiresAt: form.expiresAt,
            isArchived: false,
            isMultiPage: form.isMultiPage,
          })
          .returning();

        clonedFormId = newForm.id;
        clonedSlug = newForm.slug;

        // B. Fetch original fields
        const originalFields = await tx
          .select()
          .from(fields)
          .where(eq(fields.formId, form.id))
          .orderBy(fields.order);

        // C. Duplicate fields and their choices
        for (const field of originalFields) {
          const [newField] = await tx
            .insert(fields)
            .values({
              formId: clonedFormId,
              type: field.type,
              label: field.label,
              placeholder: field.placeholder,
              required: field.required,
              order: field.order,
              validations: field.validations,
            })
            .returning();

          // Fetch options for the current field
          const originalOptions = await tx
            .select()
            .from(fieldOptions)
            .where(eq(fieldOptions.fieldId, field.id))
            .orderBy(fieldOptions.order);

          // Duplicate field options
          for (const opt of originalOptions) {
            await tx.insert(fieldOptions).values({
              fieldId: newField.id,
              label: opt.label,
              value: opt.value,
              order: opt.order,
              color: opt.color,
            });
          }
        }

        // D. Fetch original notifications
        const [notif] = await tx
          .select()
          .from(emailNotifications)
          .where(eq(emailNotifications.formId, form.id));
        if (notif) {
          await tx.insert(emailNotifications).values({
            formId: clonedFormId,
            notifyCreator: notif.notifyCreator,
            notifyRespondent: notif.notifyRespondent,
            creatorTemplate: notif.creatorTemplate,
            respondentTemplate: notif.respondentTemplate,
          });
        }
      });

      return {
        success: true,
        id: clonedFormId,
        slug: clonedSlug,
        message: "Form cloned successfully",
      };
    }),

  getFormCollaborators: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      if (form.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden" });

      return db
        .select({
          id: formCollaborators.id,
          role: formCollaborators.role,
          invitedAt: formCollaborators.invitedAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
          },
        })
        .from(formCollaborators)
        .innerJoin(users, eq(formCollaborators.userId, users.id))
        .where(eq(formCollaborators.formId, input.formId));
    }),

  addFormCollaborator: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(["viewer", "editor"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [form] = await db.select().from(forms).where(eq(forms.id, input.formId));
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      if (form.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden" });

      const [invitedUser] = await db.select().from(users).where(eq(users.email, input.email));
      if (!invitedUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found with this email" });

      if (invitedUser.id === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot add yourself as a collaborator" });
      }

      // Check if already a collaborator
      const [existing] = await db
        .select()
        .from(formCollaborators)
        .where(and(eq(formCollaborators.formId, input.formId), eq(formCollaborators.userId, invitedUser.id)));
      if (existing) throw new TRPCError({ code: "BAD_REQUEST", message: "User is already a collaborator" });

      await db.insert(formCollaborators).values({
        formId: input.formId,
        userId: invitedUser.id,
        role: input.role,
      });

      return { success: true, message: "Collaborator added successfully" };
    }),

  removeFormCollaborator: protectedProcedure
    .input(z.object({ collaboratorId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [collab] = await db.select().from(formCollaborators).where(eq(formCollaborators.id, input.collaboratorId));
      if (!collab) throw new TRPCError({ code: "NOT_FOUND", message: "Collaborator entry not found" });

      const [form] = await db.select().from(forms).where(eq(forms.id, collab.formId));
      if (!form || form.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden" });

      await db.delete(formCollaborators).where(eq(formCollaborators.id, input.collaboratorId));
      return { success: true, message: "Collaborator removed successfully" };
    }),
});
