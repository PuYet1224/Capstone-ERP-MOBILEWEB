const https = require('http');
const url = require('url');
const querystring = require('querystring');

module.exports = async (req, res) => {
  const targetBase = 'http://identity.hoaiminh.vn';
  const pathMatch = req.url.replace(/^\/api\/proxy-identity/, '');
  const targetUrl = targetBase + pathMatch;

  const headers = { ...req.headers };
  delete headers['host'];
  headers['host'] = 'identity.hoaiminh.vn';

  const parsed = url.parse(targetUrl);

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || 80,
    path: parsed.path,
    method: req.method,
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    const proxyReq = https.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
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
      let bodyStr;
      if (typeof req.body === 'string') {
        bodyStr = req.body;
      } else if (headers['content-type'] && headers['content-type'].includes('x-www-form-urlencoded')) {
        bodyStr = querystring.stringify(req.body);
      } else {
        bodyStr = JSON.stringify(req.body);
      }
      proxyReq.write(bodyStr);
    }
    proxyReq.end();
  });
};
