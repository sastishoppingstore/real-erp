import { z } from "zod";
import { createRouter, authedQuery, authedMutation } from "./middleware";
import { getDb } from "./queries/connection";
import { sendEmail } from "./lib/smtp";
import {
  invoices,
  invoiceItems,
  creditNotes,
  purchaseOrders,
  customerPayments,
  cashboxTransactions,
  customers,
  suppliers,
  products,
  constructionContracts,
  companySettings,
  users,
  emailLogs,
  sahlReportSettings,
} from "@db/schema";
import { and, between, desc, eq, gte, inArray, lte, ne, sql } from "drizzle-orm";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(value: string, days: number) {
  const [y, m, d] = value.split("-").map(Number);
  return ymd(new Date(y, (m || 1) - 1, (d || 1) + days, 12, 0, 0));
}

function normalizeRange(from: string, to?: string) {
  let start = from.slice(0, 10);
  let end = (to || from).slice(0, 10);
  if (end < start) [start, end] = [end, start];
  return { from: start, to: end };
}

function dayStart(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

function dayEnd(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
}

function money(value: number) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanReason(reason: string | null | undefined) {
  return String(reason ?? "").split("[ITEMS]")[0].trim();
}

type PeriodSummaryData = {
  from: string;
  to: string;
  sales: { count: number; total: number; tax: number; paid: number; due: number };
  returns: { count: number; total: number };
  purchases: { count: number; total: number };
  payments: { count: number; total: number };
  expenses: { count: number; total: number };
  contracts: { count: number; value: number; invoiced: number };
  invoices: Array<{ no: string; date: string; customer: string; type: string; total: number; paid: number; due: number }>;
  returnRows: Array<{ no: string; date: string; customer: string; amount: number; reason: string }>;
  purchaseRows: Array<{ no: string; date: string; supplier: string; total: number; status: string }>;
  paymentRows: Array<{ date: string; customer: string; amount: number; method: string }>;
  contractRows: Array<{ no: string; title: string; client: string; date: string; value: number; status: string }>;
  topCustomers: Array<{ name: string; total: number }>;
  topItems: Array<{ name: string; qty: number; total: number }>;
};

// Builds the whole period report directly from the database. Both the
// periodSummary query and the email path use it, so print/email never drift.
async function buildPeriodSummary(tenantId: number, fromInput: string, toInput?: string): Promise<PeriodSummaryData> {
  const db = getDb();
  const { from, to } = normalizeRange(fromInput, toInput);

  const invoiceInRange = and(
    eq(invoices.tenantId, tenantId),
    ne(invoices.status, "cancelled"),
    between(invoices.date, from, to),
  );

  const contractDateExpr = sql`date(coalesce(${constructionContracts.contractDate}, ${constructionContracts.startDate}, ${constructionContracts.createdAt}))`;

  const [
    salesAggRows,
    returnAggRows,
    purchaseAggRows,
    paymentAggRows,
    expenseAggRows,
    invoiceList,
    returnList,
    purchaseList,
    paymentList,
    topCustomerList,
    topItemList,
    contractTotalsRows,
    contractClientRows,
    contractList,
  ] = await Promise.all([
    db.select({
      count: sql<number>`count(*)`,
      total: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
      tax: sql<string>`coalesce(sum(${invoices.taxAmount}), 0)`,
      paid: sql<string>`coalesce(sum(${invoices.paidAmount}), 0)`,
      due: sql<string>`coalesce(sum(${invoices.balanceDue}), 0)`,
    }).from(invoices).where(invoiceInRange),

    db.select({
      count: sql<number>`count(*)`,
      total: sql<string>`coalesce(sum(${creditNotes.amount}), 0)`,
    }).from(creditNotes).where(and(
      eq(creditNotes.tenantId, tenantId),
      between(creditNotes.date, from, to),
    )),

    db.select({
      count: sql<number>`count(*)`,
      total: sql<string>`coalesce(sum(${purchaseOrders.totalAmount}), 0)`,
    }).from(purchaseOrders).where(and(
      eq(purchaseOrders.tenantId, tenantId),
      ne(purchaseOrders.status, "cancelled"),
      between(purchaseOrders.date, from, to),
    )),

    db.select({
      count: sql<number>`count(*)`,
      total: sql<string>`coalesce(sum(${customerPayments.amount}), 0)`,
    }).from(customerPayments).where(and(
      eq(customerPayments.tenantId, tenantId),
      between(customerPayments.date, from, to),
    )),

    // cashbox_transactions has no `date` column: the business day is createdAt.
    // Expenses are the explicit "expense" rows written by cashboxRouter.addExpense
    // (cash_out withdrawals are tracked separately and are not expenses).
    db.select({
      count: sql<number>`count(*)`,
      total: sql<string>`coalesce(sum(${cashboxTransactions.amount}), 0)`,
    }).from(cashboxTransactions).where(and(
      eq(cashboxTransactions.tenantId, tenantId),
      ne(cashboxTransactions.status, "cancelled"),
      eq(cashboxTransactions.transactionType, "expense"),
      gte(cashboxTransactions.createdAt, dayStart(from)),
      lte(cashboxTransactions.createdAt, dayEnd(to)),
    )),

    db.select({
      no: invoices.invoiceNumber,
      date: invoices.date,
      customer: sql<string>`coalesce(${customers.name}, ${invoices.customerName}, '')`,
      type: invoices.invoiceType,
      total: invoices.totalAmount,
      paid: invoices.paidAmount,
      due: invoices.balanceDue,
    }).from(invoices)
      .leftJoin(customers, and(
        eq(invoices.customerId, customers.id),
        eq(customers.tenantId, tenantId),
      ))
      .where(invoiceInRange)
      .orderBy(desc(invoices.date), desc(invoices.id)),

    db.select({
      no: creditNotes.creditNoteNumber,
      date: creditNotes.date,
      customer: sql<string>`coalesce(${customers.name}, '')`,
      amount: creditNotes.amount,
      reason: creditNotes.reason,
    }).from(creditNotes)
      .leftJoin(customers, and(
        eq(creditNotes.customerId, customers.id),
        eq(customers.tenantId, tenantId),
      ))
      .where(and(
        eq(creditNotes.tenantId, tenantId),
        between(creditNotes.date, from, to),
      ))
      .orderBy(desc(creditNotes.date), desc(creditNotes.id)),

    db.select({
      no: purchaseOrders.poNumber,
      date: purchaseOrders.date,
      supplier: sql<string>`coalesce(${suppliers.name}, '')`,
      total: purchaseOrders.totalAmount,
      status: purchaseOrders.status,
    }).from(purchaseOrders)
      .leftJoin(suppliers, and(
        eq(purchaseOrders.supplierId, suppliers.id),
        eq(suppliers.tenantId, tenantId),
      ))
      .where(and(
        eq(purchaseOrders.tenantId, tenantId),
        ne(purchaseOrders.status, "cancelled"),
        between(purchaseOrders.date, from, to),
      ))
      .orderBy(desc(purchaseOrders.date), desc(purchaseOrders.id)),

    db.select({
      date: customerPayments.date,
      customer: sql<string>`coalesce(${customers.name}, '')`,
      amount: customerPayments.amount,
      method: customerPayments.paymentMethod,
    }).from(customerPayments)
      .leftJoin(customers, and(
        eq(customerPayments.customerId, customers.id),
        eq(customers.tenantId, tenantId),
      ))
      .where(and(
        eq(customerPayments.tenantId, tenantId),
        between(customerPayments.date, from, to),
      ))
      .orderBy(desc(customerPayments.date), desc(customerPayments.id)),

    db.select({
      name: sql<string>`coalesce(${customers.name}, ${invoices.customerName}, '')`,
      total: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
    }).from(invoices)
      .leftJoin(customers, and(
        eq(invoices.customerId, customers.id),
        eq(customers.tenantId, tenantId),
      ))
      .where(invoiceInRange)
      .groupBy(sql`coalesce(${customers.name}, ${invoices.customerName}, '')`)
      .orderBy(desc(sql`coalesce(sum(${invoices.totalAmount}), 0)`))
      .limit(10),

    db.select({
      name: sql<string>`coalesce(nullif(${invoiceItems.description}, ''), 'Item')`,
      qty: sql<string>`coalesce(sum(${invoiceItems.quantity}), 0)`,
      total: sql<string>`coalesce(sum(${invoiceItems.totalAmount}), 0)`,
    }).from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .where(invoiceInRange)
      .groupBy(sql`coalesce(nullif(${invoiceItems.description}, ''), 'Item')`)
      .orderBy(desc(sql`coalesce(sum(${invoiceItems.totalAmount}), 0)`))
      .limit(10),

    db.select({
      count: sql<number>`count(*)`,
      value: sql<string>`coalesce(sum(${constructionContracts.contractValue}), 0)`,
    }).from(constructionContracts).where(and(
      eq(constructionContracts.tenantId, tenantId),
      sql`${contractDateExpr} between ${from} and ${to}`,
    )),

    db.select({ clientId: constructionContracts.clientId })
      .from(constructionContracts)
      .where(and(
        eq(constructionContracts.tenantId, tenantId),
        sql`${contractDateExpr} between ${from} and ${to}`,
      ))
      .groupBy(constructionContracts.clientId),

    db.select({
      no: constructionContracts.contractNumber,
      title: constructionContracts.title,
      client: sql<string>`coalesce(${customers.name}, '')`,
      date: sql<string>`date_format(${contractDateExpr}, '%Y-%m-%d')`,
      value: constructionContracts.contractValue,
      status: constructionContracts.status,
    }).from(constructionContracts)
      .leftJoin(customers, and(
        eq(constructionContracts.clientId, customers.id),
        eq(customers.tenantId, tenantId),
      ))
      .where(and(
        eq(constructionContracts.tenantId, tenantId),
        sql`${contractDateExpr} between ${from} and ${to}`,
      ))
      .orderBy(desc(contractDateExpr)),
  ]);

  // There is no invoice -> contract foreign key, so "invoiced" means sales
  // (labour) invoices issued in this period to the clients of the contracts
  // dated inside the period.
  const clientIds = contractClientRows
    .map((r) => r.clientId)
    .filter((id): id is number => id != null);
  let contractInvoiced = 0;
  if (clientIds.length) {
    const [row] = await db.select({
      total: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
    }).from(invoices).where(and(
      invoiceInRange,
      inArray(invoices.customerId, clientIds),
    ));
    contractInvoiced = Number(row?.total ?? 0);
  }

  const salesAgg = salesAggRows[0];
  const returnAgg = returnAggRows[0];
  const purchaseAgg = purchaseAggRows[0];
  const paymentAgg = paymentAggRows[0];
  const expenseAgg = expenseAggRows[0];
  const contractTotals = contractTotalsRows[0];

  return {
    from,
    to,
    sales: {
      count: Number(salesAgg?.count ?? 0),
      total: Number(salesAgg?.total ?? 0),
      tax: Number(salesAgg?.tax ?? 0),
      paid: Number(salesAgg?.paid ?? 0),
      due: Number(salesAgg?.due ?? 0),
    },
    returns: {
      count: Number(returnAgg?.count ?? 0),
      total: Number(returnAgg?.total ?? 0),
    },
    purchases: {
      count: Number(purchaseAgg?.count ?? 0),
      total: Number(purchaseAgg?.total ?? 0),
    },
    payments: {
      count: Number(paymentAgg?.count ?? 0),
      total: Number(paymentAgg?.total ?? 0),
    },
    expenses: {
      count: Number(expenseAgg?.count ?? 0),
      total: Number(expenseAgg?.total ?? 0),
    },
    contracts: {
      count: Number(contractTotals?.count ?? 0),
      value: Number(contractTotals?.value ?? 0),
      invoiced: contractInvoiced,
    },
    invoices: invoiceList.map((r) => ({
      no: r.no,
      date: String(r.date ?? "").slice(0, 10),
      customer: r.customer ?? "",
      type: r.type ?? "",
      total: Number(r.total ?? 0),
      paid: Number(r.paid ?? 0),
      due: Number(r.due ?? 0),
    })),
    returnRows: returnList.map((r) => ({
      no: r.no,
      date: String(r.date ?? "").slice(0, 10),
      customer: r.customer ?? "",
      amount: Number(r.amount ?? 0),
      reason: cleanReason(r.reason),
    })),
    purchaseRows: purchaseList.map((r) => ({
      no: r.no,
      date: String(r.date ?? "").slice(0, 10),
      supplier: r.supplier ?? "",
      total: Number(r.total ?? 0),
      status: r.status ?? "",
    })),
    paymentRows: paymentList.map((r) => ({
      date: String(r.date ?? "").slice(0, 10),
      customer: r.customer ?? "",
      amount: Number(r.amount ?? 0),
      method: r.method ?? "",
    })),
    contractRows: contractList.map((r) => ({
      no: r.no,
      title: r.title ?? "",
      client: r.client ?? "",
      date: String(r.date ?? "").slice(0, 10),
      value: Number(r.value ?? 0),
      status: r.status ?? "",
    })),
    topCustomers: topCustomerList.map((r) => ({
      name: r.name || "—",
      total: Number(r.total ?? 0),
    })),
    topItems: topItemList.map((r) => ({
      name: r.name || "—",
      qty: Number(r.qty ?? 0),
      total: Number(r.total ?? 0),
    })),
  };
}

async function resolveRecipient(tenantId: number, recipients: string | null, override?: string) {
  const direct = override?.trim();
  if (direct) return direct;

  const listed = String(recipients ?? "")
    .split(/[,;\s]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (listed.length) return listed[0];

  const db = getDb();
  const [company] = await db.select({ email: companySettings.email })
    .from(companySettings)
    .where(eq(companySettings.tenantId, tenantId))
    .limit(1);
  if (company?.email?.trim()) return company.email.trim();

  const [admin] = await db.select({ email: users.email })
    .from(users)
    .where(and(
      eq(users.tenantId, tenantId),
      eq(users.isActive, true),
      inArray(users.role, ["admin", "super_admin"]),
    ))
    .orderBy(users.id)
    .limit(1);
  if (admin?.email?.trim()) return admin.email.trim();

  const [fallback] = await db.select({ email: users.email })
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.isActive, true)))
    .orderBy(users.id)
    .limit(1);
  return fallback?.email?.trim() || "";
}

