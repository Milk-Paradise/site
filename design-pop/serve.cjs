const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
http.createServer((req, res) => {
  const routes = {'/': ['index.html', 'text/html; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8']};
  const route = routes[req.url.split('?')[0]];
  if (!route) {res.writeHead(404); res.end(); return;}
  res.writeHead(200, {'Content-Type': route[1]});
  fs.createReadStream(path.join(__dirname, route[0])).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
