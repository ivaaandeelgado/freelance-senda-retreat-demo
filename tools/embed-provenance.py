from pathlib import Path
import json, subprocess, hashlib
root=Path(__file__).resolve().parent.parent
manifest_path=root/'docs/asset-provenance.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
version=(root/'.agents/skills/impeccable/scripts/VERSION').read_text().strip()
engine=Path.home()/'.impeccable/bin'/version/'impeccable.exe'
if not engine.is_file(): raise SystemExit('Verified Impeccable runtime not found')
for photo in manifest['photographs']:
    file=root/'public'/photo['file']
    origin='SOURCE: '+photo['url']+' | LICENSE: '+photo['license']+' | USE: '+photo['use']
    subprocess.run([str(engine),'embed-prompt',str(file),'--prompt',origin],check=True)
    photo['download_sha256']=photo.get('download_sha256',photo['sha256'])
    photo['sha256']=hashlib.sha256(file.read_bytes()).hexdigest()
    photo['bytes']=file.stat().st_size
    photo.pop('embedded_origin',None)
    photo['provenance_storage']='Impeccable WebP JSON sidecar alongside the image'
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
detector=root/'.impeccable/review/detector.json'
raw=detector.read_bytes()
data=json.loads(raw.decode('utf-16') if raw.startswith(b'\xff\xfe') else raw.decode('utf-8-sig'))
detector.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Embedded origins and updated hashes for',len(manifest['photographs']),'photos.')

