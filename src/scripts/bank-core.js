export const COURSES=['maogai','metal'];
export const TYPES={single:'单选题',multiple:'多选题',judge:'判断题'};
export const eligible=q=>Array.isArray(q.answer)&&q.answer.length>0&&!q.ungraded;
export function sameAnswer(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&[...new Set(a)].length===a.length&&[...a].sort((x,y)=>x-y).every((n,i)=>n===[...b].sort((x,y)=>x-y)[i])}
export function filterQuestions(bank,{topic='',type='',query='',wrongOnly=false,records={}}={}){const term=query.trim().toLowerCase();return bank.filter(q=>(!topic||q.topic===topic)&&(!type||q.type===type)&&(!wrongOnly||records[q.id]?.wrong)&&(!term||[q.stem,q.topic,...q.options].join(' ').toLowerCase().includes(term)))}
export function shuffled(items,rng=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export function composePaper(bank,{topics=[],counts={},minutes=30},now=Date.now(),rng=Math.random){
 if(!Array.isArray(topics)||!Number.isInteger(minutes)||minutes<0||minutes>180)throw new Error('考试时间应为0～180分钟的整数。');
 const pool=bank.filter(q=>eligible(q)&&(!topics.length||topics.includes(q.topic))),ids=[];
 for(const type of Object.keys(TYPES)){const count=Number(counts[type]??0),available=pool.filter(q=>q.type===type);if(!Number.isInteger(count)||count<0||count>100)throw new Error('每类题量应为0～100的整数。');if(count>available.length)throw new Error(`${TYPES[type]}只有${available.length}道可评分题，请减少题量或扩大章节范围。`);ids.push(...shuffled(available,rng).slice(0,count).map(q=>q.id))}
 if(!ids.length)throw new Error('请至少选择一道题。');
 return {ids,answers:Object.create(null),started:now,deadline:minutes?now+minutes*60000:null,submitted:false,finished:null};
}
export function gradePaper(paper,bank){const lookup=new Map(bank.map(q=>[q.id,q]));let correct=0,unanswered=0;const details=paper.ids.map(id=>{const q=lookup.get(id);if(!q||!eligible(q))throw new Error('试卷题目已变更，请重新组卷。');const selected=paper.answers[id]||[];if(!selected.length)unanswered++;const ok=sameAnswer(selected,q.answer);if(ok)correct++;return{id,selected,correct:ok}});return {correct,total:details.length,unanswered,score:Math.round(correct/details.length*10000)/100,details}}
export function emptyBankState(){return {version:1,records:Object.create(null),positions:{maogai:null,metal:null},exams:{maogai:null,metal:null},history:[],revisions:{maogai:null,metal:null}}}
const idOK=id=>typeof id==='string'&&/^(mao:(s|m|j):\d{3}|metal:\d{3})$/.test(id);
const selections=a=>Array.isArray(a)&&a.length<=6&&a.every(n=>Number.isInteger(n)&&n>=0&&n<6)&&new Set(a).size===a.length;
const timeOK=t=>Number.isFinite(t)&&t>=0&&t<4102444800000;
export function normalizeBankState(raw){
 if(!raw||raw.version!==1||!raw.records||typeof raw.records!=='object'||Array.isArray(raw.records)||Object.keys(raw.records).length>10000)throw new Error('不是有效的课程题库备份。');
 const s=emptyBankState();
 for(const course of COURSES){const revision=raw.revisions?.[course];if(revision!=null&&(typeof revision!=='string'||revision.length>100))throw new Error('题库版本格式无效。');s.revisions[course]=revision||null}
 for(const [id,r] of Object.entries(raw.records)){if(!idOK(id)||!r||!selections(r.selected)||!timeOK(r.at)||typeof r.wrong!=='boolean'||!Number.isInteger(r.attempts)||r.attempts<1||r.attempts>1000000)throw new Error('答题记录格式无效。');s.records[id]={selected:[...r.selected],at:r.at,wrong:r.wrong,attempts:r.attempts}}
 for(const course of COURSES){const pos=raw.positions?.[course];s.positions[course]=idOK(pos)&&pos.startsWith(course==='maogai'?'mao:':'metal:')?pos:null;const e=raw.exams?.[course];if(!e)continue;
  if(!Array.isArray(e.ids)||!e.ids.length||e.ids.length>300||new Set(e.ids).size!==e.ids.length||!e.ids.every(id=>idOK(id)&&id.startsWith(course==='maogai'?'mao:':'metal:'))||!timeOK(e.started)||(e.deadline!==null&&(!timeOK(e.deadline)||e.deadline<=e.started))||typeof e.submitted!=='boolean'||(e.submitted&&!timeOK(e.finished))||!e.answers||typeof e.answers!=='object'||Array.isArray(e.answers))throw new Error('试卷记录格式无效。');
  const answers=Object.create(null);for(const [id,a] of Object.entries(e.answers)){if(!e.ids.includes(id)||!selections(a))throw new Error('试卷答案格式无效。');answers[id]=[...a]}
  s.exams[course]={ids:[...e.ids],answers,started:e.started,deadline:e.deadline,submitted:e.submitted,finished:e.submitted?e.finished:null};
 }
 if(raw.history&&!Array.isArray(raw.history))throw new Error('考试历史格式无效。');
 for(const h of (raw.history||[]).slice(0,40)){if(!h||!COURSES.includes(h.course)||!timeOK(h.finished)||!Number.isInteger(h.total)||h.total<1||h.total>300||!Number.isInteger(h.correct)||h.correct<0||h.correct>h.total)throw new Error('考试历史格式无效。');s.history.push({course:h.course,finished:h.finished,total:h.total,correct:h.correct})}
 return s;
}
export function recordAnswer(state,q,selected,now=Date.now()){if(!eligible(q)||!selections(selected)||selected.some(n=>n>=q.options.length))throw new Error('本题不能自动评分。');const correct=sameAnswer(selected,q.answer);state.records[q.id]={selected:[...selected],at:now,wrong:!correct,attempts:(state.records[q.id]?.attempts||0)+1};return correct}
export function reconcileBankRevision(state,bank){
 if(!bank.revision||state.revisions[bank.course]===bank.revision)return false;
 // The first expanded edition maps the original preview's option positions once.
 const remaps=state.revisions[bank.course]===null?bank.optionRemaps||{}:{};
 for(const item of bank.questions){const map=remaps[item.id],r=state.records[item.id];if(r){if(map)r.selected=r.selected.map(n=>map[n]).filter(Number.isInteger);if(eligible(item))r.wrong=!sameAnswer(r.selected,item.answer)}
  const paper=state.exams[bank.course];if(map&&paper?.answers[item.id])paper.answers[item.id]=paper.answers[item.id].map(n=>map[n]).filter(Number.isInteger);
 }
 state.revisions[bank.course]=bank.revision;return true;
}
export function submitPaper(state,course,bank,now=Date.now()){const paper=state.exams[course];if(!paper)throw new Error('没有进行中的试卷。');const result=gradePaper(paper,bank);if(!paper.submitted){for(const item of result.details)recordAnswer(state,bank.find(q=>q.id===item.id),item.selected,now);paper.submitted=true;paper.finished=now;state.history=[{course,finished:now,total:result.total,correct:result.correct},...state.history].slice(0,40)}return result}
export function mergeBankStates(current,incoming){const merged=normalizeBankState(current),other=normalizeBankState(incoming);for(const [id,r] of Object.entries(other.records))if(!merged.records[id]||r.at>merged.records[id].at)merged.records[id]=r;for(const c of COURSES){if(!merged.revisions[c])merged.revisions[c]=other.revisions[c];if(!merged.positions[c])merged.positions[c]=other.positions[c];if(!merged.exams[c]||merged.exams[c].submitted){const e=other.exams[c];if(e&&(!merged.exams[c]||e.started>merged.exams[c].started))merged.exams[c]=e}}
 const history=new Map([...merged.history,...other.history].map(h=>[h.course+':'+h.finished,h]));merged.history=[...history.values()].sort((a,b)=>b.finished-a.finished).slice(0,40);return normalizeBankState(merged)}
