const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

console.log("Using browser at:", executablePath);

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: "shell",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--remote-debugging-port=9222"
      ]
    });
    console.log("Browser opened!");
    const page = await browser.newPage();
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    const title = await page.title();
    console.log("Rendered Page Title:", title);
    await browser.close();
    console.log("Browser closed cleanly!");
  } catch (err) {
    console.error("Browser error:", err);
  }
})();
