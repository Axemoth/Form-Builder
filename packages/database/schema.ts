import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  integer,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// PostgreSQL Native Enums
// ==========================================

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "unpublished"]);
export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);
export const fieldTypeEnum = pgEnum("field_type", [
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
export const planNameEnum = pgEnum("plan_name", ["free", "pro", "enterprise"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "expired",
]);
export const collaboratorRoleEnum = pgEnum("collaborator_role", ["viewer", "editor"]);
export const notificationTypeEnum = pgEnum("notification_type", ["new_response", "form_published"]);
export const emailLogTypeEnum = pgEnum("email_log_type", [
  "creator_notification",
  "respondent_confirmation",
]);
export const emailLogStatusEnum = pgEnum("email_log_status", ["sent", "failed"]);

// ==========================================
// Core Tables
// ==========================================

// Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: text("avatar"),
  passwordHash: varchar("password_hash", { length: 255 }), // nullable for Google OAuth users
  googleId: varchar("google_id", { length: 255 }).unique(), // unique for Google users, nullable for credentials-only users
  emailVerified: boolean("email_verified").default(false).notNull(), // verification status
  role: varchar("role", { length: 50 }).default("user").notNull(), // user role (user/admin)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Backward-compatible alias for existing imports
export const usersTable = users;

// Sessions Table
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Plans Table
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: planNameEnum("name").notNull().unique(),
  price: integer("price").notNull(), // standard price in cents
  responseLimit: integer("response_limit").notNull(),
  formLimit: integer("form_limit").notNull(),
  features: jsonb("features").notNull(), // JSON list of feature strings
});

// User Subscriptions Table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "restrict" }),
  status: subscriptionStatusEnum("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// API Keys Table
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(), // hashed api key
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// Forms Tables
// ==========================================

// Form Themes Table
export const formThemes = pgTable("form_themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  primaryColor: varchar("primary_color", { length: 50 }).notNull(),
  backgroundColor: varchar("background_color", { length: 50 }).notNull(),
  fontFamily: varchar("font_family", { length: 100 }).notNull(),
  backgroundImage: text("background_image"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdBy: uuid("created_by") // null = system theme, userId = custom creator
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Forms Table
export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: formStatusEnum("status").default("draft").notNull(),
  visibility: formVisibilityEnum("visibility").default("public").notNull(),
  themeId: uuid("theme_id").references(() => formThemes.id, { onDelete: "set null" }),
  themeName: varchar("theme_name", { length: 50 }).default("wano").notNull(),
  submitButtonText: varchar("submit_button_text", { length: 255 }).default("Submit"),
  successMessage: text("success_message"),
  redirectUrl: text("redirect_url"),
  requireEmail: boolean("require_email").default(false).notNull(),
  allowMultipleResponses: boolean("allow_multiple_responses").default(true).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }), // for password-protected forms
  responseLimit: integer("response_limit"),
  expiresAt: timestamp("expires_at"),
  isArchived: boolean("is_archived").default(false).notNull(),
  isMultiPage: boolean("is_multi_page").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tags Table
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 50 }),
});

// Form Tags Table (Many-to-Many Junction)
export const formTags = pgTable(
  "form_tags",
  {
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.formId, table.tagId] })],
);

// Form Collaborators Table
export const formCollaborators = pgTable("form_collaborators", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: collaboratorRoleEnum("role").notNull(),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
});

// ==========================================
// Fields Tables
// ==========================================

// Fields Table
export const fields = pgTable("fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  type: fieldTypeEnum("type").notNull(),
  label: text("label").notNull(),
  placeholder: text("placeholder"),
  required: boolean("required").default(false).notNull(),
  order: integer("order").notNull(),
  options: jsonb("options"), // legacy json schema config for select/checkbox
  validations: jsonb("validations"), // JSON for min, max, regex validations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Field Options Table (Relational select options)
export const fieldOptions = pgTable("field_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldId: uuid("field_id")
    .notNull()
    .references(() => fields.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
  order: integer("order").notNull(),
  color: varchar("color", { length: 50 }), // optional branding color
});

// ==========================================
// Responses Tables
// ==========================================

// Responses Table
export const responses = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  respondentEmail: varchar("respondent_email", { length: 255 }),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  metadata: jsonb("metadata"), // IP, userAgent rate limiting data
});

// Response Answers Table
export const responseAnswers = pgTable("response_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id")
    .notNull()
    .references(() => responses.id, { onDelete: "cascade" }),
  fieldId: uuid("field_id")
    .notNull()
    .references(() => fields.id, { onDelete: "cascade" }),
  value: jsonb("value").notNull(), // JSON value of the response answer
});

// Response Metadata Table
export const responseMetadata = pgTable("response_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  responseId: uuid("response_id")
    .notNull()
    .unique()
    .references(() => responses.id, { onDelete: "cascade" }),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 100 }),
  completionTime: integer("completion_time"), // completion time in seconds
  referrer: text("referrer"),
});

// ==========================================
// Analytics Tables
// ==========================================

