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
      if (source === "./cloud" && importer?.replaceAll("\\", "/").includes("/tracking/data/"))
        return fixture("sync-cloud.ts");
    },
  }],
});
try {
  await server.listen();
  const child = spawn(process.env.PYTHON || "python", ["tests/e2e/sync.py"], {
    stdio: "inherit", env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  process.exitCode = await new Promise((done, fail) => {
    child.on("exit", (code) => done(code ?? 1));
    child.on("error", fail);
  });
} finally {
  await server.close();
}
