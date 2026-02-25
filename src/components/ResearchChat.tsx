import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Bot, User, Loader2, Search, Globe, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useResearchChat, type ChatMessage } from "@/hooks/useResearchChat";

const SUGGESTIONS = [
  { icon: BarChart3, text: "Analyze AAPL's financial health" },
  { icon: Search, text: "Latest earnings surprises in semiconductors" },
  { icon: Globe, text: "Compare TSMC vs Samsung Foundry market share" },
  { icon: BarChart3, text: "What's NVDA's current valuation vs peers?" },
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 border border-border/50"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none [&_table]:text-xs [&_th]:px-2 [&_td]:px-2 [&_pre]:bg-background/50 [&_code]:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/50 flex items-center justify-center mt-1">
          <User className="h-4 w-4 text-accent-foreground" />
        </div>
      )}
    </div>
  );
}

interface ResearchChatProps {
  compact?: boolean;
}

export default function ResearchChat({ compact = false }: ResearchChatProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useResearchChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "h-[calc(100vh-8rem)]"}`}>
      {/* Messages */}
      <ScrollArea className="flex-1 pr-2" ref={scrollRef as any}>
        <div className="space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">AI Research Assistant</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask me about stocks, financials, supply chains. I can pull live data, search the web, and scrape pages.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text)}
                    className="flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                  >
                    <s.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted/50 border border-border/50 rounded-xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/50 p-3">
        <div className="flex gap-2 items-end">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="flex-shrink-0 h-9 w-9"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any stock, market, or supply chain..."
            className="min-h-[40px] max-h-[120px] resize-none text-sm"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 h-9 w-9"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          AI can pull live financials • Search the web • Scrape pages
        </p>
      </div>
    </div>
  );
}
