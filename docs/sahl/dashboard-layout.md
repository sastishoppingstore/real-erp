# Dashboard Layout — /app/construction/ (reference geometry)

```
[brand 168px][green×5: reports|invoices|treasury|accounts|goods]   h=104
[navy×2: sales-analysis|daily-movement][blue×4: acct-mgmt|prod-mgmt|settings|tour]  h=88
[teal×2 stocktaking][coral×1 expenses][red-orange×2 purchase][green×2 sales]  h=96
[turquoise|teal-dark|green|burgundy|green|green ×6]  h=88
[green header: sales analysis + new-invoice][kpis + bars | recent invoices table]
```

- Background: pure black; tiles flat (no rounded corners/shadows/gradients).
- Brand block at row end (right in RTL): سهل 34px bold, SAHL letterspaced, المقاولات + tagline.
- All widths proportional (fr/minmax), never a uniform card grid.
- Tile → route map: reports→cvr, invoices/sales→sales-invoices, treasury→advance-payments, accounts→subcontractors, goods→products, daily→daily-reports, settings→/app/settings, stocktaking/adjust→stock, expenses→sub-payments, purchase/returns→/app/purchase, transfers→transfers, materials→materials, prices→boq, tax→invoices.
