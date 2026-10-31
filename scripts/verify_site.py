from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import hashlib,sys
ROOT=Path(__file__).resolve().parent.parent
DIST=ROOT/'dist'
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        for name,value in attrs:
            if name=='href' and value:self.links.append(value)
broken=[]
for path in DIST.rglob('*.html'):
    parser=Links();parser.feed(path.read_text(encoding='utf-8'))
    for href in parser.links:
        u=urlsplit(href)
        if u.scheme or u.netloc or not u.path:continue
        target=(DIST/unquote(u.path).lstrip('/')) if u.path.startswith('/') else (path.parent/unquote(u.path))
        if target.is_dir():target=target/'index.html'
        if not target.exists():broken.append((str(path.relative_to(DIST)),href))
posts=list((ROOT/'src/content/blog').glob('*.md'))
assert len(posts)==16
assert len(list((DIST/'blog').glob('*/index.html')))==len(posts)
assert len(list((DIST/'games').glob('*/index.html')))==18
for name in ['index.html','app.js','arm-model.js','arm-lab.js','content.js','style.css','机器人学期末复习册.docx']:
    assert (DIST/'learn/robotics'/name).exists(),name
if len(sys.argv)>1:
    old=Path(sys.argv[1])/'src/content/blog'
    for p in old.glob('*.md'):assert hashlib.sha256(p.read_bytes()).digest()==hashlib.sha256((ROOT/'src/content/blog'/p.name).read_bytes()).digest(),p.name
    print('All 14 original Markdown files unchanged.')
if broken:
    for x in broken:print('BROKEN',x)
    sys.exit(1)
print(f'Passed: {len(posts)} article routes, 18 game routes, all local hrefs, integrated laboratory assets.')
