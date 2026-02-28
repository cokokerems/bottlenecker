import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FMP_BASE = "https://financialmodelingprep.com/stable";
const CONCURRENCY = 3;

// ── Helpers ──

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function runConcurrent<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()));
  return results;
}

// ── FMP fetchers ──

async function fmpFetch(path: string, params: Record<string, string>, apiKey: string): Promise<unknown> {
  const sp = new URLSearchParams({ ...params, apikey: apiKey });
  const res = await fetch(`${FMP_BASE}${path}?${sp}`);
  if (!res.ok) {
    const body = await res.text();
    console.error(`FMP ${res.status} for ${path}: ${body.slice(0, 200)}`);
    return null;
  }
  return res.json();
}

interface CompanyFinancials {
  ticker: string;
  companyId: string;
  quote: Record<string, unknown> | null;
  keyMetrics: Record<string, unknown> | null;
  incomeStatement: Record<string, unknown> | null;
  transcript: string | null;
}

async function fetchCompanyData(
  ticker: string,
  companyId: string,
  apiKey: string
): Promise<CompanyFinancials> {
  const result: CompanyFinancials = {
    ticker,
    companyId,
    quote: null,
    keyMetrics: null,
    incomeStatement: null,
    transcript: null,
  };

  const [quoteData, metricsData, incomeData, transcriptData] = await Promise.all([
    fmpFetch("/quote", { symbol: ticker }, apiKey),
    fmpFetch("/key-metrics", { symbol: ticker, period: "ttm" }, apiKey),
    fmpFetch("/income-statement", { symbol: ticker, limit: "1" }, apiKey),
    fmpFetch("/earning-call-transcript", {
      symbol: ticker,
      year: String(new Date().getUTCFullYear()),
      quarter: String(Math.max(1, Math.ceil(new Date().getUTCMonth() / 3) - 1)),
    }, apiKey),
  ]);

  result.quote = Array.isArray(quoteData) && quoteData.length > 0 ? quoteData[0] : null;
  result.keyMetrics = Array.isArray(metricsData) && metricsData.length > 0 ? metricsData[0] : null;
  result.incomeStatement = Array.isArray(incomeData) && incomeData.length > 0 ? incomeData[0] : null;

  if (Array.isArray(transcriptData) && transcriptData.length > 0) {
    const content = transcriptData[0].content;
    result.transcript = typeof content === "string" && content.length > 6000
      ? content.slice(0, 6000) + "\n...[truncated]"
      : content;
  }

  return result;
}

// ── Perplexity news search ──

async function searchSupplyChainNews(
  companyName: string,
  ticker: string,
  pxKey: string
): Promise<string> {
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${pxKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "Provide concise factual information about supply chain risks." },
          {
            role: "user",
            content: `${companyName} (${ticker}) supply chain risks, constraints, bottlenecks, capacity issues 2025-2026. Focus on: single-source dependencies, lead time changes, capacity utilization, demand/supply imbalances.`,
          },
        ],
        search_recency_filter: "month",
      }),
    });
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];
    return `${answer}\n\nSources: ${citations.join(", ")}`;
  } catch (e) {
    console.error(`Perplexity error for ${ticker}:`, e);
    return "";
  }
}

// ── AI analysis (Gemini via Lovable AI) ──

interface AnalysisResult {
  scores: Array<{
    company_id: string;
    bottleneck_score: number;
    beneficiary_score: number;
    breakdown: {
      concentration_risk: number;
      financial_health: number;
      signal_strength: number;
      reason: string;
    };
  }>;
  signals: Array<{
    company_id: string;
    signal_type: string;
    direction: "up" | "down" | "flat" | "unknown";
    magnitude: number;
    summary: string;
    source: string;
  }>;
  new_relationships: Array<{
    from_company_id: string;
    to_company_id: string;
    rel_type: "supplier" | "customer" | "partner" | "competitor" | "other";
    confidence: number;
    notes: string;
  }>;
}

