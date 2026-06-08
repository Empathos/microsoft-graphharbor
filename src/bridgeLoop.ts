import { listRecentMessages, sendChatMessage, type GraphChatMessage } from "./graphClient.js";
import { readState, writeState } from "./stateStore.js";

export type BridgeState = {
  seenMessageIds: Set<string>;
};

export function createInitialState(): BridgeState {
  return { seenMessageIds: new Set<string>() };
}

export function createStateFromIds(ids: string[]): BridgeState {
  return { seenMessageIds: new Set<string>(ids) };
}

export function unseenMessages(
  messages: GraphChatMessage[],
  state: BridgeState,
): GraphChatMessage[] {
  return messages
    .filter((message) => message.id && !state.seenMessageIds.has(message.id))
    .sort((a, b) => (a.createdDateTime ?? "").localeCompare(b.createdDateTime ?? ""));
}

export async function pollOnce(params: {
  accessToken: string;
  chatId: string;
  state: BridgeState;
  stateFile?: string;
  reply?: (message: GraphChatMessage) => Promise<string | undefined>;
}): Promise<{ messagesSeen: number; repliesSent: number }> {
  const messages = await listRecentMessages({
    accessToken: params.accessToken,
    chatId: params.chatId,
  });

  let repliesSent = 0;

  for (const message of unseenMessages(messages, params.state)) {
    params.state.seenMessageIds.add(message.id);

    const response = await params.reply?.(message);
    if (response) {
      const sent = await sendChatMessage({
        accessToken: params.accessToken,
        chatId: params.chatId,
        content: response,
      });
      if (sent.id) {
        params.state.seenMessageIds.add(sent.id);
      }
      repliesSent += 1;
    }
  }

  if (params.stateFile) {
    await writeState(params.stateFile, {
      seenMessageIds: [...params.state.seenMessageIds].slice(-500),
      lastPollAt: new Date().toISOString(),
    });
  }

  return { messagesSeen: messages.length, repliesSent };
}

export async function primeState(params: {
  accessToken: string;
  chatId: string;
  stateFile: string;
}): Promise<{ messagesPrimed: number }> {
  const messages = await listRecentMessages({
    accessToken: params.accessToken,
    chatId: params.chatId,
  });

  await writeState(params.stateFile, {
    seenMessageIds: messages.map((message) => message.id).filter(Boolean).slice(-500),
    lastPollAt: new Date().toISOString(),
  });

  return { messagesPrimed: messages.length };
}

export async function pollOnceFromState(params: {
  accessToken: string;
  chatId: string;
  stateFile: string;
  reply?: (message: GraphChatMessage) => Promise<string | undefined>;
}): Promise<{ messagesSeen: number; repliesSent: number }> {
  const stateFile = await readState(params.stateFile);
  return await pollOnce({
    accessToken: params.accessToken,
    chatId: params.chatId,
    state: createStateFromIds(stateFile.seenMessageIds),
    stateFile: params.stateFile,
    reply: params.reply,
  });
}
