export type CompanyCategory = "chip-makers" | "equipment-materials" | "cloud-datacenters" | "networking-cooling";

export interface Company {
  id: string;
  name: string;
  ticker: string;
  category: CompanyCategory;
  description: string;
  marketCap: number; // billions
  currentPrice: number;
  priceChange: number; // percentage
  priceHistory: number[]; // last 30 days
  revenue: number; // billions, TTM
  earnings: number; // billions, TTM
  grossMargin: number; // percentage
  peRatio: number;
  suppliers: string[]; // company ids
  customers: string[]; // company ids
  riskScore: number; // 0-100
  dependencyCount: number; // how many companies depend on this one
}

export const categoryLabels: Record<CompanyCategory, string> = {
  "chip-makers": "Chip Makers",
  "equipment-materials": "Equipment & Materials",
  "cloud-datacenters": "Cloud / Data Centers",
  "networking-cooling": "Networking & Cooling",
};

export const categoryColors: Record<CompanyCategory, string> = {
  "chip-makers": "hsl(217, 91%, 60%)",
  "equipment-materials": "hsl(280, 70%, 60%)",
  "cloud-datacenters": "hsl(142, 71%, 45%)",
  "networking-cooling": "hsl(38, 92%, 50%)",
};

function generatePriceHistory(basePrice: number, volatility: number): number[] {
  const history: number[] = [];
  let price = basePrice * (1 - volatility * 0.15);
  for (let i = 0; i < 30; i++) {
    price += (Math.random() - 0.48) * basePrice * volatility * 0.03;
    price = Math.max(price, basePrice * 0.7);
    history.push(Math.round(price * 100) / 100);
  }
  return history;
}

