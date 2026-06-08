export type BridgeConfig = {
  tenantId: string;
  clientId: string;
  chatId: string;
  tokenFile: string;
  pollIntervalMs: number;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): BridgeConfig {
  return {
    tenantId: requiredEnv("TENANT_ID"),
    clientId: requiredEnv("CLIENT_ID"),
    chatId: requiredEnv("CHAT_ID"),
    tokenFile: requiredEnv("TOKEN_FILE"),
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 5000),
  };
}

