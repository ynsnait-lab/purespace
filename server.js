// Serveur statique minimal pour prévisualiser le site localement.
// Zéro dépendance — utilise uniquement Node.js (http + fs).
// Lance-le avec :  node server.js     (puis http://localhost:3000)

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm':  'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.mp3':  'audio/mpeg',
  '.mp4':  'video/mp4',
  '.wav':  'audio/wav',
  '.ogg':  'audio/ogg',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.txt':   'text/plain; charset=utf-8',
  '.pdf':   'application/pdf',
};

function safeJoin(root, urlPath){
  // Décode l'URL et empêche le path traversal.
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const filePath = path.normalize(path.join(root, decoded));
  if(!filePath.startsWith(root)) return null;
  return filePath;
}

const server = http.createServer((req, res) => {
  let filePath = safeJoin(ROOT, req.url === '/' ? '/index.html' : req.url);
  if(!filePath){
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stat) => {
    if(err){
      res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
      res.end('404 — ' + req.url);
      return;
    }
    // Si c'est un dossier, on tente index.html à l'intérieur.
    if(stat.isDirectory()) filePath = path.join(filePath, 'index.html');

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=0, must-revalidate',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n  PureSpace dev server ready  →  http://localhost:${PORT}\n`);
});
