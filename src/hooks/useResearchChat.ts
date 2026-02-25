import { useState, useCallback, useEffect } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-research`;
const STORAGE_KEY = "research-conversations";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrate old format (flat message array)
    if (Array.isArray(parsed) && parsed.length > 0 && "role" in parsed[0]) {
      const migrated: Conversation = {
        id: crypto.randomUUID(),
        title: getTitle(parsed as ChatMessage[]),
        messages: parsed as ChatMessage[],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return migrated.messages.length > 0 ? [migrated] : [];
    }
    return parsed;
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

function getTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New Chat";
  return first.content.slice(0, 50) + (first.content.length > 50 ? "…" : "");
}

export function useResearchChat() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(() => {
    const convos = loadConversations();
    return convos.length > 0 ? convos[0].id : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const activeConvo = conversations.find((c) => c.id === activeId) || null;
  const messages = activeConvo?.messages || [];

  // Persist
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const newChat = useCallback(() => {
    const id = crypto.randomUUID();
    const convo: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [convo, ...prev]);
    setActiveId(id);
  }, []);

  const switchChat = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (activeId === id) {
          setActiveId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [activeId]
  );

  const sendMessage = useCallback(
    async (input: string) => {
      let currentActiveId = activeId;

      // Auto-create conversation if none active
      if (!currentActiveId) {
        const id = crypto.randomUUID();
        const convo: Conversation = {
          id,
          title: input.slice(0, 50) + (input.length > 50 ? "…" : ""),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setConversations((prev) => [convo, ...prev]);
        setActiveId(id);
        currentActiveId = id;
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: input,
      };

      // Add user message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentActiveId) return c;
          const msgs = [...c.messages, userMsg];
          return {
            ...c,
            messages: msgs,
            title: c.title === "New Chat" ? getTitle(msgs) : c.title,
            updatedAt: Date.now(),
          };
        })
      );

      setIsLoading(true);
      let assistantSoFar = "";
      const assistantId = crypto.randomUUID();

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== currentActiveId) return c;
            const last = c.messages[c.messages.length - 1];
            if (last?.role === "assistant" && last.id === assistantId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantSoFar } : m
                ),
                updatedAt: Date.now(),
              };
            }
            return {
              ...c,
              messages: [
                ...c.messages,
                { id: assistantId, role: "assistant" as const, content: assistantSoFar },
              ],
              updatedAt: Date.now(),
            };
          })
        );
      };

      try {
        // Get current messages for API (need to read from latest state)
        const currentConvo = conversations.find((c) => c.id === currentActiveId);
        const allMsgs = [...(currentConvo?.messages || []), userMsg];
        const apiMessages = allMsgs.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Request failed" }));
          upsert(err.error || "Something went wrong. Please try again.");
          setIsLoading(false);
          return;
        }

        if (!resp.body) {
          upsert("No response received.");
          setIsLoading(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsert(content);
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e) {
        console.error("Research chat error:", e);
        upsert("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeId, conversations]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    conversations,
    activeId,
    newChat,
    switchChat,
    deleteChat,
  };
}