async function analyzeWithAI(
  companiesData: CompanyFinancials[],
  newsData: Record<string, string>,
  existingCompanyIds: string[],
  lovableKey: string
): Promise<AnalysisResult> {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  const companyContext = companiesData
    .map((c) => {
      const sections = [`## ${c.ticker} (ID: ${c.companyId})`];
      if (c.quote) sections.push(`Quote: ${JSON.stringify(c.quote)}`);
      if (c.keyMetrics) sections.push(`Key Metrics: ${JSON.stringify(c.keyMetrics)}`);
      if (c.incomeStatement) sections.push(`Income Statement: ${JSON.stringify(c.incomeStatement)}`);
      if (c.transcript) sections.push(`Earnings Transcript (excerpt):\n${c.transcript}`);
      if (newsData[c.companyId]) sections.push(`Recent News:\n${newsData[c.companyId]}`);
      return sections.join("\n");
    })
    .join("\n\n---\n\n");

  const systemPrompt = `You are an expert AI supply chain risk analyst. Today is ${dateStr}. The year is ${now.getUTCFullYear()}.

Analyze the following companies' financial data, earnings transcripts, and recent news to identify:
1. **Bottleneck scores** (0-100): How much of a single point of failure is this company in the AI infrastructure supply chain? Consider: market share monopoly/duopoly position, number of downstream dependents, replaceability.
2. **Beneficiary scores** (0-100): How much does this company benefit from AI infrastructure buildout?
3. **Signals**: Extract specific supply chain signals from earnings transcripts and news (demand trends, capacity constraints, lead time changes, pricing pressure, capex plans).
4. **New relationships**: If you discover supplier/customer/partner relationships from transcripts or news that aren't in the existing data, report them.

Known company IDs in our system: ${existingCompanyIds.join(", ")}

Only create relationships between companies that exist in our system.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: companyContext },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "submit_analysis",
            description: "Submit the complete bottleneck analysis results",
            parameters: {
              type: "object",
              properties: {
                scores: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company_id: { type: "string" },
                      bottleneck_score: { type: "number" },
                      beneficiary_score: { type: "number" },
                      breakdown: {
                        type: "object",
                        properties: {
                          concentration_risk: { type: "number" },
                          financial_health: { type: "number" },
                          signal_strength: { type: "number" },
                          reason: { type: "string" },
                        },
                        required: ["concentration_risk", "financial_health", "signal_strength", "reason"],
                      },
                    },
                    required: ["company_id", "bottleneck_score", "beneficiary_score", "breakdown"],
                  },
                },
                signals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company_id: { type: "string" },
                      signal_type: { type: "string" },
                      direction: { type: "string", enum: ["up", "down", "flat", "unknown"] },
                      magnitude: { type: "number" },
                      summary: { type: "string" },
                      source: { type: "string" },
                    },
                    required: ["company_id", "signal_type", "direction", "magnitude", "summary", "source"],
                  },
                },
                new_relationships: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      from_company_id: { type: "string" },
                      to_company_id: { type: "string" },
                      rel_type: { type: "string", enum: ["supplier", "customer", "partner", "competitor", "other"] },
                      confidence: { type: "number" },
                      notes: { type: "string" },
                    },
                    required: ["from_company_id", "to_company_id", "rel_type", "confidence", "notes"],
                  },
                },
              },
              required: ["scores", "signals", "new_relationships"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "submit_analysis" } },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("AI analysis error:", res.status, text);
    throw new Error(`AI analysis failed: ${res.status}`);
  }

  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return structured analysis");

  return JSON.parse(toolCall.function.arguments) as AnalysisResult;
}

// ── DB persistence ──

async function persistResults(
  supabase: ReturnType<typeof createClient>,
  analysis: AnalysisResult,
  scanId: string
) {
  let signalsFound = 0;
  let relationshipsFound = 0;

  // Upsert company scores
  if (analysis.scores.length > 0) {
    for (const score of analysis.scores) {
      await supabase.from("company_scores").upsert(
        {
          company_id: score.company_id,
          bottleneck_score: score.bottleneck_score,
          beneficiary_score: score.beneficiary_score,
          breakdown: score.breakdown,
          computed_at: new Date().toISOString(),
        },
        { onConflict: "company_id" }
      );
    }
  }

  // Insert signals
  if (analysis.signals.length > 0) {
    const { error } = await supabase.from("signals").insert(
      analysis.signals.map((s) => ({
        company_id: s.company_id,
        signal_type: s.signal_type,
        direction: s.direction,
        magnitude: s.magnitude,
        summary: s.summary,
        source: s.source,
      }))
    );
    if (error) console.error("Signal insert error:", error);
    else signalsFound = analysis.signals.length;
  }

  // Upsert new relationships
  if (analysis.new_relationships.length > 0) {
    for (const rel of analysis.new_relationships) {
      const { error } = await supabase.from("relationships").upsert(
        {
          from_company_id: rel.from_company_id,
          to_company_id: rel.to_company_id,
          rel_type: rel.rel_type,
          confidence: rel.confidence,
          notes: rel.notes,
          source: "ai-scan",
          last_seen: new Date().toISOString(),
        },
        { onConflict: "from_company_id,to_company_id,rel_type" }
      );
      if (!error) relationshipsFound++;
    }
  }

  return { signalsFound, relationshipsFound };
}

// ── Main handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const FMP_API_KEY = Deno.env.get("FMP_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!FMP_API_KEY) return err("FMP_API_KEY not configured");
  if (!LOVABLE_API_KEY) return err("LOVABLE_API_KEY not configured");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return err("Supabase not configured");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json().catch(() => ({}));
    const triggerType = body.trigger_type || "manual";

    // Create scan run record
    const { data: scanRun, error: scanErr } = await supabase
      .from("scan_runs")
      .insert({ status: "running", trigger_type: triggerType })
      .select("id")
      .single();

    if (scanErr || !scanRun) {
      console.error("Failed to create scan run:", scanErr);
      return err("Failed to initialize scan");
    }

    const scanId = scanRun.id;

    // Get all companies from DB
    const { data: companies, error: compErr } = await supabase
      .from("companies")
      .select("id, ticker, name");

    if (compErr || !companies?.length) {
      await supabase.from("scan_runs").update({ status: "failed", error_message: "No companies found", completed_at: new Date().toISOString() }).eq("id", scanId);
      return err("No companies in database");
    }

    const allCompanyIds = companies.map((c: { id: string }) => c.id);

    // ── Step 1: Fetch financial data from FMP (batched with concurrency) ──
    console.log(`Fetching FMP data for ${companies.length} companies...`);
    const fmpTasks = companies.map((c: { id: string; ticker: string }) => () => fetchCompanyData(c.ticker, c.id, FMP_API_KEY));
    const financials = await runConcurrent(fmpTasks, CONCURRENCY);

    // ── Step 2: Search for supply chain news via Perplexity ──
    const newsData: Record<string, string> = {};
    if (PERPLEXITY_API_KEY) {
      console.log("Searching for supply chain news...");
      // Only search top companies by risk/importance to stay within rate limits
      const topCompanies = companies.slice(0, 15);
      const newsTasks = topCompanies.map((c: { id: string; ticker: string; name: string }) => async () => {
        const news = await searchSupplyChainNews(c.name, c.ticker, PERPLEXITY_API_KEY);
        newsData[c.id] = news;
      });
      await runConcurrent(newsTasks, 2); // Lower concurrency for Perplexity rate limits
    } else {
      console.log("Perplexity not configured, skipping news search");
    }

    // ── Step 3: AI analysis with Gemini via Lovable AI ──
    // Process in batches of ~15 companies to stay within context limits
    console.log("Running AI analysis...");
    const batchSize = 15;
    let totalSignals = 0;
    let totalRelationships = 0;

    for (let i = 0; i < financials.length; i += batchSize) {
      const batch = financials.slice(i, i + batchSize);
      const batchNews: Record<string, string> = {};
      batch.forEach((c) => {
        if (newsData[c.companyId]) batchNews[c.companyId] = newsData[c.companyId];
      });

      try {
        const analysis = await analyzeWithAI(batch, batchNews, allCompanyIds, LOVABLE_API_KEY);
        const { signalsFound, relationshipsFound } = await persistResults(supabase, analysis, scanId);
        totalSignals += signalsFound;
        totalRelationships += relationshipsFound;
      } catch (e) {
        console.error(`Batch ${i / batchSize + 1} analysis error:`, e);
      }
    }

    // ── Step 4: Update scan run as completed ──
    await supabase.from("scan_runs").update({
      status: "completed",
      companies_scanned: companies.length,
      signals_found: totalSignals,
      relationships_found: totalRelationships,
      completed_at: new Date().toISOString(),
    }).eq("id", scanId);

    console.log(`Scan ${scanId} completed: ${companies.length} companies, ${totalSignals} signals, ${totalRelationships} relationships`);

    return ok({
      scan_id: scanId,
      status: "completed",
      companies_scanned: companies.length,
      signals_found: totalSignals,
      relationships_found: totalRelationships,
    });
  } catch (e) {
    console.error("Bottleneck scan error:", e);
    return err(e instanceof Error ? e.message : "Unknown error");
  }
});
