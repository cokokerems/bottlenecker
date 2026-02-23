export type CompanyCategory =
  | "chip-designers"
  | "chip-ip"
  | "eda"
  | "foundries"
  | "memory"
  | "semi-equipment"
  | "packaging-assembly"
  | "substrates-pcb"
  | "semi-materials"
  | "optical-transceivers"
  | "networking"
  | "server-oem"
  | "dc-power-cooling"
  | "dc-construction"
  | "hyperscalers"
  | "dc-reits"
  | "power-grid"
  | "base-materials";

export const categoryLabels: Record<CompanyCategory, string> = {
  "chip-designers": "Chip Designers",
  "chip-ip": "Chip IP / Licensing",
  "eda": "EDA Software",
  "foundries": "Foundries",
  "memory": "Memory",
  "semi-equipment": "Semi Equipment",
  "packaging-assembly": "Packaging & Assembly",
  "substrates-pcb": "Substrates / PCB",
  "semi-materials": "Materials & Gases",
  "optical-transceivers": "Optical / Transceivers",
  "networking": "Networking",
  "server-oem": "Server OEM / ODM",
  "dc-power-cooling": "Power & Cooling",
  "dc-construction": "DC Construction",
  "hyperscalers": "Hyperscalers",
  "dc-reits": "DC REITs",
  "power-grid": "Power / Grid",
  "base-materials": "Base Materials",
};

export const categoryColors: Record<CompanyCategory, string> = {
  "chip-designers": "hsl(217, 91%, 60%)",
  "chip-ip": "hsl(200, 80%, 55%)",
  "eda": "hsl(260, 70%, 60%)",
  "foundries": "hsl(280, 70%, 60%)",
  "memory": "hsl(320, 70%, 55%)",
  "semi-equipment": "hsl(340, 70%, 55%)",
  "packaging-assembly": "hsl(15, 80%, 55%)",
  "substrates-pcb": "hsl(30, 80%, 50%)",
  "semi-materials": "hsl(60, 70%, 45%)",
  "optical-transceivers": "hsl(170, 70%, 45%)",
  "networking": "hsl(142, 71%, 45%)",
  "server-oem": "hsl(190, 70%, 50%)",
  "dc-power-cooling": "hsl(38, 92%, 50%)",
  "dc-construction": "hsl(80, 60%, 45%)",
  "hyperscalers": "hsl(120, 60%, 40%)",
  "dc-reits": "hsl(240, 60%, 55%)",
  "power-grid": "hsl(0, 65%, 50%)",
  "base-materials": "hsl(25, 55%, 45%)",
};

export const sectorPerformance = [
  { name: "Chip Design", change: 0.9, color: categoryColors["chip-designers"] },
  { name: "Chip IP", change: 1.2, color: categoryColors["chip-ip"] },
  { name: "EDA", change: 0.4, color: categoryColors["eda"] },
  { name: "Foundries", change: 1.5, color: categoryColors["foundries"] },
  { name: "Memory", change: -0.8, color: categoryColors["memory"] },
  { name: "Semi Equip", change: 0.2, color: categoryColors["semi-equipment"] },
  { name: "Packaging", change: -0.3, color: categoryColors["packaging-assembly"] },
  { name: "Substrates", change: 0.1, color: categoryColors["substrates-pcb"] },
  { name: "Materials", change: 0.3, color: categoryColors["semi-materials"] },
  { name: "Optical", change: 1.8, color: categoryColors["optical-transceivers"] },
  { name: "Networking", change: 1.1, color: categoryColors["networking"] },
  { name: "Server OEM", change: -1.2, color: categoryColors["server-oem"] },
  { name: "Power/Cool", change: 2.1, color: categoryColors["dc-power-cooling"] },
  { name: "DC Build", change: 0.7, color: categoryColors["dc-construction"] },
  { name: "Hyperscale", change: 0.5, color: categoryColors["hyperscalers"] },
  { name: "DC REITs", change: -0.4, color: categoryColors["dc-reits"] },
  { name: "Power Grid", change: 1.3, color: categoryColors["power-grid"] },
  { name: "Materials", change: -0.6, color: categoryColors["base-materials"] },
];
