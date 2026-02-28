
-- ================================================
-- AI Supply Chain Intelligence Schema
-- ================================================

-- 1. Categories lookup
CREATE TABLE public.categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT
);

-- 2. Companies
CREATE TABLE public.companies (
  id TEXT PRIMARY KEY,
  ticker TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  risk_score INT NOT NULL DEFAULT 0,
  dependency_count INT NOT NULL DEFAULT 0,
  competitive_position JSONB,
  market_cap NUMERIC,
  current_price NUMERIC,
  revenue NUMERIC,
  earnings NUMERIC,
  gross_margin NUMERIC,
  pe_ratio NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Company-category join
CREATE TABLE public.company_categories (
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  category_key TEXT REFERENCES public.categories(key) ON DELETE CASCADE,
  PRIMARY KEY (company_id, category_key)
);

-- 4. Relationships (edges in supply chain graph)
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  to_company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rel_type TEXT NOT NULL CHECK (rel_type IN ('supplier','customer','partner','competitor','other')),
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.500,
  source TEXT,
  notes TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_company_id, to_company_id, rel_type)
);

-- 5. Signals (extracted facts from AI analysis)
CREATE TABLE public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('up','down','flat','unknown')),
  magnitude NUMERIC(8,3),
  summary TEXT,
  source TEXT,
  as_of TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Company scores (computed bottleneck outputs)
CREATE TABLE public.company_scores (
  company_id TEXT PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  bottleneck_score INT NOT NULL DEFAULT 0,
  beneficiary_score INT NOT NULL DEFAULT 0,
  breakdown JSONB,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Scan runs (track scan history & status)
CREATE TABLE public.scan_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual','scheduled')),
  companies_scanned INT DEFAULT 0,
  signals_found INT DEFAULT 0,
  relationships_found INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ================================================
-- RLS: anonymous SELECT only, writes via service role
-- ================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "anon_select" ON public.companies FOR SELECT USING (true);
CREATE POLICY "anon_select" ON public.company_categories FOR SELECT USING (true);
CREATE POLICY "anon_select" ON public.relationships FOR SELECT USING (true);
CREATE POLICY "anon_select" ON public.signals FOR SELECT USING (true);
CREATE POLICY "anon_select" ON public.company_scores FOR SELECT USING (true);
CREATE POLICY "anon_select" ON public.scan_runs FOR SELECT USING (true);

-- ================================================
-- Indexes for common queries
-- ================================================

CREATE INDEX idx_relationships_from ON public.relationships(from_company_id);
CREATE INDEX idx_relationships_to ON public.relationships(to_company_id);
CREATE INDEX idx_signals_company ON public.signals(company_id);
CREATE INDEX idx_signals_as_of ON public.signals(as_of DESC);
CREATE INDEX idx_scan_runs_status ON public.scan_runs(status, started_at DESC);

-- ================================================
-- Auto-update timestamp trigger
-- ================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
