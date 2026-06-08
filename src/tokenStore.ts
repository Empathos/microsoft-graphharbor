import { readFile } from "node:fs/promises";

export type StoredBridgeToken = {
  tenantId: string;
  clientId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string;
};

export async function readStoredToken(path: string): Promise<StoredBridgeToken> {
  const raw = await readFile(path, "utf8");
  const token = JSON.parse(raw) as StoredBridgeToken;

  if (!token.tenantId || !token.clientId) {
    throw new Error(`Token file ${path} is missing tenantId or clientId`);
  }

  return token;
}

