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
  let f = path.join('build', req.url === '/' ? 'index.html' : req.url);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': m[path.extname(f).slice(1)] || 'text/plain' });
    res.end(d);
  });
}).listen(3000, () => console.log('Build serving on :3000'));
