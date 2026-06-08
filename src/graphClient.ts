export type GraphChatMessage = {
  id: string;
  createdDateTime?: string;
  from?: {
    user?: {
      id?: string;
      displayName?: string;
      userPrincipalName?: string;
    };
    application?: {
      id?: string;
      displayName?: string;
    };
  };
  body?: {
    contentType?: string;
    content?: string;
  };
};

type GraphCollection<T> = {
  value?: T[];
};

async function graphRequest<T>(params: {
  accessToken: string;
  method: "GET" | "POST";
  path: string;
  body?: unknown;
}): Promise<T> {
  const response = await fetch(`https://graph.microsoft.com/v1.0${params.path}`, {
    method: params.method,
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: params.body === undefined ? undefined : JSON.stringify(params.body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Graph ${params.method} ${params.path} failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export async function listRecentMessages(params: {
  accessToken: string;
  chatId: string;
  top?: number;
}): Promise<GraphChatMessage[]> {
  const top = params.top ?? 10;
  const result = await graphRequest<GraphCollection<GraphChatMessage>>({
    accessToken: params.accessToken,
    method: "GET",
    path: `/chats/${encodeURIComponent(params.chatId)}/messages?$top=${top}`,
  });
  return result.value ?? [];
}

export async function sendChatMessage(params: {
  accessToken: string;
  chatId: string;
  content: string;
}): Promise<GraphChatMessage> {
  return await graphRequest<GraphChatMessage>({
    accessToken: params.accessToken,
    method: "POST",
    path: `/chats/${encodeURIComponent(params.chatId)}/messages`,
    body: {
      body: {
        contentType: "text",
        content: params.content,
      },
    },
  });
}

