const http = require('http');

const TARGET_HOST = 'identity.hoaiminh.vn';

module.exports = async function handler(req, res) {
  const proxyPath = req.url.replace(/^\/api\/proxy-identity/, '') || '/';

  const headers = { ...req.headers };
  delete headers['host'];
  delete headers['connection'];
  headers['host'] = TARGET_HOST;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Company, Language, Data-Type, Priority');

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
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            res.setHeader(key, value);
          }
        }
        res.setHeader('Access-Control-Allow-Origin', '*');

        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          res.end(Buffer.concat(chunks));
          resolve();
        });
      }
    );

    proxyReq.on('error', (err) => {
      console.error('Identity proxy error:', err.message);
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'Identity proxy error', details: err.message }));
      resolve();
    });

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
