import { existsSync } from 'fs';
import { join } from 'path';
import { NextFunction, Request, Response } from 'express';

/**
 * Serves the React app's index.html for client-side routes.
 *
 * The frontend is a single-page app (front-end/dist): `/admin/login`,
 * `/seller/billing` and the old `/admin-dashboard.html` style URLs are not
 * files on disk — React Router draws them in the browser. Without this, a
 * refresh or a bookmarked deep link would 404 before React ever loaded.
 *
 * Only browser page loads are answered: GET/HEAD requests that accept HTML,
 * outside the API, Swagger, uploads and the health probe, and that don't look
 * like a missing asset file (a request for `/missing.js` should still 404).
 */
const SKIPPED_PREFIXES = ['/api', '/uploads', '/health'];
// Real files (scripts, images, fonts…) are served by useStaticAssets first;
// one that wasn't found must 404 rather than receive the HTML page.
// `.html` is deliberately not listed — old page URLs are React routes now.
const ASSET_EXTENSION = /\.(js|mjs|css|map|json|png|jpe?g|gif|svg|webp|ico|txt|woff2?|ttf|pdf)$/i;

export function createSpaFallback(frontendDir: string) {
  const indexFile = join(frontendDir, 'index.html');

  return function spaFallback(req: Request, res: Response, next: NextFunction): void {
    const path = req.path ?? req.originalUrl;
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (SKIPPED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return next();
    if (ASSET_EXTENSION.test(path)) return next();
    if (!req.accepts('html')) return next();

    // A missing build is a setup problem worth saying plainly, not a blank 404.
    if (!existsSync(indexFile)) {
      res
        .status(503)
        .type('text/plain')
        .send('The React frontend has not been built yet. Run "npm run build:frontend" from the project root.');
      return;
    }
    res.sendFile(indexFile);
  };
}
