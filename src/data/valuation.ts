// M&A Valuation data fields per company
export interface ValuationData {
  ebitda: number; // billions
  ebit: number; // billions
  depreciation: number; // billions
  capex: number; // billions
  changeInWorkingCapital: number; // billions
  taxRate: number; // percentage (0-1)
  sharesOutstanding: number; // billions (fully diluted)
  wacc: number; // percentage (0-1)
  terminalGrowthRate: number; // percentage (0-1)
  costOfEquity: number; // percentage (0-1)
  costOfDebt: number; // percentage (0-1)
  projectedFCF: number[]; // 5-year projected FCF (billions)
  exitMultiple: number; // EV/EBITDA exit multiple
  offerPremium: number; // takeover premium percentage (0-1)
  costSynergies: number; // billions
  revenueSynergies: number; // billions
  synergyDiscountRate: number; // percentage (0-1)
  buyerEPS: number; // dollars
  proFormaEPS: number; // dollars
}

export const valuationData: Record<string, ValuationData> = {
  nvda: {
    ebitda: 81.2, ebit: 76.8, depreciation: 4.4, capex: 3.2, changeInWorkingCapital: 1.8,
    taxRate: 0.12, sharesOutstanding: 24.4, wacc: 0.095, terminalGrowthRate: 0.03,
    costOfEquity: 0.105, costOfDebt: 0.035, projectedFCF: [65.2, 74.8, 82.1, 88.5, 93.7],
    exitMultiple: 30, offerPremium: 0.35, costSynergies: 2.5, revenueSynergies: 4.0,
    synergyDiscountRate: 0.10, buyerEPS: 5.38, proFormaEPS: 5.52,
  },
  amd: {
    ebitda: 7.8, ebit: 6.2, depreciation: 1.6, capex: 0.9, changeInWorkingCapital: 0.4,
    taxRate: 0.13, sharesOutstanding: 1.62, wacc: 0.10, terminalGrowthRate: 0.03,
    costOfEquity: 0.115, costOfDebt: 0.04, projectedFCF: [5.1, 6.3, 7.5, 8.4, 9.2],
    exitMultiple: 22, offerPremium: 0.30, costSynergies: 1.2, revenueSynergies: 2.0,
    synergyDiscountRate: 0.10, buyerEPS: 3.33, proFormaEPS: 3.45,
  },
  intc: {
    ebitda: 8.5, ebit: 1.2, depreciation: 7.3, capex: 11.5, changeInWorkingCapital: -0.8,
    taxRate: 0.15, sharesOutstanding: 4.29, wacc: 0.09, terminalGrowthRate: 0.02,
    costOfEquity: 0.10, costOfDebt: 0.045, projectedFCF: [-2.1, 0.5, 2.8, 4.5, 6.1],
    exitMultiple: 10, offerPremium: 0.40, costSynergies: 3.0, revenueSynergies: 1.5,
    synergyDiscountRate: 0.10, buyerEPS: 0.0, proFormaEPS: -0.12,
  },
  avgo: {
    ebitda: 28.5, ebit: 24.1, depreciation: 4.4, capex: 2.1, changeInWorkingCapital: 0.6,
    taxRate: 0.14, sharesOutstanding: 4.58, wacc: 0.085, terminalGrowthRate: 0.03,
    costOfEquity: 0.095, costOfDebt: 0.04, projectedFCF: [19.8, 22.1, 24.5, 26.8, 28.9],
    exitMultiple: 20, offerPremium: 0.25, costSynergies: 3.5, revenueSynergies: 2.5,
    synergyDiscountRate: 0.09, buyerEPS: 3.54, proFormaEPS: 3.68,
  },
  qcom: {
    ebitda: 16.2, ebit: 13.8, depreciation: 2.4, capex: 1.8, changeInWorkingCapital: 0.3,
    taxRate: 0.14, sharesOutstanding: 1.12, wacc: 0.09, terminalGrowthRate: 0.025,
    costOfEquity: 0.10, costOfDebt: 0.04, projectedFCF: [10.5, 11.8, 12.9, 14.1, 15.0],
    exitMultiple: 14, offerPremium: 0.28, costSynergies: 1.5, revenueSynergies: 2.0,
    synergyDiscountRate: 0.095, buyerEPS: 10.54, proFormaEPS: 10.82,
  },
  asml: {
    ebitda: 12.5, ebit: 10.8, depreciation: 1.7, capex: 1.2, changeInWorkingCapital: 0.5,
    taxRate: 0.15, sharesOutstanding: 0.40, wacc: 0.085, terminalGrowthRate: 0.03,
    costOfEquity: 0.095, costOfDebt: 0.03, projectedFCF: [8.2, 9.5, 10.8, 12.0, 13.1],
    exitMultiple: 25, offerPremium: 0.30, costSynergies: 0.8, revenueSynergies: 1.2,
    synergyDiscountRate: 0.09, buyerEPS: 23.25, proFormaEPS: 23.90,
  },
  tsmc: {
    ebitda: 50.2, ebit: 42.8, depreciation: 7.4, capex: 28.0, changeInWorkingCapital: 1.2,
    taxRate: 0.10, sharesOutstanding: 5.18, wacc: 0.08, terminalGrowthRate: 0.03,
    costOfEquity: 0.09, costOfDebt: 0.025, projectedFCF: [18.5, 22.3, 26.1, 29.8, 33.0],
    exitMultiple: 18, offerPremium: 0.35, costSynergies: 2.0, revenueSynergies: 3.0,
    synergyDiscountRate: 0.085, buyerEPS: 6.89, proFormaEPS: 7.05,
  },
  amat: {
    ebitda: 10.2, ebit: 8.8, depreciation: 1.4, capex: 0.8, changeInWorkingCapital: 0.3,
    taxRate: 0.13, sharesOutstanding: 0.83, wacc: 0.09, terminalGrowthRate: 0.025,
    costOfEquity: 0.10, costOfDebt: 0.035, projectedFCF: [7.2, 7.9, 8.6, 9.2, 9.8],
    exitMultiple: 16, offerPremium: 0.25, costSynergies: 0.6, revenueSynergies: 0.8,
    synergyDiscountRate: 0.09, buyerEPS: 8.92, proFormaEPS: 9.10,
  },
  lrcx: {
    ebitda: 6.8, ebit: 5.9, depreciation: 0.9, capex: 0.6, changeInWorkingCapital: 0.2,
    taxRate: 0.12, sharesOutstanding: 1.33, wacc: 0.09, terminalGrowthRate: 0.025,
    costOfEquity: 0.10, costOfDebt: 0.035, projectedFCF: [4.8, 5.3, 5.8, 6.2, 6.6],
    exitMultiple: 15, offerPremium: 0.22, costSynergies: 0.5, revenueSynergies: 0.6,
    synergyDiscountRate: 0.09, buyerEPS: 3.46, proFormaEPS: 3.55,
  },
  amzn: {
    ebitda: 110.0, ebit: 68.5, depreciation: 41.5, capex: 55.0, changeInWorkingCapital: 3.2,
    taxRate: 0.15, sharesOutstanding: 10.43, wacc: 0.09, terminalGrowthRate: 0.03,
    costOfEquity: 0.10, costOfDebt: 0.035, projectedFCF: [22.5, 28.8, 35.2, 41.0, 46.5],
    exitMultiple: 18, offerPremium: 0.20, costSynergies: 5.0, revenueSynergies: 8.0,
    synergyDiscountRate: 0.09, buyerEPS: 4.26, proFormaEPS: 4.38,
  },
  googl: {
    ebitda: 112.0, ebit: 95.2, depreciation: 16.8, capex: 32.0, changeInWorkingCapital: 2.5,
    taxRate: 0.14, sharesOutstanding: 12.33, wacc: 0.085, terminalGrowthRate: 0.03,
    costOfEquity: 0.095, costOfDebt: 0.03, projectedFCF: [58.0, 64.5, 71.2, 77.8, 84.0],
    exitMultiple: 16, offerPremium: 0.22, costSynergies: 3.5, revenueSynergies: 6.0,
    synergyDiscountRate: 0.085, buyerEPS: 6.99, proFormaEPS: 7.15,
  },
  msft: {
    ebitda: 125.0, ebit: 110.5, depreciation: 14.5, capex: 28.0, changeInWorkingCapital: 2.0,
    taxRate: 0.16, sharesOutstanding: 7.43, wacc: 0.08, terminalGrowthRate: 0.03,
    costOfEquity: 0.09, costOfDebt: 0.03, projectedFCF: [72.0, 80.5, 88.2, 95.0, 101.5],
    exitMultiple: 22, offerPremium: 0.18, costSynergies: 4.0, revenueSynergies: 7.0,
    synergyDiscountRate: 0.085, buyerEPS: 11.85, proFormaEPS: 12.10,
  },
  orcl: {
    ebitda: 22.5, ebit: 18.2, depreciation: 4.3, capex: 5.5, changeInWorkingCapital: 0.8,
    taxRate: 0.18, sharesOutstanding: 2.76, wacc: 0.085, terminalGrowthRate: 0.025,
    costOfEquity: 0.095, costOfDebt: 0.045, projectedFCF: [11.2, 12.8, 14.1, 15.3, 16.4],
    exitMultiple: 14, offerPremium: 0.25, costSynergies: 2.0, revenueSynergies: 1.5,
    synergyDiscountRate: 0.09, buyerEPS: 5.00, proFormaEPS: 5.12,
  },
  anet: {
    ebitda: 3.4, ebit: 3.0, depreciation: 0.4, capex: 0.2, changeInWorkingCapital: 0.1,
    taxRate: 0.14, sharesOutstanding: 0.31, wacc: 0.10, terminalGrowthRate: 0.03,
    costOfEquity: 0.11, costOfDebt: 0.0, projectedFCF: [2.4, 2.8, 3.2, 3.6, 4.0],
    exitMultiple: 28, offerPremium: 0.30, costSynergies: 0.3, revenueSynergies: 0.5,
    synergyDiscountRate: 0.10, buyerEPS: 8.39, proFormaEPS: 8.62,
  },
  vrt: {
    ebitda: 1.8, ebit: 1.4, depreciation: 0.4, capex: 0.3, changeInWorkingCapital: 0.1,
    taxRate: 0.20, sharesOutstanding: 0.38, wacc: 0.10, terminalGrowthRate: 0.025,
    costOfEquity: 0.115, costOfDebt: 0.05, projectedFCF: [0.9, 1.1, 1.3, 1.5, 1.7],
    exitMultiple: 16, offerPremium: 0.35, costSynergies: 0.2, revenueSynergies: 0.3,
    synergyDiscountRate: 0.10, buyerEPS: 2.89, proFormaEPS: 2.98,
  },
  crst: {
    ebitda: 1.0, ebit: 0.7, depreciation: 0.3, capex: 0.2, changeInWorkingCapital: 0.05,
    taxRate: 0.22, sharesOutstanding: 0.12, wacc: 0.11, terminalGrowthRate: 0.02,
    costOfEquity: 0.125, costOfDebt: 0.05, projectedFCF: [0.4, 0.5, 0.6, 0.7, 0.75],
    exitMultiple: 10, offerPremium: 0.30, costSynergies: 0.15, revenueSynergies: 0.1,
    synergyDiscountRate: 0.10, buyerEPS: 5.00, proFormaEPS: 5.08,
  },
  smci: {
    ebitda: 1.4, ebit: 1.0, depreciation: 0.4, capex: 0.3, changeInWorkingCapital: 0.2,
    taxRate: 0.18, sharesOutstanding: 0.58, wacc: 0.12, terminalGrowthRate: 0.02,
    costOfEquity: 0.14, costOfDebt: 0.06, projectedFCF: [0.5, 0.7, 0.9, 1.0, 1.1],
    exitMultiple: 8, offerPremium: 0.40, costSynergies: 0.2, revenueSynergies: 0.15,
    synergyDiscountRate: 0.11, buyerEPS: 1.38, proFormaEPS: 1.42,
  },
};
