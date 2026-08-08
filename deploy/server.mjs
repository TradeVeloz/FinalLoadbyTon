import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = process.env.DIST_DIR || path.resolve(__dirname, '../packages/web/dist');
const PORT = Number(process.env.PORT || 3000);
const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:5000';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

async function proxyApi(req, res) {
  const targetUrl = new URL(req.url, API_TARGET);
  const headers = { ...req.headers };
  headers.host = targetUrl.host;

  const proxyReq = http.request(targetUrl, { method: req.method, headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `API unavailable: ${err.message}` }));
  });

  req.pipe(proxyReq);
}

async function serveStatic(req, res) {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.normalize(path.join(DIST_DIR, pathname));
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    try {
      const index = await readFile(path.join(DIST_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(index);
    } catch {
      res.writeHead(500);
      res.end('Web build not found. Run `npm run build` first.');
    }
  }
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  if (url.startsWith('/api/') || url === '/health' || url.startsWith('/socket.io/')) {
    proxyApi(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Loadbyton web serving ${DIST_DIR}`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  proxying /api -> ${API_TARGET}`);
});
