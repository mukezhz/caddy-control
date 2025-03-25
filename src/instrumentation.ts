import { ZodIssue } from 'zod';
import { validateEnv } from './appConfig';
import { initializeCaddyConfiguration } from './app/api/_services/caddy/caddy-service';

const constructEnvErrorMessages = (errors: ZodIssue[]): string[] => {
  return errors.map((error, idx) => {
    return `${idx + 1}) ${error.path.join('.')} : ${error.message}`;
  });
};

export async function register() {
  const envValidationResult = validateEnv();

  if (envValidationResult.error) {
    const errorMessages = constructEnvErrorMessages(envValidationResult.error.errors);
    throw new Error(
      `\n\n❌ Error loading environment variables:\n${errorMessages.join('\n')}\n`
    );
  }
  console.info('✅ Environment variables loaded successfully!');

  await initializeCaddyConfiguration()
}
