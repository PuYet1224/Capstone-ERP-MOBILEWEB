const http = require('http');
const url = require('url');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(200).end();
    return;
  }

  const targetBase = 'http://puyet1224-001-site1.jtempurl.com';
  const pathMatch = req.url.replace(/^\/api\/proxy-api/, '');
  const targetUrl = targetBase + pathMatch;

  // Chuẩn bị body
  let bodyBuffer = null;
  if (req.body && req.method !== 'GET') {
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    bodyBuffer = Buffer.from(bodyStr, 'utf-8');
  }

  // Copy headers cần thiết
  const headers = {};
  ['content-type', 'authorization', 'accept', 'accept-language', 'x-test-user', 'company', 'datapermission'].forEach(h => {
    if (req.headers[h]) headers[h] = req.headers[h];
  });
  headers['host'] = 'puyet1224-001-site1.jtempurl.com';
  if (bodyBuffer) {
    headers['content-length'] = bodyBuffer.length;
  }

  const parsed = url.parse(targetUrl);

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || 80,
    path: parsed.path,
    method: req.method,
    headers: headers,
    auth: 'puyet1224-001:Puyet1224@',
  };

  return new Promise((resolve) => {
    const proxyReq = http.request(options, (proxyRes) => {
      const respHeaders = {};
      Object.keys(proxyRes.headers).forEach(key => {
        if (key !== 'transfer-encoding') {
          respHeaders[key] = proxyRes.headers[key];
        }
      });
      respHeaders['access-control-allow-origin'] = '*';
      respHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      respHeaders['access-control-allow-headers'] = '*';

      let body = [];
      proxyRes.on('data', chunk => body.push(chunk));
      proxyRes.on('end', () => {
        const data = Buffer.concat(body);
        res.writeHead(proxyRes.statusCode, respHeaders);
        res.end(data);
        resolve();
      });
    });

    proxyReq.on('error', (err) => {
      res.status(502).json({ error: 'Proxy error', message: err.message });
      resolve();
    });

    if (bodyBuffer) {
      proxyReq.write(bodyBuffer);
    }
    proxyReq.end();
  });
};
