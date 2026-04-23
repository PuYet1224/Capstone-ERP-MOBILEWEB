const http = require('http');

const TARGET = 'puyet1224-001-site1.jtempurl.com';
const BASIC = 'Basic ' + Buffer.from('puyet1224-001:Puyet1224@').toString('base64');

module.exports = async (req, res) => {
  const path = req.url.replace(/^\/api\/proxy-api/, '') || '/';

  // Copy headers, preserve Bearer token, add Basic Auth separately
  const h = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (['host','connection','transfer-encoding'].includes(k.toLowerCase())) continue;
    h[k] = v;
  }
  h['host'] = TARGET;
  // SmarterASP Basic Auth goes in a custom header that IIS reads,
  // while the original Authorization (Bearer JWT) stays untouched
  if (!h['authorization']) {
    h['authorization'] = BASIC;
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Company,Language,Data-Type,Priority');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  return new Promise((resolve) => {
    const opts = { hostname: TARGET, port: 80, path, method: req.method, headers: h };

    // SmarterASP needs Basic Auth at transport level
    opts.auth = 'puyet1224-001:Puyet1224@';

    const proxy = http.request(opts, (pRes) => {
      res.statusCode = pRes.statusCode;
      for (const [k, v] of Object.entries(pRes.headers)) {
        if (!['transfer-encoding','connection'].includes(k.toLowerCase())) {
          try { res.setHeader(k, v); } catch(e) {}
        }
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      const chunks = [];
      pRes.on('data', c => chunks.push(c));
      pRes.on('end', () => { res.end(Buffer.concat(chunks)); resolve(); });
    });
    proxy.on('error', (e) => {
      res.statusCode = 502;
      res.end(JSON.stringify({error:'proxy error',msg:e.message}));
      resolve();
    });
    if (['GET','HEAD'].includes(req.method)) { proxy.end(); }
    else {
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => { proxy.end(Buffer.concat(chunks)); });
    }
  });
};
