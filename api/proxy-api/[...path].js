const http = require('http');

const TARGET_HOST = 'puyet1224-001-site1.jtempurl.com';
const BASIC_AUTH = Buffer.from('puyet1224-001:Puyet1224@').toString('base64');

module.exports = async function handler(req, res) {
  // Extract the path after /api/proxy-api/
  const proxyPath = req.url.replace(/^\/api\/proxy-api/, '') || '/';

  // Build headers — forward everything except host, add Basic Auth
  const headers = { ...req.headers };
  delete headers['host'];
  delete headers['connection'];
  headers['authorization'] = 'Basic ' + BASIC_AUTH;
  headers['host'] = TARGET_HOST;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Company, Language, Data-Type, Priority');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  return new Promise((resolve, reject) => {
    const proxyReq = http.request(
      {
        hostname: TARGET_HOST,
        port: 80,
        path: proxyPath,
        method: req.method,
        headers: headers,
      },
      (proxyRes) => {
        res.statusCode = proxyRes.statusCode;

        // Forward response headers
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            res.setHeader(key, value);
          }
        }
        // Ensure CORS on response
        res.setHeader('Access-Control-Allow-Origin', '*');

        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          const body = Buffer.concat(chunks);
          res.end(body);
          resolve();
        });
      }
    );

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'Backend proxy error', details: err.message }));
      resolve();
    });

    // Forward request body
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        proxyReq.end(Buffer.concat(chunks));
      });
    } else {
      proxyReq.end();
    }
  });
};
