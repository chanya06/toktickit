import { spawn } from "child_process";
import http from "http";
import path from "path";

function waitForUrl(url, timeoutMs = 20000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve(true);
        } else {
          retry();
        }
      }).on("error", () => {
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${url}`));
      } else {
        setTimeout(check, 300);
      }
    };

    check();
  });
}

async function main() {
  console.log("Starting mock backend on port 3000...");
  const mockServer = spawn("node", ["scripts/mock-backend-lab4.js"], {
    stdio: "inherit",
    shell: true,
  });

  console.log("Starting client preview server on port 5173...");
  const clientServer = spawn("npx", ["vite", "preview", "--port", "5173", "--strictPort"], {
    cwd: path.resolve("client"),
    stdio: "inherit",
    shell: true,
  });

  const cleanup = () => {
    console.log("Cleaning up child processes...");
    try { mockServer.kill(); } catch (_) {}
    try { clientServer.kill(); } catch (_) {}
  };

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  try {
    console.log("Waiting for servers to become ready...");
    await waitForUrl("http://localhost:3000/api/health");
    await waitForUrl("http://localhost:5173/");
    console.log("Both servers are ready. Launching screenshot capture...");

    await new Promise((resolve, reject) => {
      const captureProcess = spawn("node", ["scripts/capture-all-lab4.js"], {
        stdio: "inherit",
        shell: true,
      });

      captureProcess.on("close", (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`capture-all-lab4.js failed with exit code ${code}`));
        }
      });
    });

    console.log("Screenshots captured successfully!");
  } finally {
    cleanup();
    // Allow clean exit
    setTimeout(() => process.exit(0), 500);
  }
}

main().catch((err) => {
  console.error("Screenshot runner encountered an error:", err);
  process.exit(1);
});

