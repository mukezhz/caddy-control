import { ZodIssue } from "zod";
import { validateEnv } from "./appConfig";
import { getCaddyConfig, initializeCaddyConfiguration } from "./app/api/_services/caddy/caddy-service";
import { seedFirstUser } from "./app/api/_services/user/user-service";
import { seedPermissions } from "./app/api/_services/user/permission-service";

const constructEnvErrorMessages = (errors: ZodIssue[]): string[] => {
  return errors.map((error, idx) => {
    return `${idx + 1}) ${error.path.join(".")} : ${error.message}`;
  });
};

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const envValidationResult = validateEnv();

    if (envValidationResult.error) {
      const errorMessages = constructEnvErrorMessages(
        envValidationResult.error.errors
      );
      throw new Error(
        `\n\n❌ Error loading environment variables:\n${errorMessages.join(
          "\n"
        )}\n`
      );
    }
    console.info("✅ Environment variables loaded successfully!");
    try {
      await getCaddyConfig()
      console.log("========================================");
      console.log("✅ Caddy server is reachable. Proceeding with initialization.");
      await initializeCaddyConfiguration();
      console.log("✅ Caddy server initialized successfully.");

      console.log("========================================");
      console.log("✅ Seeding initial configuration.");

      console.log("✅ seeding first user");
      await seedFirstUser()
      console.log("✅ first user seeded successfully.");

      console.log("========================================");
      console.log("✅ seeding permissions");
      await seedPermissions();
      console.log("✅ Permissions seeded successfully.");
    } catch (error) {
      console.error("❌⚠️ Caddy server not reachable. Initializing configuration.", error);
      console.error("========================================");
      console.error("⚠️ Please ensure the Caddy server is running.");
      console.error("========================================");
      throw new Error(
        "❌⚠️ Caddy server not reachable. Initializing configuration."
      );
    }
  }
}
