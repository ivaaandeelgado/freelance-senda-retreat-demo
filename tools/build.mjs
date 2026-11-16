import { cp, mkdir, readdir, stat } from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true,force:true});
async function size(dir){let total=0;for(const f of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+f.name;total+=f.isDirectory()?await size(p):(await stat(p)).size;}return total;}
console.log(JSON.stringify({built:'dist',bytes:await size('dist')}));