export const companies: Company[] = [
  // Chip Makers
  {
    id: "nvda", name: "NVIDIA", ticker: "NVDA", category: "chip-makers",
    description: "Leading GPU and AI accelerator designer",
    marketCap: 3200, currentPrice: 131.28, priceChange: 2.4,
    priceHistory: generatePriceHistory(131.28, 0.8),
    revenue: 130.5, earnings: 72.9, grossMargin: 75.0, peRatio: 43.9,
    suppliers: ["tsmc", "asml", "amat", "lrcx"],
    customers: ["amzn", "googl", "msft", "orcl", "smci"],
    riskScore: 15, dependencyCount: 5,
  },
  {
    id: "amd", name: "AMD", ticker: "AMD", category: "chip-makers",
    description: "CPU and GPU designer for data center and consumer markets",
    marketCap: 195, currentPrice: 120.50, priceChange: -1.2,
    priceHistory: generatePriceHistory(120.50, 0.7),
    revenue: 25.8, earnings: 5.4, grossMargin: 52.0, peRatio: 36.1,
    suppliers: ["tsmc", "asml", "amat"],
    customers: ["amzn", "googl", "msft"],
    riskScore: 25, dependencyCount: 3,
  },
  {
    id: "intc", name: "Intel", ticker: "INTC", category: "chip-makers",
    description: "Integrated chip designer and manufacturer",
    marketCap: 95, currentPrice: 22.15, priceChange: -3.8,
    priceHistory: generatePriceHistory(22.15, 1.2),
    revenue: 54.2, earnings: -1.6, grossMargin: 41.5, peRatio: -59.4,
    suppliers: ["asml", "amat", "lrcx"],
    customers: ["msft", "amzn", "googl"],
    riskScore: 65, dependencyCount: 3,
  },
  {
    id: "avgo", name: "Broadcom", ticker: "AVGO", category: "chip-makers",
    description: "Diversified semiconductor and infrastructure software",
    marketCap: 820, currentPrice: 178.90, priceChange: 1.1,
    priceHistory: generatePriceHistory(178.90, 0.5),
    revenue: 51.6, earnings: 16.2, grossMargin: 68.0, peRatio: 50.6,
    suppliers: ["tsmc", "asml"],
    customers: ["amzn", "googl", "msft", "orcl"],
    riskScore: 20, dependencyCount: 4,
  },
  {
    id: "qcom", name: "Qualcomm", ticker: "QCOM", category: "chip-makers",
    description: "Mobile and edge AI chip designer",
    marketCap: 185, currentPrice: 165.70, priceChange: 0.5,
    priceHistory: generatePriceHistory(165.70, 0.6),
    revenue: 42.1, earnings: 11.8, grossMargin: 56.0, peRatio: 15.7,
    suppliers: ["tsmc", "asml"],
    customers: [],
    riskScore: 30, dependencyCount: 0,
  },
  // Equipment & Materials
  {
    id: "asml", name: "ASML", ticker: "ASML", category: "equipment-materials",
    description: "Monopoly provider of EUV lithography machines",
    marketCap: 340, currentPrice: 850.00, priceChange: -0.9,
    priceHistory: generatePriceHistory(850.00, 0.6),
    revenue: 30.1, earnings: 9.3, grossMargin: 51.0, peRatio: 36.6,
    suppliers: [],
    customers: ["tsmc", "intc", "nvda", "amd", "avgo", "qcom"],
    riskScore: 10, dependencyCount: 6,
  },
  {
    id: "tsmc", name: "TSMC", ticker: "TSM", category: "equipment-materials",
    description: "World's largest semiconductor foundry",
    marketCap: 950, currentPrice: 183.50, priceChange: 1.8,
    priceHistory: generatePriceHistory(183.50, 0.5),
    revenue: 87.1, earnings: 35.7, grossMargin: 57.0, peRatio: 26.6,
    suppliers: ["asml", "amat", "lrcx"],
    customers: ["nvda", "amd", "avgo", "qcom"],
    riskScore: 8, dependencyCount: 4,
  },
  {
    id: "amat", name: "Applied Materials", ticker: "AMAT", category: "equipment-materials",
    description: "Leading semiconductor equipment manufacturer",
    marketCap: 155, currentPrice: 187.20, priceChange: 0.3,
    priceHistory: generatePriceHistory(187.20, 0.5),
    revenue: 27.2, earnings: 7.4, grossMargin: 47.5, peRatio: 20.9,
    suppliers: [],
    customers: ["tsmc", "intc", "nvda", "amd"],
    riskScore: 15, dependencyCount: 4,
  },
  {
    id: "lrcx", name: "Lam Research", ticker: "LRCX", category: "equipment-materials",
    description: "Etch and deposition equipment for chip fabrication",
    marketCap: 110, currentPrice: 82.50, priceChange: -0.6,
    priceHistory: generatePriceHistory(82.50, 0.6),
    revenue: 16.8, earnings: 4.6, grossMargin: 47.0, peRatio: 23.9,
    suppliers: [],
    customers: ["tsmc", "intc", "nvda"],
    riskScore: 18, dependencyCount: 3,
  },
  // Cloud / Data Centers
  {
    id: "amzn", name: "Amazon (AWS)", ticker: "AMZN", category: "cloud-datacenters",
    description: "Largest cloud infrastructure provider via AWS",
    marketCap: 2100, currentPrice: 201.30, priceChange: 0.8,
    priceHistory: generatePriceHistory(201.30, 0.4),
    revenue: 620.0, earnings: 44.4, grossMargin: 48.0, peRatio: 47.3,
    suppliers: ["nvda", "amd", "intc", "avgo", "anet", "vrt", "crst", "smci"],
    customers: [],
    riskScore: 12, dependencyCount: 0,
  },
  {
    id: "googl", name: "Alphabet (Google)", ticker: "GOOGL", category: "cloud-datacenters",
    description: "Google Cloud and custom TPU AI infrastructure",
    marketCap: 2200, currentPrice: 178.50, priceChange: 1.5,
    priceHistory: generatePriceHistory(178.50, 0.4),
    revenue: 350.0, earnings: 86.2, grossMargin: 57.0, peRatio: 25.5,
    suppliers: ["nvda", "amd", "intc", "avgo", "anet", "vrt"],
    customers: [],
    riskScore: 10, dependencyCount: 0,
  },
  {
    id: "msft", name: "Microsoft", ticker: "MSFT", category: "cloud-datacenters",
    description: "Azure cloud and major AI infrastructure investor",
    marketCap: 3100, currentPrice: 416.80, priceChange: 0.6,
    priceHistory: generatePriceHistory(416.80, 0.3),
    revenue: 254.0, earnings: 88.1, grossMargin: 69.0, peRatio: 35.2,
    suppliers: ["nvda", "amd", "intc", "avgo", "anet", "vrt", "smci"],
    customers: [],
    riskScore: 8, dependencyCount: 0,
  },
  {
    id: "orcl", name: "Oracle", ticker: "ORCL", category: "cloud-datacenters",
    description: "Enterprise cloud and AI infrastructure provider",
    marketCap: 430, currentPrice: 155.90, priceChange: -2.1,
    priceHistory: generatePriceHistory(155.90, 0.7),
    revenue: 56.1, earnings: 13.8, grossMargin: 72.0, peRatio: 31.2,
    suppliers: ["nvda", "avgo", "anet", "vrt"],
    customers: [],
    riskScore: 22, dependencyCount: 0,
  },
  // Networking & Cooling
  {
    id: "anet", name: "Arista Networks", ticker: "ANET", category: "networking-cooling",
    description: "High-performance data center networking",
    marketCap: 115, currentPrice: 375.20, priceChange: 1.9,
    priceHistory: generatePriceHistory(375.20, 0.6),
    revenue: 6.7, earnings: 2.6, grossMargin: 64.0, peRatio: 44.2,
    suppliers: [],
    customers: ["amzn", "googl", "msft", "orcl"],
    riskScore: 20, dependencyCount: 4,
  },
  {
    id: "vrt", name: "Vertiv", ticker: "VRT", category: "networking-cooling",
    description: "Data center power and cooling infrastructure",
    marketCap: 42, currentPrice: 110.30, priceChange: 3.2,
    priceHistory: generatePriceHistory(110.30, 0.9),
    revenue: 7.6, earnings: 1.1, grossMargin: 36.0, peRatio: 38.2,
    suppliers: [],
    customers: ["amzn", "googl", "msft", "orcl"],
    riskScore: 25, dependencyCount: 4,
  },
  {
    id: "crst", name: "Celestica", ticker: "CLS", category: "networking-cooling",
    description: "Electronics manufacturing for data center hardware",
    marketCap: 12, currentPrice: 98.40, priceChange: -1.5,
    priceHistory: generatePriceHistory(98.40, 1.0),
    revenue: 9.2, earnings: 0.6, grossMargin: 12.0, peRatio: 20.0,
    suppliers: [],
    customers: ["amzn"],
    riskScore: 40, dependencyCount: 1,
  },
  {
    id: "smci", name: "Super Micro", ticker: "SMCI", category: "networking-cooling",
    description: "AI-optimized server and storage solutions",
    marketCap: 25, currentPrice: 42.80, priceChange: -5.2,
    priceHistory: generatePriceHistory(42.80, 1.5),
    revenue: 14.9, earnings: 0.8, grossMargin: 14.5, peRatio: 31.3,
    suppliers: ["nvda"],
    customers: ["amzn", "msft"],
    riskScore: 72, dependencyCount: 2,
  },
];

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getCompaniesByCategory(category: CompanyCategory): Company[] {
  return companies.filter((c) => c.category === category);
}

