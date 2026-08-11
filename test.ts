import { getDb } from "./api/queries/connection";
import { appRouter } from "./api/router";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";

async function runTests() {
  console.log("Starting End-to-End Persistence Tests...");
  const db = getDb();
  
  // 1. Get admin user for context
  const adminUser = await db.select().from(users).where(eq(users.email, "admin@waftch.com")).limit(1);
  if (!adminUser || adminUser.length === 0) {
    console.error("Admin user not found. Cannot run authenticated tests.");
    process.exit(1);
  }
  const user = adminUser[0];
  
  const ctx = {
    req: {} as any,
    res: {} as any,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      permissions: [],
      branchId: user.branchId,
    }
  };

  const caller = appRouter.createCaller(ctx);
  
  try {
    // --- TEST 1: Daily Report Create ---
    console.log("\n[TEST 1] Creating Daily Report...");
    const reportDate = new Date().toISOString().split("T")[0];
    const dailyReport = await caller.construction.siteDailyReportCreate({
      projectId: 1, 
      reportDate: reportDate,
      reportNumber: `DR-TEST-${Date.now()}`,
      weatherCondition: "sunny",
      temperature: "35",
      workDescription: "E2E Test Activity - Automated backend validation",
      laborCount: 15,
      supervisorName: "E2E Supervisor",
      notes: "No issues",
      status: "draft"
    });
    console.log("✅ Daily Report created with ID:", dailyReport.id);

    // --- TEST 2: WBS Create ---
    console.log("\n[TEST 2] Creating WBS Item...");
    const wbsItem = await caller.construction.wbsCreate({
      projectId: 1,
      code: `WBS.TEST.${Math.floor(Math.random() * 1000)}`,
      name: "E2E Test WBS Element",
      level: 2,
      description: "E2E Testing of WBS creation",
      status: "planned"
    });
    console.log("✅ WBS Item created with ID:", wbsItem.id);

    // --- TEST 3: Supplier Create ---
    console.log("\n[TEST 3] Creating Supplier...");
    const supplier = await caller.purchase.supplierCreate({
      name: "E2E Test Supplier Ltd",
      email: "supplier@e2etest.com",
      phone: "+966500000000",
      contactPerson: "E2E Contact",
      vatNumber: "300000000000003",
      crNumber: "1010000000",
      status: "active"
    });
    console.log("✅ Supplier created with ID:", supplier.id);

    console.log("\n🎉 ALL E2E DB PERSISTENCE TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test Failed:", error.message || error);
    process.exit(1);
  }
}

runTests();
