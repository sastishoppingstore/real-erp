import { chromium } from "playwright-core";
import fs from "fs";
const EXEC="/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const LOGO_PREFIX="iVBORw0KGgoAAAANSUhEUgAABOYAAATmCAIAAAAKnjl9AABVQGNhQlgAAFVAanVt";
const STAMP_PREFIX="iVBORw0KGgoAAAANSUhEUgAABOYAAATmCAIAAAAKnjl9AABcLWNhQlgAAFwtanVt";
const browser=await chromium.launch({executablePath:EXEC,headless:true,args:["--no-sandbox","--disable-setuid-sandbox","--disable-application-cache","--disable-extensions"]});
const page=await browser.newPage({viewport:{width:1420,height:920}});
const CK=fs.readFileSync("/tmp/cj_yafco.txt","utf8").trim();
await page.context().addCookies([{name:"erp_sid",value:CK,domain:"yasco.tech",path:"/"}]);
await page.goto("https://yasco.tech/",{waitUntil:"networkidle",timeout:30000}).catch(()=>{});
await page.evaluate(async ()=>{ try{ const sw=navigator.serviceWorker; if(sw){ const reg=await sw.getRegistration(); if(reg) await reg.unregister(); } }catch(e){} }).catch(()=>{});
console.log("[f2] SW cleared");
const createStatus={};
page.on("response", async r => {
  if(r.url().includes("sales.invoiceCreate")){ createStatus.s=String(r.status()); try{createStatus.b=(await r.clone().text()).slice(0,220);}catch(e){} }
});
const errs=[]; page.on("pageerror",e=>errs.push(String(e).slice(0,150)));
const cons=[]; page.on("console",e=>{ if(e.type()==="error") cons.push(String(e.text()).slice(0,120)); });
const toast=async t=>{ try{ await page.locator(`text=${t}`).waitFor({state:"visible",timeout:9000}); return true; }catch{ return false; } };
await page.goto("https://yasco.tech/app/sales/invoices?v="+Date.now(),{waitUntil:"networkidle",timeout:45000});
await page.waitForTimeout(2800);
const ci=page.locator('input[placeholder="Type customer name..."]');
  if(await ci.count()===0){ await page.locator("button:has-text('New Bill')").click(); await page.waitForTimeout(1400); }
let custOk=false, custList="[]";
try{
  const dd=ci.locator("xpath=ancestor::div[contains(@class,'relative')]/ul/li");
  await ci.click({clickCount:3}); await page.keyboard.press("Backspace");
  await ci.type("ja",{delay:90}); await page.waitForTimeout(1000);
  const n=await dd.count(); const lis=[]; for(let i=0;i<n;i++) lis.push((await dd.nth(i).textContent()).trim());
  custList=JSON.stringify(lis);
  for(let i=0;i<lis.length;i++){ if(/jamshaid/i.test(lis[i])){ await dd.nth(i).click(); await page.waitForTimeout(600); custOk=true; break; } }
}catch(e){ console.log("[f2] cust err:",String(e).slice(0,120)); }
let prodOk=false, prodGrid=0;
try{
  const sbox=page.locator('input[placeholder*="Search products"]');
  await sbox.fill(""); await sbox.type("head",{delay:80}); await page.waitForTimeout(700);
  const btns=page.locator("div.grid.grid-cols-2").locator("button");
  prodGrid=await btns.count();
  await btns.first().click(); await page.waitForTimeout(700);
  prodOk=(prodGrid>0);
}catch(e){ console.log("[f2] prod err:",String(e).slice(0,110)); }
let poOk=false, dueOk=false;
try{
  const po=page.locator('input[placeholder="PO Number / رقم أمر الشراء"]');
  await po.fill("GSCA2026-YAE-M-001"); poOk=true;
  const du=page.locator('input[type="date"]');
  await du.fill("2026-07-15"); dueOk=true;
}catch(e){ console.log("[f2] po/due err:",String(e).slice(0,140)); }
let created=false, prevHtml="(no preview)", createOk=false;
const checks={};
try{
  await page.locator("button:has-text('Create Bill')").filter({ has: page.locator("svg") }).click({timeout:8000});
  created=await toast("Bill created");
  await page.waitForTimeout(2400);
  await page.locator(".invoice-preview-container").waitFor({state:"visible",timeout:8000});
  prevHtml = await page.$eval(".invoice-preview-container", el=>el.innerHTML);
  const C=(s)=>prevHtml.includes(s);
  checks.company = C("YAFCO AL ARABIAH");
  checks.customer = C("Jamshaid");
  checks.hoursHeader = C("مجموع الساعات");
  checks.grandTotalHeader = C("الاجمالي بالضريبة");
  checks.amountWords = C("Amount in Words");
  checks.dueSummary = C("Due / إجمالي المبالغ المستحقة");
  checks.po = C("PO: GSCA2026-YAE-M-001");
  checks.dueDate = C("Due Date: 2026/07/15");
  checks.vatNo = C("VAT No: 4700012896");
  checks.crNo = C("CR No: 300995897900003");
  checks.unified = C("Unified Natl. No. 7011789505");
  checks.cashier = C("Cashier: مدير النظام");
  checks.payment = C("Payment: Credit");
  checks.hoursFooter = C("Hours Footer / مجموع الساعات");
  checks.logoImg = C("data:image/png;base64,"+LOGO_PREFIX);
  checks.stampImg = C("data:image/png;base64,"+STAMP_PREFIX);
  checks.walkIn = !/walk-in/i.test(prevHtml.toLowerCase());
  createOk = (createStatus.s==="200") && created;
}catch(e){ console.log("[f2] create/preview err:",String(e).slice(0,140)); }
console.log("=== FINAL (yafco tenant9 rich bill, real logo+stamp) ===");
console.log("customer selected(Jamshaid)="+custOk+" list="+custList);
console.log("product picked="+prodOk+" grid="+prodGrid);
console.log("PO filled="+poOk+" dueDate filled="+dueOk);
console.log("invoiceCreate="+ (createStatus.s ? "HTTP "+createStatus.s+" "+createStatus.b : "(none captured)"));
console.log("toast 'Bill created'="+created);
for(const k in checks){ console.log(`  ${k}: ${checks[k]}`); }
const allOk = createOk && Object.values(checks).every(Boolean);
console.log(">>> RICH_BILL_OK (all checks) =",allOk);
console.log("pageerrors:",JSON.stringify(errs.slice(0,6)));
console.log("consoleErrors:",JSON.stringify(cons.slice(0,6)));
console.log("previewHTML_len="+prevHtml.length);
await browser.close();