function reportTable(
  title: string,
  headers: string[],
  rows: Array<Array<string | number>>,
  limit = 200,
) {
  const shown = rows.slice(0, limit);
  const head = headers
    .map((h) => `<th style="background:#0f172a;color:#e2e8f0;border:1px solid #0f172a;padding:6px 7px;text-align:center;font-size:11px;font-weight:bold">${esc(h)}</th>`)
    .join("");
  const body = shown.length
    ? shown
        .map(
          (row, i) =>
            `<tr style="background:${i % 2 ? "#f8fafc" : "#ffffff"}">${row
              .map(
                (cell, ci) =>
                  `<td style="border:1px solid #e2e8f0;padding:5px 7px;font-size:11.5px;text-align:${
                    ci >= headers.length - 3 ? "right" : "center"
                  };color:#1e293b">${esc(cell)}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("")
    : `<tr><td colspan="${headers.length}" style="border:1px solid #e2e8f0;padding:10px;text-align:center;color:#94a3b8;font-size:11px">—</td></tr>`;
  const more = rows.length > shown.length
    ? `<div style="padding:5px 2px;font-size:10.5px;color:#64748b">Showing ${shown.length} of ${rows.length}</div>`
    : "";
  return `
    <div style="margin:24px 0 8px;border-bottom:2px solid #10b981;padding-bottom:5px">
      <span style="font-size:13px;font-weight:bold;color:#0f172a">${esc(title)}</span>
    </div>
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%">
      <thead><tr>${head}</tr></thead><tbody>${body}</tbody>
    </table>${more}`;
}

