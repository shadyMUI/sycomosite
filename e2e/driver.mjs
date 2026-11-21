/**
 * e2e/driver.mjs
 * High-level browser and page interaction driver for E2E tests
 */

import { launchChrome, createPageSession } from "./cdp.mjs";

export class TestDriver {
  constructor() {
    this.browser = null;
    this.session = null;
    this.errors = [];
    this.consoleLogs = [];
  }

  async init(options = {}) {
    this.browser = await launchChrome(options);
    await this.newPage();
  }

  async newPage(url = "about:blank") {
    if (this.session) {
      await this.session.close();
      this.session = null;
    }
    this.errors = [];
    this.consoleLogs = [];

    this.session = await createPageSession(this.browser, url);

    // Track runtime exceptions and console errors
    this.session.on("Runtime.exceptionThrown", (params) => {
      const desc = params.exceptionDetails?.exception?.description ||
                   params.exceptionDetails?.text ||
                   "Unknown exception";
      this.errors.push(`Uncaught exception: ${desc}`);
    });

    this.session.on("Runtime.consoleAPICalled", (params) => {
      const type = params.type;
      const text = params.args.map((a) => a.value ?? a.description ?? "").join(" ");
      this.consoleLogs.push({ type, text });
      if (type === "error") {
        this.errors.push(`Console error: ${text}`);
      }
    });

    return this.session;
  }

  async setViewport({ width, height, deviceScaleFactor = 1, isMobile = false }) {
    await this.session.send("Emulation.setDeviceMetricsOverride", {
      width: Math.round(width),
      height: Math.round(height),
      deviceScaleFactor,
      mobile: isMobile,
      screenOrientation: {
        angle: 0,
        type: height >= width ? "portraitPrimary" : "landscapePrimary",
      },
    });
    // Brief settle time for media queries to take effect
    await this.sleep(100);
  }

  async setReducedMotion(enabled) {
    await this.session.send("Emulation.setEmulatedMedia", {
      media: "",
      features: [
        {
          name: "prefers-reduced-motion",
          value: enabled ? "reduce" : "no-preference",
        },
      ],
    });
    await this.sleep(100);
  }

  async goto(url, options = {}) {
    const timeout = options.timeout || 10000;
    const waitUntil = options.waitUntil || "load"; // "load" | "domready"

    return new Promise(async (resolve, reject) => {
      let isDone = false;
      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          cleanup();
          reject(new Error(`Navigation to ${url} timed out after ${timeout}ms`));
        }
      }, timeout);

      const offLoad = this.session.on("Page.loadEventFired", () => {
        if (!isDone) {
          isDone = true;
          cleanup();
          resolve();
        }
      });

      const offDom = this.session.on("Page.domContentEventFired", () => {
        if (waitUntil === "domready" && !isDone) {
          isDone = true;
          cleanup();
          resolve();
        }
      });

      const cleanup = () => {
        clearTimeout(timer);
        offLoad();
        offDom();
      };

      try {
        await this.session.send("Page.navigate", { url });
      } catch (err) {
        cleanup();
        reject(err);
      }
    });
  }

  async reload() {
    await this.session.send("Page.reload", { ignoreCache: true });
    await this.waitForLoad();
  }

  async waitForLoad(timeout = 10000) {
    return new Promise((resolve, reject) => {
      let isDone = false;
      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          off();
          reject(new Error(`Page load wait timed out after ${timeout}ms`));
        }
      }, timeout);

      const off = this.session.on("Page.loadEventFired", () => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          off();
          resolve();
        }
      });
    });
  }

  async evaluate(fnOrCode, ...args) {
    const code =
      typeof fnOrCode === "function"
        ? `(${fnOrCode.toString()})(${args.map((a) => JSON.stringify(a)).join(",")})`
        : fnOrCode;

    const res = await this.session.send("Runtime.evaluate", {
      expression: code,
      returnByValue: true,
      awaitPromise: true,
    });

    if (res.exceptionDetails) {
      const err =
        res.exceptionDetails.exception?.description ||
        res.exceptionDetails.text ||
        "Evaluation failed";
      throw new Error(`Page evaluation error: ${err}`);
    }

    return res.result?.value;
  }

  async waitForFunction(fnOrCode, timeout = 5000, pollInterval = 50) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const result = await this.evaluate(fnOrCode);
        if (result) return result;
      } catch {}
      await this.sleep(pollInterval);
    }
    throw new Error(`waitForFunction timed out after ${timeout}ms: ${fnOrCode.toString()}`);
  }

  async waitForSelector(selector, timeout = 5000) {
    return this.waitForFunction(
      `Boolean(document.querySelector(${JSON.stringify(selector)}))`,
      timeout
    );
  }

  async click(selector) {
    return this.evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error("Element not found for selector: " + ${JSON.stringify(selector)});
        el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
        el.click();
        return true;
      })()
    `);
  }

  async scrollTo({ top = 0, left = 0, behavior = "instant" }) {
    return this.evaluate(`window.scrollTo({ top: ${Number(top)}, left: ${Number(left)}, behavior: ${JSON.stringify(behavior)} })`);
  }

  async scrollBy({ top = 0, left = 0, behavior = "instant" }) {
    return this.evaluate(`window.scrollBy({ top: ${Number(top)}, left: ${Number(left)}, behavior: ${JSON.stringify(behavior)} })`);
  }

  async getScrollState() {
    return this.evaluate(`({
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight
    })`);
  }

  async getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
    this.consoleLogs = [];
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async captureScreenshot() {
    const res = await this.session.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
    });
    return res.data; // Base64 string
  }

  async close() {
    if (this.session) {
      try {
        await this.session.close();
      } catch {}
      this.session = null;
    }
    if (this.browser) {
      try {
        await this.browser.close();
      } catch {}
      this.browser = null;
    }
  }
}
