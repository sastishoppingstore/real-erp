# API & Database Map — construction dashboard (no new endpoints)

Dashboard consumes existing tRPC only:
- `trpc.construction.constructionStats.useQuery` → activeProjects/totalSubcontractors
- `trpc.construction.projectList.useQuery` → contract values, active list, outstanding = contracts − invoiced
- `trpc.constructionInvoices.invoiceList.useQuery` → monthly sales buckets (6), recent 5, totals

No schema change, no migration. All tile destinations reuse their existing routers (construction, constructionInvoices, purchase, settings). Rollback = restore `/root/backups/construction_index_bak_20261013.tsx` + rebuild.
