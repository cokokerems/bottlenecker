import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Search, Globe, BarChart3, Plus, Trash2, MessageSquare, PanelLeftClose, PanelLeftOpen, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useResearchChat, type ChatMessage, type ModelId } from "@/hooks/useResearchChat";
import { cn } from "@/lib/utils";

const MODEL_OPTIONS: { id: ModelId; label: string; shortLabel: string; description: string }[] = [
  { id: "google/gemini-3-pro-preview", label: "Gemini 3 Pro", shortLabel: "Gemini Pro", description: "Deep reasoning, best for complex analysis" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", shortLabel: "Flash", description: "Fast, good for quick questions" },
  { id: "openai/gpt-5.2", label: "GPT-5.2", shortLabel: "GPT-5.2", description: "OpenAI's latest, strong reasoning" },
];

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

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ResearchChatProps {
  compact?: boolean;
}

export default function ResearchChat({ compact = false }: ResearchChatProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    conversations,
    activeId,
    newChat,
    switchChat,
    deleteChat,
    model,
    setModel,
  } = useResearchChat();

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(!compact);
  const [modelOpen, setModelOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentModelOption = MODEL_OPTIONS.find((m) => m.id === model) || MODEL_OPTIONS[0];

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
    <div className={`flex ${compact ? "h-full" : "h-[calc(100vh-8rem)]"}`}>
      {/* Conversation Sidebar */}
      <div
        className={cn(
          "border-r border-border/50 flex flex-col transition-all duration-200 overflow-hidden",
          sidebarOpen ? (compact ? "w-[180px]" : "w-[240px]") : "w-0"
        )}
      >
        <div className="p-2 border-b border-border/50 flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={newChat}
            className="flex-1 h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-1.5 space-y-0.5">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition-colors text-xs",
                  c.id === activeId
                    ? "bg-accent/60 text-accent-foreground"
                    : "hover:bg-accent/30 text-muted-foreground"
                )}
                onClick={() => switchChat(c.id)}
              >
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-[10px] opacity-60">{formatTime(c.updatedAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-4">
                No conversations yet
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toggle sidebar button */}
        <div className="flex items-center px-2 py-1 border-b border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide history" : "Show history"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={newChat}
              className="h-7 text-xs gap-1 ml-1"
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
          )}
        </div>

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
            {/* Model Selector */}
            <Popover open={modelOpen} onOpenChange={setModelOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 text-xs flex-shrink-0 px-2.5"
                >
                  <span className="truncate max-w-[80px]">{currentModelOption.shortLabel}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-1.5 bg-popover" align="start" side="top">
                {MODEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setModel(opt.id);
                      setModelOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2.5 w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent/50",
                      model === opt.id && "bg-accent/40"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                    </div>
                    {model === opt.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <Textarea
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
    </div>
  );
}
