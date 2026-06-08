import { chmod, readFile, rename, writeFile } from "node:fs/promises";

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

async function writeStoredToken(path: string, token: StoredBridgeToken): Promise<void> {
  const tempPath = `${path}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(token, null, 2)}\n`, { mode: 0o600 });
  await chmod(tempPath, 0o600);
  await rename(tempPath, path);
}

function tokenNeedsRefresh(token: StoredBridgeToken, nowMs = Date.now()): boolean {
  if (!token.accessToken) {
    return true;
  }

  if (!token.expiresAt) {
    return true;
  }

  return token.expiresAt - nowMs < 5 * 60 * 1000;
}

export async function getAccessToken(path: string): Promise<string> {
  const token = await readStoredToken(path);

  if (!tokenNeedsRefresh(token)) {
    return token.accessToken as string;
  }

  if (!token.refreshToken) {
    throw new Error(`Token file ${path} has no refresh token`);
  }
  const refreshToken = token.refreshToken;

  const body = new URLSearchParams({
    client_id: token.clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: token.scopes ?? "ChatMessage.Send User.Read",
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${token.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Token refresh failed (${response.status}): ${text}`);
  }

  const refreshed = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };

  if (!refreshed.access_token) {
    throw new Error("Token refresh response did not include an access token");
  }

  const nextToken: StoredBridgeToken = {
    ...token,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? refreshToken,
    expiresAt: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
    scopes: refreshed.scope ?? token.scopes,
  };

  await writeStoredToken(path, nextToken);

  return refreshed.access_token;
}
