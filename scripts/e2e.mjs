import { spawn } from "node:child_process";
const port = process.env.E2E_PORT || "3100";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const appUrl = process.env.APP_URL || `http://127.0.0.1:${port}${basePath}/`;
const child = process.env.APP_URL
  ? null
  : spawn(process.execPath, ["scripts/serve-static.mjs"], {
      env: { ...process.env, PORT: port },
      stdio: "inherit",
    });
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(appUrl)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error(`App not ready: ${appUrl}`);
  const test = spawn(process.env.PYTHON || "python", ["tests/e2e/app.py"], {
    env: { ...process.env, APP_URL: appUrl, PYTHONIOENCODING: "utf-8" },
    stdio: "inherit",
  });
  const result = await new Promise((resolve, reject) => {
    test.on("exit", resolve);
    test.on("error", reject);
  });
  process.exitCode = typeof result === "number" ? result : 1;
} finally {
  child?.kill();
}
