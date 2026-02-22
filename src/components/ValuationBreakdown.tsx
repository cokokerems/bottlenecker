import { Company, categoryColors } from "@/data/companies";
import { ValuationData, valuationData } from "@/data/valuation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bot, TrendingUp, Calculator, DollarSign, BarChart3, Layers, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";

function fmt(v: number, decimals = 1): string {
  return v.toFixed(decimals);
}
function pct(v: number): string {
  return (v * 100).toFixed(1) + "%";
}

function FormulaRow({ label, formula, value, highlight }: { label: string; formula: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-1.5 ${highlight ? "font-bold" : ""}`}>
      <div className="min-w-0">
        <span className={`text-sm ${highlight ? "text-primary" : "text-foreground"}`}>{label}</span>
        <p className="text-[10px] font-mono text-muted-foreground leading-tight">{formula}</p>
      </div>
      <span className={`font-mono text-sm whitespace-nowrap ${highlight ? "text-primary" : ""}`}>{value}</span>
    </div>
  );
}

function SectionCard({ icon: Icon, title, badge, children }: { icon: React.ElementType; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">{title}</CardTitle>
          {badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">{badge}</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">{children}</CardContent>
    </Card>
  );
}

export default function ValuationBreakdown({ company }: { company: Company }) {
  const v = valuationData[company.id];
  if (!v) return null;

  // 1. Enterprise Value
  const ev = company.marketCap + company.totalDebt + company.preferredStock + company.minorityInterest - company.cashAndEquivalents;
  // 2. Equity Value
  const equityValue = company.currentPrice * v.sharesOutstanding;
  // 3. Takeover Premium
  const offerPrice = company.currentPrice * (1 + v.offerPremium);
  // 4. EV/EBITDA
  const evEbitda = ev / v.ebitda;
  // 5. EV/Revenue
  const evRevenue = ev / company.revenue;
  // 6. P/E
  const pe = company.earnings !== 0 ? equityValue / company.earnings : NaN;
  // 7. FCF
  const fcf = v.ebit * (1 - v.taxRate) + v.depreciation - v.capex - v.changeInWorkingCapital;
  // 8. DCF
  const pvFCF = v.projectedFCF.reduce((sum, f, i) => sum + f / Math.pow(1 + v.wacc, i + 1), 0);
  // 9. Terminal Value (Gordon)
  const tvGordon = v.projectedFCF[4] * (1 + v.terminalGrowthRate) / (v.wacc - v.terminalGrowthRate);
  // 10. Terminal Value (Exit Multiple)
  const tvExit = v.ebitda * v.exitMultiple;
  // PV of terminal values
  const pvTvGordon = tvGordon / Math.pow(1 + v.wacc, 5);
  const pvTvExit = tvExit / Math.pow(1 + v.wacc, 5);
  // DCF values
  const dcfGordon = pvFCF + pvTvGordon;
  const dcfExit = pvFCF + pvTvExit;
  // 11. WACC (display)
  const eV = equityValue;
  const totalV = eV + company.totalDebt;
  const waccCalc = (eV / totalV) * v.costOfEquity + (company.totalDebt / totalV) * v.costOfDebt * (1 - v.taxRate);
  // 12. Synergy
  const synergy = (v.costSynergies + v.revenueSynergies) / v.synergyDiscountRate; // simplified perpetuity PV
  // 13. Accretion/Dilution
  const accretion = v.buyerEPS !== 0 ? (v.proFormaEPS - v.buyerEPS) / v.buyerEPS : 0;
  const isAccretive = accretion >= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">M&A Valuation Analysis</h2>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">AI Agent</span>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">Computed by valuation agent using 13 standard M&A formulas · Mock data for demonstration</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EV & Equity */}
        <SectionCard icon={DollarSign} title="Enterprise & Equity Value" badge="Formulas 1-2">
          <FormulaRow label="Market Capitalization" formula="Share Price × Diluted Shares" value={`$${fmt(equityValue)}B`} />
          <FormulaRow label="+ Total Debt" formula="" value={`$${fmt(company.totalDebt)}B`} />
          <FormulaRow label="+ Preferred Stock" formula="" value={`$${fmt(company.preferredStock)}B`} />
          <FormulaRow label="+ Minority Interest" formula="" value={`$${fmt(company.minorityInterest)}B`} />
          <FormulaRow label="− Cash & Equivalents" formula="" value={`$${fmt(company.cashAndEquivalents)}B`} />
          <Separator className="my-1" />
          <FormulaRow label="Enterprise Value (EV)" formula="EV = Equity + Debt + Pref + MI − Cash" value={`$${fmt(ev)}B`} highlight />
        </SectionCard>

        {/* Multiples */}
        <SectionCard icon={BarChart3} title="Valuation Multiples" badge="Formulas 4-6">
          <FormulaRow label="EV / EBITDA" formula={`$${fmt(ev)}B / $${fmt(v.ebitda)}B`} value={`${fmt(evEbitda)}x`} />
          <FormulaRow label="EV / Revenue" formula={`$${fmt(ev)}B / $${fmt(company.revenue)}B`} value={`${fmt(evRevenue)}x`} />
          <FormulaRow label="P/E Ratio" formula={`$${fmt(equityValue)}B / $${fmt(company.earnings)}B`} value={isNaN(pe) ? "N/A" : `${fmt(pe)}x`} />
          <Separator className="my-1" />
          <FormulaRow label="EBITDA" formula="Earnings Before Interest, Taxes, Depr. & Amort." value={`$${fmt(v.ebitda)}B`} />
        </SectionCard>

        {/* FCF & DCF */}
        <SectionCard icon={Calculator} title="DCF Valuation" badge="Formulas 7-10">
          <FormulaRow label="EBIT × (1 − Tax)" formula={`$${fmt(v.ebit)}B × (1 − ${pct(v.taxRate)})`} value={`$${fmt(v.ebit * (1 - v.taxRate))}B`} />
          <FormulaRow label="+ Depreciation" formula="" value={`$${fmt(v.depreciation)}B`} />
          <FormulaRow label="− CapEx" formula="" value={`$${fmt(v.capex)}B`} />
          <FormulaRow label="− ΔWC" formula="" value={`$${fmt(v.changeInWorkingCapital)}B`} />
          <Separator className="my-1" />
          <FormulaRow label="Free Cash Flow (FCF)" formula="EBIT(1−T) + D&A − CapEx − ΔWC" value={`$${fmt(fcf)}B`} highlight />
          <div className="mt-2" />
          <FormulaRow label="PV of 5-yr FCFs" formula="Σ FCFₜ / (1+WACC)ᵗ" value={`$${fmt(pvFCF)}B`} />
          <FormulaRow label="Terminal Value (Gordon)" formula={`FCF₆ / (WACC − g) = $${fmt(v.projectedFCF[4] * (1 + v.terminalGrowthRate))}B / (${pct(v.wacc)} − ${pct(v.terminalGrowthRate)})`} value={`$${fmt(tvGordon)}B`} />
          <FormulaRow label="Terminal Value (Exit)" formula={`EBITDA × ${v.exitMultiple}x`} value={`$${fmt(tvExit)}B`} />
          <Separator className="my-1" />
          <FormulaRow label="DCF (Gordon Growth)" formula="PV(FCFs) + PV(TV Gordon)" value={`$${fmt(dcfGordon)}B`} highlight />
          <FormulaRow label="DCF (Exit Multiple)" formula="PV(FCFs) + PV(TV Exit)" value={`$${fmt(dcfExit)}B`} highlight />
        </SectionCard>

        {/* WACC */}
        <SectionCard icon={Layers} title="WACC & Capital Structure" badge="Formula 11">
          <FormulaRow label="Cost of Equity (Re)" formula="CAPM-derived" value={pct(v.costOfEquity)} />
          <FormulaRow label="Cost of Debt (Rd)" formula="After-tax" value={pct(v.costOfDebt)} />
          <FormulaRow label="Equity Weight (E/V)" formula={`$${fmt(eV)}B / $${fmt(totalV)}B`} value={pct(eV / totalV)} />
          <FormulaRow label="Debt Weight (D/V)" formula={`$${fmt(company.totalDebt)}B / $${fmt(totalV)}B`} value={pct(company.totalDebt / totalV)} />
          <FormulaRow label="Tax Rate" formula="" value={pct(v.taxRate)} />
          <Separator className="my-1" />
          <FormulaRow label="WACC" formula="(E/V)×Re + (D/V)×Rd×(1−T)" value={pct(waccCalc)} highlight />
        </SectionCard>

        {/* Takeover & Synergies */}
        <SectionCard icon={Zap} title="Takeover Analysis" badge="Formulas 3, 12-13">
          <FormulaRow label="Current Share Price" formula="" value={`$${company.currentPrice.toFixed(2)}`} />
          <FormulaRow label="Takeover Premium" formula={`(Offer − Current) / Current`} value={pct(v.offerPremium)} />
          <FormulaRow label="Implied Offer Price" formula={`$${company.currentPrice.toFixed(2)} × (1 + ${pct(v.offerPremium)})`} value={`$${offerPrice.toFixed(2)}`} highlight />
          <Separator className="my-1" />
          <FormulaRow label="Cost Synergies" formula="PV of annual cost savings" value={`$${fmt(v.costSynergies)}B/yr`} />
          <FormulaRow label="Revenue Synergies" formula="PV of revenue uplift" value={`$${fmt(v.revenueSynergies)}B/yr`} />
          <FormulaRow label="Synergy Value" formula={`PV = ($${fmt(v.costSynergies)}B + $${fmt(v.revenueSynergies)}B) / ${pct(v.synergyDiscountRate)}`} value={`$${fmt(synergy)}B`} highlight />
          <Separator className="my-1" />
          <div className="flex items-center justify-between py-1.5">
            <div>
              <span className="text-sm font-bold">Accretion / Dilution</span>
              <p className="text-[10px] font-mono text-muted-foreground">(Pro Forma EPS − Buyer EPS) / Buyer EPS</p>
            </div>
            <span className={`font-mono text-sm font-bold flex items-center gap-1 ${isAccretive ? "text-success" : "text-destructive"}`}>
              {isAccretive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {pct(Math.abs(accretion))} {isAccretive ? "Accretive" : "Dilutive"}
            </span>
          </div>
        </SectionCard>

        {/* Summary */}
        <SectionCard icon={TrendingUp} title="Valuation Summary" badge="All Methods">
          <div className="space-y-2">
            {[
              { method: "Enterprise Value", value: ev },
              { method: "DCF (Gordon Growth)", value: dcfGordon },
              { method: "DCF (Exit Multiple)", value: dcfExit },
              { method: "Synergy-Adj. EV", value: ev + synergy },
            ].map((r) => (
              <div key={r.method} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{r.method}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-primary/20 w-24 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (r.value / Math.max(dcfGordon, dcfExit, ev + synergy)) * 100)}%` }} />
                  </div>
                  <span className="font-mono text-sm font-bold">${fmt(r.value)}B</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
