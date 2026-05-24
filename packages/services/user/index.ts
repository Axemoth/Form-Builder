import { db, eq } from "@repo/database";
import { usersTable, sessions } from "@repo/database/schema";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema } from "./model";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

class UserService {
  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

    const isGoogleConfigured = !!(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);

    if (isGoogleConfigured) {
      const url = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
        redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI,
        prompt: "consent",
        include_granted_scopes: true,
      });
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
  }

  public async loginWithGoogleCode(code: string) {
    const { tokens } = await googleOAuth2Client.getToken({
      code,
      redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI,
    });
    googleOAuth2Client.setCredentials(tokens);

    // Fetch user profile from google userinfo API
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile from Google");
    }

    const profile = (await response.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    // Find or create user
    // First, try to find by googleId
    let [user] = await db.select().from(usersTable).where(eq(usersTable.googleId, profile.sub));

    if (!user) {
      // If not found, try to find by email
      const [existingUserByEmail] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, profile.email));

      if (existingUserByEmail) {
        // Link googleId to existing user
        const [updatedUser] = await db
          .update(usersTable)
          .set({
            googleId: profile.sub,
            name: profile.name || existingUserByEmail.name,
            avatar: profile.picture || existingUserByEmail.avatar,
            emailVerified: true,
          })
          .where(eq(usersTable.id, existingUserByEmail.id))
          .returning();
        user = updatedUser;
      } else {
        // Check if this is the first user
        const existingUsers = await db.select().from(usersTable).limit(1);
        const isFirstUser = existingUsers.length === 0;
        const role = isFirstUser ? "admin" : "user";

        // Create new user
        const [newUser] = await db
          .insert(usersTable)
          .values({
            email: profile.email,
            name: profile.name || "Google User",
            avatar: profile.picture || null,
            googleId: profile.sub,
            emailVerified: true,
            role,
          })
          .returning();
        user = newUser;
      }
    }

    if (!user) {
      throw new Error("Failed to authenticate or register user with Google profile.");
    }

    // Create session in the database
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        token: sessionToken,
        expiresAt: sessionExpiresAt,
      })
      .returning();

    return {
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  public async signupWithCredentials(name: string, email: string, password: string) {
    // Check if user already exists
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (existingUser) {
      throw new Error("An account with this email already exists. Try signing in instead.");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Check if this is the first user
    const existingUsers = await db.select().from(usersTable).limit(1);
    const isFirstUser = existingUsers.length === 0;
    const role = isFirstUser ? "admin" : "user";

    // Create user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email,
        name,
        passwordHash,
        emailVerified: false,
        role,
      })
      .returning();

    if (!newUser) {
      throw new Error("Failed to create user account.");
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      userId: newUser.id,
      token: sessionToken,
      expiresAt: sessionExpiresAt,
    });

    return {
      token: sessionToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
      },
    };
  }

  public async loginWithCredentials(email: string, password: string) {
    // Find user by email
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (!user.passwordHash) {
      throw new Error("This account uses Google sign-in. Please use the Google button to log in.");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password.");
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt: sessionExpiresAt,
    });

    return {
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }
}

export default UserService;
