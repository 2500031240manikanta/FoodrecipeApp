import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dataDir = join(root, 'data');
const commentsFile = join(dataDir, 'comments.json');
const sessions = new Set();
const port = Number(process.env.PORT || 3001);
const adminEmail = (process.env.ADMIN_EMAIL || 'navadeep292@gmail.com').toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'mani240';
mkdirSync(dataDir, { recursive: true });
if (!existsSync(commentsFile)) writeFileSync(commentsFile, '{}');

const readComments = () => { try { return JSON.parse(readFileSync(commentsFile, 'utf8')); } catch { return {}; } };
const saveComments = value => writeFileSync(commentsFile, JSON.stringify(value, null, 2));
const send = (res, status, value, headers = {}) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers }); res.end(JSON.stringify(value)); };
const bodyOf = req => new Promise((resolve, reject) => { let body = ''; req.on('data', chunk => { body += chunk; if (body.length > 100_000) reject(new Error('Request too large')); }); req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); } }); req.on('error', reject); });
const getToken = req => (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('recipeAdminSession='))?.slice('recipeAdminSession='.length);
const isAdmin = req => { const token = getToken(req); return Boolean(token && sessions.has(token)); };
const constantTimeEquals = (a, b) => { const left = Buffer.from(String(a)); const right = Buffer.from(String(b)); return left.length === right.length && timingSafeEqual(left, right); };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'POST' && url.pathname === '/api/admin/login') {
      const body = await bodyOf(req);
      if (String(body.email || '').toLowerCase() !== adminEmail || !constantTimeEquals(body.password || '', adminPassword)) return send(res, 401, { error: 'Invalid administrator credentials.' });
      const token = randomBytes(32).toString('hex'); sessions.add(token);
      return send(res, 200, { ok: true }, { 'Set-Cookie': `recipeAdminSession=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200` });
    }
    if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
      const token = getToken(req); if (token) sessions.delete(token);
      return send(res, 200, { ok: true }, { 'Set-Cookie': 'recipeAdminSession=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
    }
    if (url.pathname === '/api/admin/comments') {
      if (!isAdmin(req)) return send(res, 403, { error: 'Administrator access required.' });
      return send(res, 200, Object.entries(readComments()).flatMap(([recipeId, list]) => list.map(comment => ({ ...comment, recipeId }))));
    }
    const match = url.pathname.match(/^\/api\/comments\/([^/]+)$/);
    if (match) {
      const recipeId = decodeURIComponent(match[1]); const all = readComments();
      if (req.method === 'GET') return send(res, 200, all[recipeId] || []);
      if (req.method === 'POST') {
        const body = await bodyOf(req); const text = String(body.text || '').trim(); const owner = String(body.owner || '').trim();
        if (!text || text.length > 2000 || !owner || owner.length > 120) return send(res, 400, { error: 'Enter a comment of up to 2,000 characters.' });
        const comment = { id: randomBytes(12).toString('hex'), owner, text, createdAt: new Date().toISOString() };
        all[recipeId] = [...(all[recipeId] || []), comment]; saveComments(all); return send(res, 201, comment);
      }
      if (req.method === 'DELETE') {
        if (!isAdmin(req)) return send(res, 403, { error: 'Administrator access required.' });
        all[recipeId] = (all[recipeId] || []).filter(comment => comment.id !== url.searchParams.get('id'));
        saveComments(all); return send(res, 200, all[recipeId]);
      }
      return send(res, 405, { error: 'Method not allowed.' });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 404, { error: 'Not found.' });
    const dist = join(root, 'dist'); const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = normalize(join(dist, requested)); const safeFile = file.startsWith(dist) && existsSync(file) ? file : join(dist, 'index.html');
    if (!existsSync(safeFile)) return send(res, 503, { error: 'Build the app first with npm run build.' });
    const type = ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json' })[extname(safeFile)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` }); if (req.method === 'HEAD') return res.end(); createReadStream(safeFile).pipe(res);
  } catch (error) { send(res, 400, { error: error.message || 'Request failed.' }); }
}).listen(port, () => console.log(`RecipeHub is available on port ${port}`));