function buildReportHtml(company: {
  name?: string | null;
  nameAr?: string | null;
  logo?: string | null;
}, data: PeriodSummaryData) {
  const companyName = company.name || "Company";
  const companyNameAr = company.nameAr || "";
  const logo = company.logo && /^(https?:|data:image\/)/i.test(company.logo) && company.logo.length < 600000
    ? company.logo
    : "";

  const net = data.sales.total - data.returns.total - data.purchases.total - data.expenses.total;
  const cards: Array<{ label: string; value: string; color: string; bg: string }> = [
    { label: "Sales / المبيعات", value: money(data.sales.total), color: "#047857", bg: "#ecfdf5" },
    { label: "Collected / المحصّل", value: money(data.sales.paid), color: "#0f766e", bg: "#f0fdfa" },
    { label: "Due / المتبقي", value: money(data.sales.due), color: "#b45309", bg: "#fffbeb" },
    { label: "Purchases / المشتريات", value: money(data.purchases.total), color: "#1d4ed8", bg: "#eff6ff" },
    { label: "Expenses / المصروفات", value: money(data.expenses.total), color: "#be123c", bg: "#fff1f2" },
    { label: "Returns / المرتجعات", value: money(data.returns.total), color: "#6d28d9", bg: "#f5f3ff" },
    { label: "Net / الصافي", value: money(net), color: net >= 0 ? "#334155" : "#be123c", bg: "#f8fafc" },
    { label: "Invoices / الفواتير", value: String(data.sales.count), color: "#0f172a", bg: "#f1f5f9" },
  ];
  const cardRows: string[] = [];
  for (let i = 0; i < cards.length; i += 4) {
    const slice = cards.slice(i, i + 4);
    cardRows.push(`<tr>${slice.map((c) => `
      <td width="25%" style="padding:5px">
        <div style="background:${c.bg};border:1px solid #e2e8f0;border-top:3px solid ${c.color};border-radius:8px;padding:9px 10px">
          <div style="font-size:10px;font-weight:bold;color:#64748b;letter-spacing:.4px">${esc(c.label)}</div>
          <div style="font-size:16px;font-weight:bold;color:#0f172a;margin-top:3px">${esc(c.value)}</div>
        </div>
      </td>`).join("")}</tr>`);
  }
  const extraRows: Array<[string, string]> = [
    ["VAT / الضريبة", money(data.sales.tax)],
    ["Payments / المقبوضات", money(data.payments.total)],
    ["Contracts / العقود", `${data.contracts.count} — ${money(data.contracts.value)}`],
    ["Invoiced on contracts / المفوتر على العقود", money(data.contracts.invoiced)],
    ["Purchase orders / أوامر الشراء", String(data.purchases.count)],
  ];
  const extraHtml = extraRows.map(([k, v]) => `
    <tr>
      <td style="border:1px solid #e2e8f0;background:#f8fafc;padding:6px 8px;font-size:11.5px;color:#475569;width:34%">${esc(k)}</td>
      <td style="border:1px solid #e2e8f0;padding:6px 8px;font-size:12px;font-weight:bold;text-align:right;color:#0f172a">${esc(v)}</td>
    </tr>`).join("");

  return `<!doctype html>
<html dir="rtl">
<head><meta charset="utf-8"><title>Period report ${esc(data.from)} — ${esc(data.to)}</title></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Tahoma,Arial,sans-serif;color:#0f172a">
  <div style="max-width:960px;margin:0 auto;background:#fff;padding:0 0 24px">
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#0b1220">
      <tr>
        <td style="padding:18px 20px;vertical-align:middle">
          <div style="font-size:10px;font-weight:bold;letter-spacing:2px;color:#6ee7b7;text-transform:uppercase">${esc(companyName)}${companyNameAr ? ` — ${esc(companyNameAr)}` : ""}</div>
          <div style="font-size:22px;font-weight:bold;color:#fff;margin-top:4px">Period report / تقرير فترة</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px">${esc(data.from)} — ${esc(data.to)}</div>
        </td>
        <td style="text-align:left;vertical-align:middle;padding:18px 20px;width:170px">${logo ? `<img src="${esc(logo)}" alt="" style="max-height:60px;max-width:150px">` : ""}</td>
      </tr>
    </table>

    <div style="padding:16px 20px 0">
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
      <tbody>${cardRows.join("")}</tbody>
    </table>
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:8px">
      <tbody>${extraHtml}</tbody>
    </table>

    <p style="font-size:11px;color:#64748b;margin:12px 0 4px">
      Sales invoices are labour invoices. Figures are inclusive of the selected period only.
    </p>

    ${reportTable("Sales invoices / فواتير البيع", ["No.", "Date", "Customer", "Type", "Total", "Paid", "Due"], data.invoices.map((r) => [r.no, r.date, r.customer, r.type, money(r.total), money(r.paid), money(r.due)]), 200)}
    ${reportTable("Returns / المرتجعات", ["No.", "Date", "Customer", "Amount", "Reason"], data.returnRows.map((r) => [r.no, r.date, r.customer, money(r.amount), r.reason]))}
    ${reportTable("Purchases / المشتريات", ["No.", "Date", "Supplier", "Total", "Status"], data.purchaseRows.map((r) => [r.no, r.date, r.supplier, money(r.total), r.status]))}
    ${reportTable("Payments / المقبوضات", ["Date", "Customer", "Amount", "Method"], data.paymentRows.map((r) => [r.date, r.customer, money(r.amount), r.method]))}
    ${reportTable("Top customers / أعلى العملاء", ["Customer", "Total"], data.topCustomers.map((r) => [r.name, money(r.total)]))}
    ${reportTable("Top items / أعلى الأصناف", ["Item", "Qty", "Total"], data.topItems.map((r) => [r.name, r.qty, money(r.total)]))}
    ${reportTable("Contracts / العقود", ["No.", "Title", "Client", "Date", "Value", "Status"], data.contractRows.map((r) => [r.no, r.title, r.client, r.date, money(r.value), r.status]))}

    <p style="font-size:10px;color:#94a3b8;margin-top:18px;border-top:1px solid #e2e8f0;padding-top:8px">
      Generated by ${esc(companyName)} ERP — ${esc(new Date().toLocaleString("en-GB"))}
    </p>
    </div>
  </div>
</body>
</html>`;
}

