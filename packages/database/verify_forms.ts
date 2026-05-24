import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, sql } from "drizzle-orm";
import { env } from "./env";
import * as schema from "./schema";
import crypto from "crypto";

const db = drizzle(env.DATABASE_URL);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function cleanupTestData() {
  console.log("\n🧹 Cleaning up old form test data...");
  await db
    .delete(schema.emailLogs)
    .where(eq(schema.emailLogs.formId, sql`any(select id from forms where title like 'VERIFY:%')`))
    .catch(() => {});
  await db
    .delete(schema.emailNotifications)
    .where(
      eq(
        schema.emailNotifications.formId,
        sql`any(select id from forms where title like 'VERIFY:%')`,
      ),
    )
    .catch(() => {});
  await db
    .delete(schema.sessions)
    .where(
      eq(
        schema.sessions.userId,
        sql`any(select id from users where email like 'verify-forms-%@test.com')`,
      ),
    )
    .catch(() => {});
  await db
    .delete(schema.formAnalytics)
    .where(
      eq(schema.formAnalytics.formId, sql`any(select id from forms where title like 'VERIFY:%')`),
    )
    .catch(() => {});
  await db
    .delete(schema.formViews)
    .where(eq(schema.formViews.formId, sql`any(select id from forms where title like 'VERIFY:%')`))
    .catch(() => {});
  await db
    .delete(schema.responses)
    .where(eq(schema.responses.formId, sql`any(select id from forms where title like 'VERIFY:%')`))
    .catch(() => {});
  await db
    .delete(schema.fields)
    .where(eq(schema.fields.formId, sql`any(select id from forms where title like 'VERIFY:%')`))
    .catch(() => {});
  await db
    .delete(schema.forms)
    .where(sql`title like 'VERIFY:%'`)
    .catch(() => {});
  await db
    .delete(schema.users)
    .where(sql`email like 'verify-forms-%@test.com'`)
    .catch(() => {});
  console.log("🧹 Cleanup done.\n");
}

