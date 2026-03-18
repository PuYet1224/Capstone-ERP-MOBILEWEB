const http = require('http');
const url = require('url');
const querystring = require('querystring');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(200).end();
    return;
  }

  const targetBase = 'http://identity.hoaiminh.vn';
  const pathMatch = req.url.replace(/^\/api\/proxy-identity/, '');
  const targetUrl = targetBase + pathMatch;

  // Chuẩn bị body trước để tính Content-Length
  let bodyBuffer = null;
  if (req.body && req.method !== 'GET') {
    let bodyStr;
    const ct = req.headers['content-type'] || '';
    if (typeof req.body === 'string') {
      bodyStr = req.body;
    } else if (ct.includes('x-www-form-urlencoded')) {
      bodyStr = querystring.stringify(req.body);
    } else {
      bodyStr = JSON.stringify(req.body);
    }
    bodyBuffer = Buffer.from(bodyStr, 'utf-8');
  }

  const headers = {};
  // Copy headers cần thiết (bỏ qua headers Vercel thêm vào)
  ['content-type', 'authorization', 'accept', 'accept-language'].forEach(h => {
    if (req.headers[h]) headers[h] = req.headers[h];
  });
  headers['host'] = 'identity.hoaiminh.vn';
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
  };

  return new Promise((resolve) => {
    const proxyReq = http.request(options, (proxyRes) => {
      // Copy response headers
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
