from pathlib import Path
from docx import Document
import json,sys
ROOT=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1])
doc=Document(source)
paras=[p.text.strip() for p in doc.paragraphs if p.text.strip()]
assert paras[0]=='2026.9.30'
assets=ROOT/'public/images/essays';assets.mkdir(parents=True,exist_ok=True)
drawings={
'autumn-crossroads':('秋日里，一条还没有走完的路。','''<path d="M250 240Q270 184 238 145Q209 111 120 70M250 240Q301 174 344 144Q384 114 453 91"/><path d="M215 240Q235 179 212 150Q177 118 111 96M284 240Q319 193 360 166Q406 135 461 123"/><path d="M75 221V102M69 132Q42 111 48 93Q73 96 75 118M78 154Q110 129 112 113Q87 111 77 136M490 221V65M488 110Q461 90 468 73Q493 78 490 97"/><path d="M59 222H131M426 224H517M128 44Q137 34 146 44M386 62Q398 51 409 62"/><path d="M154 164Q168 151 176 166Q171 181 154 164ZM408 201Q420 189 433 199Q429 214 408 201Z"/>'''),
'quiet-footprints':('走过的路，也可以慢慢留下清楚的脚印。','''<path d="M37 224Q131 177 207 193Q319 216 409 173Q460 150 536 170M35 244Q139 197 204 214Q326 237 415 194Q472 172 540 191"/><path d="M155 181Q150 167 159 164Q171 165 173 179Q169 187 155 181ZM201 207Q193 195 201 190Q212 188 219 201Q219 210 201 207ZM268 184Q265 169 275 167Q287 170 286 185Q279 190 268 184ZM320 206Q312 194 320 188Q332 187 339 201Q336 210 320 206Z"/><path d="M421 137V74M421 88Q392 61 404 46Q430 57 421 88M423 112Q454 83 469 99Q452 122 423 112"/><path d="M371 141H477M57 91Q85 83 106 92M65 107Q82 100 95 108"/>'''),
'open-notebook':('把剩下的时间，写成自己的下一页。','''<path d="M125 70Q184 54 286 80V223Q200 194 123 210ZM286 80Q369 54 455 70L458 210Q366 193 286 223"/><path d="M132 78Q203 64 279 87V211M294 87Q372 65 448 78M156 101Q202 94 253 109M155 122Q202 116 251 130M154 145Q195 138 238 151M318 103Q360 91 421 99M319 124Q358 112 423 120M319 146Q363 132 405 140M316 171Q345 157 380 162"/><path d="M480 188L518 86L528 90L491 193L481 203ZM518 86L520 78L531 82L528 90M99 221H514"/><path d="M74 103Q56 86 64 73Q85 79 81 98M83 130Q101 108 114 119Q109 140 83 140M81 163V97"/>''')}
for name,(caption,paths) in drawings.items():
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 280" role="img"><rect width="580" height="280" rx="8" fill="#f3f2e9"/><g fill="none" stroke="#7d9270" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+paths+'</g><g fill="none" stroke="#9faf8d" stroke-width=".5" opacity=".5" transform="translate(2 1)">'+paths+'</g></svg>'
    (assets/(name+'.svg')).write_text(svg,encoding='utf-8')
def figure(name):
    caption=drawings[name][0]
    return f'<figure class="essay-illustration"><img src="/images/essays/{name}.svg" alt="线稿插图：{caption}" loading="lazy"/><figcaption>{caption} / 配图</figcaption></figure>'
insertions={
'现在回头看，那可能是我大学里第一次真正为了一件事情比较认真地努力。':'autumn-crossroads',
'就是觉得自己好像一直在往前走，但走到现在，回头一看，没有留下特别清楚的脚印。':'quiet-footprints',
'我只是开始觉得，剩下的时间可能不能再像之前那样稀里糊涂地过去了。':'open-notebook'}
body=[]
for p in paras[1:]:
    body.append(p)
    if p in insertions:body.append(figure(insertions[p]))
post='---\ntitle: "2026.9.30"\ndescription: '+json.dumps('看到保研结果以后，回头看自己的大学两年，也想想剩下的时间该怎样走。',ensure_ascii=False)+'\npubDate: "2026-09-30"\ntags: ["随笔", "大学", "成长"]\n---\n\n'+'\n\n'.join(body)+'\n'
target=ROOT/'src/content/blog/2026-09-30.md';target.write_text(post,encoding='utf-8')
assert all(p in post for p in paras[1:])
print(f'Imported {len(paras)-1} text paragraphs, 3 original SVG illustrations; title and original prose preserved.')
