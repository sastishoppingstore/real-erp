# Screen Blueprints — Sahl dashboard at /app/construction/

## Layout (RTL-first, black `#000`, flat squares, dense 11–12px type)
- **Top row**: 5 green (`#2fae4e`) tiles — التقارير، الفواتير، الخزينة، الحسابات، البضاعة — each with white line icon + AR label + EN sub-label; brand block (سهل/SAHL/المقاولات) fixed 168px at row end (right in RTL).
- **Second row**: 6 equal tiles — 2 navy (`#1b3a5f`): تحليل المبيعات، الحركة اليومية; 4 blue (`#1b9bd7`): إدارة الحسابات، إدارة الأصناف، إعداد البرنامج، جولة تعريفية (opens in-dashboard tour overlay, 5 steps, ends at bill creator).
- **Txn grid**: uneven `2fr 1fr 2fr 2fr` — جرد مخزن (teal, wide)، المصروفات (coral)، شراء (red-orange, wide)، بيع (green, wide).
- **Second txn row**: 6 equal — تسوية مخزن (turquoise)، تحويل مخزن (dark teal)، مواد الموقع (green)، مرتجع شراء (burgundy)، عرض الأسعار (green)، مرتجع بيع (green).
- **Data strip**: green header bar with sales-analysis title + New Invoice button; KPI line (invoiced/contracts/outstanding/active from tRPC); 6-month sales bars (pure divs, real invoice data); recent-invoices table (green header, thin borders); quick links row.
- Grids use `minmax()` columns so tiles stay side-by-side at 640×342.

## Behavior
- Every tile is a native `<button>` (keyboard accessible, focus outline), `hover:brightness-110`.
- Tour overlay: Back/Next state machine; final CTA navigates to sales-invoices.
- Loading: tRPC queries stream in; tiles render immediately, data strip fills when ready (no skeleton white-out).
