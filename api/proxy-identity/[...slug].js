const http = require('http');

const TARGET = 'identity.hoaiminh.vn';

module.exports = async (req, res) => {
  const path = req.url.replace(/^\/api\/proxy-identity/, '') || '/';

  const h = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (['host','connection','transfer-encoding'].includes(k.toLowerCase())) continue;
    h[k] = v;
  }
  h['host'] = TARGET;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Company,Language,Data-Type,Priority');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  return new Promise((resolve) => {
    const proxy = http.request(
      { hostname: TARGET, port: 80, path, method: req.method, headers: h },
      (pRes) => {
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
      }
    );
    proxy.on('error', (e) => {
      res.statusCode = 502;
      res.end(JSON.stringify({error:'identity proxy error',msg:e.message}));
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
