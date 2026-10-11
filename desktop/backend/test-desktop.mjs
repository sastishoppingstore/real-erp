import assert from "node:assert";
import fs from "node:fs";

async function run() {
  console.log("Starting desktop backend test suite...");
  try {
    fs.unlinkSync("/tmp/erp-test.sqlite");
  } catch {}
  // Start server
  const { spawn } = await import("node:child_process");
  const serverProc = spawn("node", ["dist/desktop-boot.js"], { stdio: "inherit", env: { ...process.env, ERP_DB_PATH: "/tmp/erp-test.sqlite" } });
  await new Promise((r) => setTimeout(r, 1500));

  try {
    const fetchCookie = {};
    // 1. Login
    const loginRes = await fetch("http://127.0.0.1:32145/api/trpc/auth.passwordLogin?batch=1", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ "0": { json: { username: "admin", password: "admin123" } } }),
    });
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookieVal = setCookie.split(";")[0];
    assert(loginRes.ok, "Login failed HTTP status");
    const loginJson = await loginRes.json();
    assert(loginJson[0].result.data.json.success === true, "Login success=true expected");
    console.log("✓ Login test passed");

    // 2. Product Create & List
    const prodRes = await fetch("http://127.0.0.1:32145/api/trpc/inventory.productCreate?batch=1", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieVal },
      body: JSON.stringify({ "0": { json: { name: "Desktop Test Widget", salePrice: "150.00", purchasePrice: "100.00" } } }),
    });
    assert(prodRes.ok, "Product create failed");
    const prodJson = await prodRes.json();
    const prodId = prodJson[0].result.data.json.id;
    assert(prodId > 0, "Product ID expected");
    console.log("✓ Product create test passed (id:", prodId, ")");

    // 3. Invoice Create
    const invRes = await fetch("http://127.0.0.1:32145/api/trpc/sales.invoiceCreate?batch=1", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieVal },
      body: JSON.stringify({
        "0": {
          json: {
            invoiceNumber: "INV-DT-001",
            date: "2026-08-11",
            subTotal: "150.00",
            totalAmount: "172.50",
            taxAmount: "22.50",
            items: [{ productId: prodId, description: "Desktop Test Widget", quantity: 1, unitPrice: "150.00", totalAmount: "150.00" }],
          },
        },
      }),
    });
    assert(invRes.ok, "Invoice create failed");
    const invJson = await invRes.json();
    const invId = invJson[0].result.data.json.id;
    assert(invId > 0, "Invoice ID expected");
    console.log("✓ Invoice create test passed (id:", invId, ")");

    // 4. Thermal Print Generation
    const printRes = await fetch("http://127.0.0.1:32145/api/trpc/thermalPrint.generateThermal?batch=1&input=" + encodeURIComponent(JSON.stringify({ "0": { json: { invoiceId: invId, format: "80mm" } } })), {
      headers: { cookie: cookieVal },
    });
    assert(printRes.ok, "Thermal print failed");
    const printJson = await printRes.json();
    assert(printJson[0].result.data.json.success === true, "Thermal print success expected");
    assert(typeof printJson[0].result.data.json.data === "string", "Base64 receipt data expected");
    console.log("✓ Thermal print generation test passed");

    console.log("ALL DESKTOP OFFLINE BACKEND TESTS PASSED SUCCESSFULLY!");
  } finally {
    serverProc.kill();
  }
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
