import { useCallback, useState, useRef, useEffect } from "react";
import { companies, categoryColors, categoryLabels, type Company, type CompanyCategory, getPrimaryCategory } from "@/data/companies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface NodePosition {
  x: number;
  y: number;
  company: Company;
}

// Arrange categories in a grid layout for the expanded set
const categoryPositions: Record<CompanyCategory, { cx: number; cy: number }> = {
  "semi-equipment": { cx: 120, cy: 120 },
  "semi-materials": { cx: 120, cy: 280 },
  "eda": { cx: 300, cy: 120 },
  "chip-ip": { cx: 300, cy: 280 },
  "foundries": { cx: 300, cy: 440 },
  "memory": { cx: 480, cy: 120 },
  "chip-designers": { cx: 480, cy: 280 },
  "packaging-assembly": { cx: 480, cy: 440 },
  "substrates-pcb": { cx: 660, cy: 120 },
  "optical-transceivers": { cx: 660, cy: 280 },
  "networking": { cx: 660, cy: 440 },
  "server-oem": { cx: 840, cy: 120 },
  "dc-power-cooling": { cx: 840, cy: 280 },
  "dc-construction": { cx: 840, cy: 440 },
  "hyperscalers": { cx: 1020, cy: 120 },
  "dc-reits": { cx: 1020, cy: 280 },
  "power-grid": { cx: 1020, cy: 440 },
  "base-materials": { cx: 1020, cy: 560 },
};

function getNodePositions(): NodePosition[] {
  const positions: NodePosition[] = [];
  const byCategory = new Map<CompanyCategory, Company[]>();
  const assigned = new Set<string>();

  // Assign each company to its primary category for graph positioning
  companies.forEach((c) => {
    if (assigned.has(c.id)) return;
    assigned.add(c.id);
    const cat = getPrimaryCategory(c);
    const list = byCategory.get(cat) || [];
    list.push(c);
    byCategory.set(cat, list);
  });

  byCategory.forEach((comps, cat) => {
    const center = categoryPositions[cat];
    if (!center) return;
    const angleStep = (2 * Math.PI) / Math.max(comps.length, 1);
    const radius = 40 + comps.length * 6;
    comps.forEach((company, i) => {
      const angle = angleStep * i - Math.PI / 2;
      positions.push({
        x: center.cx + Math.cos(angle) * radius,
        y: center.cy + Math.sin(angle) * radius,
        company,
      });
    });
  });

  return positions;
}

