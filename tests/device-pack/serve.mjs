import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { URL, fileURLToPath } from "node:url";
import { dirname, resolve, sep, extname } from "node:path";
import console from "node:console";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "site");
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const path = resolve(root, "." + decodeURIComponent(url.pathname === "/" ? "/tests/device-pack/device-check.html" : url.pathname));
    if (!path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const data = await readFile(path);
    response.writeHead(200, { "Content-Type": types[extname(path)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    response.end(data);
  } catch { response.writeHead(404).end("Not found"); }
});
server.listen(4180, "127.0.0.1", () => console.log("Open http://127.0.0.1:4180 in the browser being tested. Ctrl+C stops this owned server."));
server.on("error", (error) => { console.error(error.message); process.exitCode = 1; server.close(); });
