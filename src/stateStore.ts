import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export type BridgeStateFile = {
  seenMessageIds: string[];
  lastPollAt?: string;
};

export async function readState(path: string): Promise<BridgeStateFile> {
  try {
    const raw = await readFile(path, "utf8");
    const state = JSON.parse(raw) as Partial<BridgeStateFile>;
    return {
      seenMessageIds: Array.isArray(state.seenMessageIds) ? state.seenMessageIds : [],
      lastPollAt: state.lastPollAt,
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { seenMessageIds: [] };
    }
    throw error;
  }
}

export async function writeState(path: string, state: BridgeStateFile): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  await rename(tempPath, path);
}
