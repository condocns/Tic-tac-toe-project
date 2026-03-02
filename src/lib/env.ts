const isTestEnv = process.env.NODE_ENV === "test";

const REQUIRED_SERVER_ENVS = [
  "DATABASE_URL",
  "AUTH_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

type RequiredEnvKey = (typeof REQUIRED_SERVER_ENVS)[number];

type EnvKey = RequiredEnvKey | string;

export const getRequiredEnv = (key: RequiredEnvKey): string => {
  const value = process.env[key];
  if (!value && !isTestEnv) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
};

export const getOptionalEnv = (key: EnvKey): string | undefined => process.env[key];

if (!isTestEnv) {
  const missing = REQUIRED_SERVER_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export { isTestEnv };
