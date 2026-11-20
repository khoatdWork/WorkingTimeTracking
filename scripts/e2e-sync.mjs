import { createServer } from "vite";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const fixture = (file) => resolve(`tests/e2e/${file}`);
const server = await createServer({
  configFile: false,
  define: { "process.env.NEXT_PUBLIC_BASE_PATH": JSON.stringify("") },
  server: { host: "127.0.0.1", port: 3101, strictPort: true, watch: { ignored: ["**/.next/**", "**/out/**", "**/output/**"] } },
  resolve: { alias: [
    { find: "@/lib/firebase/client", replacement: fixture("sync-firebase.ts") },
    { find: "firebase/auth", replacement: fixture("sync-firebase.ts") },
    { find: "@", replacement: resolve("src") },
  ] },
  plugins: [{
    name: "sync-cloud-fixture",
    enforce: "pre",
    resolveId(source, importer) {
      if ((source === "./cloud" || source === "./data/cloud") && importer?.replaceAll("\\", "/").includes("/tracking/"))
        return fixture("sync-cloud.ts");
    },
  }],
});
try {
  await server.listen();
  for (const script of ["tests/e2e/sync.py", "tests/e2e/data-safety.py"]) {
    const child = spawn(process.env.PYTHON || "python", [script], {
      stdio: "inherit", env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    process.exitCode = await new Promise((done, fail) => {
      child.on("exit", (code) => done(code ?? 1));
      child.on("error", fail);
    });
    if (process.exitCode) break;
  }
} finally {
  await server.close();
}
