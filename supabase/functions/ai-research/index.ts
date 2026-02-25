import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FMP_BASE = "https://financialmodelingprep.com/stable";

// ── Tool definitions ──
const tools = [
  {
    type: "function",
    function: {
      name: "get_stock_data",
      description:
        "Fetch live financial data for a stock ticker: price, market cap, revenue, earnings, balance sheet, key metrics. Use when the user asks about a specific company's financials.",
      parameters: {
        type: "object",
        properties: {
          ticker: { type: "string", description: "Stock ticker symbol, e.g. AAPL" },
        },
        required: ["ticker"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description:
        "Search the web for real-time information about stocks, markets, earnings, news, SEC filings. Returns grounded results with citations.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scrape_page",
      description:
        "Scrape and extract content from a specific URL (investor relations page, SEC filing, news article, etc).",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to scrape" },
        },
        required: ["url"],
      },
    },
  },
];

// ── Tool execution ──
async function executeToolCall(
  name: string,
  args: Record<string, string>
): Promise<string> {
  try {
    if (name === "get_stock_data") {
      const fmpKey = Deno.env.get("FMP_API_KEY");
      if (!fmpKey) return JSON.stringify({ error: "FMP_API_KEY not configured" });

      const ticker = args.ticker.toUpperCase();
      const endpoints = ["quote", "profile", "income-statement", "balance-sheet-statement", "key-metrics"];
      const results: Record<string, unknown> = {};

      await Promise.all(
        endpoints.map(async (ep) => {
          const params: Record<string, string> = { symbol: ticker };
          if (ep === "key-metrics") params.period = "ttm";
          if (ep.includes("statement")) params.limit = "1";
          const sp = new URLSearchParams({ ...params, apikey: fmpKey });
          const res = await fetch(`${FMP_BASE}/${ep}?${sp}`);
          if (res.ok) {
            const d = await res.json();
            results[ep] = Array.isArray(d) && d.length === 1 ? d[0] : d;
          }
        })
      );
      return JSON.stringify(results);
    }

    if (name === "web_search") {
      const pxKey = Deno.env.get("PERPLEXITY_API_KEY");
      if (!pxKey) return JSON.stringify({ error: "Perplexity not configured. Connect the Perplexity connector." });

      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${pxKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: "Provide concise, factual answers with sources." },
            { role: "user", content: args.query },
          ],
        }),
      });
      const data = await res.json();
      return JSON.stringify({
        answer: data.choices?.[0]?.message?.content || "No results",
        citations: data.citations || [],
      });
    }

    if (name === "scrape_page") {
      const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (!fcKey) return JSON.stringify({ error: "Firecrawl not configured. Connect the Firecrawl connector." });

      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: args.url, formats: ["markdown"], onlyMainContent: true }),
      });
      const data = await res.json();
      const md = data.data?.markdown || data.markdown || "";
      // Truncate if too long
      return md.length > 8000 ? md.slice(0, 8000) + "\n\n...[truncated]" : md;
    }

    return JSON.stringify({ error: `Unknown tool: ${name}` });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Tool execution failed" });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { messages } = await req.json();

    const now = new Date();
    const systemPrompt = `You are an expert stock and supply chain research analyst embedded in a finance app called "AI Supply Chain Intel". The current date and time is ${now.toISOString()} (UTC). Do NOT guess or approximate the time — use this exact timestamp when asked about the current time.

CRITICAL RULES:
- **ALWAYS call get_stock_data FIRST** when a user asks about any company's price, market cap, revenue, earnings, valuation, or any financial metric. NEVER answer financial questions from memory — your training data is outdated.
- After getting live data from get_stock_data, you may supplement with web_search for context (news, analysis).
- Use scrape_page to extract content from specific URLs the user provides.
- When presenting data, clearly state it came from live API data, not your training knowledge.

Available tools:
1. **get_stock_data** — Fetches LIVE financial data: current price, market cap, revenue, earnings, balance sheet, key metrics. USE THIS FOR ALL FINANCIAL QUESTIONS.
2. **web_search** — Real-time web search for news, earnings reports, SEC filings, market analysis. Good for context and recent events.
3. **scrape_page** — Scrape content from any URL (investor relations, 10-K filings, news articles).

Format responses with clear markdown: headers, bullet points, tables for financial data. Always specify data source (e.g. "Source: Live FMP API data").

If a tool returns an error about not being configured, let the user know they need to connect that service in their project settings.`;

    let currentMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Tool-calling loop (max 5 iterations to avoid infinite loops)
    for (let i = 0; i < 5; i++) {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: currentMessages,
          tools,
          stream: false,
        }),
      });

      if (!aiRes.ok) {
        if (aiRes.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiRes.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await aiRes.text();
        console.error("AI error:", aiRes.status, t);
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await aiRes.json();
      const choice = aiData.choices?.[0];

      if (!choice) {
        return new Response(JSON.stringify({ error: "No AI response" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If the model wants to call tools
      if (choice.finish_reason === "tool_calls" || choice.message?.tool_calls?.length) {
        currentMessages.push(choice.message);

        const toolCalls = choice.message.tool_calls || [];
        // Execute all tool calls in parallel
        const toolResults = await Promise.all(
          toolCalls.map(async (tc: { id: string; function: { name: string; arguments: string } }) => {
            const args = JSON.parse(tc.function.arguments);
            const result = await executeToolCall(tc.function.name, args);
            return {
              role: "tool" as const,
              tool_call_id: tc.id,
              content: result,
            };
          })
        );

        currentMessages.push(...toolResults);
        continue; // Loop back for the model to process tool results
      }

      // Final text response — stream it back
      // Re-call with streaming for the final response
      const streamRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: currentMessages,
          stream: true,
        }),
      });

      return new Response(streamRes.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(JSON.stringify({ error: "Too many tool iterations" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Research chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