// Form Analytics Table
export const formAnalytics = pgTable("form_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(), // aggregate per day
  views: integer("views").default(0).notNull(),
  submissions: integer("submissions").default(0).notNull(),
  dropoffs: integer("dropoffs").default(0).notNull(),
  avgCompletionTime: integer("avg_completion_time"), // average completion in seconds
});

// Form Views Table
export const formViews = pgTable("form_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  visitorId: varchar("visitor_id", { length: 255 }).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 100 }),
});

// ==========================================
// Notifications & Email Settings Tables
// ==========================================

// Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email Notifications Settings Table
export const emailNotifications = pgTable("email_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .unique()
    .references(() => forms.id, { onDelete: "cascade" }),
  notifyCreator: boolean("notify_creator").default(false).notNull(),
  notifyRespondent: boolean("notify_respondent").default(false).notNull(),
  creatorTemplate: text("creator_template"),
  respondentTemplate: text("respondent_template"),
});

// Email Logs Table
export const emailLogs = pgTable("email_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  to: varchar("to", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  type: emailLogTypeEnum("type").notNull(),
  status: emailLogStatusEnum("status").notNull(),
  formId: uuid("form_id").references(() => forms.id, { onDelete: "set null" }),
  responseId: uuid("response_id").references(() => responses.id, { onDelete: "set null" }),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// ==========================================
// Drizzle Relations Mappings
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  forms: many(forms),
  sessions: many(sessions),
  subscription: one(userSubscriptions, {
    fields: [users.id],
    references: [userSubscriptions.userId],
  }),
  apiKeys: many(apiKeys),
  notifications: many(notifications),
  collaborations: many(formCollaborators),
  customThemes: many(formThemes),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [userSubscriptions.planId],
    references: [plans.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const formThemesRelations = relations(formThemes, ({ one, many }) => ({
  creator: one(users, {
    fields: [formThemes.createdBy],
    references: [users.id],
  }),
  forms: many(forms),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  creator: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
  fields: many(fields),
  responses: many(responses),
  emailNotifications: one(emailNotifications, {
    fields: [forms.id],
    references: [emailNotifications.formId],
  }),
  theme: one(formThemes, {
    fields: [forms.themeId],
    references: [formThemes.id],
  }),
  formTags: many(formTags),
  collaborators: many(formCollaborators),
  analytics: many(formAnalytics),
  views: many(formViews),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  formTags: many(formTags),
}));

export const formTagsRelations = relations(formTags, ({ one }) => ({
  form: one(forms, {
    fields: [formTags.formId],
    references: [forms.id],
  }),
  tag: one(tags, {
    fields: [formTags.tagId],
    references: [tags.id],
  }),
}));

export const formCollaboratorsRelations = relations(formCollaborators, ({ one }) => ({
  form: one(forms, {
    fields: [formCollaborators.formId],
    references: [forms.id],
  }),
  user: one(users, {
    fields: [formCollaborators.userId],
    references: [users.id],
  }),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  form: one(forms, {
    fields: [fields.formId],
    references: [forms.id],
  }),
  options: many(fieldOptions),
  answers: many(responseAnswers),
}));

export const fieldOptionsRelations = relations(fieldOptions, ({ one }) => ({
  field: one(fields, {
    fields: [fieldOptions.fieldId],
    references: [fields.id],
  }),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  form: one(forms, {
    fields: [responses.formId],
    references: [forms.id],
  }),
  answers: many(responseAnswers),
  metadata: one(responseMetadata, {
    fields: [responses.id],
    references: [responseMetadata.responseId],
  }),
  emailLogs: many(emailLogs),
}));

export const responseAnswersRelations = relations(responseAnswers, ({ one }) => ({
  response: one(responses, {
    fields: [responseAnswers.responseId],
    references: [responses.id],
  }),
  field: one(fields, {
    fields: [responseAnswers.fieldId],
    references: [fields.id],
  }),
}));

export const responseMetadataRelations = relations(responseMetadata, ({ one }) => ({
  response: one(responses, {
    fields: [responseMetadata.responseId],
    references: [responses.id],
  }),
}));

export const formAnalyticsRelations = relations(formAnalytics, ({ one }) => ({
  form: one(forms, {
    fields: [formAnalytics.formId],
    references: [forms.id],
  }),
}));

export const formViewsRelations = relations(formViews, ({ one }) => ({
  form: one(forms, {
    fields: [formViews.formId],
    references: [forms.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const emailNotificationsRelations = relations(emailNotifications, ({ one }) => ({
  form: one(forms, {
    fields: [emailNotifications.formId],
    references: [forms.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  form: one(forms, {
    fields: [emailLogs.formId],
    references: [forms.id],
  }),
  response: one(responses, {
    fields: [emailLogs.responseId],
    references: [responses.id],
  }),
}));

// ==========================================
// Email Verifications Table
// ==========================================

export const emailVerifications = pgTable("email_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailVerificationsRelations = relations(emailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [emailVerifications.userId],
    references: [users.id],
  }),
}));