function buildReportText(data: PeriodSummaryData) {
  return [
    `Period report ${data.from} — ${data.to}`,
    `Sales: ${money(data.sales.total)} | VAT: ${money(data.sales.tax)} | Paid: ${money(data.sales.paid)} | Due: ${money(data.sales.due)}`,
    `Invoices: ${data.sales.count} | Returns: ${money(data.returns.total)} | Purchases: ${money(data.purchases.total)} | Expenses: ${money(data.expenses.total)}`,
    `Payments: ${money(data.payments.total)} | Contracts: ${data.contracts.count} (${money(data.contracts.value)}) | Invoiced on contracts: ${money(data.contracts.invoiced)}`,
  ].join("\n");
}

async function sendPeriodReport(tenantId: number, from: string, to: string, override?: string) {
  const db = getDb();
  const [settings] = await db.select().from(sahlReportSettings)
    .where(eq(sahlReportSettings.tenantId, tenantId))
    .limit(1);
  const [company] = await db.select({
    name: companySettings.companyName,
    nameAr: companySettings.companyNameAr,
    email: companySettings.email,
    logo: companySettings.logo,
  }).from(companySettings)
    .where(eq(companySettings.tenantId, tenantId))
    .limit(1);

  const recipient = await resolveRecipient(tenantId, settings?.recipients ?? null, override);
  if (!recipient) {
    return { sent: false, to: "", error: "No recipient email configured" };
  }

  const data = await buildPeriodSummary(tenantId, from, to);
  const subject = `Period report ${data.from} — ${data.to}${company?.name ? ` — ${company.name}` : ""}`;
  const html = buildReportHtml(company ?? {}, data);

  let sent = false;
  let error: string | undefined;
  try {
    const result = await sendEmail({
      to: recipient,
      subject,
      html,
      text: buildReportText(data),
    });
    sent = result.sent;
    if (!sent) error = "SMTP is not configured";
  } catch (err: any) {
    error = err?.message || "Email send failed";
  }

  try {
    await db.insert(emailLogs).values({
      tenantId,
      templateKey: "sahl_period_report",
      recipient,
      subject,
      body: html.slice(0, 20000),
      status: sent ? "sent" : "failed",
      errorMessage: error ?? null,
    });
  } catch {
    // Logging must never break the report/email flow.
  }

  return error ? { sent, to: recipient, error } : { sent, to: recipient };
}

