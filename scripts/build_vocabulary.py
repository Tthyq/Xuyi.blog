"""Extract ECDICT's ky-tagged entries; retain MIT notice and pinned source metadata."""
from pathlib import Path
import csv,json,sys,hashlib
root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]);revision=Path(sys.argv[2]).read_text(encoding='utf-8-sig').strip()
entries=[]
with source.open(encoding='utf-8-sig',newline='') as f:
    for row in csv.DictReader(f):
        if 'ky' not in row['tag'].split() or not row['translation'].strip():continue
        word=row['word'].strip()
        if not word or len(word)>100:continue
        entries.append({'id':'en:'+word.lower(),'deck':'english','question':word,'answer':row['translation'].replace('\\n','\n'),'phonetic':row['phonetic'],'definition':row['definition'].replace('\\n','\n'),'exchange':row['exchange'],'topic':word[0].upper(),'rank':int(row['bnc'] or 0) or int(row['frq'] or 0) or 999999})
entries.sort(key=lambda x:(x['rank'],x['question']))
assert len(entries)>4000 and len({x['id'] for x in entries})==len(entries)
data={'source':'ECDICT · ky 考研标签','license':'MIT','revision':revision,'sourceUrl':'https://github.com/skywind3000/ECDICT/tree/'+revision,'count':len(entries),'note':'按开源词典的考研标签整理，非某一年度官方大纲；默认按语料词频顺序安排新词。','cards':entries}
out=root/'public/review/vocabulary.json';out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(out.parent/'vocabulary-provenance.json').write_text(json.dumps({k:v for k,v in data.items() if k!='cards'}|{'csvSha256':hashlib.sha256(source.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8');print(f'{len(entries)} vocabulary cards, {out.stat().st_size} bytes')
