import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHomework } from "./homework-server/api.mjs";

const homework = await createHomework();

const root = resolve(
  process.env.STATIC_DIR || dirname(fileURLToPath(import.meta.url)),
);
const types = {
  ".mjs": "text/javascript; charset=utf-8",
  ".wasm": "application/wasm",
  ".bcmap": "application/octet-stream",
  ".pfb": "application/octet-stream",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};
const pages = new Set([
  "index.html",
  "apps.js",
  "hub.js",
  "hub.css",
  "premium.css",
  "mobile.css",
  "courses.css",
  "floating.css",
  "motion.js",
  "artwork.css",
  "使用说明.txt",
]);
const compressed = new Map();
const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (await homework(request, response)) return;
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (pathname === "/health") {
      response
        .writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        })
        .end(request.method === "HEAD" ? undefined : '{"ok":true}');
      return;
    }
    const relative =
      pathname === "/"
        ? "index.html"
        : ["/homework", "/homework/"].includes(pathname)
          ? "homework/index.html"
          : pathname.slice(1);
    const file = resolve(root, relative);
    const homeworkAsset = [
      "homework/index.html",
      "homework/app.js",
      "homework/style.css", "homework/workspace.css", "homework/workspace-ui.js",
      "homework/nav.js","homework/learning-model.js","homework/learning-ui.js","homework/pdf-reader.js",
    ].includes(relative);
    if (
      !(
        pages.has(relative) ||
        homeworkAsset ||
        (relative.startsWith("assets/") &&
          !relative.split("/").some((part) => part.startsWith(".")))
      ) ||
      !file.startsWith(root + sep) ||
      !types[extname(file)]
    ) {
      response.writeHead(404).end();
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) {
      response.writeHead(404).end();
      return;
    }
    const etag = `W/"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}"`;
    response.setHeader("ETag", etag);
    response.setHeader(
      "Cache-Control",
      /-[a-f0-9]{8}\.webp$/.test(relative)
        ? "public, max-age=31536000, immutable"
        : relative.startsWith("assets/")
          ? "public, max-age=300, must-revalidate"
          : "no-cache",
    );
    const compressible =
      /\.(html|css|m?js|svg|txt)$/.test(file) && info.size > 512;
    if (compressible) response.setHeader("Vary", "Accept-Encoding");
    if (request.headers["if-none-match"] === etag) {
      response.writeHead(304).end();
      return;
    }
    const acceptsGzip = (request.headers["accept-encoding"] || "")
      .split(",")
      .some((value) => {
        const [encoding, ...params] = value.trim().toLowerCase().split(";");
        const quality = params.find((param) => param.trim().startsWith("q="));
        return (
          encoding === "gzip" &&
          (!quality || Number(quality.trim().slice(2)) > 0)
        );
      });
    if (compressible && acceptsGzip) {
      let cached = compressed.get(file);
      if (cached?.etag !== etag) {
        cached = { etag, body: gzipSync(await readFile(file)) };
        compressed.set(file, cached);
      }
      response.writeHead(200, {
        "Content-Type": types[extname(file)],
        "Content-Encoding": "gzip",
        "Content-Length": cached.body.length,
      });
      response.end(request.method === "HEAD" ? undefined : cached.body);
      return;
    }
    response.writeHead(200, {
      "Content-Type": types[extname(file)],
      "Content-Length": info.size,
    });
    if (request.method === "HEAD") response.end();
    else
      createReadStream(file)
        .on("error", () => response.destroy())
        .pipe(response);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404).end();
  }
});
server.listen(Number(process.env.PORT || 8080), "0.0.0.0", () =>
  console.log(
    `Mike economics hub listening on port ${process.env.PORT || 8080}`,
  ),
);
process.on("SIGTERM", () => server.close(() => process.exit(0)));
