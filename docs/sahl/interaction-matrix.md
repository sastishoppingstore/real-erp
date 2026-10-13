# Interaction Matrix — /app/construction/

| Action | Target | Result |
|---|---|---|
| Click any tile | mapped route | navigates to real module (none dead) |
| جولة تعريفية tile | overlay | 5-step tour Back/Next; finish → sales-invoices |
| فاتورة جديدة (data strip + menu strip) | sales-invoices | bill creator (Customer+Products+Cart) |
| Language toggle (title bar) | `useLanguage` ar↔en | flips dir + all AR/EN labels |
| Hamburger | drawer | native-scroll nav of all construction sections |
| New Invoice steps | bill creator | existing invoice state machine untouched |

Uncertain-label policy: coral tile labeled المصروفات (position/function preserved per spec); cutting-tile position mapped to مواد الموقع (site materials) and documented here.
