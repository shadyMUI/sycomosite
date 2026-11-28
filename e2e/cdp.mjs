/**
 * e2e/cdp.mjs
 * Lightweight, zero-dependency Chrome DevTools Protocol (CDP) client
 * Runs using standard Node.js APIs and native headless Chrome.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

/**
 * Finds an open TCP port
 */
export async function getFreePort(startPort = 9333) {
  for (let port = startPort; port < startPort + 100; port++) {
    const isFree = await new Promise((resolve) => {
      const server = net.createServer();
      server.unref();
      server.on("error", () => resolve(false));
      server.listen(port, "127.0.0.1", () => {
        server.close(() => resolve(true));
      });
    });
    if (isFree) return port;
  }
  throw new Error("Could not find an available port for Chrome DevTools");
}

/**
 * Launches Chrome in headless mode with remote debugging enabled
 */
export async function launchChrome(options = {}) {
  const chromePath =
    options.chromePath ||
    process.env.CHROME_PATH ||
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : "/usr/bin/google-chrome");
  const port = options.port || (await getFreePort(9333));
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sycomo-e2e-"));

  const args = [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--disable-default-apps",
    "--disable-extensions",
    "--disable-sync",
    "--disable-translate",
    "--mute-audio",
    "--no-first-run",
    "--safebrowsing-disable-auto-update",
    "about:blank",
  ];

  const proc = spawn(chromePath, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Wait for DevTools port to become ready
  let versionInfo = null;
  const start = Date.now();
  while (Date.now() - start < 10000) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        versionInfo = await res.json();
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  if (!versionInfo) {
    proc.kill("SIGKILL");
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
    throw new Error(`Headless Chrome failed to start on port ${port} within 10s`);
  }

  const browser = {
    port,
    proc,
    tmpDir,
    versionInfo,
    async close() {
      try {
        proc.kill("SIGTERM");
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            try {
              proc.kill("SIGKILL");
            } catch {}
            resolve();
          }, 3000);
          proc.on("exit", () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      } catch {}

      // Cleanup tmp dir with retries
      for (let i = 0; i < 10; i++) {
        try {
          fs.rmSync(tmpDir, { recursive: true, force: true });
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    },
  };

  return browser;
}

/**
 * Creates a CDP Session connected to a specific page target
 */
export async function createPageSession(browser, initialUrl = "about:blank") {
  // Create target via HTTP API
  const newTargetUrl = `http://127.0.0.1:${browser.port}/json/new?${encodeURIComponent(initialUrl)}`;
  const res = await fetch(newTargetUrl, { method: "PUT" });
  if (!res.ok) {
    throw new Error(`Failed to create page target: ${res.statusText}`);
  }
  const target = await res.json();

  if (typeof WebSocket === "undefined") {
    throw new Error("WebSocket is not defined. Ensure Node was started with --experimental-websocket.");
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let messageId = 1;
  const pendingRequests = new Map();
  const eventListeners = new Map();

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.id && pendingRequests.has(data.id)) {
        const { resolve, reject } = pendingRequests.get(data.id);
        pendingRequests.delete(data.id);
        if (data.error) {
          reject(new Error(data.error.message || JSON.stringify(data.error)));
        } else {
          resolve(data.result);
        }
      } else if (data.method) {
        const listeners = eventListeners.get(data.method) || [];
        for (const fn of listeners) {
          try {
            fn(data.params);
          } catch (e) {
            console.error("Error in CDP event listener:", e);
          }
        }
      }
    } catch (err) {
      console.error("Error parsing CDP message:", err);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  function on(eventName, handler) {
    if (!eventListeners.has(eventName)) {
      eventListeners.set(eventName, []);
    }
    eventListeners.get(eventName).push(handler);
    return () => {
      const list = eventListeners.get(eventName) || [];
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    };
  }

  // Enable essential domains
  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");

  const session = {
    targetId: target.id,
    ws,
    send,
    on,
    async close() {
      try {
        ws.close();
      } catch {}
      try {
        await fetch(`http://127.0.0.1:${browser.port}/json/close/${target.id}`);
      } catch {}
    },
  };

  return session;
}