export interface Alert {
  id: string;
  companyId: string;
  type: "earnings-miss" | "price-drop" | "supply-risk";
  message: string;
  severity: "warning" | "critical";
  timestamp: string;
}

export const alerts: Alert[] = [
  { id: "a1", companyId: "smci", type: "price-drop", message: "SMCI down 5.2% — accounting concerns persist", severity: "critical", timestamp: "2h ago" },
  { id: "a2", companyId: "intc", type: "earnings-miss", message: "Intel Q4 earnings miss, foundry losses widen", severity: "critical", timestamp: "5h ago" },
  { id: "a3", companyId: "orcl", type: "price-drop", message: "Oracle drops 2.1% on cloud growth slowdown fears", severity: "warning", timestamp: "8h ago" },
  { id: "a4", companyId: "crst", type: "supply-risk", message: "Celestica: single customer concentration risk (Amazon)", severity: "warning", timestamp: "1d ago" },
  { id: "a5", companyId: "asml", type: "supply-risk", message: "ASML: sole EUV supplier — 6 companies depend on it", severity: "warning", timestamp: "2d ago" },
];

export const sectorPerformance = [
  { name: "Chip Makers", change: 0.9, color: categoryColors["chip-makers"] },
  { name: "Equipment", change: 0.2, color: categoryColors["equipment-materials"] },
  { name: "Cloud/DC", change: 0.5, color: categoryColors["cloud-datacenters"] },
  { name: "Network/Cool", change: -0.3, color: categoryColors["networking-cooling"] },
];
