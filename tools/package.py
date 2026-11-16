from pathlib import Path
import zipfile, json, hashlib, shutil
root=Path(__file__).resolve().parent.parent
out=root/'exports'
out.mkdir(exist_ok=True)
screens=root/'docs/screenshots'
screens.mkdir(exist_ok=True)
for name in ['desktop','mobile','planner-desktop','saved-plan-mobile','scene-coast']:
    shutil.copy2(root/'.impeccable/review'/f'{name}.png',screens/f'{name}.png')
for name in ['finish-review.md','verdict.md']:
    source=root/'.impeccable/review'/name
    if source.is_file(): shutil.copy2(source,root/'docs'/name)
archive=out/'Senda-codigo-y-demo.zip'
allowed=['public','tools','tests','docs','.agents/skills/impeccable','.impeccable/surfaces']
root_files=['README.md','PRODUCT.md','DESIGN.md','package.json','package-lock.json','playwright.config.mjs','.gitignore','.impeccable/design.json','exports/Senda-OpenDesign.html']
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for relative in root_files:
        file=root/relative
        if file.is_file(): z.write(file,'senda/'+relative)
    for folder in allowed:
        for file in (root/folder).rglob('*'):
            if not file.is_file() or file.suffix in ['.exe','.zip','.pyc']: continue
            if file.name=='finalize-delivery.mjs': continue
            if '__pycache__' in file.parts or 'node_modules' in file.parts: continue
            z.write(file,'senda/'+file.relative_to(root).as_posix())
info={'archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}
(out/'package-manifest.json').write_text(json.dumps(info,indent=2)+'\n',encoding='utf-8')
print(json.dumps(info))

