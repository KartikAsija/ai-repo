import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACTS_DIR = "C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\36158fe8-7ea2-4394-b6ad-44e3639167cc";
const BASE_URL = "http://127.0.0.1:5173";

async function run() {
  console.log("Launching Edge browser...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,900"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  async function snap(filename) {
    const filePath = path.join(ARTIFACTS_DIR, filename);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved screenshot: ${filePath}`);
  }

  try {
    // 1. Home Page
    console.log("Navigating to Home Page...");
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("01_home_page.png");

    // 2. Profile Page (Jordan Miller)
    console.log("Navigating to Profile Page...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const pBtn = btns.find((b) => b.textContent.includes("Profile"));
      if (pBtn) pBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("02_profile_jordan.png");

    // 3. Comparison Page (Jordan Miller)
    console.log("Navigating to Role Comparison (Jordan)...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const cBtn = btns.find((b) => b.textContent.includes("Role Comparison"));
      if (cBtn) cBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await snap("03_comparison_jordan.png");

    // 4. Roadmap Page (Jordan Miller)
    console.log("Navigating to Roadmap (Jordan)...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const rBtn = btns.find((b) => b.textContent.includes("Roadmap"));
      if (rBtn) rBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await snap("04_roadmap_jordan.png");

    // 5. Dashboard & Replan (Jordan Miller)
    console.log("Navigating to Dashboard & Simulating Jordan Replan (6h -> 3h)...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const dBtn = btns.find((b) => b.textContent.includes("Progress & Replan"));
      if (dBtn) dBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Execute replan for Jordan to 3 hrs/week
    await page.evaluate(async () => {
      const slider = document.querySelector('input[type="range"]');
      if (slider) {
        slider.value = "3";
        slider.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const replanBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Execute Replan")
      );
      if (replanBtn) replanBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2500));
    await snap("05_dashboard_replan_jordan.png");

    // 6. Switch to Learner B (Alex Chen)
    console.log("Switching to Learner B: Alex Chen...");
    await page.evaluate(() => {
      const select = document.querySelector("header select");
      if (select) {
        const opt = Array.from(select.options).find((o) => o.text.includes("Alex"));
        if (opt) {
          select.value = opt.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Role Comparison (Alex Chen)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const cBtn = btns.find((b) => b.textContent.includes("Role Comparison"));
      if (cBtn) cBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await snap("06_comparison_alex.png");

    // 7. Roadmap (Alex Chen)
    console.log("Navigating to Roadmap (Alex Chen)...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const rBtn = btns.find((b) => b.textContent.includes("Roadmap"));
      if (rBtn) rBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await snap("07_roadmap_alex.png");

    // 8. Dashboard & Replan (Alex Chen -> Cloud/DevOps)
    console.log("Navigating to Dashboard & Simulating Alex Career Pivot (Cloud/DevOps)...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const dBtn = btns.find((b) => b.textContent.includes("Progress & Replan"));
      if (dBtn) dBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Pivot Alex to Cloud/DevOps Associate
    await page.evaluate(async () => {
      const selects = Array.from(document.querySelectorAll("select"));
      const roleSelect = selects.find((s) => Array.from(s.options).some((o) => o.value === "cloud_devops_associate"));
      if (roleSelect) {
        roleSelect.value = "cloud_devops_associate";
        roleSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const replanBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent.includes("Execute Replan")
      );
      if (replanBtn) replanBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2500));
    await snap("08_dashboard_replan_alex.png");

    // 9. Traceability Explorer
    console.log("Navigating to Traceability Explorer...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const tBtn = btns.find((b) => b.textContent.includes("Traceability"));
      if (tBtn) tBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await snap("09_traceability.png");

    // 10. Methodology & Limitations
    console.log("Navigating to About & Methodology...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("nav button, header button"));
      const aBtn = btns.find((b) => b.textContent.includes("Methodology"));
      if (aBtn) aBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));
    await snap("10_about_methodology.png");

    console.log("ALL 10 VERIFICATION SCREENSHOTS CAPTURED SUCCESSFULLY!");
  } catch (err) {
    console.error("Browser verification error:", err);
  } finally {
    await browser.close();
  }
}

run();

