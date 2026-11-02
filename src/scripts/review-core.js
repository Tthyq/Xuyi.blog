export const DAY=86400000,DECKS=['robotics','english','quotes'];
const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'});
export function dayKey(time=Date.now()){const p=Object.fromEntries(fmt.formatToParts(new Date(time)).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
export function shiftDay(day,offset){return new Date(Date.parse(day+'T12:00:00Z')+offset*DAY).toISOString().slice(0,10)}
export function emptyState(){return{version:1,cards:Object.create(null),daily:Object.create(null),favorites:[],customCards:[],settings:{dailyGoal:10,newLimit:{robotics:5,english:10,quotes:2},lastDeck:'robotics'}}}
const int=(n,min,max,defaultValue)=>Number.isFinite(n)&&n>=min&&n<=max?Math.floor(n):defaultValue;
const safeId=id=>typeof id==='string'&&id.length<=150&&/^(rb:|en:|qt:|custom:)/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
const validDay=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().startsWith(s);
export function normalizeState(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||input.version!==1)throw new Error('不是有效的每日温习备份（需要 version: 1）。');
 const s=emptyState();
 for(const field of ['cards','daily'])if(!input[field]||typeof input[field]!=='object'||Array.isArray(input[field]))throw new Error('备份缺少 '+field+' 记录。');
 if(Object.keys(input.cards).length>20000||Object.keys(input.daily).length>3660)throw new Error('备份记录过多。');
 for(const [id,r] of Object.entries(input.cards)){
  if(!safeId(id)||!r||typeof r!=='object'||!Number.isFinite(r.due)||r.due<0||r.due>4102444800000)throw new Error('卡片复习时间无效。');
  s.cards[id]={due:r.due,interval:int(r.interval,0,365,0),reps:int(r.reps,0,1000000,0),lapses:int(r.lapses,0,1000000,0),lastReviewed:int(r.lastReviewed,0,4102444800000,0),firstSeen:int(r.firstSeen,0,4102444800000,0),grade:int(r.grade,0,3,0)};
 }
 for(const [date,d] of Object.entries(input.daily)){
  if(!validDay(date)||!d||!Array.isArray(d.ids)||d.ids.length>20000||!d.ids.every(safeId))throw new Error('每日记录格式无效。');
  s.daily[date]={goal:int(d.goal,1,100,10),ids:[...new Set(d.ids)]};
 }
 if(input.favorites&&!Array.isArray(input.favorites))throw new Error('收藏记录无效。');
 s.favorites=[...new Set((input.favorites||[]).filter(safeId))].slice(0,10000);
 if(input.customCards&&!Array.isArray(input.customCards))throw new Error('自建卡片格式无效。');
 if((input.customCards||[]).length>2000)throw new Error('自建卡片超过2000张。');
 const ids=new Set();for(const c of input.customCards||[]){
  if(!c||!/^custom:[a-zA-Z0-9-]+$/.test(c.id)||ids.has(c.id)||!DECKS.includes(c.deck)||typeof c.question!=='string'||!c.question.trim()||c.question.length>1000||typeof c.answer!=='string'||!c.answer.trim()||c.answer.length>10000)throw new Error('自建卡片内容无效或重复。');
  ids.add(c.id);s.customCards.push({id:c.id,deck:c.deck,question:c.question.trim(),answer:c.answer.trim(),topic:typeof c.topic==='string'?c.topic.slice(0,60):'我的卡片',source:'自建卡片'});
 }
 const settings=input.settings||{};s.settings.dailyGoal=int(settings.dailyGoal,1,100,10);s.settings.lastDeck=DECKS.includes(settings.lastDeck)?settings.lastDeck:'robotics';
 for(const deck of DECKS)s.settings.newLimit[deck]=int(settings.newLimit?.[deck],0,50,s.settings.newLimit[deck]);
 return s;
}
export function nextSchedule(record,grade,now=Date.now()){
 if(![0,1,2,3].includes(grade))throw new Error('无效的掌握程度。');
 const old=record||{interval:0,reps:0,lapses:0,firstSeen:now};let interval=0;
 if(grade===1)interval=Math.max(1,Math.round(old.interval*1.2));
 if(grade===2)interval=old.interval===0?1:old.interval===1?3:Math.round(old.interval*2);
 if(grade===3)interval=old.interval===0?3:Math.max(4,Math.round(old.interval*2.5));
 interval=Math.min(365,interval);
 return{due:grade===0?now+600000:now+interval*DAY,interval,reps:grade===0?0:old.reps+1,lapses:old.lapses+(grade===0?1:0),lastReviewed:now,firstSeen:old.firstSeen||now,grade};
}
export function applyReview(state,id,grade,now=Date.now()){
 if(!safeId(id))throw new Error('卡片编号无效。');
 const today=dayKey(now),record=nextSchedule(state.cards[id],grade,now);state.cards[id]=record;
 const day=state.daily[today]||(state.daily[today]={goal:state.settings.dailyGoal,ids:[]});const wasDone=day.ids.length>=day.goal;
 if(!day.ids.includes(id))day.ids.push(id);
 return{record,day,checkedNow:!wasDone&&day.ids.length>=day.goal};
}
export function stats(state,now=Date.now()){
 const today=dayKey(now),day=state.daily[today]||{goal:state.settings.dailyGoal,ids:[]},checkedDays=Object.keys(state.daily).filter(d=>state.daily[d].ids.length>=state.daily[d].goal).sort();
 let cursor=day.ids.length>=day.goal?today:shiftDay(today,-1),streak=0;const completed=new Set(checkedDays);while(completed.has(cursor)){streak++;cursor=shiftDay(cursor,-1)}
 return{today,day,streak,checkedDays,totalReviews:Object.values(state.daily).reduce((n,d)=>n+d.ids.length,0),learned:Object.keys(state.cards).length};
}
export function makeQueue(cards,state,deck,now=Date.now()){
 const selected=cards.filter(c=>c.deck===deck),today=dayKey(now),due=selected.filter(c=>state.cards[c.id]&&state.cards[c.id].due<=now).sort((a,b)=>state.cards[a.id].due-state.cards[b.id].due);
 const newToday=selected.filter(c=>state.cards[c.id]&&dayKey(state.cards[c.id].firstSeen)===today).length;
 const fresh=selected.filter(c=>!state.cards[c.id]).slice(0,Math.max(0,state.settings.newLimit[deck]-newToday));
 return [...due.slice(0,100),...fresh].map(c=>c.id);
}
export function scheduleLabel(record,grade,now=Date.now()){const next=nextSchedule(record,grade,now);return grade===0?'10 分钟后':next.interval+' 天后'}
