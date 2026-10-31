'use strict';
// Planar revolute chain. Angles in degrees at the boundary, radians in derivatives.
const ArmModel=(()=>{
 const rad=Math.PI/180, maxLinks=8, normalize=a=>((a+180)%360+360)%360-180;
 function valid(links){return Array.isArray(links)&&links.length>=1&&links.length<=maxLinks&&links.every(l=>Number.isFinite(l.length)&&l.length>=.2&&l.length<=3&&Number.isFinite(l.angle)&&l.angle>=-180&&l.angle<=180)}
 function forward(links){let x=0,y=0,angle=0,points=[[0,0]];for(const l of links){angle+=l.angle;x+=l.length*Math.cos(angle*rad);y+=l.length*Math.sin(angle*rad);points.push([x,y])}return{x,y,phi:normalize(angle),points}}
 function workspace(links){const outer=links.reduce((s,l)=>s+l.length,0);return{outer,inner:Math.max(0,2*Math.max(...links.map(l=>l.length))-outer)}}
 function jacobian(links){const p=forward(links);return[p.points.slice(0,-1).map(o=>-(p.y-o[1])),p.points.slice(0,-1).map(o=>p.x-o[0])]}
 function inverse(links,x,y,variant=0){
  if(!valid(links)||!Number.isFinite(x)||!Number.isFinite(y))return{status:'invalid'};
  const {outer,inner}=workspace(links),r=Math.hypot(x,y),tol=1e-5;
  if(r>outer+tol||r<inner-tol)return{status:'unreachable',outer,inner};
  if(links.length===1)return{status:'solved',angles:[normalize(Math.atan2(y,x)/rad)],error:Math.abs(r-outer)};
  if(links.length===2){const [a,b]=links.map(l=>l.length);if(r<1e-9&&Math.abs(a-b)<1e-9)return{status:'continuous',angles:[links[0].angle,180],error:0};let c=Math.max(-1,Math.min(1,(r*r-a*a-b*b)/(2*a*b)));const solutions=[1,-1].map(sign=>{let q2=sign*Math.acos(c);return[normalize((Math.atan2(y,x)-Math.atan2(b*Math.sin(q2),a+b*Math.cos(q2)))/rad),normalize(q2/rad)]});return{status:'solved',angles:solutions[variant%2],solutions,error:0}}
  if(Math.abs(r-outer)<tol)return{status:'solved',angles:[normalize(Math.atan2(y,x)/rad),...links.slice(1).map(()=>0)],error:Math.abs(r-outer)};
  // CCD uses several deterministic starting poses to escape stationary straight chains.
  let best={status:'approximate',error:Infinity,angles:links.map(l=>l.angle)};
  for(let attempt=0;attempt<12;attempt++){
   let chain=links.map((l,i)=>({...l,angle:attempt===0&&variant===0?l.angle:normalize((i===0?Math.atan2(y,x)/rad:0)+Math.sin((i+1)*(attempt+1+variant)*1.7)*125)}));
   for(let iteration=0;iteration<600;iteration++){
    let p=forward(chain),error=Math.hypot(p.x-x,p.y-y);
    if(error<best.error)best={status:error<tol?'solved':'approximate',error,angles:chain.map(l=>l.angle)};
    if(error<tol)return best;
    for(let i=chain.length-1;i>=0;i--){p=forward(chain);const o=p.points[i],ax=p.x-o[0],ay=p.y-o[1],bx=x-o[0],by=y-o[1];if(Math.hypot(ax,ay)<1e-12||Math.hypot(bx,by)<1e-12)continue;const delta=Math.atan2(ax*by-ay*bx,ax*bx+ay*by);chain[i].angle=normalize(chain[i].angle+Math.max(-.7,Math.min(.7,delta))/rad)}
   }
  }return best;
 }
 return{maxLinks,valid,forward,workspace,jacobian,inverse};
})();
