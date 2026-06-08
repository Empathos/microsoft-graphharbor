import { listRecentMessages, sendChatMessage, type GraphChatMessage } from "./graphClient.js";

export type BridgeState = {
  seenMessageIds: Set<string>;
};

export function createInitialState(): BridgeState {
  return { seenMessageIds: new Set<string>() };
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
  reply?: (message: GraphChatMessage) => Promise<string | undefined>;
}): Promise<void> {
  const messages = await listRecentMessages({
    accessToken: params.accessToken,
    chatId: params.chatId,
  });

  for (const message of unseenMessages(messages, params.state)) {
    params.state.seenMessageIds.add(message.id);

    const response = await params.reply?.(message);
    if (response) {
      await sendChatMessage({
        accessToken: params.accessToken,
        chatId: params.chatId,
        content: response,
      });
    }
  }
}

