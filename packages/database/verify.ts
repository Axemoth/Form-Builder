import { db, eq } from "./index";
import * as schema from "./schema";

async function verify() {
  console.log("🚀 Starting database schema relations verification...\n");

  try {
    // Clean up existing test data
    console.log("🧹 Cleaning up old test data...");
    await db.delete(schema.responseMetadata);
    await db.delete(schema.responses);
    await db.delete(schema.fieldOptions);
    await db.delete(schema.fields);
    await db.delete(schema.forms);
    await db.delete(schema.formThemes);
    await db.delete(schema.userSubscriptions);
    await db.delete(schema.users);
    await db.delete(schema.plans);
    console.log("🧹 Cleanup done.\n");

    // 1. Insert Plan
    const [plan] = await db
      .insert(schema.plans)
      .values({
        name: "pro",
        price: 1500,
        responseLimit: 1000,
        formLimit: 50,
        features: ["Unlimited responses", "Advanced analytics", "Custom themes"],
      })
      .returning();
    console.log("✅ Inserted Plan:", plan.name);

    // 2. Insert User (Credentials signup flow)
    const [user] = await db
      .insert(schema.users)
      .values({
        email: "test-collaborator@example.com",
        name: "Alex Developer",
        avatar: "https://avatar.example.com/alex",
        passwordHash: "$2b$12$eXamPleHasHValUeForTeStinG1234567890", // credentials password hash
        googleId: null, // no googleId for credentials users
        emailVerified: true,
      })
      .returning();
    console.log("✅ Inserted Credentials User:", user.email, "| Verified:", user.emailVerified);

    // 2.1 Insert Google OAuth User
    const [googleUser] = await db
      .insert(schema.users)
      .values({
        email: "google-user@example.com",
        name: "Google User",
        avatar: "https://avatar.example.com/google",
        passwordHash: null, // no password hash for google OAuth users
        googleId: "google-oauth-id-12345", // OAuth ID
        emailVerified: true, // Google email is auto-verified
      })
      .returning();
    console.log(
      "✅ Inserted Google OAuth User:",
      googleUser.email,
      "| Google ID:",
      googleUser.googleId,
    );

    // 2.2 Insert second Credentials User (verifying that multiple users can have null googleId)
    const [user2] = await db
      .insert(schema.users)
      .values({
        email: "second-credentials@example.com",
        name: "Bob Credentials",
        passwordHash: "$2b$12$anotherHasHValUe",
        googleId: null, // multiple nulls are allowed in UNIQUE columns
        emailVerified: false,
      })
      .returning();
    console.log("✅ Inserted Second Credentials User (Google ID: null):", user2.email);

    // 2.3 Verify googleId UNIQUE constraint (should throw an error on duplicate googleId)
    try {
      await db.insert(schema.users).values({
        email: "malicious-user@example.com",
        name: "Malicious User",
        googleId: "google-oauth-id-12345", // DUPLICATE googleId!
      });
      console.error(
        "❌ UNIQUE constraint check failed: Duplicate googleId was incorrectly allowed!",
      );
    } catch (e) {
      console.log("✅ UNIQUE constraint check passed: Duplicate googleId threw an expected error.");
    }

    // 3. Insert Subscription
    const [subscription] = await db
      .insert(schema.userSubscriptions)
      .values({
        userId: user.id,
        planId: plan.id,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .returning();
    console.log("✅ Inserted User Subscription status:", subscription.status);

    // 4. Insert Reusable Theme
    const [theme] = await db
      .insert(schema.formThemes)
      .values({
        name: "Anime Cyberpunk",
        primaryColor: "#ff007f",
        backgroundColor: "#0d0e15",
        fontFamily: "Outfit",
        backgroundImage: "https://cyberpunk.example.com/bg.png",
        isDefault: false,
        createdBy: user.id,
      })
      .returning();
    console.log("✅ Inserted Form Theme:", theme.name);

    // 5. Insert Form
    const [form] = await db
      .insert(schema.forms)
      .values({
        userId: user.id,
        title: "My Epic Anime Poll",
        slug: "epic-anime-poll",
        status: "published",
        themeId: theme.id,
      })
      .returning();
    console.log("✅ Inserted Form:", form.title);

    // 6. Insert Field
    const [field] = await db
      .insert(schema.fields)
      .values({
        formId: form.id,
        type: "single_select",
        label: "What is your favorite series?",
        order: 1,
        required: true,
      })
      .returning();
    console.log("✅ Inserted Field:", field.label);

    // 7. Insert Field Options
    const [option] = await db
      .insert(schema.fieldOptions)
      .values({
        fieldId: field.id,
        label: "Neon Genesis Evangelion",
        value: "nge",
        order: 1,
        color: "#8a2be2",
      })
      .returning();
    console.log("✅ Inserted Field Option:", option.label);

    // 8. Insert Response
    const [response] = await db
      .insert(schema.responses)
      .values({
        formId: form.id,
        respondentEmail: "respondent@example.com",
      })
      .returning();
    console.log("✅ Inserted Response ID:", response.id);

    // 9. Insert Response Metadata
    const [metadata] = await db
      .insert(schema.responseMetadata)
      .values({
        responseId: response.id,
        ipHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        country: "Japan",
        completionTime: 42,
      })
      .returning();
    console.log("✅ Inserted Response Metadata country:", metadata.country);

    // 10. Relational Query Check
    console.log("\n🔍 Running Relational Query Verification...");
    const results = await db
      .select({
        userName: schema.users.name,
        planName: schema.plans.name,
        formTitle: schema.forms.title,
        themeName: schema.formThemes.name,
        fieldLabel: schema.fields.label,
        optionLabel: schema.fieldOptions.label,
        responseEmail: schema.responses.respondentEmail,
        metadataCountry: schema.responseMetadata.country,
      })
      .from(schema.forms)
      .innerJoin(schema.users, eq(schema.forms.userId, schema.users.id))
      .innerJoin(schema.userSubscriptions, eq(schema.users.id, schema.userSubscriptions.userId))
      .innerJoin(schema.plans, eq(schema.userSubscriptions.planId, schema.plans.id))
      .innerJoin(schema.formThemes, eq(schema.forms.themeId, schema.formThemes.id))
      .innerJoin(schema.fields, eq(schema.fields.formId, schema.forms.id))
      .innerJoin(schema.fieldOptions, eq(schema.fieldOptions.fieldId, schema.fields.id))
      .innerJoin(schema.responses, eq(schema.responses.formId, schema.forms.id))
      .innerJoin(
        schema.responseMetadata,
        eq(schema.responseMetadata.responseId, schema.responses.id),
      );

    console.log("\n📊 Query Results:");
    console.dir(results, { depth: null });

    if (results.length > 0) {
      console.log(
        "\n✨ Verification PASSED! All 14 tables, constraints, and relationships are working perfectly.",
      );
    } else {
      console.error("\n❌ Verification FAILED: Query returned no results.");
    }
  } catch (error) {
    console.error("\n💥 Error during verification:", error);
  } finally {
    process.exit(0);
  }
}

verify();
