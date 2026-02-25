

## Add Global Notes and Trade Log Tabs

### Overview
Add two new top-level pages accessible from the navigation bar: **Notes** and **Trade Log**. Both will persist data to localStorage (no authentication required).

### 1. Database Tables
Since this is a personal tool without authentication, we'll use **localStorage** for persistence to keep things simple and avoid needing auth/RLS. If you want cloud persistence later, we can add that with authentication.

### 2. Navigation Update
**File: `src/components/DashboardLayout.tsx`**
- Add two new nav items: Notes (StickyNote icon) and Trade Log (Table icon)

### 3. Notes Page
**New file: `src/pages/Notes.tsx`**
- A simple rich-text area where you can write and save notes
- Auto-saves to localStorage
- Timestamp showing last saved time

### 4. Trade Log Page
**New file: `src/pages/TradeLog.tsx`**
- Editable spreadsheet-style table with columns: **Date, Symbol, Bought, Sold, P&L, Comments**
- Add row button to insert new trades
- Inline editing -- click a cell to edit
- Delete row capability
- Auto-calculated P&L (Sold - Bought) or manual entry
- Summary row showing total P&L
- Data persisted to localStorage
- Date picker for the Date column

### 5. Routing
**File: `src/App.tsx`**
- Add routes for `/notes` and `/trade-log`

### Technical Details
- Trade log state managed with `useState` + `useEffect` for localStorage sync
- Each trade row: `{ id, date, symbol, bought, sold, pnl, comments }`
- P&L auto-calculates as `sold - bought` when both fields are filled
- Table uses existing shadcn Table components for consistent styling
- Notes use a `<Textarea>` with debounced auto-save

