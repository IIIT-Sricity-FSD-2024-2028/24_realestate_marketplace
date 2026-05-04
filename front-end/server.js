const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const port = Number(process.env.PORT || 5500);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function safeResolve(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const cleanPath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const withoutSlash = cleanPath.replace(/^[/\\]+/, '');
  const candidate = path.join(rootDir, withoutSlash);

  if (!path.extname(candidate)) {
    const htmlCandidate = candidate + '.html';
    if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) return htmlCandidate;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    return path.join(candidate, 'index.html');
  }

  return candidate;
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end();
    return;
  }

  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  const filePath = safeResolve(req.url || '/');
  if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`truEstate frontend running at http://localhost:${port}`);
  console.log(`Serving ${rootDir}`);
});
