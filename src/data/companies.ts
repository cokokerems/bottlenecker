import { type CompanyCategory, categoryColors, categoryLabels } from "./categories";

export { type CompanyCategory, categoryColors, categoryLabels } from "./categories";

export interface Company {
  id: string;
  name: string;
  ticker: string;
  categories: CompanyCategory[];
  description: string;
  suppliers: string[];
  customers: string[];
  riskScore: number;
  dependencyCount: number;
  competitivePosition: {
    position: "monopoly" | "duopoly" | "market-leader" | "strong-challenger" | "niche-specialist" | "emerging-contender";
    marketSharePercent: number;
    competitors: string[];
    moat: string;
    trend: "strengthening" | "stable" | "weakening";
  };
  // Legacy fields kept for valuation compatibility — will be overridden by live data
  marketCap: number;
  currentPrice: number;
  priceChange: number;
  revenue: number;
  earnings: number;
  grossMargin: number;
  peRatio: number;
  totalDebt: number;
  preferredStock: number;
  minorityInterest: number;
  cashAndEquivalents: number;
}

export const companies: Company[] = [
  // ─── 1. Chip Designers / AI Accelerators ───
  {
    id: "nvda", name: "NVIDIA", ticker: "NVDA", categories: ["chip-designers"],
    description: "Leading GPU and AI accelerator designer",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["tsmc", "asml", "amat", "lrcx", "mu"],
    customers: ["amzn", "googl", "msft", "orcl", "smci", "dell", "hpe"],
    riskScore: 15, dependencyCount: 7,
    competitivePosition: { position: "market-leader", marketSharePercent: 80, competitors: ["amd", "intc", "avgo"], moat: "Dominant AI accelerator platform with CUDA ecosystem lock-in", trend: "strengthening" },
  },
  {
    id: "amd", name: "AMD", ticker: "AMD", categories: ["chip-designers"],
    description: "CPU and GPU designer for data center and consumer markets",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["tsmc", "asml", "amat"],
    customers: ["amzn", "googl", "msft", "dell", "hpe"],
    riskScore: 25, dependencyCount: 5,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 20, competitors: ["nvda", "intc"], moat: "Rapidly gaining data center GPU share with competitive MI-series accelerators", trend: "strengthening" },
  },
  {
    id: "intc", name: "Intel", ticker: "INTC", categories: ["chip-designers", "foundries"],
    description: "Integrated chip designer and manufacturer",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["asml", "amat", "lrcx"],
    customers: ["msft", "amzn", "googl", "dell", "hpe"],
    riskScore: 65, dependencyCount: 5,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 12, competitors: ["nvda", "amd", "avgo"], moat: "Vertically integrated fab + design, but losing process node leadership", trend: "weakening" },
  },
  {
    id: "avgo", name: "Broadcom", ticker: "AVGO", categories: ["chip-designers", "networking"],
    description: "Diversified semiconductor and infrastructure software",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["tsmc", "asml"],
    customers: ["amzn", "googl", "msft", "orcl"],
    riskScore: 20, dependencyCount: 4,
    competitivePosition: { position: "market-leader", marketSharePercent: 35, competitors: ["nvda", "qcom", "mrvl"], moat: "Dominant custom ASIC provider for hyperscalers plus VMware software moat", trend: "strengthening" },
  },
  {
    id: "mrvl", name: "Marvell Technology", ticker: "MRVL", categories: ["chip-designers", "networking"],
    description: "Data infrastructure semiconductor solutions",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["tsmc", "asml"],
    customers: ["amzn", "googl", "msft"],
    riskScore: 28, dependencyCount: 3,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 10, competitors: ["avgo", "nvda"], moat: "Custom silicon and electro-optics for cloud/5G data infrastructure", trend: "strengthening" },
  },
  {
    id: "qcom", name: "Qualcomm", ticker: "QCOM", categories: ["chip-designers"],
    description: "Mobile and edge AI chip designer",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["tsmc", "asml"],
    customers: [],
    riskScore: 30, dependencyCount: 0,
    competitivePosition: { position: "market-leader", marketSharePercent: 75, competitors: ["avgo"], moat: "Near-monopoly in mobile SoCs with essential 5G patent portfolio", trend: "stable" },
  },

  // ─── 2. Chip IP / Licensing ───
  {
    id: "arm", name: "Arm Holdings", ticker: "ARM", categories: ["chip-ip"],
    description: "Dominant CPU architecture licensor for mobile and data center",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["nvda", "amd", "qcom", "avgo", "mrvl"],
    riskScore: 10, dependencyCount: 5,
    competitivePosition: { position: "monopoly", marketSharePercent: 99, competitors: [], moat: "Near-total dominance in mobile CPU architecture, expanding rapidly into data center", trend: "strengthening" },
  },
  {
    id: "rmbs", name: "Rambus", ticker: "RMBS", categories: ["chip-ip"],
    description: "High-performance memory interface and security IP",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["mu"],
    riskScore: 20, dependencyCount: 1,
    competitivePosition: { position: "niche-specialist", marketSharePercent: 60, competitors: [], moat: "Critical memory interface IP and patents for HBM/DDR standards", trend: "strengthening" },
  },

  // ─── 3. EDA Software ───
  {
    id: "cdns", name: "Cadence Design Systems", ticker: "CDNS", categories: ["eda"],
    description: "Electronic design automation tools for chip development",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["nvda", "amd", "avgo", "qcom", "mrvl", "tsmc"],
    riskScore: 8, dependencyCount: 6,
    competitivePosition: { position: "duopoly", marketSharePercent: 32, competitors: ["snps"], moat: "Duopoly EDA provider with deep verification and custom IC design tools", trend: "stable" },
  },
  {
    id: "snps", name: "Synopsys", ticker: "SNPS", categories: ["eda"],
    description: "Largest EDA tools and semiconductor IP provider",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["nvda", "amd", "avgo", "qcom", "mrvl", "tsmc", "intc"],
    riskScore: 8, dependencyCount: 7,
    competitivePosition: { position: "duopoly", marketSharePercent: 35, competitors: ["cdns"], moat: "Largest EDA vendor with dominant synthesis/place-and-route and IP licensing", trend: "stable" },
  },

  // ─── 4. Foundries ───
  {
    id: "tsmc", name: "TSMC", ticker: "TSM", categories: ["foundries"],
    description: "World's largest semiconductor foundry",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["asml", "amat", "lrcx", "klac", "entg"],
    customers: ["nvda", "amd", "avgo", "qcom", "mrvl", "arm"],
    riskScore: 8, dependencyCount: 6,
    competitivePosition: { position: "monopoly", marketSharePercent: 90, competitors: ["intc", "gfs"], moat: "Dominant advanced-node foundry — sole manufacturer of leading-edge chips", trend: "strengthening" },
  },
  {
    id: "gfs", name: "GlobalFoundries", ticker: "GFS", categories: ["foundries"],
    description: "Specialty and mature-node semiconductor foundry",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["asml", "amat", "lrcx"],
    customers: ["amd", "qcom"],
    riskScore: 35, dependencyCount: 2,
    competitivePosition: { position: "niche-specialist", marketSharePercent: 5, competitors: ["tsmc"], moat: "Focused on specialty nodes for automotive, IoT, and RF applications", trend: "stable" },
  },

  // ─── 5. Memory ───
  {
    id: "mu", name: "Micron Technology", ticker: "MU", categories: ["memory"],
    description: "DRAM and NAND flash memory manufacturer",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["asml", "amat", "lrcx"],
    customers: ["nvda", "amd", "dell", "hpe"],
    riskScore: 25, dependencyCount: 4,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 22, competitors: [], moat: "US-based memory manufacturer with growing HBM capacity and CHIPS Act support", trend: "strengthening" },
  },

  // ─── 6. Semiconductor Equipment ───
  {
    id: "asml", name: "ASML", ticker: "ASML", categories: ["semi-equipment"],
    description: "Monopoly provider of EUV lithography machines",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["tsmc", "intc", "mu"],
    riskScore: 10, dependencyCount: 3,
    competitivePosition: { position: "monopoly", marketSharePercent: 100, competitors: [], moat: "Sole EUV lithography provider globally — no viable alternative exists", trend: "stable" },
  },
  {
    id: "amat", name: "Applied Materials", ticker: "AMAT", categories: ["semi-equipment"],
    description: "Leading semiconductor equipment manufacturer",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["tsmc", "intc", "mu"],
    riskScore: 15, dependencyCount: 3,
    competitivePosition: { position: "duopoly", marketSharePercent: 45, competitors: ["lrcx", "klac"], moat: "Broadest semiconductor equipment portfolio across deposition, etch, and inspection", trend: "stable" },
  },
  {
    id: "lrcx", name: "Lam Research", ticker: "LRCX", categories: ["semi-equipment"],
    description: "Etch and deposition equipment for chip fabrication",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["tsmc", "intc"],
    riskScore: 18, dependencyCount: 2,
    competitivePosition: { position: "duopoly", marketSharePercent: 40, competitors: ["amat"], moat: "Leading etch equipment provider critical to advanced chip manufacturing", trend: "stable" },
  },
  {
    id: "klac", name: "KLA Corporation", ticker: "KLAC", categories: ["semi-equipment"],
    description: "Process control and yield management equipment",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["tsmc", "intc"],
    riskScore: 12, dependencyCount: 2,
    competitivePosition: { position: "market-leader", marketSharePercent: 55, competitors: ["amat"], moat: "Dominant process control/inspection with no close competitor in advanced defect detection", trend: "stable" },
  },

  // ─── 7. Advanced Packaging & Assembly (OSAT) ───
  {
    id: "aset", name: "ASE Technology", ticker: "ASX", categories: ["packaging-assembly"],
    description: "Largest outsourced semiconductor assembly and test company",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["amat"],
    customers: ["nvda", "amd", "qcom"],
    riskScore: 22, dependencyCount: 3,
    competitivePosition: { position: "market-leader", marketSharePercent: 30, competitors: ["amkr"], moat: "Largest OSAT with advanced 2.5D/3D packaging capability for AI chips", trend: "strengthening" },
  },
  {
    id: "amkr", name: "Amkor Technology", ticker: "AMKR", categories: ["packaging-assembly"],
    description: "Advanced semiconductor packaging and test services",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["amat"],
    customers: ["qcom", "nvda"],
    riskScore: 30, dependencyCount: 2,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 15, competitors: ["aset"], moat: "Strong US-based OSAT with growing advanced packaging for Apple and AI chips", trend: "stable" },
  },

  // ─── 8. ABF Substrates / PCB ───
  {
    id: "ttmi", name: "TTM Technologies", ticker: "TTMI", categories: ["substrates-pcb"],
    description: "US-based PCB and RF component manufacturer",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["intc"],
    riskScore: 32, dependencyCount: 1,
    competitivePosition: { position: "niche-specialist", marketSharePercent: 5, competitors: [], moat: "US-based PCB maker with defense/aerospace clearances", trend: "stable" },
  },

  // ─── 9. Semiconductor Materials & Gases ───
  {
    id: "entg", name: "Entegris", ticker: "ENTG", categories: ["semi-materials"],
    description: "Specialty chemicals and materials for semiconductor fabs",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["tsmc", "intc", "mu"],
    riskScore: 15, dependencyCount: 3,
    competitivePosition: { position: "market-leader", marketSharePercent: 30, competitors: ["lin"], moat: "Critical contamination control and advanced materials for leading-edge fabs", trend: "strengthening" },
  },
  {
    id: "lin", name: "Linde plc", ticker: "LIN", categories: ["semi-materials"],
    description: "World's largest industrial gas company",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["tsmc", "intc", "mu"],
    riskScore: 8, dependencyCount: 3,
    competitivePosition: { position: "market-leader", marketSharePercent: 30, competitors: ["entg"], moat: "Largest industrial gas company with critical ultra-pure gas supply for chip fabs", trend: "stable" },
  },

  // ─── 10. Optical / Transceivers ───
  {
    id: "cohr", name: "Coherent Corp.", ticker: "COHR", categories: ["optical-transceivers"],
    description: "Optical and photonic components for data center interconnects",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "googl", "msft", "anet"],
    riskScore: 30, dependencyCount: 4,
    competitivePosition: { position: "market-leader", marketSharePercent: 25, competitors: ["lite", "fn", "cien"], moat: "Leading 800G/1.6T optical transceiver provider riding AI data center buildout", trend: "strengthening" },
  },
  {
    id: "lite", name: "Lumentum Holdings", ticker: "LITE", categories: ["optical-transceivers"],
    description: "Photonic products for optical networking and 3D sensing",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["anet", "csco"],
    riskScore: 42, dependencyCount: 2,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 15, competitors: ["cohr", "fn"], moat: "Strong optical amplifier and transceiver tech transitioning to AI networking", trend: "stable" },
  },
  {
    id: "aaoi", name: "Applied Optoelectronics", ticker: "AAOI", categories: ["optical-transceivers"],
    description: "Fiber-optic transceivers for data centers and CATV",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "msft"],
    riskScore: 55, dependencyCount: 2,
    competitivePosition: { position: "niche-specialist", marketSharePercent: 3, competitors: ["cohr", "lite", "fn"], moat: "Vertically integrated optical transceiver maker with hyperscaler relationships", trend: "stable" },
  },
  {
    id: "fn", name: "Fabrinet", ticker: "FN", categories: ["optical-transceivers"],
    description: "Precision optical and electronic manufacturing services",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["nvda", "cohr", "lite"],
    riskScore: 22, dependencyCount: 3,
    competitivePosition: { position: "market-leader", marketSharePercent: 35, competitors: ["lite"], moat: "Dominant contract manufacturer for optical transceivers with unmatched precision", trend: "strengthening" },
  },
  {
    id: "cien", name: "Ciena", ticker: "CIEN", categories: ["optical-transceivers", "networking"],
    description: "Optical networking systems and software",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "msft", "googl"],
    riskScore: 25, dependencyCount: 3,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 18, competitors: ["cohr", "anet"], moat: "WaveLogic coherent optics leadership for long-haul and DCI networking", trend: "strengthening" },
  },

  // ─── 11. Networking (Switching / Routing) ───
  {
    id: "anet", name: "Arista Networks", ticker: "ANET", categories: ["networking"],
    description: "High-performance data center networking",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["avgo", "mrvl"],
    customers: ["amzn", "googl", "msft", "orcl"],
    riskScore: 20, dependencyCount: 4,
    competitivePosition: { position: "market-leader", marketSharePercent: 60, competitors: ["csco"], moat: "Dominant high-speed data center switch provider with software-defined networking edge", trend: "strengthening" },
  },
  {
    id: "csco", name: "Cisco Systems", ticker: "CSCO", categories: ["networking"],
    description: "Enterprise networking and security infrastructure",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["avgo", "mrvl"],
    customers: ["amzn", "msft", "googl"],
    riskScore: 18, dependencyCount: 3,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 30, competitors: ["anet"], moat: "Largest overall networking vendor pivoting to AI-era infrastructure and security", trend: "stable" },
  },

  // ─── 12. Server OEM / Rack Integration / ODM ───
  {
    id: "smci", name: "Super Micro Computer", ticker: "SMCI", categories: ["server-oem"],
    description: "AI-optimized server and storage solutions",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["nvda", "amd"],
    customers: ["amzn", "msft"],
    riskScore: 72, dependencyCount: 2,
    competitivePosition: { position: "niche-specialist", marketSharePercent: 8, competitors: ["dell", "hpe", "crst"], moat: "AI-optimized liquid-cooled server racks with rapid deployment capability", trend: "weakening" },
  },
  {
    id: "dell", name: "Dell Technologies", ticker: "DELL", categories: ["server-oem"],
    description: "Enterprise servers, storage, and PC manufacturer",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["nvda", "amd", "intc", "mu"],
    customers: ["amzn", "msft", "googl"],
    riskScore: 22, dependencyCount: 3,
    competitivePosition: { position: "market-leader", marketSharePercent: 18, competitors: ["hpe", "smci", "crst"], moat: "Largest x86 server vendor with massive enterprise sales channel for AI servers", trend: "strengthening" },
  },
  {
    id: "hpe", name: "Hewlett Packard Enterprise", ticker: "HPE", categories: ["server-oem"],
    description: "Enterprise servers, networking, and edge computing",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["nvda", "amd", "intc", "mu"],
    customers: [],
    riskScore: 28, dependencyCount: 0,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 12, competitors: ["dell", "smci"], moat: "Strong enterprise/HPC server brand with Cray supercomputer integration", trend: "stable" },
  },
  {
    id: "crst", name: "Celestica", ticker: "CLS", categories: ["server-oem"],
    description: "Electronics manufacturing for data center hardware",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["nvda"],
    customers: ["amzn"],
    riskScore: 40, dependencyCount: 1,
    competitivePosition: { position: "niche-specialist", marketSharePercent: 5, competitors: ["smci", "dell"], moat: "Specialized EMS provider with strong data center hardware assembly capabilities", trend: "stable" },
  },

  // ─── 13. Data Center Power & Cooling ───
  {
    id: "vrt", name: "Vertiv", ticker: "VRT", categories: ["dc-power-cooling"],
    description: "Data center power and cooling infrastructure",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "googl", "msft", "orcl", "eqix", "dlr"],
    riskScore: 25, dependencyCount: 6,
    competitivePosition: { position: "market-leader", marketSharePercent: 22, competitors: ["etn", "abb"], moat: "Leading data center thermal management and power solutions provider", trend: "strengthening" },
  },
  {
    id: "etn", name: "Eaton", ticker: "ETN", categories: ["dc-power-cooling"],
    description: "Power management solutions for data centers",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "msft", "googl", "eqix"],
    riskScore: 12, dependencyCount: 4,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 18, competitors: ["vrt", "abb"], moat: "Broad power management portfolio with UPS and switchgear for data centers", trend: "strengthening" },
  },
  {
    id: "abb", name: "ABB", ticker: "ABB", categories: ["dc-power-cooling"],
    description: "Electrification and automation technology",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "msft", "eqix"],
    riskScore: 12, dependencyCount: 3,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 15, competitors: ["vrt", "etn"], moat: "Strong medium-voltage and power quality solutions for large-scale data centers", trend: "stable" },
  },
  {
    id: "jci", name: "Johnson Controls", ticker: "JCI", categories: ["dc-power-cooling"],
    description: "Building automation, HVAC, and fire/security systems",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "eqix", "dlr"],
    riskScore: 18, dependencyCount: 3,
    competitivePosition: { position: "niche-specialist", marketSharePercent: 8, competitors: ["vrt"], moat: "HVAC and building management systems for enterprise data center campuses", trend: "stable" },
  },

  // ─── 14. Data Center Construction / Engineering ───
  {
    id: "flr", name: "Fluor Corporation", ticker: "FLR", categories: ["dc-construction"],
    description: "Engineering and construction services for large-scale projects",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "msft", "googl"],
    riskScore: 30, dependencyCount: 3,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 12, competitors: ["j", "acm"], moat: "Large-scale EPC capability for hyperscaler data center campus builds", trend: "strengthening" },
  },
  {
    id: "j", name: "Jacobs Solutions", ticker: "J", categories: ["dc-construction"],
    description: "Infrastructure engineering and consulting firm",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "googl"],
    riskScore: 20, dependencyCount: 2,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 10, competitors: ["flr", "acm"], moat: "Technical consulting and PM services for mission-critical data center infrastructure", trend: "stable" },
  },
  {
    id: "acm", name: "AECOM", ticker: "ACM", categories: ["dc-construction"],
    description: "Infrastructure advisory and construction management",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["msft", "googl"],
    riskScore: 22, dependencyCount: 2,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 8, competitors: ["flr", "j"], moat: "Global infrastructure design and management for large-scale DC campuses", trend: "stable" },
  },

  // ─── 15. Hyperscalers / AI Cloud Platforms ───
  {
    id: "amzn", name: "Amazon (AWS)", ticker: "AMZN", categories: ["hyperscalers"],
    description: "Largest cloud infrastructure provider via AWS",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["nvda", "amd", "intc", "avgo", "anet", "vrt", "crst", "smci", "dell", "cohr", "cien", "etn"],
    customers: [],
    riskScore: 12, dependencyCount: 0,
    competitivePosition: { position: "market-leader", marketSharePercent: 31, competitors: ["msft", "googl", "orcl"], moat: "Largest cloud provider with deepest enterprise adoption and global infrastructure", trend: "stable" },
  },
  {
    id: "googl", name: "Alphabet (Google)", ticker: "GOOGL", categories: ["hyperscalers"],
    description: "Google Cloud and custom TPU AI infrastructure",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["nvda", "amd", "intc", "avgo", "anet", "vrt", "dell", "cohr", "cien"],
    customers: [],
    riskScore: 10, dependencyCount: 0,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 12, competitors: ["amzn", "msft", "orcl"], moat: "Custom TPU silicon and AI-native cloud with deep integration into Google ecosystem", trend: "strengthening" },
  },
  {
    id: "msft", name: "Microsoft", ticker: "MSFT", categories: ["hyperscalers"],
    description: "Azure cloud and major AI infrastructure investor",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["nvda", "amd", "intc", "avgo", "anet", "vrt", "smci", "dell", "cohr", "cien", "etn"],
    customers: [],
    riskScore: 8, dependencyCount: 0,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 25, competitors: ["amzn", "googl", "orcl"], moat: "Azure + OpenAI partnership creating strongest enterprise AI cloud position", trend: "strengthening" },
  },
  {
    id: "orcl", name: "Oracle", ticker: "ORCL", categories: ["hyperscalers"],
    description: "Enterprise cloud and AI infrastructure provider",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["nvda", "avgo", "anet", "vrt", "dell"],
    customers: [],
    riskScore: 22, dependencyCount: 0,
    competitivePosition: { position: "emerging-contender", marketSharePercent: 5, competitors: ["amzn", "googl", "msft"], moat: "Aggressive AI infrastructure buildout with multi-cloud database installed base", trend: "strengthening" },
  },

  // ─── 16. Data Center REITs / Colocation ───
  {
    id: "eqix", name: "Equinix", ticker: "EQIX", categories: ["dc-reits"],
    description: "Largest global data center REIT and colocation provider",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["vrt", "etn", "abb", "jci"],
    customers: ["amzn", "msft", "googl"],
    riskScore: 12, dependencyCount: 3,
    competitivePosition: { position: "market-leader", marketSharePercent: 25, competitors: ["dlr", "irm"], moat: "Largest global interconnection platform with 260+ data centers across 72 metros", trend: "stable" },
  },
  {
    id: "dlr", name: "Digital Realty", ticker: "DLR", categories: ["dc-reits"],
    description: "Global data center REIT for hyperscale and enterprise",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["vrt", "jci"],
    customers: ["amzn", "msft", "googl", "orcl"],
    riskScore: 15, dependencyCount: 4,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 15, competitors: ["eqix", "irm"], moat: "Large hyperscale-focused DC REIT with global campus portfolio", trend: "stable" },
  },
  {
    id: "irm", name: "Iron Mountain", ticker: "IRM", categories: ["dc-reits"],
    description: "Data center REIT expanding from records management",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: ["vrt"],
    customers: ["msft"],
    riskScore: 25, dependencyCount: 1,
    competitivePosition: { position: "emerging-contender", marketSharePercent: 5, competitors: ["eqix", "dlr"], moat: "Rapidly growing DC business leveraging real estate expertise and land bank", trend: "strengthening" },
  },

  // ─── 17. Power Generation / Grid ───
  {
    id: "nee", name: "NextEra Energy", ticker: "NEE", categories: ["power-grid"],
    description: "Largest renewable energy generator and utility",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "msft", "googl", "eqix"],
    riskScore: 10, dependencyCount: 4,
    competitivePosition: { position: "market-leader", marketSharePercent: 15, competitors: ["ceg", "duk", "so"], moat: "Largest US renewable energy operator with massive solar/wind portfolio for DC PPAs", trend: "strengthening" },
  },
  {
    id: "ceg", name: "Constellation Energy", ticker: "CEG", categories: ["power-grid"],
    description: "Largest US nuclear fleet operator",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["msft", "amzn"],
    riskScore: 18, dependencyCount: 2,
    competitivePosition: { position: "market-leader", marketSharePercent: 20, competitors: ["nee", "duk", "so"], moat: "Largest US nuclear fleet providing 24/7 carbon-free power for data centers", trend: "strengthening" },
  },
  {
    id: "duk", name: "Duke Energy", ticker: "DUK", categories: ["power-grid"],
    description: "Major US regulated electric utility",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["amzn", "googl"],
    riskScore: 12, dependencyCount: 2,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 8, competitors: ["nee", "ceg", "so"], moat: "Large regulated utility in data center growth corridors (Carolinas, Indiana)", trend: "stable" },
  },
  {
    id: "so", name: "Southern Company", ticker: "SO", categories: ["power-grid"],
    description: "Major US utility with nuclear and natural gas fleet",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: ["msft", "googl"],
    riskScore: 12, dependencyCount: 2,
    competitivePosition: { position: "strong-challenger", marketSharePercent: 7, competitors: ["nee", "ceg", "duk"], moat: "Large Southeast utility with Plant Vogtle nuclear expansion and growing DC load", trend: "stable" },
  },

  // ─── 18. Base Materials ───
  {
    id: "fcx", name: "Freeport-McMoRan", ticker: "FCX", categories: ["base-materials"],
    description: "World's largest publicly traded copper producer",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: [],
    riskScore: 22, dependencyCount: 0,
    competitivePosition: { position: "market-leader", marketSharePercent: 8, competitors: ["bhp", "rio"], moat: "Largest copper miner — copper is critical for power delivery in data centers", trend: "stable" },
  },
  {
    id: "bhp", name: "BHP Group", ticker: "BHP", categories: ["base-materials"],
    description: "Diversified global mining company",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: [],
    riskScore: 15, dependencyCount: 0,
    competitivePosition: { position: "market-leader", marketSharePercent: 12, competitors: ["fcx", "rio"], moat: "Diversified mining giant with major copper, iron ore, and potash operations", trend: "stable" },
  },
  {
    id: "rio", name: "Rio Tinto", ticker: "RIO", categories: ["base-materials"],
    description: "Global mining group focused on iron ore, copper, aluminium",
    marketCap: 0, currentPrice: 0, priceChange: 0, revenue: 0, earnings: 0, grossMargin: 0, peRatio: 0,
    totalDebt: 0, preferredStock: 0, minorityInterest: 0, cashAndEquivalents: 0,
    suppliers: [],
    customers: [],
    riskScore: 15, dependencyCount: 0,
    competitivePosition: { position: "market-leader", marketSharePercent: 10, competitors: ["fcx", "bhp"], moat: "Major copper and aluminium producer critical for power grid and DC infrastructure", trend: "stable" },
  },
];

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getCompaniesByCategory(category: CompanyCategory): Company[] {
  return companies.filter((c) => c.categories.includes(category));
}

/** Returns the primary (first) category of a company */
export function getPrimaryCategory(company: Company): CompanyCategory {
  return company.categories[0];
}
