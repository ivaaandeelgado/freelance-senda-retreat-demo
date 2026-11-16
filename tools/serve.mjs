import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(process.argv.includes('--dist') ? 'dist' : 'public');
const port = Number(process.env.PORT || 4328);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf'};
const server = http.createServer(async (req, res) => {
  try {
    const route = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root, '.' + (route === '/' ? '/index.html' : route));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403);res.end('Forbidden');return; }
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not found');
    const bytes = await readFile(file);
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(bytes);
  } catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Página no encontrada'); }
});
server.listen(port,'127.0.0.1',()=>process.stdout.write('Senda: http://127.0.0.1:'+port+'\n'));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));

