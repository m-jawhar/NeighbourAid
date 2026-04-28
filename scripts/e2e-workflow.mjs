import { chromium } from "playwright-core";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const CRISIS_ID = process.env.CRISIS_ID || "c001";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password";
const VOL_PHONE_E164 = process.env.TEST_VOL_PHONE || "+919496619579";
const VOL_PHONE_LOCAL = VOL_PHONE_E164.replace(/^\+91/, "").replace(/\D/g, "");
const VOL_EMAIL = `volunteer_${Date.now()}@example.com`;
const VOL_PASSWORD = process.env.TEST_VOL_PASSWORD || "Password123!";
const VOL_NAME = "Test Volunteer";
const GEO = { latitude: 10.0559, longitude: 76.6497 };

if (VOL_PHONE_LOCAL.length !== 10) {
  throw new Error(`Expected a 10-digit Indian phone, got "${VOL_PHONE_E164}"`);
}

const requests = [];

function logStep(message) {
  console.log(`[STEP] ${message}`);
}

async function waitForApp(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("link", { name: "Register as Responder" })
    .waitFor({ timeout: 30000 });
}

async function registerVolunteer(page) {
  logStep("Register volunteer");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "domcontentloaded" });

  await page.getByLabel("Name").fill(VOL_NAME);
  await page.getByLabel("Email").fill(VOL_EMAIL);
  await page.getByLabel("Password").fill(VOL_PASSWORD);
  await page.getByLabel("Phone").fill(VOL_PHONE_LOCAL);
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Swimmer", exact: true }).click();
  await page.getByRole("button", { name: "First Aid", exact: true }).click();
  await page.getByRole("button", { name: "Boat", exact: true }).click();
  await page.getByRole("button", { name: "Malayalam", exact: true }).click();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Allow location access" }).click();
  await page
    .getByRole("button", { name: "Location captured" })
    .waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Complete registration" }).click();
  await page
    .getByRole("heading", { name: "Your community thanks you" })
    .waitFor({ timeout: 30000 });

  const logoutButton = page.getByRole("button", { name: "Logout" });
  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL("**/", { timeout: 15000 });
  }
}

async function setupAdmin(page) {
  logStep("Setup admin");
  await page.goto(`${BASE_URL}/setup-admin`, { waitUntil: "domcontentloaded" });

  const setupButton = page.getByRole("button", {
    name: "Create Admin Account",
  });
  await setupButton.click();

  const loginUrlPromise = page
    .waitForURL("**/login", { timeout: 15000 })
    .catch(() => null);
  await loginUrlPromise;

  if (!page.url().includes("/login")) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  }
}

async function loginAdmin(page) {
  logStep("Login admin");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page
    .getByText("Admin Console", { exact: false })
    .waitFor({ timeout: 30000 });
}

async function activateBreakGlass(page) {
  logStep("Activate Break-Glass");
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
  const activateButton = page
    .getByRole("button", { name: /ACTIVATE BREAK-GLASS/i })
    .last();
  await activateButton.click();
  await page
    .getByRole("heading", { name: "Confirm Break-Glass activation" })
    .waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL("**/matching**", { timeout: 30000 });
}

async function dispatchMissions(page) {
  logStep("Dispatch missions");
  await page
    .getByText("Gemini Brief", { exact: false })
    .waitFor({ timeout: 60000 });
  const dispatchAll = page.getByRole("button", { name: "Dispatch All" });
  await dispatchAll.click();

  const request = await page.waitForRequest("**/api/whatsapp", {
    timeout: 60000,
  });
  requests.push(request.postData() || "");
  await page.waitForTimeout(4000);
}

async function checkMissionTracker(page) {
  logStep("Mission tracker");
  await page.goto(`${BASE_URL}/missions?crisisId=${CRISIS_ID}`, {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByRole("heading", { name: /Mission Tracker/i })
    .waitFor({ timeout: 30000 });

  const advanceButton = page
    .getByRole("button", { name: "Advance Status" })
    .first();
  if (await advanceButton.isVisible().catch(() => false)) {
    await advanceButton.click();
  }

  await page
    .getByRole("heading", { name: "Audit Log" })
    .waitFor({ timeout: 30000 });
}

async function verifyBackend() {
  try {
    const response = await fetch("http://127.0.0.1:8000/docs");
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Backend not reachable: ${error.message}`);
  }
}

async function main() {
  await verifyBackend();
  const browser = await chromium.launch({ channel: "msedge", headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    geolocation: GEO,
    permissions: ["geolocation"],
  });

  const page = await context.newPage();
  page.on("console", (msg) =>
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`),
  );
  page.on("pageerror", (error) => console.log(`[PAGEERROR] ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      console.log(`[HTTP ${response.status()}] ${response.url()}`);
    }
  });
  page.on("request", (request) => {
    if (
      request.url().includes("/api/whatsapp") &&
      request.method() === "POST"
    ) {
      requests.push(request.postData() || "");
    }
  });

  await waitForApp(page);
  await registerVolunteer(page);
  await setupAdmin(page);
  await loginAdmin(page);
  await activateBreakGlass(page);
  await dispatchMissions(page);
  await checkMissionTracker(page);

  await context.close();
  await browser.close();

  const dispatchPayloads = requests
    .map((payload) => {
      try {
        return JSON.parse(payload);
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);

  const matched = dispatchPayloads.some((payload) =>
    (payload.phone || "").includes(VOL_PHONE_E164),
  );
  console.log("[RESULT] Dispatch payloads:", dispatchPayloads.length);
  console.log(
    `[RESULT] WhatsApp dispatch includes ${VOL_PHONE_E164}: ${matched}`,
  );
}

main().catch((error) => {
  console.error("[FAILED]", error.message);
  process.exit(1);
});
