from pathlib import Path
from PIL import Image
import sys
root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1])
out=root/'public/images/essays';out.mkdir(parents=True,exist_ok=True)
figures=[(1,(118,323,778,709)),(1,(118,893,778,1189)),(2,(118,637,778,1016)),(3,(118,344,778,732)),(4,(118,42,778,341)),(4,(118,589,778,886)),(5,(118,311,778,604))]
for i,(page,box) in enumerate(figures,1):
    Image.open(source/f'wechat-{page}.png').crop(box).convert('RGB').save(out/f'roco-{i}.webp',quality=95)
print('Extracted all 7 original article figures from supplied PDF page images.')
