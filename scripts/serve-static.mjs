import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const directory = resolve("out");
const port = Number(process.env.PORT || 3000);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};
createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (
      basePath &&
      (pathname === basePath || pathname.startsWith(basePath + "/"))
    )
      pathname = pathname.slice(basePath.length) || "/";
    const file = resolve(directory, "." + pathname);
    if (file !== directory && !file.startsWith(directory + sep)) {
      response.writeHead(403);
      response.end();
      return;
    }
    const candidates = [file, file + ".html", resolve(file, "index.html")];
    let selected;
    for (const candidate of candidates) {
      try {
        if ((await stat(candidate)).isFile()) {
          selected = candidate;
          break;
        }
      } catch {}
    }
    if (!selected) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": types[extname(selected)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(
      request.method === "HEAD" ? undefined : await readFile(selected),
    );
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Static app http://127.0.0.1:${port}${basePath}`),
);
