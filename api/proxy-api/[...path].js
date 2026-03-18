const https = require('http');
const url = require('url');

module.exports = async (req, res) => {
  const targetBase = 'http://puyet1224-001-site1.jtempurl.com';
  const pathMatch = req.url.replace(/^\/api\/proxy-api/, '');
  const targetUrl = targetBase + pathMatch;

  // Basic Auth cho SmarterASP.NET hosting
  const basicAuth = Buffer.from('puyet1224-001:Puyet1224@').toString('base64');

  const headers = { ...req.headers };
  // Thêm Basic Auth header cho hosting
  headers['authorization-hosting'] = `Basic ${basicAuth}`;
  // Giữ nguyên Authorization header từ FE (JWT Bearer token)
  // Xóa host header để tránh lỗi
  delete headers['host'];
  headers['host'] = 'puyet1224-001-site1.jtempurl.com';

  const parsed = url.parse(targetUrl);

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || 80,
    path: parsed.path,
    method: req.method,
    headers: headers,
    auth: 'puyet1224-001:Puyet1224@', // HTTP Basic Auth
  };

  return new Promise((resolve, reject) => {
    const proxyReq = https.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      // Forward response headers
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      let body = [];
      proxyRes.on('data', chunk => body.push(chunk));
      proxyRes.on('end', () => {
        res.end(Buffer.concat(body));
        resolve();
      });
    });

    proxyReq.on('error', (err) => {
      res.status(502).json({ error: 'Proxy error', message: err.message });
      resolve();
    });

    // Forward request body
    if (req.body) {
      const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      proxyReq.write(bodyStr);
    }
    proxyReq.end();
  });
};
