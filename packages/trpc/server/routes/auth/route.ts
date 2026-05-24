import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

const authResultSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
    role: z.string(),
  }),
});

export const authRouter = router({
  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      const supportedMethods = await userService.getAuthenticationMethods();
      return supportedMethods;
    }),

  loginWithGoogleCode: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/google-login"), tags: TAGS } })
    .input(z.object({ code: z.string() }))
    .output(authResultSchema)
    .mutation(async ({ input }) => {
      const result = await userService.loginWithGoogleCode(input.code);
      return result;
    }),

  signup: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signup"), tags: TAGS } })
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
    )
    .output(authResultSchema)
    .mutation(async ({ input }) => {
      const result = await userService.signupWithCredentials(
        input.name,
        input.email,
        input.password,
      );
      return result;
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), tags: TAGS } })
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .output(authResultSchema)
    .mutation(async ({ input }) => {
      const result = await userService.loginWithCredentials(input.email, input.password);
      return result;
    }),
});
