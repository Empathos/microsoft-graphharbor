import { spawn } from "node:child_process";
import type { GraphChatMessage } from "./graphClient.js";

export type InterpreterInput = {
  message: GraphChatMessage;
  text: string;
  from: string;
};

export async function runInterpreterCommand(params: {
  command: string;
  input: InterpreterInput;
  timeoutMs?: number;
}): Promise<string | undefined> {
  const timeoutMs = params.timeoutMs ?? 180_000;

  return await new Promise((resolve, reject) => {
    const child = spawn(params.command, {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`Interpreter timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);

      if (code !== 0) {
        reject(new Error(`Interpreter exited ${code}: ${stderr.trim()}`));
        return;
      }

      const reply = stdout.trim();
      resolve(reply.length > 0 ? reply : undefined);
    });

    child.stdin.end(`${JSON.stringify(params.input)}\n`);
  });
}