function startOfWeekSunday(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function minutesOfDay(value: string) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value || ""));
  if (!match) return 8 * 60;
  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const minutes = Math.min(59, Math.max(0, Number(match[2])));
  return hours * 60 + minutes;
}

function isDue(settings: {
  frequency: "daily" | "weekly" | "monthly";
  sendTime: string;
  lastSentAt: Date | null;
}) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes < minutesOfDay(settings.sendTime)) return false;

  const last = settings.lastSentAt ? new Date(settings.lastSentAt) : null;
  if (!last || Number.isNaN(last.getTime())) return true;
  if (last.getTime() > now.getTime()) return false;

  if (settings.frequency === "daily") {
    return ymd(last) !== ymd(now);
  }
  if (settings.frequency === "weekly") {
    return startOfWeekSunday(last).getTime() !== startOfWeekSunday(now).getTime();
  }
  return last.getFullYear() !== now.getFullYear() || last.getMonth() !== now.getMonth();
}

// Runs every 30 minutes from api/boot.ts. Silently no-ops when the settings
// table has not been migrated yet (production rollout safety).
export async function runSahlReportScheduler() {
  try {
    const db = getDb();
    const rows = await db.select().from(sahlReportSettings)
      .where(eq(sahlReportSettings.enabled, true));

    for (const row of rows) {
      if (!isDue({
        frequency: row.frequency,
        sendTime: row.sendTime,
        lastSentAt: row.lastSentAt,
      })) continue;

      const today = ymd(new Date());
      const days = Math.min(365, Math.max(1, Number(row.periodDays) || 7));
      const from = addDays(today, -(days - 1));

      try {
        await sendPeriodReport(row.tenantId, from, today);
      } catch (err: any) {
        console.warn(`[sahl-reports] tenant ${row.tenantId} send failed:`, err?.message || err);
      } finally {
        try {
          await db.update(sahlReportSettings)
            .set({ lastSentAt: new Date() })
            .where(eq(sahlReportSettings.id, row.id));
        } catch (err: any) {
          console.warn(`[sahl-reports] tenant ${row.tenantId} lastSentAt update failed:`, err?.message || err);
        }
      }
    }
  } catch {
    // Table missing / DB not ready yet: retry on the next scheduler tick.
  }
}

