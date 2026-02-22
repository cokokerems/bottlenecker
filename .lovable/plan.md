
# AI Infrastructure Supply Chain Intelligence Dashboard

## Overview
A dark, sleek dashboard that tracks AI infrastructure companies across the full supply chain — from chip equipment makers to cloud providers — showing stock prices, financials, and an interactive supply chain graph that reveals bottlenecks and risks.

## Pages & Features

### 1. Dashboard Home
- **Market overview cards** showing key indices and sector performance at a glance
- **Watchlist** of tracked companies with live stock prices, daily change, and mini sparkline charts
- **Alerts panel** highlighting companies with earnings misses, sharp price drops, or supply chain risk flags

### 2. Company Detail View
- Click any company to see detailed stock chart, key financial metrics (revenue, earnings, margins), and recent performance
- **Supply chain context**: which companies it supplies to and depends on
- Risk indicator showing how critical this company is to the overall AI supply chain

### 3. Interactive Supply Chain Graph
- **Network visualization** of all tracked companies as nodes, with edges showing supplier/customer relationships
- Companies grouped by category: Chip Makers, Equipment & Materials, Cloud/Data Centers, Networking & Cooling
- **Node sizing** based on how many companies depend on them (concentration risk)
- **Color-coded risk**: nodes turn red/amber when a company's stock drops significantly or earnings disappoint, visually propagating risk downstream
- Click any node to see its connections and drill into detail

### 4. Bottleneck Analysis
- **Concentration risk view**: ranked list of companies that are single points of failure (e.g., TSMC, ASML)
- **Performance alerts**: flags when a critical supplier shows financial weakness — with downstream impact list
- Combined risk score for each company factoring in both dependency concentration and financial health

## Companies Covered (MVP)
- **Chip makers**: NVIDIA, AMD, Intel, Broadcom, Qualcomm
- **Equipment & materials**: ASML, TSMC, Applied Materials, Lam Research
- **Cloud/Data centers**: AWS (Amazon), Google (Alphabet), Microsoft, Oracle
- **Networking & cooling**: Arista Networks, Vertiv, Celestica, Super Micro Computer

## Data Approach (MVP)
- Start with realistic **mock/sample data** for stock prices, earnings, and supply chain relationships
- Pre-built supply chain relationship map based on known public partnerships
- Architecture ready to swap in a real financial API (Alpha Vantage, Polygon, etc.) later

## Design
- **Dark theme** with accent colors (e.g., electric blue, amber for warnings, red for risk)
- Dense but readable data layout
- Smooth transitions and hover interactions on the supply chain graph
