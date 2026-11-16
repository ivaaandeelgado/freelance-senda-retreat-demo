from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen
import hashlib, json, re

root = Path(__file__).resolve().parents[1]
out = root / "public" / "assets"
out.mkdir(parents=True, exist_ok=True)
sources = [
 ("hero-lake.webp", "photo-1470770841072-f978cf4d019e", 1920, 1120),
 ("cabin-forest.webp", "photo-1510798831971-661eb04b3739", 960, 800),
 ("cabin-stone.webp", "photo-1449158743715-0a90ebb6d2d8", 960, 800),
 ("forest.webp", "photo-1441974231531-c6227db76b6e", 1400, 1000),
 ("coast.webp", "photo-1507525428034-b723cf961d3e", 1400, 1000),
 ("mountain.webp", "photo-1464822759023-fed622ff2c3b", 1200, 900),
 ("cabin-house.webp", "photo-1449844908441-8829872d2607", 960, 800),
]
def fetch(url):
 req = Request(url, headers={"User-Agent":"Mozilla/5.0"})
 with urlopen(req, timeout=45) as response:
  return response.read()
def photograph(item):
 name, ident, width, height = item
 url = f"https://images.unsplash.com/{ident}?auto=format&fit=crop&w={width}&h={height}&q=82&fm=webp"
 content = fetch(url)
 if content[:4] != b"RIFF" or content[8:12] != b"WEBP": raise ValueError(name + " is not WebP")
 (out/name).write_bytes(content)
 return {"file":"assets/"+name,"url":url,"license":"https://unsplash.com/license","use":"Illustrative atmosphere photo for a fictional portfolio concept; not the actual named property.","bytes":len(content),"sha256":hashlib.sha256(content).hexdigest()}
with ThreadPoolExecutor(max_workers=4) as pool:
 records = list(pool.map(photograph, sources))
font_url = "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Public+Sans:wght@400;500;600;700&display=swap"
css = fetch(font_url).decode("utf-8")
(root/"docs"/"design-sources"/"google-fonts-original.css").write_text(css, encoding="utf-8")
font_records = []
for family, slug in [("Archivo Black","archivo-black"),("Public Sans","public-sans")]:
 blocks = [block for block in css.split("}") if "font-family: '"+family+"'" in block]
 seen = {}
 for block in blocks:
  match = re.search(r"url\((https://[^)]+)\)",block)
  if not match: continue
  url = match.group(1)
  # Google's simple user-agent response may return TTF; preserve the real extension.
  name = slug + "-" + str(len(seen)+1) + (".woff2" if ".woff2" in url else ".ttf")
  if url in seen: continue
  content=fetch(url); (out/name).write_bytes(content); seen[url]=name
  font_records.append({"family":family,"file":"assets/"+name,"url":url,"bytes":len(content),"weight":re.search(r"font-weight:\s*([^;]+)",block).group(1)})
licenses = [
 ("Archivo-Black-OFL.txt","https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/OFL.txt"),
 ("Public-Sans-OFL.txt","https://raw.githubusercontent.com/google/fonts/main/ofl/publicsans/OFL.txt"),
 ("Impeccable-LICENSE.txt","https://raw.githubusercontent.com/pbakaus/impeccable/d41d9860b0094dcb68030657da63461212835aaa/LICENSE"),
 ("OpenDesign-LICENSE.txt","https://raw.githubusercontent.com/nexu-io/open-design/84dd08b5709bfa4bf4108ece8424d15e4062c982/LICENSE"),
]
for name,url in licenses:
 (root/"docs"/"design-sources"/name).write_bytes(fetch(url))
(root/"docs"/"asset-provenance.json").write_text(json.dumps({"photographs":records,"fonts":font_records},indent=2),encoding="utf-8")
print(json.dumps({"photos":records,"fonts":font_records},indent=2))

