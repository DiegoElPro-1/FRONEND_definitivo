const http = require('http');
const fs = require('fs');
const path = require('path');
const m = {
  'js': 'application/javascript',
  'css': 'text/css',
  'html': 'text/html',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'svg': 'image/svg+xml',
  'ico': 'image/x-icon',
  'json': 'application/json'
};
http.createServer((req, res) => {
  const p = req.url === '/' ? 'index.html' : req.url;
  let f = path.join('build', p);
  fs.readFile(f, (e, d) => {
    if (e) {
      if (path.extname(p)) {
        res.writeHead(404); res.end('Not found'); return;
      }
      f = path.join('build', 'index.html');
      fs.readFile(f, (e2, d2) => {
        if (e2) { res.writeHead(500); res.end('Server error'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': m[path.extname(f).slice(1)] || 'text/plain' });
    res.end(d);
  });
}).listen(3000, () => console.log('Build serving on :3000'));
