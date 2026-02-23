

# Competitive Position Section for Company Profiles

## What We're Adding
A new "Competitive Position" section on each company's profile page that shows where the company stands within its sector -- whether it's a monopoly, duopoly player, market leader, challenger, niche specialist, or emerging contender.

## Data Model Changes (`src/data/companies.ts`)

Add a new `competitivePosition` object to the `Company` interface with:

- **position**: The label (e.g., "Monopoly", "Duopoly", "Market Leader", "Strong Challenger", "Niche Specialist", "Emerging Contender")
- **marketSharePercent**: Estimated market share within their sub-segment
- **competitors**: Array of competitor IDs within the tracked universe
- **moat**: Short description of competitive advantage (e.g., "Sole EUV lithography provider globally")
- **trend**: "strengthening" | "stable" | "weakening" -- recent trajectory

Mock data for all 18 companies, for example:
- ASML: Monopoly, ~100% EUV market share, no competitors
- NVIDIA: Market Leader, ~80% AI accelerator share, strengthening
- TSMC: Monopoly, ~90% advanced node foundry share
- AMD: Strong Challenger, ~20% data center GPU share, strengthening
- Intel: Legacy Leader, declining share, weakening
- Celestica: Niche Specialist, ~5% share, stable

## New Component (`src/components/CompetitivePosition.tsx`)

A card displayed on the CompanyDetail page with:

1. **Position badge** -- color-coded label (e.g., gold for Monopoly, blue for Leader, amber for Challenger, gray for Niche)
2. **Market share bar** -- a horizontal progress bar showing estimated share within their sub-segment
3. **Competitive moat** -- one-liner explaining why they hold their position
4. **Trend indicator** -- arrow icon showing if position is strengthening, stable, or weakening
5. **Sector peers** -- small list of tracked competitors with their market share for comparison

## CompanyDetail Page Update (`src/pages/CompanyDetail.tsx`)

Insert the new `CompetitivePosition` component between the Supply Chain Context section and the Valuation Breakdown section.

## Technical Details

### Interface addition in `src/data/companies.ts`:
```text
competitivePosition: {
  position: "monopoly" | "duopoly" | "market-leader" | "strong-challenger" | "niche-specialist" | "emerging-contender";
  marketSharePercent: number;
  competitors: string[];  // company IDs
  moat: string;
  trend: "strengthening" | "stable" | "weakening";
}
```

### Files to create:
- `src/components/CompetitivePosition.tsx` -- the display component

### Files to modify:
- `src/data/companies.ts` -- add `competitivePosition` field to interface and all 18 company records
- `src/pages/CompanyDetail.tsx` -- import and render the new component