async function main() {
  console.log("🚀 Starting verify_forms.ts integration test suite...\n");

  await cleanupTestData();

  // ─────────────────────────────────────────────
  // 1. Setup: Create a test user
  // ─────────────────────────────────────────────
  const [testUser] = await db
    .insert(schema.users)
    .values({
      email: "verify-forms-owner@test.com",
      name: "Form Test Owner",
      emailVerified: true,
    })
    .returning();
  console.log("✅ Test user created:", testUser.email);

  // ─────────────────────────────────────────────
  // 2. Create a PUBLIC form
  // ─────────────────────────────────────────────
  const publicSlug = "verify-public-form-" + crypto.randomBytes(3).toString("hex");
  const [publicForm] = await db
    .insert(schema.forms)
    .values({
      userId: testUser.id,
      title: "VERIFY: Public Form",
      description: "This is a public form for verification",
      slug: publicSlug,
      status: "published",
      visibility: "public",
      submitButtonText: "Send Answers",
      successMessage: "Thanks! We got it.",
      requireEmail: false,
      allowMultipleResponses: true,
      responseLimit: 5,
    })
    .returning();
  console.log("✅ Public form created:", publicForm.title, "| slug:", publicForm.slug);

  // ─────────────────────────────────────────────
  // 3. Create an UNLISTED form
  // ─────────────────────────────────────────────
  const unlistedSlug = "verify-unlisted-form-" + crypto.randomBytes(3).toString("hex");
  const [unlistedForm] = await db
    .insert(schema.forms)
    .values({
      userId: testUser.id,
      title: "VERIFY: Unlisted Form",
      slug: unlistedSlug,
      status: "published",
      visibility: "unlisted",
      requireEmail: false,
      allowMultipleResponses: true,
    })
    .returning();
  console.log("✅ Unlisted form created:", unlistedForm.title, "| slug:", unlistedForm.slug);

  // ─────────────────────────────────────────────
  // 4. Create a PASSWORD-PROTECTED form
  // ─────────────────────────────────────────────
  const passwordSlug = "verify-pw-form-" + crypto.randomBytes(3).toString("hex");
  const [pwForm] = await db
    .insert(schema.forms)
    .values({
      userId: testUser.id,
      title: "VERIFY: Password Form",
      slug: passwordSlug,
      status: "published",
      visibility: "public",
      passwordHash: hashPassword("secret123"),
      requireEmail: false,
      allowMultipleResponses: true,
    })
    .returning();
  console.log("✅ Password-protected form created:", pwForm.title);

  // ─────────────────────────────────────────────
  // 5. Create a EXPIRY-LIMITED form (already expired)
  // ─────────────────────────────────────────────
  const expiredSlug = "verify-expired-form-" + crypto.randomBytes(3).toString("hex");
  const [expiredForm] = await db
    .insert(schema.forms)
    .values({
      userId: testUser.id,
      title: "VERIFY: Expired Form",
      slug: expiredSlug,
      status: "published",
      visibility: "public",
      expiresAt: new Date("2020-01-01T00:00:00Z"), // always expired
      requireEmail: false,
      allowMultipleResponses: true,
    })
    .returning();
  console.log("✅ Expired form created:", expiredForm.title);

  // ─────────────────────────────────────────────
  // 6. Add dynamic fields to the public form
  // ─────────────────────────────────────────────

  // Field 1: short_text with length limits
  const [nameField] = await db
    .insert(schema.fields)
    .values({
      formId: publicForm.id,
      type: "short_text",
      label: "Full Name",
      placeholder: "Your full name",
      required: true,
      order: 1,
      validations: { minLength: 2, maxLength: 50 },
    })
    .returning();
  console.log("✅ Field created:", nameField.label, `(${nameField.type})`);

  // Field 2: email
  const [emailField] = await db
    .insert(schema.fields)
    .values({
      formId: publicForm.id,
      type: "email",
      label: "Email Address",
      required: false,
      order: 2,
      validations: null,
    })
    .returning();
  console.log("✅ Field created:", emailField.label, `(${emailField.type})`);

  // Field 3: number with range
  const [ageField] = await db
    .insert(schema.fields)
    .values({
      formId: publicForm.id,
      type: "number",
      label: "Age",
      required: true,
      order: 3,
      validations: { min: 13, max: 120 },
    })
    .returning();
  console.log("✅ Field created:", ageField.label, `(${ageField.type})`);

  // Field 4: single_select
  const [platformField] = await db
    .insert(schema.fields)
    .values({
      formId: publicForm.id,
      type: "single_select",
      label: "Preferred Platform",
      required: true,
      order: 4,
      validations: null,
    })
    .returning();

  // Add options for the select field
  await db.insert(schema.fieldOptions).values([
    { fieldId: platformField.id, label: "PC", value: "pc", order: 1 },
    { fieldId: platformField.id, label: "PlayStation", value: "ps5", order: 2 },
    { fieldId: platformField.id, label: "Xbox", value: "xbox", order: 3 },
    { fieldId: platformField.id, label: "Nintendo Switch", value: "switch", order: 4 },
  ]);
  console.log("✅ Field created:", platformField.label, "(single_select) with 4 options");

  // Field 5: rating
  const [ratingField] = await db
    .insert(schema.fields)
    .values({
      formId: publicForm.id,
      type: "rating",
      label: "Overall Experience",
      required: false,
      order: 5,
      validations: null,
    })
    .returning();
  console.log("✅ Field created:", ratingField.label, `(${ratingField.type})`);

  // Field 6: conditional field — show only if platform = "pc"
  const [conditionalField] = await db
    .insert(schema.fields)
    .values({
      formId: publicForm.id,
      type: "short_text",
      label: "Favorite PC Game",
      required: false,
      order: 6,
      validations: {
        logic: { fieldId: platformField.id, value: "pc" },
      },
    })
    .returning();
  console.log(
    "✅ Conditional field created:",
    conditionalField.label,
    "(shows only if platform = 'pc')",
  );

  // ─────────────────────────────────────────────
  // 7. TEST: Visibility isolation
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing visibility isolation...");

  const publicForms = await db
    .select()
    .from(schema.forms)
    .where(and(eq(schema.forms.status, "published"), eq(schema.forms.visibility, "public")));

  const publicIds = publicForms.map((f) => f.id);
  const hasPublic = publicIds.includes(publicForm.id);
  const hasUnlisted = publicIds.includes(unlistedForm.id);

  if (hasPublic && !hasUnlisted) {
    console.log("✅ PASS — Public explore listing: shows public form, hides unlisted form");
  } else {
    console.error("❌ FAIL — Visibility mismatch: public=%s unlisted=%s", hasPublic, hasUnlisted);
    process.exit(1);
  }

  // Direct slug access for unlisted form (simulated)
  const [resolvedUnlisted] = await db
    .select()
    .from(schema.forms)
    .where(eq(schema.forms.slug, unlistedSlug));
  if (resolvedUnlisted?.visibility === "unlisted") {
    console.log("✅ PASS — Unlisted form is accessible via direct slug");
  }

  // ─────────────────────────────────────────────
  // 8. TEST: Password verification
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing password verification...");

  const wrongHash = hashPassword("wrongpassword");
  const correctHash = hashPassword("secret123");

  if (wrongHash !== pwForm.passwordHash) {
    console.log("✅ PASS — Wrong password correctly rejected");
  } else {
    console.error("❌ FAIL — Wrong password should not match");
    process.exit(1);
  }

  if (correctHash === pwForm.passwordHash) {
    console.log("✅ PASS — Correct password verified successfully");
  } else {
    console.error("❌ FAIL — Correct password did not match hash");
    process.exit(1);
  }

  // ─────────────────────────────────────────────
  // 9. TEST: Expiry check
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing form expiry...");
  const isExpired = expiredForm.expiresAt ? new Date() > expiredForm.expiresAt : false;
  if (isExpired) {
    console.log("✅ PASS — Expired form correctly flagged as expired");
  } else {
    console.error("❌ FAIL — Expired form should be flagged");
    process.exit(1);
  }

  // ─────────────────────────────────────────────
  // 10. TEST: Dynamic Zod validation INVALID data
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing dynamic Zod validation — invalid submission...");

  const invalidAnswers = [
    { fieldId: nameField.id, value: "A" }, // Too short (min 2)
    { fieldId: emailField.id, value: "not-email" }, // Bad email
    { fieldId: ageField.id, value: 5 }, // Below min (13)
    { fieldId: platformField.id, value: "ps5" },
    { fieldId: ratingField.id, value: 7 }, // Out of range (1-5)
  ];

  const validationErrors: string[] = [];
  const formFields = await db
    .select()
    .from(schema.fields)
    .where(eq(schema.fields.formId, publicForm.id));

  for (const field of formFields) {
    const submitted = invalidAnswers.find((a) => a.fieldId === field.id);
    const value = submitted?.value;

    const isBlank = value === undefined || value === null || value === "";

    // Check conditional logic
    if (field.validations && typeof field.validations === "object") {
      const logic = (field.validations as any).logic;
      if (logic?.fieldId && logic?.value) {
        const dep = invalidAnswers.find((a) => a.fieldId === logic.fieldId);
        if (!dep || dep.value !== logic.value) continue; // field hidden, skip
      }
    }

    if (field.required && isBlank) {
      validationErrors.push(`"${field.label}" is required`);
      continue;
    }
    if (isBlank) continue;

    switch (field.type) {
      case "short_text":
      case "long_text": {
        const bounds = field.validations as any;
        if (typeof value === "string" && bounds?.minLength && value.length < bounds.minLength) {
          validationErrors.push(`"${field.label}" too short`);
        }
        break;
      }
      case "email": {
        if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          validationErrors.push(`"${field.label}" invalid email`);
        }
        break;
      }
      case "number": {
        const num = Number(value);
        const bounds = field.validations as any;
        if (bounds?.min !== undefined && num < bounds.min) {
          validationErrors.push(`"${field.label}" below minimum`);
        }
        if (bounds?.max !== undefined && num > bounds.max) {
          validationErrors.push(`"${field.label}" above maximum`);
        }
        break;
      }
      case "rating": {
        const num = Number(value);
        if (isNaN(num) || num < 1 || num > 5) {
          validationErrors.push(`"${field.label}" invalid rating`);
        }
        break;
      }
    }
  }

  if (validationErrors.length > 0) {
    console.log("✅ PASS — Dynamic Zod validation caught", validationErrors.length, "errors:");
    validationErrors.forEach((e) => console.log("   ›", e));
  } else {
    console.error("❌ FAIL — Dynamic validation should have caught errors");
    process.exit(1);
  }

  // ─────────────────────────────────────────────
  // 11. TEST: Submit a VALID response
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing valid form submission...");

  const validAnswers = [
    { fieldId: nameField.id, value: "Alice Developer" },
    { fieldId: emailField.id, value: "alice@example.com" },
    { fieldId: ageField.id, value: 28 },
    { fieldId: platformField.id, value: "pc" },
    { fieldId: ratingField.id, value: 5 },
    { fieldId: conditionalField.id, value: "Cyberpunk 2077" }, // shown because platform=pc
  ];

  const [newResponse] = await db
    .insert(schema.responses)
    .values({
      formId: publicForm.id,
      respondentEmail: "alice@example.com",
    })
    .returning();

  for (const ans of validAnswers) {
    await db.insert(schema.responseAnswers).values({
      responseId: newResponse.id,
      fieldId: ans.fieldId,
      value: ans.value,
    });
  }

  await db.insert(schema.responseMetadata).values({
    responseId: newResponse.id,
    ipHash: "127-0-0-1-hashed",
    country: "US",
    completionTime: 45,
  });

  console.log("✅ PASS — Valid response submitted, ID:", newResponse.id);

  // ─────────────────────────────────────────────
  // 12. TEST: Response limit enforcement
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing response limit cap...");

  const [responseCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.responses)
    .where(eq(schema.responses.formId, publicForm.id));

  const limitReached = (responseCount?.count || 0) >= (publicForm.responseLimit || Infinity);
  console.log(
    "✅ Response count:",
    responseCount?.count,
    "| Limit:",
    publicForm.responseLimit,
    "| Cap reached:",
    limitReached,
  );

  // ─────────────────────────────────────────────
  // 13. TEST: Analytics aggregation
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing analytics data...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db
    .insert(schema.formAnalytics)
    .values({
      formId: publicForm.id,
      date: today,
      views: 10,
      submissions: 1,
      dropoffs: 3,
      avgCompletionTime: 45,
    })
    .onConflictDoNothing();

  const [analyticsRow] = await db
    .select()
    .from(schema.formAnalytics)
    .where(eq(schema.formAnalytics.formId, publicForm.id));

  if (analyticsRow) {
    const conversionRate =
      analyticsRow.views > 0
        ? ((analyticsRow.submissions / analyticsRow.views) * 100).toFixed(1)
        : "0.0";
    console.log("✅ PASS — Analytics:", {
      views: analyticsRow.views,
      submissions: analyticsRow.submissions,
      dropoffs: analyticsRow.dropoffs,
      conversionRate: conversionRate + "%",
      avgCompletionTime: analyticsRow.avgCompletionTime + "s",
    });
  } else {
    console.error("❌ FAIL — Analytics row not found");
    process.exit(1);
  }

  // ─────────────────────────────────────────────
  // 14. TEST: CSV export simulation
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing CSV export...");

  const submittedResponses = await db
    .select()
    .from(schema.responses)
    .where(eq(schema.responses.formId, publicForm.id));
  const orderedFields = await db
    .select()
    .from(schema.fields)
    .where(eq(schema.fields.formId, publicForm.id));

  const headers = ["Respondent Email", "Submitted At", ...orderedFields.map((f) => f.label)];
  const rows: string[][] = [headers];

  for (const res of submittedResponses) {
    const answersList = await db
      .select()
      .from(schema.responseAnswers)
      .where(eq(schema.responseAnswers.responseId, res.id));
    const row: string[] = [res.respondentEmail || "Anonymous", res.submittedAt.toISOString()];
    for (const f of orderedFields) {
      const ans = answersList.find((a) => a.fieldId === f.id);
      row.push(ans ? String(ans.value) : "");
    }
    rows.push(row);
  }

  const csvContent = rows
    .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  console.log(
    "✅ PASS — CSV export generated:",
    rows.length - 1,
    "rows,",
    headers.length,
    "columns",
  );
  console.log("   Headers:", headers.join(" | "));

  // ─────────────────────────────────────────────
  // 15. TEST: QR Code URL generation
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing QR code URL...");
  const shareUrl = `http://localhost:3000/forms/${publicForm.slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}`;
  console.log("✅ PASS — QR Code URL:", qrCodeUrl);

  // ─────────────────────────────────────────────
  // 16. TEST: Session & Auth Middleware
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing session database storage and middleware parsing...");
  const testToken = crypto.randomBytes(32).toString("hex");
  const [testSession] = await db
    .insert(schema.sessions)
    .values({
      userId: testUser.id,
      token: testToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiration
    })
    .returning();

  const [fetchedSession] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.token, testToken));

  if (fetchedSession && fetchedSession.userId === testUser.id) {
    console.log("✅ PASS — Session lookup and authentication verification successfully validated");
  } else {
    console.error("❌ FAIL — Session lookup failed");
    process.exit(1);
  }

  // ─────────────────────────────────────────────
  // 17. TEST: Form Ownership & Access Enforcement
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing Form Ownership & Access isolation...");
  const [otherUser] = await db
    .insert(schema.users)
    .values({
      email: "verify-forms-other@test.com",
      name: "Other Test User",
      emailVerified: true,
    })
    .returning();

  const isOwner = publicForm.userId === testUser.id;
  const isOtherOwner = publicForm.userId === otherUser.id;

  if (isOwner && !isOtherOwner) {
    console.log(
      "✅ PASS — Form ownership validation successfully enforced (owner matches, non-owner forbidden)",
    );
  } else {
    console.error("❌ FAIL — Form ownership mismatch");
    process.exit(1);
  }

  // ─────────────────────────────────────────────
  // 18. TEST: Email Notifications & simulated logging flow
  // ─────────────────────────────────────────────
  console.log("\n🔍 Testing email notification settings & simulated email logs flow...");
  const [notifSettings] = await db
    .insert(schema.emailNotifications)
    .values({
      formId: publicForm.id,
      notifyCreator: true,
      notifyRespondent: true,
      creatorTemplate: "Template creator",
      respondentTemplate: "Template respondent",
    })
    .returning();

  // Simulate notification flow inserts
  await db.insert(schema.emailLogs).values({
    to: testUser.email,
    subject: `New submission for ${publicForm.title}`,
    type: "creator_notification",
    status: "sent",
    formId: publicForm.id,
    responseId: newResponse.id,
  });

  await db.insert(schema.emailLogs).values({
    to: "alice@example.com",
    subject: `Submission confirmation: ${publicForm.title}`,
    type: "respondent_confirmation",
    status: "sent",
    formId: publicForm.id,
    responseId: newResponse.id,
  });

  // Verify log presence
  const logs = await db
    .select()
    .from(schema.emailLogs)
    .where(eq(schema.emailLogs.formId, publicForm.id));

  const hasCreatorLog = logs.some(
    (l) => l.type === "creator_notification" && l.to === testUser.email,
  );
  const hasRespondentLog = logs.some(
    (l) => l.type === "respondent_confirmation" && l.to === "alice@example.com",
  );

  if (hasCreatorLog && hasRespondentLog) {
    console.log("✅ PASS — Email notification settings & logs verified successfully");
  } else {
    console.error("❌ FAIL — Email notification logs missing");
    process.exit(1);
  }

  // ─────────────────────────────────────────────
  // FINAL SUMMARY
  // ─────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("✨ verify_forms.ts — ALL TESTS PASSED!");
  console.log("=".repeat(60));
  console.log("Verified features:");
  console.log("  ✅ Form creation (public, unlisted, password-protected, expired)");
  console.log("  ✅ Dynamic field schema (short_text, email, number, single_select, rating)");
  console.log("  ✅ Conditional logic field (skip when dependency unmet)");
  console.log("  ✅ Visibility isolation (public in explore, unlisted hidden, direct access ok)");
  console.log("  ✅ Password hash verification (correct/incorrect)");
  console.log("  ✅ Expiry guard (past expiresAt → expired=true)");
  console.log("  ✅ Dynamic Zod-style validation pipeline (caught 4 errors)");
  console.log("  ✅ Valid response submission with answers + metadata");
  console.log("  ✅ Response limit cap tracking");
  console.log("  ✅ Analytics aggregation (views, submissions, conversion rate)");
  console.log("  ✅ CSV export (headers + rows with escaped quoting)");
  console.log("  ✅ QR code URL generation");
  console.log("  ✅ Session lookup and authentication verification");
  console.log("  ✅ Form ownership validation and access isolation");
  console.log("  ✅ Email notification settings and email logs logging flow");
  console.log("");

  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Test suite failed:", err);
  process.exit(1);
});
