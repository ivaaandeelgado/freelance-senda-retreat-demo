import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
const types={'.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf'};
const assetMap=new Map();
for(const file of await readdir('public/assets')){
 const type=types[path.extname(file)];if(!type)continue;
 const bytes=await readFile('public/assets/'+file);
 assetMap.set(file,'data:'+type+';base64,'+bytes.toString('base64'));
}
const bundled=await build({
 entryPoints:['public/js/app.js'],bundle:true,format:'iife',target:'es2022',write:false,minify:false,
 plugins:[{name:'portable-local-assets',setup(builder){
  builder.onLoad({filter:/catalog\.js$/},async args=>{
   let source=await readFile(args.path,'utf8');
   for(const [name,url] of assetMap)source=source.replaceAll("'"+name+"'",JSON.stringify(url));
   return {contents:source,loader:'js',resolveDir:path.dirname(args.path)};
  });
  builder.onLoad({filter:/app\.js$/},async args=>({contents:(await readFile(args.path,'utf8')).replaceAll('./assets/',''),loader:'js',resolveDir:path.dirname(args.path)}));
 }}]
});
let css=await readFile('public/styles.css','utf8');
css=css.replace(/url\(['"]?\.\/assets\/([^)'"]+)['"]?\)/g,(_,file)=>'url("'+assetMap.get(file)+'")');
let html=await readFile('public/index.html','utf8');
html=html.replace(/\s*<link rel="preload"[^>]*>/g,'');
html=html.replace('<link rel="stylesheet" href="./styles.css">',()=>'<style>\n'+css+'\n</style>');
html=html.replace('<script type="module" src="./js/app.js"></script>','');
html=html.replace(/(?:src|href)="\.\/assets\/([^"]+)"/g,(match,file)=>match.split('=')[0]+'="'+assetMap.get(file)+'"');
const script=bundled.outputFiles[0].text.replaceAll('</script','<\\/script');
html=html.replace('</body>',()=>'<script>\n'+script+'\n</script>\n</body>');
await mkdir('exports',{recursive:true});
await writeFile('exports/Senda-OpenDesign.html',html);
console.log('Portable HTML: exports/Senda-OpenDesign.html ('+(Buffer.byteLength(html)/1024/1024).toFixed(2)+' MB)');

