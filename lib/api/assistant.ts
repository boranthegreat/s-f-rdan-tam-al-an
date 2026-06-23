import { fetchJson } from "@/lib/api/http";
import type { AssistantMessage, AssistantResponse } from "@/types";

export async function askAssistant(messages: AssistantMessage[]): Promise<AssistantResponse> {
  return fetchJson<AssistantResponse>("/api/assistant", "BorAI su anda cevap veremedi.", {
    method: "POST",
    body: JSON.stringify({ messages }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}
