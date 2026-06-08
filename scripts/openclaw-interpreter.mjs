#!/usr/bin/env node
import { spawn } from "node:child_process";

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function runOpenClaw(message) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "node",
      [
        "/home/alice/openclaw/dist/index.js",
        "agent",
        "--json",
        "--session-key",
        "agent:main:graphharbor-teams",
        "--timeout",
        "180",
        "--thinking",
        "low",
        "--message",
        message,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`openclaw agent exited ${code}: ${stderr.trim()}`));
        return;
      }
      resolve(stdout);
    });
  });
}

function parseReply(raw) {
  const parsed = JSON.parse(raw);
  const payload = parsed?.result?.payloads?.find((item) => typeof item?.text === "string" && item.text.trim());
  const text = payload?.text ?? parsed?.result?.meta?.finalAssistantVisibleText;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("openclaw agent returned no text payload");
  }
  return text.trim();
}

const input = JSON.parse(await readStdin());
const prompt = [
  "You are Alice replying through Microsoft Teams via GraphHarbor.",
  "Reply naturally and concisely to the Teams message below.",
  "Do not mention transport internals unless the message asks about them.",
  "",
  `From: ${input.from || "unknown"}`,
  `Message: ${input.text || ""}`,
].join("\n");

const raw = await runOpenClaw(prompt);
process.stdout.write(`${parseReply(raw)}\n`);
