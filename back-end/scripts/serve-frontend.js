const http = require('http');
const fs = require('fs');
const path = require('path');

// The React frontend's production build (run `npm run build:frontend` first).
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'front-end', 'dist');
// Client-side routes (no file extension, or an old *.html page) get index.html.
const ASSET_EXTENSION = /\.(js|mjs|css|map|json|png|jpe?g|gif|svg|webp|ico|txt|woff2?|ttf|pdf)$/i;

const APPS = {
  admin: {
    name: 'Admin App',
    port: 3001,
    entry: 'admin/login',
  },
  superuser: {
    name: 'Superuser App',
    port: 3002,
    entry: 'superuser/login',
  },
  agent: {
    name: 'Agent/Seller App',
    port: 3003,
    entry: 'seller',
  },
  buyer: {
    name: 'Buyer/Customer App',
    port: 3004,
    entry: '',
  }
};

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
      res.end(error.code === 'ENOENT' ? 'Not Found' : 'Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    });
    res.end(data);
  });
}

function createStaticServer(appConfig) {
  return http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const requestedPath = decodeURIComponent(url.pathname);
    const relativePath = requestedPath === '/' ? appConfig.entry : requestedPath.replace(/^\/+/, '');
    const resolvedPath = path.resolve(FRONTEND_DIR, relativePath);

    if (!resolvedPath.startsWith(FRONTEND_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    sendFile(res, resolvedPath);
  });
}

function startAllApps() {
  Object.values(APPS).forEach(appConfig => {
    const server = createStaticServer(appConfig);
    server.listen(appConfig.port, '127.0.0.1', () => {
      console.log(`${appConfig.name} running at http://127.0.0.1:${appConfig.port}`);
    });
  });
}

startAllApps();