export const sahlReportsRouter = createRouter({
  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const today = ymd(new Date());
    const monthStart = `${today.slice(0, 7)}-01`;
    const activeInvoice = and(
      eq(invoices.tenantId, tenantId),
      ne(invoices.status, "cancelled"),
    );

    const [
      salesRows,
      returnRows,
      purchaseRows,
      customerCountRows,
      productCountRows,
      contractRows,
      topCustomerList,
      last7Rows,
    ] = await Promise.all([
      db.select({
        todaySales: sql<string>`coalesce(sum(case when ${invoices.date} = ${today} then ${invoices.totalAmount} else 0 end), 0)`,
        monthSales: sql<string>`coalesce(sum(case when ${invoices.date} between ${monthStart} and ${today} then ${invoices.totalAmount} else 0 end), 0)`,
        totalSales: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
        totalPaid: sql<string>`coalesce(sum(${invoices.paidAmount}), 0)`,
        totalDue: sql<string>`coalesce(sum(${invoices.balanceDue}), 0)`,
        invoiceCount: sql<number>`count(*)`,
      }).from(invoices).where(activeInvoice),

      db.select({
        todayReturns: sql<string>`coalesce(sum(case when ${creditNotes.date} = ${today} then ${creditNotes.amount} else 0 end), 0)`,
        returnsTotal: sql<string>`coalesce(sum(${creditNotes.amount}), 0)`,
      }).from(creditNotes).where(eq(creditNotes.tenantId, tenantId)),

      db.select({
        purchaseTotal: sql<string>`coalesce(sum(${purchaseOrders.totalAmount}), 0)`,
      }).from(purchaseOrders).where(and(
        eq(purchaseOrders.tenantId, tenantId),
        ne(purchaseOrders.status, "cancelled"),
      )),

      db.select({ count: sql<number>`count(*)` }).from(customers)
        .where(eq(customers.tenantId, tenantId)),

      db.select({ count: sql<number>`count(*)` }).from(products)
        .where(eq(products.tenantId, tenantId)),

      db.select({
        contractValue: sql<string>`coalesce(sum(${constructionContracts.contractValue}), 0)`,
        contractCount: sql<number>`count(*)`,
      }).from(constructionContracts)
        .where(eq(constructionContracts.tenantId, tenantId)),

      db.select({
        name: sql<string>`coalesce(${customers.name}, ${invoices.customerName}, '')`,
        total: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
      }).from(invoices)
        .leftJoin(customers, and(
          eq(invoices.customerId, customers.id),
          eq(customers.tenantId, tenantId),
        ))
        .where(activeInvoice)
        .groupBy(sql`coalesce(${customers.name}, ${invoices.customerName}, '')`)
        .orderBy(desc(sql`coalesce(sum(${invoices.totalAmount}), 0)`))
        .limit(5),

      db.select({
        date: invoices.date,
        total: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
      }).from(invoices)
        .where(and(
          activeInvoice,
          between(invoices.date, addDays(today, -6), today),
        ))
        .groupBy(invoices.date),
    ]);

    const sales = salesRows[0];
    const returns = returnRows[0];
    const purchases = purchaseRows[0];
    const contracts = contractRows[0];
    const dayTotals = new Map(
      last7Rows.map((row) => [String(row.date).slice(0, 10), Number(row.total ?? 0)]),
    );

    return {
      todaySales: Number(sales?.todaySales ?? 0),
      monthSales: Number(sales?.monthSales ?? 0),
      totalSales: Number(sales?.totalSales ?? 0),
      totalPaid: Number(sales?.totalPaid ?? 0),
      totalDue: Number(sales?.totalDue ?? 0),
      invoiceCount: Number(sales?.invoiceCount ?? 0),
      todayReturns: Number(returns?.todayReturns ?? 0),
      returnsTotal: Number(returns?.returnsTotal ?? 0),
      purchaseTotal: Number(purchases?.purchaseTotal ?? 0),
      customerCount: Number(customerCountRows[0]?.count ?? 0),
      productCount: Number(productCountRows[0]?.count ?? 0),
      contractValue: Number(contracts?.contractValue ?? 0),
      contractCount: Number(contracts?.contractCount ?? 0),
      topCustomers: topCustomerList.map((row) => ({
        name: row.name || "—",
        total: Number(row.total ?? 0),
      })),
      last7: Array.from({ length: 7 }, (_, index) => {
        const date = addDays(today, index - 6);
        return { date, total: dayTotals.get(date) ?? 0 };
      }),
    };
  }),

  periodSummary: authedQuery
    .input(z.object({
      from: z.string().regex(DATE_RE),
      to: z.string().regex(DATE_RE).optional(),
    }))
    .query(async ({ input, ctx }) => {
      return buildPeriodSummary(ctx.user.tenantId!, input.from, input.to);
    }),

  // Aggregates only (no row lists) — used to compare the selected period with
  // the previous one so every report box can show a % up / down.
  periodTotals: authedQuery
    .input(z.object({
      from: z.string().regex(DATE_RE),
      to: z.string().regex(DATE_RE),
    }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const { from, to } = normalizeRange(input.from, input.to);

      const [salesRows, returnRows, purchaseRows, paymentRows, expenseRows] = await Promise.all([
        db.select({
          count: sql<number>`count(*)`,
          total: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
          tax: sql<string>`coalesce(sum(${invoices.taxAmount}), 0)`,
          paid: sql<string>`coalesce(sum(${invoices.paidAmount}), 0)`,
          due: sql<string>`coalesce(sum(${invoices.balanceDue}), 0)`,
        }).from(invoices).where(and(
          eq(invoices.tenantId, tenantId),
          ne(invoices.status, "cancelled"),
          between(invoices.date, from, to),
        )),

        db.select({
          count: sql<number>`count(*)`,
          total: sql<string>`coalesce(sum(${creditNotes.amount}), 0)`,
        }).from(creditNotes).where(and(
          eq(creditNotes.tenantId, tenantId),
          between(creditNotes.date, from, to),
        )),

        db.select({
          count: sql<number>`count(*)`,
          total: sql<string>`coalesce(sum(${purchaseOrders.totalAmount}), 0)`,
        }).from(purchaseOrders).where(and(
          eq(purchaseOrders.tenantId, tenantId),
          ne(purchaseOrders.status, "cancelled"),
          between(purchaseOrders.date, from, to),
        )),

        db.select({
          count: sql<number>`count(*)`,
          total: sql<string>`coalesce(sum(${customerPayments.amount}), 0)`,
        }).from(customerPayments).where(and(
          eq(customerPayments.tenantId, tenantId),
          between(customerPayments.date, from, to),
        )),

        db.select({
          count: sql<number>`count(*)`,
          total: sql<string>`coalesce(sum(${cashboxTransactions.amount}), 0)`,
        }).from(cashboxTransactions).where(and(
          eq(cashboxTransactions.tenantId, tenantId),
          ne(cashboxTransactions.status, "cancelled"),
          eq(cashboxTransactions.transactionType, "expense"),
          gte(cashboxTransactions.createdAt, dayStart(from)),
          lte(cashboxTransactions.createdAt, dayEnd(to)),
        )),
      ]);

      const sales = salesRows[0];
      const returns = returnRows[0];
      const purchases = purchaseRows[0];
      const payments = paymentRows[0];
      const expenses = expenseRows[0];

      return {
        from,
        to,
        sales: {
          count: Number(sales?.count ?? 0),
          total: Number(sales?.total ?? 0),
          tax: Number(sales?.tax ?? 0),
          paid: Number(sales?.paid ?? 0),
          due: Number(sales?.due ?? 0),
        },
        returns: { count: Number(returns?.count ?? 0), total: Number(returns?.total ?? 0) },
        purchases: { count: Number(purchases?.count ?? 0), total: Number(purchases?.total ?? 0) },
        payments: { count: Number(payments?.count ?? 0), total: Number(payments?.total ?? 0) },
        expenses: { count: Number(expenses?.count ?? 0), total: Number(expenses?.total ?? 0) },
      };
    }),

  settingsGet: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [row] = await db.select().from(sahlReportSettings)
      .where(eq(sahlReportSettings.tenantId, ctx.user.tenantId!))
      .limit(1);

    return {
      id: row?.id ?? null,
      enabled: row?.enabled ?? false,
      frequency: row?.frequency ?? ("weekly" as const),
      sendTime: row?.sendTime ?? "08:00",
      periodDays: row?.periodDays ?? 7,
      recipients: row?.recipients ?? "",
      lastSentAt: row?.lastSentAt ?? null,
    };
  }),

  settingsSave: authedMutation
    .input(z.object({
      enabled: z.boolean(),
      frequency: z.enum(["daily", "weekly", "monthly"]),
      sendTime: z.string().regex(/^\d{2}:\d{2}$/),
      periodDays: z.number().min(1).max(365),
      recipients: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;
      const values = {
        enabled: input.enabled,
        frequency: input.frequency,
        sendTime: input.sendTime,
        periodDays: Math.round(input.periodDays),
        recipients: input.recipients?.trim() || null,
      };

      const [existing] = await db.select({ id: sahlReportSettings.id })
        .from(sahlReportSettings)
        .where(eq(sahlReportSettings.tenantId, tenantId))
        .limit(1);

      if (existing) {
        await db.update(sahlReportSettings)
          .set(values)
          .where(eq(sahlReportSettings.tenantId, tenantId));
      } else {
        await db.insert(sahlReportSettings).values({ tenantId, ...values });
      }

      return { success: true };
    }),

  emailPeriod: authedMutation
    .input(z.object({
      from: z.string().regex(DATE_RE),
      to: z.string().regex(DATE_RE).optional(),
      email: z.string().email().optional(),
      recipient: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { from, to } = normalizeRange(input.from, input.to);
      return sendPeriodReport(ctx.user.tenantId!, from, to, input.email || input.recipient);
    }),

  sendNow: authedMutation.mutation(async ({ ctx }) => {
    const db = getDb();
    const tenantId = ctx.user.tenantId!;
    const [settings] = await db.select().from(sahlReportSettings)
      .where(eq(sahlReportSettings.tenantId, tenantId))
      .limit(1);

    const today = ymd(new Date());
    const days = Math.min(365, Math.max(1, Number(settings?.periodDays) || 7));
    const from = addDays(today, -(days - 1));

    return sendPeriodReport(tenantId, from, today);
  }),
});
