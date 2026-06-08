export type BridgeConfig = {
  tenantId: string;
  clientId: string;
  chatId: string;
  tokenFile: string;
  stateFile: string;
  pollIntervalMs: number;
  replyPrefix: string;
  interpreterCommand?: string;
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
    stateFile: requiredEnv("STATE_FILE"),
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 5000),
    replyPrefix: process.env.REPLY_PREFIX ?? "GraphHarbor received",
    interpreterCommand: process.env.INTERPRETER_COMMAND?.trim() || undefined,
  };
}