export default function SupplyChainGraph() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const positions = useRef(getNodePositions()).current;

  const posMap = new Map(positions.map((p) => [p.company.id, p]));

  const edges: { from: NodePosition; to: NodePosition; highlighted: boolean }[] = [];
  companies.forEach((company) => {
    const fromPos = posMap.get(company.id);
    if (!fromPos) return;
    company.customers.forEach((custId) => {
      const toPos = posMap.get(custId);
      if (!toPos) return;
      const highlighted = hoveredId === company.id || hoveredId === custId || selectedId === company.id || selectedId === custId;
      edges.push({ from: fromPos, to: toPos, highlighted });
    });
  });

  const selected = selectedId ? companies.find((c) => c.id === selectedId) : null;

  function getNodeSize(company: Company): number {
    return 10 + company.dependencyCount * 2;
  }

  function getRiskColor(score: number): string {
    if (score < 30) return "hsl(142, 71%, 45%)";
    if (score < 60) return "hsl(38, 92%, 50%)";
    return "hsl(0, 72%, 51%)";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Supply Chain Graph</h1>
        <p className="text-sm text-muted-foreground">Interactive view of AI infrastructure supplier/customer relationships</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[key as CompanyCategory] }} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
        <div className="ml-4 flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="text-muted-foreground">Low risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-warning" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span className="text-muted-foreground">High risk</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <svg viewBox="0 0 1200 650" className="w-full h-[600px]">
                {/* Category labels */}
                {Object.entries(categoryPositions).map(([cat, pos]) => (
                  <text
                    key={cat}
                    x={pos.cx}
                    y={pos.cy - 55}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px] font-medium"
                  >
                    {categoryLabels[cat as CompanyCategory]}
                  </text>
                ))}

                {/* Arrow marker definitions */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(225, 15%, 25%)" />
                  </marker>
                  <marker id="arrow-highlighted" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(217, 91%, 60%)" />
                  </marker>
                </defs>

                {/* Edges */}
                {edges.map((edge, i) => {
                  const dx = edge.to.x - edge.from.x;
                  const dy = edge.to.y - edge.from.y;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  if (len === 0) return null;
                  const nodeRadius = 10;
                  const x2 = edge.to.x - (dx / len) * nodeRadius;
                  const y2 = edge.to.y - (dy / len) * nodeRadius;
                  return (
                    <line
                      key={i}
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={x2}
                      y2={y2}
                      stroke={edge.highlighted ? "hsl(217, 91%, 60%)" : "hsl(225, 15%, 25%)"}
                      strokeWidth={edge.highlighted ? 2 : 0.5}
                      strokeOpacity={edge.highlighted ? 0.9 : 0.3}
                      markerEnd={edge.highlighted ? "url(#arrow-highlighted)" : "url(#arrow)"}
                    />
                  );
                })}

                {/* Nodes */}
                {positions.map((node) => {
                  const size = getNodeSize(node.company);
                  const isHovered = hoveredId === node.company.id;
                  const isSelected = selectedId === node.company.id;
                  const isConnected = hoveredId ? (
                    node.company.suppliers.includes(hoveredId) || 
                    node.company.customers.includes(hoveredId) ||
                    companies.find(c => c.id === hoveredId)?.suppliers.includes(node.company.id) ||
                    companies.find(c => c.id === hoveredId)?.customers.includes(node.company.id)
                  ) : false;
                  const dimmed = hoveredId !== null && !isHovered && !isConnected;
                  const primaryCat = getPrimaryCategory(node.company);

                  return (
                    <g
                      key={node.company.id}
                      onMouseEnter={() => setHoveredId(node.company.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedId(selectedId === node.company.id ? null : node.company.id)}
                      className="cursor-pointer"
                      opacity={dimmed ? 0.15 : 1}
                    >
                      {node.company.riskScore >= 50 && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={size + 4}
                          fill="none"
                          stroke={getRiskColor(node.company.riskScore)}
                          strokeWidth={1.5}
                          strokeOpacity={0.4}
                          className="animate-pulse-glow"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isHovered || isSelected ? size + 2 : size}
                        fill={getRiskColor(node.company.riskScore)}
                        fillOpacity={0.15}
                        stroke={categoryColors[primaryCat]}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={3}
                        fill={getRiskColor(node.company.riskScore)}
                      />
                      <text
                        x={node.x}
                        y={node.y + size + 10}
                        textAnchor="middle"
                        className="fill-foreground text-[7px] font-mono font-medium"
                      >
                        {node.company.ticker}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Side panel */}
        <div className="col-span-1">
          {selected ? (
            <Card className="border-border/50 sticky top-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{selected.name}</CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{selected.ticker}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono">${selected.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Change</span>
                  <span className={`font-mono ${selected.priceChange >= 0 ? "text-success" : "text-destructive"}`}>
                    {selected.priceChange >= 0 ? "+" : ""}{selected.priceChange}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className="font-mono" style={{ color: getRiskColor(selected.riskScore) }}>{selected.riskScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dependents</span>
                  <span className="font-mono">{selected.dependencyCount}</span>
                </div>
                <hr className="border-border/50" />
                <p className="text-xs text-muted-foreground">{selected.description}</p>
                <Link to={`/company/${selected.id}`} className="text-xs text-primary hover:underline block">
                  View full details →
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Click a node to see details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
