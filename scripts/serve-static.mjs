import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve('out');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.hdr':'application/octet-stream','.txt':'text/plain; charset=utf-8'};
const base=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,'');
await stat(path.join(root,'index.html')).catch(()=>{throw new Error('Chạy npm run build trước khi mở bản production.');});
http.createServer(async(req,res)=>{
  try {
    let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(base&&(url===base||url.startsWith(base+'/')))url=url.slice(base.length)||'/';
    const file=path.resolve(root,'.'+url);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const info=await stat(file);
    const target=info.isDirectory()?path.join(file,'index.html'):file;
    res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');
    res.end(await readFile(target));
  }catch {res.writeHead(404).end('Not found');}
}).listen(Number(process.env.PORT||5173),'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${process.env.PORT||5173}${base}/`));
