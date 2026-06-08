import { loadConfig } from "./config.js";
import { sendChatMessage } from "./graphClient.js";
import { readStoredToken } from "./tokenStore.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const token = await readStoredToken(config.tokenFile);

  if (!token.accessToken) {
    throw new Error("Token refresh is not implemented in the scaffold yet");
  }

  const proof = await sendChatMessage({
    accessToken: token.accessToken,
    chatId: config.chatId,
    content: "GraphHarbor scaffold is wired.",
  });

  console.log(
    JSON.stringify(
      {
        status: "sent",
        messageId: proof.id,
        createdDateTime: proof.createdDateTime,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
