// @ts-nocheck
// Dashboard logic ported from the original script. It drives the DOM in lib/markup.ts.
export function initPlanner(): void {
const f=(v,d=0)=>new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const pc=v=>Math.round(v*100)+"%";
const dl=i=>{const d=new Date(2026,9+i,1);return MN[d.getMonth()]+" "+d.getFullYear();};
const setP=el=>el.style.setProperty("--p",(el.value-el.min)/(el.max-el.min)*100+"%");
const $=id=>document.getElementById(id);
const defs=[
["net","Monthly take-home pay",3000,8000,10,4680,v=>f(v)],
["start","Savings you already have",0,10000,100,0,v=>f(v)],
["lump","One-time extra money you add now",0,10000,100,0,v=>f(v)],
["sign","Signing bonus, net per payment",0,2500,50,1500,v=>f(v)],
["aipAmt","Annual incentive bonus, net",0,5000,50,1700,v=>f(v)]
];
const V={n:12,tfsa:27500,fhsa:8000,aip:false};
const c1=$("c1"),c2=$("c2"),c3=$("c3");
const C2=["lump","sign","aipAmt"];
defs.forEach(([id,lab,mn,mx,st,val,fm])=>{
  V[id]=val;
  const d=document.createElement("div");d.className="ctl";
  d.innerHTML=`<label for="${id}">${lab}<output id="o_${id}">${fm(val)}</output></label><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}" value="${val}">`;
  (C2.includes(id)?c2:c1).appendChild(d);setP(d.querySelector("input"));
  d.querySelector("input").addEventListener("input",e=>{V[id]=+e.target.value;setP(e.target);d.querySelector("output").textContent=fm(V[id]);run();});
});
const ck=document.createElement("div");ck.className="ctl check";
ck.innerHTML='<input type="checkbox" id="aip"><label for="aip" style="margin:0">Include the annual incentive bonus</label>';
c2.appendChild(ck);
ck.querySelector("input").addEventListener("change",e=>{V.aip=e.target.checked;run();});
const bonusAt=i=>(i===4||i===10?V.sign:0)+(i%12===5&&V.aip?V.aipAmt:0);

const OO=[],OX=[];let ooN=0,oxN=0;
const ooSum=i=>OO.reduce((t,o)=>t+(o.on&&o.m===i?o.a:0),0)-OX.reduce((t,o)=>t+(o.on&&o.m===i?o.a:0),0);
const MOPT=Array.from({length:60},(_,i)=>`<option value="${i}">${i?dl(i):"Now (Oct 2026)"}</option>`).join("");
const ooBox=document.createElement("div");
ooBox.innerHTML='<div class="grp"><span>Other one-time payments</span><span id="oot">$0</span></div><div id="oolist"></div><button class="add" id="ooadd" type="button">+ Add a one-time payment</button><p class="note" style="margin-top:10px">Tick the box to include a payment in the projection. "Now" is money you have today. Other months count as a deposit that month and arrive on payday (the last banking day) in the chart.</p>';
c2.appendChild(ooBox);
const oolist=ooBox.querySelector("#oolist");
const ooTot=()=>{$("oot").textContent=f(OO.reduce((t,o)=>t+(o.on?o.a:0),0));};
$("ooadd").addEventListener("click",()=>{
  const o={id:++ooN,n:"One-time payment",a:1000,m:0,on:true};OO.push(o);
  const r=document.createElement("div");r.className="oo";r.dataset.id=o.id;
  r.innerHTML=`<input class="oi" type="checkbox" checked aria-label="Include in projection"><input class="on" type="text" value="${o.n}" aria-label="Name"><input class="oa" type="number" min="0" step="50" value="${o.a}" aria-label="Amount"><select class="om" aria-label="Month">${MOPT}</select><button class="ox" type="button" aria-label="Remove">×</button>`;
  r.querySelector(".om").value=o.m;oolist.appendChild(r);ooTot();run();
});
oolist.addEventListener("input",e=>{const r=e.target.closest(".oo");if(!r)return;const o=OO.find(x=>x.id===+r.dataset.id);
  if(e.target.classList.contains("oi")){o.on=e.target.checked;r.classList.toggle("off",!o.on);ooTot();run();}
  else if(e.target.classList.contains("oa")){o.a=Math.max(0,+e.target.value||0);ooTot();run();}
  else if(e.target.classList.contains("on"))o.n=e.target.value;});
oolist.addEventListener("change",e=>{if(!e.target.classList.contains("om"))return;const r=e.target.closest(".oo");OO.find(x=>x.id===+r.dataset.id).m=+e.target.value;run();});
oolist.addEventListener("click",e=>{if(!e.target.classList.contains("ox"))return;const r=e.target.closest(".oo"),k=OO.findIndex(x=>x.id===+r.dataset.id);OO.splice(k,1);r.remove();ooTot();run();});

/* expenses */
const EX=[
["Fixed expenses",[["Rent",2075,1,4000,25],["Electricity (bill every 2 months)",90,2,400,5],["Phone",135,1,300,5],["Opus Metro pass",160,1,300,5],["Wi-Fi",50,1,150,5]]],
["Subscriptions",[["Apple iCloud",15,1,50,1],["Apple Music (person 1)",7,1,30,1],["Apple Music (person 2)",7,1,30,1],["Disney+",20,1,50,1],["AppleCare for Apple Watch",5,1,30,1],["Amazon",11,1,50,1],["Claude Pro",32,1,100,1]]],
["Variable expenses",[["Groceries",450,1,1200,10],["Eating out",150,1,800,10],["Shopping",100,1,800,10],["Entertainment & misc",100,1,800,10],["Health & personal",70,1,500,10],["Other",100,1,800,10]]]];
const NEEDS=new Set(["Rent","Electricity (bill every 2 months)","Phone","Opus Metro pass","Wi-Fi","Groceries","Health & personal"]);
const GC=["var(--std)","var(--scotia)","var(--promo)"];
c3.innerHTML='<div class="duo"><div class="m tot"><div class="k">Total expenses</div><div class="v" id="etot"></div><div class="n" id="esplit"></div></div><div class="m tot pos" id="left"><div class="k">Left over each month</div><div class="v" id="ltot"></div><div class="n" id="lnote"></div></div></div>'+
 EX.map((g,gi)=>`<div class="grp"><span>${g[0]}</span><span id="gt${gi}"></span></div>`+(gi===2?'<p class="note">These amounts are placeholders. Move the sliders to your real spending.</p>':'')+
 g[1].map((it,ii)=>`<div class="ctl"><label for="e${gi}_${ii}"><span>${it[0]}<small id="mu${gi}_${ii}"></small></span><output id="eo${gi}_${ii}">${f(it[1])}</output></label><input type="range" id="e${gi}_${ii}" min="0" max="${it[3]}" step="${it[4]}" value="${it[1]}" data-g="${gi}" data-i="${ii}"></div>`).join("")).join("");
c3.querySelectorAll("input").forEach(el=>setP(el));
c3.addEventListener("input",e=>{const t=e.target;if(t.dataset.g===undefined)return;const g=+t.dataset.g,i=+t.dataset.i;EX[g][1][i][1]=+t.value;setP(t);$("eo"+g+"_"+i).textContent=f(+t.value);run();});
function updExp(){
  const t=[0,0,0];V.cats=[];
  EX.forEach((g,gi)=>{g[1].forEach((it,ii)=>{const m=it[1]/it[2];t[gi]+=m;
      V.cats.push({n:it[0].replace(" (bill every 2 months)",""),m,g:gi,need:NEEDS.has(it[0])});
      if(it[2]>1)$("mu"+gi+"_"+ii).textContent=" = "+f(m,2)+" a month";});
    $("gt"+gi).textContent=f(t[gi]);});
  V.grp=t;V.fx=t[0]+t[1];V.vr=t[2];
  return t[0]+t[1]+t[2];
}

/* model */
function calc(n=V.n,dp=V.dep){
  const rows=[];let a=V.start+V.lump+ooSum(0);
  for(let i=0;i<n;i++){
    const base=i===0?0:dp,extra=bonusAt(i)+(i?ooSum(i):0),dep=base+extra;
    a+=dep;rows.push({i,lab:dl(i),base,extra,dep,a});
  }
  return rows;
}
function daily(n){
  const pts=[];let bal=V.exp+V.start+V.lump+ooSum(0),t=0;
  for(let i=0;i<n;i++){
    const dim=new Date(2026,10+i,0).getDate();
    const bonus=bonusAt(i);
    for(let d=1;d<=dim;d++){
      if(d===1)bal-=V.fx;
      bal-=V.vr/dim;
      if(d===dim){pts.push({t:t++,bal,i,d,pre:1});bal+=V.net+bonus+(i?ooSum(i):0);}
      pts.push({t:t++,bal,i,d,pay:d===dim});
    }
  }
  return pts;
}

/* rendering helpers */
const kpi=(k,v,n,c="")=>`<div class="kpi ${c}"><div class="k">${k}</div><div class="v">${v}</div><div class="n">${n}</div></div>`;
const bar=(w,col,mark)=>`<div class="bar"><i style="width:${Math.max(0,Math.min(100,w*100))}%;background:${col}"></i>${mark!==undefined?`<s style="left:${mark*100}%"></s>`:""}</div>`;

function run(){
  V.exp=updExp();V.dep=V.net-V.exp;
  const rows=calc(),far=calc(240),last=rows[rows.length-1];
  const left=V.net-V.exp,rate=V.net?left/V.net:0;
  const hz=$("hz"),hl=hz.options[hz.selectedIndex].text;
  const pts=daily(V.n),lo=pts.reduce((a,p)=>p.bal<a.bal?p:a),lod=new Date(2026,9+lo.i,lo.d);
  const start0=far[0].a;

  /* expenses: total and left over on one line */
  $("etot").textContent=f(V.exp);
  $("esplit").textContent="Fixed "+f(V.fx)+" · Variable "+f(V.vr);
  $("left").className="m tot "+(left<0?"neg":"pos");
  $("ltot").textContent=(left<0?"-":"")+f(Math.abs(left));
  $("lnote").textContent=left<0?"Over budget. Your "+f(V.net)+" take-home does not cover it.":pc(rate)+" of your "+f(V.net)+" take-home";

  /* header */
  const hs=$("health");
  hs.className="badge "+(left<0?"neg":rate>=.2?"pos":"warn");
  hs.innerHTML="<i></i>"+(left<0?"Over budget":rate>=.2?"On track":rate>=.1?"Tight":"Low savings");
  $("chips").innerHTML=[["Start","Oct 2026"],["Horizon",hl],["Take-home",f(V.net)+"/mo"],["Saving",pc(Math.max(0,rate))]].map(c=>`<span class="chip">${c[0]} <b>${c[1]}</b></span>`).join("");

  /* milestones */
  const T=[["1 month of expenses",V.exp],["3 months of expenses",V.exp*3],["$10,000",10000],["$25,000",25000],["$50,000",50000],["$100,000",100000]].filter(t=>t[1]>0).sort((a,b)=>a[1]-b[1]);
  const eta=v=>{const r=far.find(r=>r.a>=v);return r?(r.i===0?"Reached":r.lab):"Not reached";};
  const nextM=T.find(t=>start0<t[1]);
  $("ms").innerHTML=T.map(t=>{const e=eta(t[1]);return `<div class="ms${e==="Reached"?" done":""}"><b>${t[0]}${t[0][0]==="$"?"":` <em style="color:var(--mute);font-style:normal">(${f(t[1])})</em>`}</b><span>${e}</span>${bar(last.a/t[1],e==="Reached"?"var(--std)":"var(--scotia)")}</div>`;}).join("");

  /* KPIs */
  const extra=rows.reduce((t,r)=>t+r.extra,0),added=last.a-start0+rows[0].dep;
  const e1=eta(V.exp),e3=eta(V.exp*3);
  $("kpis").innerHTML=
    kpi("Saved by "+last.lab,f(last.a),f(Math.max(0,last.a-(V.start+V.lump)))+" added over "+hl,"hero")+
    kpi("Savings rate",pc(rate),"of take-home · guideline 20%",left<0?"neg":rate>=.2?"pos":"warn")+
    kpi("Emergency fund",e1,"1 month · 3 months: "+e3)+
    kpi("Next milestone",nextM?nextM[0]:"All reached",nextM?"Expected "+eta(nextM[1]):"Nice work")+
    kpi("Bonuses and one-time money",f(extra),last.a-(V.start+V.lump)>0?pc(extra/(last.a-(V.start+V.lump)))+" of what you add by "+last.lab:"None in this period")+
    kpi("Lowest balance",f(lo.bal),"on "+MN[lod.getMonth()]+" "+lod.getDate(),lo.bal<0?"neg":"");

  /* where your money goes */
  const tot=V.exp||1;
  $("mixd").textContent=f(V.exp)+" a month in total";
  $("mixbar").innerHTML=V.grp.map((v,i)=>`<i style="width:${v/tot*100}%;background:${GC[i]}"></i>`).join("");
  $("mixleg").innerHTML=V.grp.map((v,i)=>`<div class="lrow" style="margin:4px 0"><span><i style="background:${GC[i]}"></i>${EX[i][0]}</span><span>${f(v)} · ${pc(v/tot)}</span></div>`).join("");
  const top=[...V.cats].sort((a,b)=>b.m-a.m).slice(0,5),mx=top[0]?top[0].m||1:1;
  $("cats").innerHTML='<div class="lrow" style="margin-top:16px"><span><em>Biggest categories</em></span><span></span></div>'+top.map(c=>`<div class="lrow" style="margin:8px 0 4px"><span>${c.n}</span><span>${f(c.m)}</span></div>${bar(c.m/mx,GC[c.g])}`).join("");

  /* needs / wants / savings */
  const needs=V.cats.filter(c=>c.need).reduce((t,c)=>t+c.m,0),wants=V.exp-needs,sv=Math.max(0,left),nt=V.net||1;
  $("rule").innerHTML=[["Needs","rent, bills, groceries, transit, health",needs,.5,"var(--scotia)"],["Wants","subscriptions, eating out, shopping, other",wants,.3,"var(--promo)"],["Savings","what is left over",sv,.2,"var(--std)"]].map(r=>
    `<div class="lrow" style="margin:0 0 5px"><span>${r[0]} <em>· ${r[1]}</em></span><span>${f(r[2])} · ${pc(r[2]/nt)}</span></div>${bar(r[2]/nt,r[4],r[3])}<div style="height:14px"></div>`).join("");

  /* tax-sheltered room */
  const tf=Math.max(0,+$("tfsa").value||0),fh=Math.max(0,+$("fhsa").value||0);
  $("tfsab").style.width=Math.min(100,tf?last.a/tf*100:0)+"%";
  $("tfsat").innerHTML=tf?"Your savings by <b>"+last.lab+"</b> would use <b>"+pc(Math.min(1,last.a/tf))+"</b> of this room. Room fills up: <b>"+eta(tf)+"</b>.":"Enter your TFSA room.";
  const dec=calc(3)[2].a,fc=Math.min(Math.max(0,dec),fh),est=fc<=4000?fc*.36:1450+(fc-4000)*.3;
  $("fhsab").style.width=Math.min(100,fh?Math.max(0,dec)/fh*100:0)+"%";
  $("fhsat").innerHTML=fh?"By Dec 31 your savings would be about <b>"+f(Math.max(0,dec))+"</b>. Contributing that to an FHSA by Dec 31 could add roughly <b>"+f(est)+"</b> to your 2026 refund (estimate). Cover your 1-month fund first.":"Enter your FHSA room.";

  /* insights */
  const ins=[];
  if(lo.bal<0)ins.push("<b>Warning:</b> your cash balance dips below zero around "+MN[lod.getMonth()]+" "+lod.getDate()+". Lower expenses or move a bonus earlier.");
  ins.push(left<0?"Your expenses are <b>"+f(-left)+"</b> a month more than your take-home, so savings shrink.":"You save <b>"+pc(rate)+"</b> of take-home. A common target is 20%"+(rate>=.2?", so you are ahead of it.":", so there is room to improve."));
  const rent=V.cats.find(c=>c.n==="Rent");
  if(rent&&V.net)ins.push("Rent is <b>"+pc(rent.m/V.net)+"</b> of take-home. A common guideline is about 30%.");
  ins.push("Needs take <b>"+pc(needs/nt)+"</b> of your pay (guideline 50%) and wants <b>"+pc(wants/nt)+"</b> (guideline 30%).");
  if(extra>0)ins.push("Bonuses and one-time money are <b>"+f(extra)+"</b> of your savings by "+last.lab+". They depend on you staying employed, so do not count on them for bills.");
  const big=top[0];if(big&&big.n!=="Rent")ins.push("Your biggest category is <b>"+big.n+"</b> at "+f(big.m)+" a month.");
  ins.push("Every <b>$100</b> a month you trim adds <b>$1,200</b> a year to savings.");
  $("ins").innerHTML=ins.map(t=>"<li>"+t+"</li>").join("");

  /* goals */
  const homeNeed=V.home*V.dpp/100+V.home*.03;
  const path=ret=>{let b=far[0].a,c=Math.max(0,V.dep),r=ret/1200,out=[b],hit=null;
    for(let m=1;m<=720;m++){b=b*(1+r)+c;if(m%12===0)c*=1+V.rais/100;out.push(b);if(hit===null&&b>=V.target)hit=m;}
    return{hit,out};};
  const fm=m=>m===null?"Not within 60 years":Math.floor(m/12)+" yrs "+(m%12)+" mo · "+dl(m);
  const pI=path(V.ret),p0=path(0);
  const gr=(n,sub,v,e)=>`<div class="lrow" style="margin:12px 0 4px"><span>${n} <em>· ${sub}</em></span><span>${e}</span></div>${bar(last.a/v,"var(--std)")}`;
  $("gout").innerHTML=
    gr("House",f(homeNeed)+" cash",homeNeed,eta(homeNeed))+
    '<p class="note" style="margin:4px 0 0">Down payment plus about 3% for closing costs (welcome tax, notary, inspection). An FHSA can hold up to $40,000 of it tax-free.</p>'+
    `<div class="grp" style="margin-top:20px"><span>Millionaire path</span><span>${f(V.target)}</span></div>
     <div class="kv"><span>At ${V.ret}% a year</span><span>${fm(pI.hit)}</span></div>
     <div class="kv"><span>With no investment return</span><span>${fm(p0.hit)}</span></div>
     <div class="kv"><span><em>Balance after 5 / 10 / 20 years</em></span><span>${[60,120,240].map(m=>"$"+Math.round(pI.out[m]/1000)+"k").join(" / ")}</span></div>
     <p class="note" style="margin-top:8px">Uses only your monthly surplus, growing ${V.rais}% a year. Bonuses and one-time money are left out, and returns are not guaranteed.</p>`;

  /* what if */
  const baseF=calc(V.n,V.dep)[V.n-1].a;
  const SC=[["Current plan",0],["Spend $200 less a month",200],["Spend $200 more a month",-200],["Take-home up $500 (raise)",500],["Take-home up $1,000 (raise)",1000]];
  const scv=SC.map(x=>[x[0],calc(V.n,V.dep+x[1])[V.n-1].a]);
  const scm=Math.max(1,...scv.map(x=>Math.abs(x[1])));
  $("scd").textContent="Savings by "+last.lab+" if one thing changes and nothing else does.";
  $("scen").innerHTML=scv.map((x,i)=>`<div class="sc${i?"":" cur"}"><b style="font-weight:${i?500:600}">${x[0]}</b><span>${f(x[1])}</span><span style="min-width:74px;text-align:right;color:${x[1]-baseF>0?"var(--std)":x[1]-baseF<0?"var(--neg)":"var(--mute)"}">${i?(x[1]-baseF>0?"+":"-")+f(Math.abs(x[1]-baseF)):"base"}</span>${bar(Math.max(0,x[1])/scm,i?(x[1]>=baseF?"var(--scotia)":"var(--promo)"):"var(--std)")}</div>`).join("");

  /* year by year */
  const f5=calc(60),mx5=Math.max(1,f5[59].a);
  $("yby").innerHTML=[1,2,3,4,5].map(y=>{const r=f5[12*y-1],pv=y===1?f5[0].a:f5[12*y-13].a;
    return `<div class="sc"><b style="font-weight:500">${r.lab}</b><span>${f(r.a)}</span><span style="min-width:74px;text-align:right">+${f(r.a-pv)}</span>${bar(r.a/mx5,"var(--std)")}</div>`;}).join("")+
    '<p class="note">Assumes today\'s pay and spending stay the same and no raises.</p>';

  /* key dates */
  const now=new Date(),KD=[["2026-12-31","Dec 31, 2026","Last day to contribute to an FHSA and claim it on your 2026 return (open the account first)"],
    ["2027-01-31","Jan 2027","Air Canada's yearly 15,000 Aeroplan points are granted"],
    ["2027-02-17","Feb 17, 2027","Probation ends. First $2,500 signing payment (gross), if still employed"],
    ["2027-02-28","End Feb 2027","T4 and RL-1 tax slips arrive. Then you can file"],
    ["2027-03-01","Mar 1, 2027","RRSP deadline for your 2026 return. Travel privileges start (28 weeks)"],
    ["2027-04-30","Apr 30, 2027","File your federal and Quebec returns"],
    ["2027-05-31","May 2027","Expected refund of about $1,400 (estimate)"],
    ["2027-08-17","Aug 17, 2027","Second $2,500 signing payment (gross)"]];
  $("dates").innerHTML=KD.map(k=>{const d=Math.ceil((new Date(k[0]+"T23:59:59")-now)/864e5);
    return `<div class="ev${d<0?" past":""}"><b>${k[1]}</b><span>${k[2]}</span><em>${d<0?"passed":d===0?"today":"in "+d+" days"}</em></div>`;}).join("");

  /* table */
  $("tbl").innerHTML="<tr><th>Month</th><th>Surplus from pay</th><th>Bonuses and one-time</th><th>Total saved</th><th>Savings balance</th></tr>"+
    rows.map(r=>`<tr><td>${r.lab}</td><td>${f(r.base)}</td><td class="p">${r.extra?f(r.extra):"–"}</td><td>${f(r.dep)}</td><td class="s">${f(r.a)}</td></tr>`).join("");
  $("lg").innerHTML='<span><i style="background:var(--text)"></i>Total cash</span>';
  draw(rows,pts,lo,lod);drawBars(rows);renderCar();
}
function grid(g,mn,mx,Y,W,L,R){
  for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4,y=Y(v);
    g.s+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="#27272a"/><text x="${L-6}" y="${y+4}" text-anchor="end" fill="#a1a1aa" font-size="11">${f(v)}</text>`;}
}
function draw(rows,pts,lo,dlo){
  const W=640,L=56,R=12,T=12,B=28,pw=W-L-R,g={s:""},H=280;
  const ph=H-T-B,N=pts.length,vals=pts.map(p=>p.bal);
  let mx=Math.max(...vals),mn=Math.min(0,...vals);if(mx<=mn)mx=mn+1;
  const X=i=>L+i/(N-1)*pw,Y=v=>T+ph-(v-mn)/(mx-mn)*ph;
  grid(g,mn,mx,Y,W,L,R);
  if(mn<0)g.s+=`<line x1="${L}" x2="${W-R}" y1="${Y(0)}" y2="${Y(0)}" stroke="#f87171" stroke-dasharray="4 4"/>`;
  const step=V.n<=6?1:V.n<=12?2:V.n<=24?3:V.n<=36?6:12;
  pts.forEach((p,k)=>{if(p.d===1&&p.i%step===0){const dt=new Date(2026,9+p.i,1);
    g.s+=`<text x="${X(k)}" y="${H-8}" text-anchor="middle" fill="#a1a1aa" font-size="11">${V.n<=6?MN[dt.getMonth()]+" 1":MN[dt.getMonth()]+" ’"+String(dt.getFullYear()).slice(2)}</text>`;}});
  g.s+=`<path d="${pts.map((p,k)=>(k?"L":"M")+X(k).toFixed(1)+" "+Y(p.bal).toFixed(1)).join(" ")}" fill="none" stroke="#fafafa" stroke-width="${V.n>24?1.5:2}" stroke-linejoin="round"/>`;
  if(V.n<=6)pts.forEach((p,k)=>{if(p.pay)g.s+=`<circle cx="${X(k)}" cy="${Y(p.bal)}" r="4" fill="var(--std)"/>`;});
  const endV=vals[N-1],sv=rows[rows.length-1].a;
  $("cn").textContent="Lowest point "+f(lo.bal)+" on "+MN[dlo.getMonth()]+" "+dlo.getDate()+". Ends at "+f(endV)+": "+f(sv)+" saved plus "+f(endV-sv)+" of next month's pay that has just arrived (the headline figure leaves that out). Each month the balance drops on the 1st (fixed bills), slides down through the month (other spending), and jumps on the last banking day (pay and any bonus). October's bills are assumed paid already, so just before October's pay you hold your starting savings.";
  const svg=$("chart");svg.setAttribute("viewBox","0 0 640 "+H);svg.innerHTML=g.s;
}
/* extra cards that fill the input columns */
function addCtl(parent,id,lab,mn,mx,st,val,fm){
  V[id]=val;const d=document.createElement("div");d.className="ctl";
  d.innerHTML=`<label for="${id}">${lab}<output>${fm(val)}</output></label><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}" value="${val}">`;
  parent.appendChild(d);const inp=d.querySelector("input");setP(inp);
  inp.addEventListener("input",e=>{V[id]=+e.target.value;setP(e.target);d.querySelector("output").textContent=fm(V[id]);run();});
}
const pay=document.createElement("div");pay.className="card";
pay.innerHTML=`<h3>Your pay, from the September stub</h3><p class="d">Where each $7,917 monthly paycheque goes.</p>
<div class="stackbar"><i style="width:59.1%;background:var(--std)"></i><i style="width:31.2%;background:var(--scotia)"></i><i style="width:6%;background:var(--promo)"></i><i style="width:3.7%;background:var(--mix)"></i></div>
<div class="lrow" style="margin:4px 0"><span><i style="background:var(--std)"></i>Take-home</span><span>$4,680.90 · 59%</span></div>
<div class="lrow" style="margin:4px 0"><span><i style="background:var(--scotia)"></i>Income tax, QPP, EI, QPIP</span><span>$2,467.55 · 31%</span></div>
<div class="lrow" style="margin:4px 0"><span><i style="background:var(--promo)"></i>Pension (6%)</span><span>$475.02 · 6%</span></div>
<div class="lrow" style="margin:4px 0"><span><i style="background:var(--mix)"></i>Insurance (life, LTD, STD, dental, AD&amp;D)</span><span>$293.53 · 4%</span></div>
<div class="kv tt"><span>Employer also pays each month</span><span>$724.68</span></div>
<div class="kv"><span><em>Pension match</em></span><span>$475.02</span></div>
<div class="kv"><span><em>Extended health and dental</em></span><span>$249.66</span></div>
<p class="note" style="margin-top:8px">September's net of $4,387.37 included one-time retro deductions of $293.53. The $4,680.90 above is the recurring figure.</p>`;
c1.appendChild(pay);
const comp=document.createElement("div");comp.className="card";
comp.innerHTML=`<h3>Yearly pay package</h3><p class="d">Based on your Air Canada offer, at target.</p>
<div class="kv"><span>Base salary</span><span>$95,000</span></div>
<div class="kv"><span>Annual incentive <em>· target 8%, max 16%</em></span><span>$7,600</span></div>
<div class="kv"><span>Signing bonus <em>· 2 × $2,500, taxable</em></span><span>$5,000</span></div>
<div class="kv"><span>Employer pension match <em>· up to 6%</em></span><span>$5,700</span></div>
<div class="kv"><span>Employer-paid health and dental</span><span>$2,996</span></div>
<div class="kv tt"><span>Total, first year at target</span><span>$116,296</span></div>
<div class="kv"><span><em>Also: 15,000 Aeroplan points a year, travel privileges after 28 weeks, profit sharing, optional ESOP</em></span><span></span></div>
<p class="note" style="margin-top:8px">The incentive could be as high as $15,200. Profit sharing and ESOP amounts are not in the total.</p>`;
c1.appendChild(comp);
const goal=document.createElement("div");goal.className="card";
goal.innerHTML='<h3>Goals</h3><p class="d">Pick a target and see when your savings reach it. Each goal assumes all your savings go to that goal alone.</p><div id="gsl"></div><div id="gout"></div>';
c2.appendChild(goal);
addCtl($("gsl"),"home","Home price",250000,1200000,10000,450000,v=>f(v));
addCtl($("gsl"),"dpp","Down payment",5,25,1,10,v=>v+"%");
addCtl($("gsl"),"target","Millionaire target",250000,3000000,50000,1000000,v=>f(v));
addCtl($("gsl"),"ret","Yearly investment return (millionaire path only)",0,12,.5,6,v=>v+"%");
addCtl($("gsl"),"rais","Yearly increase in what you save",0,10,.5,3,v=>v+"%");
function loan(P,apr,n,extra){
  const r=apr/1200;if(P<=0)return{pm:0,months:0,int:0,bal:[0]};
  const pm=r?P*r/(1-Math.pow(1+r,-n)):P/n;let b=P,m=0,int=0;const bal=[P];
  while(b>.005&&m<600){const i=b*r,pay=Math.min(b+i,pm+extra);b=b+i-pay;int+=i;m++;bal.push(Math.max(0,b));}
  return{pm,months:m,int,bal};
}
function renderCar(){
  const nt=V.net||1,left=V.net-V.exp;
  const tax=V.ctax?V.cprice*.14975:0,total=V.cprice+tax,dpay=Math.min(V.cdown,total),P=Math.max(0,total-dpay);
  const base=loan(P,V.capr,V.cterm,0),ex=loan(P,V.capr,V.cterm,V.cextra);
  const far=calc(240),buy=V.cbuy,saved=far[buy].a,hit=far.find(r=>r.a>=dpay);
  const yrs=m=>m%12===0?m/12+" yr":(m/12).toFixed(1)+" yr";
  const pcs=base.pm/nt;
  $("carkpi").innerHTML=
    kpi("Monthly payment",f(base.pm),pc(pcs)+" of take-home · guideline 10-15%",pcs>.15?"warn":"pos")+
    kpi("Extra you pay in interest",f(base.int),"over "+V.cterm+" months at "+V.capr.toFixed(1)+"%",base.int>0?"warn":"pos")+
    kpi("Total cost of the car",f(V.cprice+tax+base.int),f(V.cprice)+" price + "+f(tax)+" tax + "+f(base.int)+" interest")+
    kpi("You borrow",f(P),f(dpay)+" down payment")+
    kpi("Paid off by",dl(buy+base.months),"buying in "+(buy===0?"now":dl(buy))+" · "+yrs(V.cterm)+" loan")+
    kpi("Left over after the payment",(left-base.pm<0?"-":"")+f(Math.abs(left-base.pm)),left-base.pm<0?"The payment is more than your monthly surplus":pc((left-base.pm)/nt)+" of take-home still saved","");
  const ok=saved>=dpay;
  const m=$("carmsg");m.className="msg "+(ok?"ok":"no");
  m.innerHTML=ok?"By <b>"+(buy===0?"now":dl(buy))+"</b> your savings are projected at <b>"+f(saved)+"</b>, enough for the <b>"+f(dpay)+"</b> down payment. After paying it you would have <b>"+f(saved-dpay)+"</b> left.":
    "By <b>"+(buy===0?"now":dl(buy))+"</b> your savings are projected at <b>"+f(saved)+"</b>, which is <b>"+f(dpay-saved)+"</b> short of the <b>"+f(dpay)+"</b> down payment. "+(hit?"You would have it by <b>"+hit.lab+"</b>.":"Raise your savings or lower the down payment.");
  /* loan lengths */
  $("cterms").innerHTML="<tr><th>Length</th><th>Monthly</th><th>Extra (interest)</th><th>Total you pay</th><th>% of pay</th></tr>"+
    [24,36,48,60,72,84].map(t=>{const l=loan(P,V.capr,t,0);
      return `<tr class="${t===V.cterm?"sel":""}"><td>${t} months (${yrs(t)})</td><td>${f(l.pm)}</td><td>${f(l.int)}</td><td>${f(dpay+P+l.int)}</td><td>${pc(l.pm/nt)}</td></tr>`;}).join("");
  /* extra payments */
  const exs=[...new Set([0,100,200,300,500,V.cextra])].sort((a,b)=>a-b);
  $("cexd").textContent="Adding to the "+V.cterm+"-month loan. Your slider is highlighted.";
  $("cextra").innerHTML="<tr><th>Extra a month</th><th>Paid off</th><th>Interest</th><th>Saved</th></tr>"+
    exs.map(x=>{const l=loan(P,V.capr,V.cterm,x);
      return `<tr class="${x===V.cextra?"sel":""}"><td>${f(x)}</td><td>${dl(buy+l.months)} <small style="color:var(--mute)">(${l.months} mo)</small></td><td>${f(l.int)}</td><td>${f(base.int-l.int)}</td></tr>`;}).join("");
  /* rates */
  $("crd").textContent="Same loan at different rates. A better rate is worth asking for.";
  $("crate").innerHTML="<tr><th>Rate</th><th>Monthly</th><th>Interest</th><th>Vs now</th></tr>"+
    [-2,-1,0,1,2].map(d=>{const a=Math.max(0,V.capr+d),l=loan(P,a,V.cterm,0),df=l.int-base.int;
      return `<tr class="${d===0?"sel":""}"><td>${a.toFixed(1)}%</td><td>${f(l.pm)}</td><td>${f(l.int)}</td><td>${d===0?"–":(df>0?"+":"-")+f(Math.abs(df))}</td></tr>`;}).join("");
  /* chart */
  const W=640,H=260,L=56,R=12,T=12,B=28,pw=W-L-R,ph=H-T-B,g={s:""},N=Math.max(base.bal.length,ex.bal.length)-1||1;
  const X=i=>L+i/N*pw,Y=v=>T+ph-v/(P||1)*ph;
  grid(g,0,P||1,Y,W,L,R);
  const stp=Math.max(1,Math.ceil(N/12/6))*12;
  for(let i=0;i<=N;i+=stp)g.s+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle" fill="#a1a1aa" font-size="11">${i/12} yr</text>`;
  const line=(b,c,w)=>`<path d="${b.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"/>`;
  g.s+=line(base.bal,"#fafafa",2);if(V.cextra>0)g.s+=line(ex.bal,"#34d399",2.5);
  $("carchart").innerHTML=g.s;
  $("cchd").textContent=V.cextra>0?"Paying "+f(V.cextra)+" extra a month clears the loan "+(base.months-ex.months)+" months sooner and saves "+f(base.int-ex.int)+" in interest.":"Raise the extra payment slider to see how much sooner you would finish.";
}
function drawBars(rows){
  const W=640,L=56,R=12,T=12,B=28,pw=W-L-R,H=280,ph=H-T-B,g={s:""},n=rows.length;
  const mx=Math.max(1,...rows.map(r=>r.dep)),mn=Math.min(0,...rows.map(r=>r.dep));
  const Y=v=>T+ph-(v-mn)/(mx-mn)*ph;
  grid(g,mn,mx,Y,W,L,R);
  const bw=Math.max(1,pw/n*.7),X=i=>L+(i+.5)/n*pw;
  const step=Math.ceil(n/8);
  rows.forEach((r,i)=>{
    const baseV=Math.min(r.base,r.dep),y0=Y(0),yb=Y(r.base),yt=Y(r.dep);
    g.s+=`<rect x="${(X(i)-bw/2).toFixed(1)}" y="${Math.min(y0,yb).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.abs(yb-y0).toFixed(1)}" fill="#34d399"/>`;
    if(r.extra)g.s+=`<rect x="${(X(i)-bw/2).toFixed(1)}" y="${Math.min(yb,yt).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.abs(yt-yb).toFixed(1)}" fill="#fbbf24"/>`;
    if(i%step===0||i===n-1){const p=r.lab.split(" ");g.s+=`<text x="${X(i).toFixed(1)}" y="${H-8}" text-anchor="middle" fill="#a1a1aa" font-size="11">${p[0]} ’${p[1].slice(2)}</text>`;}
  });
  $("chart2").innerHTML=g.s;
  const tot=rows.reduce((t,r)=>t+r.dep,0),ex=rows.reduce((t,r)=>t+r.extra,0);
  $("cn2").textContent="Each bar is what you add that month. "+f(tot)+" in total, of which "+f(ex)+" is bonuses and one-time money. October is zero because only starting savings count in the first month.";
}
/* one-time expenses */
const oxBox=document.createElement("div");
oxBox.innerHTML='<div class="grp"><span>One-time expenses</span><span id="oxt">$0</span></div><div id="oxlist"></div><button class="add" id="oxadd" type="button">+ Add a one-time expense</button><p class="note" style="margin-top:10px">These come out of your savings once, in the month you pick. "Now" is paid today. Change the amount of the credit card balance to what you still owe.</p>';
c3.appendChild(oxBox);
const oxlist=oxBox.querySelector("#oxlist");
const oxTot=()=>{$("oxt").textContent=f(OX.reduce((t,o)=>t+(o.on?o.a:0),0));};
function addOX(o){
  OX.push(o);
  const r=document.createElement("div");r.className="oo";r.dataset.id=o.id;
  r.innerHTML=`<input class="oi" type="checkbox" checked aria-label="Include in projection"><input class="on" type="text" value="${o.n}" aria-label="Name"><input class="oa" type="number" min="0" step="50" value="${o.a}" aria-label="Amount"><select class="om" aria-label="Month">${MOPT}</select><button class="ox" type="button" aria-label="Remove">×</button>`;
  r.querySelector(".om").value=o.m;oxlist.appendChild(r);oxTot();
}
$("oxadd").addEventListener("click",()=>{addOX({id:++oxN,n:"One-time expense",a:500,m:0,on:true});run();});
oxlist.addEventListener("input",e=>{const r=e.target.closest(".oo");if(!r)return;const o=OX.find(x=>x.id===+r.dataset.id);
  if(e.target.classList.contains("oi")){o.on=e.target.checked;r.classList.toggle("off",!o.on);oxTot();run();}
  else if(e.target.classList.contains("oa")){o.a=Math.max(0,+e.target.value||0);oxTot();run();}
  else if(e.target.classList.contains("on"))o.n=e.target.value;});
oxlist.addEventListener("change",e=>{if(!e.target.classList.contains("om"))return;const r=e.target.closest(".oo");OX.find(x=>x.id===+r.dataset.id).m=+e.target.value;run();});
oxlist.addEventListener("click",e=>{if(!e.target.classList.contains("ox"))return;const r=e.target.closest(".oo"),k=OX.findIndex(x=>x.id===+r.dataset.id);OX.splice(k,1);r.remove();oxTot();run();});
addOX({id:++oxN,n:"Credit card balance (remaining)",a:1000,m:0,on:true});
/* car goal sliders */
const cc=$("carctl");
addCtl(cc,"cprice","Car price, before tax",5000,100000,500,30000,v=>f(v));
const tx=document.createElement("div");tx.className="ctl check";
tx.innerHTML='<input type="checkbox" id="ctax" checked><label for="ctax" style="margin:0">Add GST and QST (14.975%)</label>';
cc.appendChild(tx);V.ctax=true;
tx.querySelector("input").addEventListener("change",e=>{V.ctax=e.target.checked;run();});
addCtl(cc,"cdown","Down payment",0,60000,500,6000,v=>f(v));
addCtl(cc,"capr","Loan interest rate (APR)",0,15,.1,7.5,v=>v.toFixed(1)+"%");
addCtl(cc,"cterm","Loan length",12,96,12,60,v=>v+" months");
addCtl(cc,"cextra","Extra you pay each month",0,1000,25,100,v=>f(v));
addCtl(cc,"cbuy","Buy the car in",0,36,1,12,v=>v===0?"now":dl(v));
/* fill the third column under Expenses */
["dates","scen","yby"].forEach(id=>{const c=$(id).closest(".card");if(c)c3.appendChild(c);});
$("hz").addEventListener("change",e=>{V.n=+e.target.value;run();});
$("tfsa").addEventListener("input",run);$("fhsa").addEventListener("input",run);
run();

/* ---- plain-language tooltips: hover, focus or tap an underlined term ---- */
(function(){
  const T=[
    ["annual incentive|\\bAIP\\b","Annual incentive (AIP)","A yearly bonus from Air Canada. It depends on how the company and you perform, and it is paid each March.","It can speed up your savings. It is not guaranteed, so treat it as extra and make sure your bills are covered without it."],
    ["signing (?:bonus|payments?)","Signing bonus","A one-time bonus for joining, paid in two parts (Feb and Aug 2027) if you are still employed.","A big boost for your emergency fund or down payment. Tax is taken first, so the planner uses the after-tax amount."],
    ["take-home","Take-home pay","The money that actually lands in your bank account after tax and deductions.","It is the number to budget with. Your salary is bigger, but you cannot spend what is taken off."],
    ["\\bgross\\b","Gross","The amount before tax and deductions are taken off.","Gross looks bigger than what you receive. Plan with the net (after-tax) amount."],
    ["\\bnet\\b","Net","The amount after tax and deductions are taken off.","It is the money you can really spend or save, so every bonus here is shown net."],
    ["\\bTFSA\\b","TFSA (Tax-Free Savings Account)","An account where your savings and any growth are never taxed, and you can take money out any time.","You keep all your gains. Good for flexible goals like a car or an emergency fund."],
    ["\\bFHSA\\b","FHSA (First Home Savings Account)","An account for buying your first home. You can add $8,000 a year, up to $40,000 in total.","What you put in lowers your tax (a bigger refund), and the money is tax-free when used for the home."],
    ["\\bRRSP\\b","RRSP (Registered Retirement Savings Plan)","An account for retirement savings. What you put in is deducted from your income for tax.","It can give you a bigger tax refund now. You pay tax later when you withdraw, usually at a lower rate."],
    ["\\bQPIP\\b","QPIP (Quebec Parental Insurance Plan)","A small deduction that pays for maternity, paternity and parental leave in Quebec.","It is one reason take-home is lower than pay, and it covers you if you ever take leave."],
    ["\\bQPP\\b","QPP (Quebec Pension Plan)","A required deduction from your pay that builds your government retirement pension.","It lowers take-home today, but you earn a pension from it later."],
    ["\\bEI\\b","EI (Employment Insurance)","A small deduction that gives you benefits if you lose your job.","It is part of why take-home is lower than salary, and it acts as a safety net."],
    ["(?:employer )?pension match|pension \\(6%\\)","Pension match","Air Canada adds money to your pension, up to 6% of pay, when you put in 6%.","It is free money. Contributing the full amount is one of the best returns you can get."],
    ["emergency fund","Emergency fund","Cash set aside for surprises such as a job loss, a repair or a medical cost.","It keeps you out of credit card debt. One to three months of expenses is a common goal."],
    ["savings rate","Savings rate","The share of your take-home pay that you save each month.","A quick health check. About 20% is a common target, and a higher rate reaches your goals sooner."],
    ["50/30/20","50/30/20 guideline","A simple budget rule: 50% of pay for needs, 30% for wants and 20% for savings.","It shows at a glance whether your spending is balanced, without tracking every dollar."],
    ["\\bAPR\\b","APR (annual percentage rate)","The yearly cost of borrowing, shown as a percentage of the loan.","A lower APR means less interest. Even 1% less can save hundreds on a car loan."],
    ["down payment","Down payment","The cash you pay upfront. The rest of the price is borrowed.","A bigger down payment means a smaller loan, a lower monthly payment and less interest."],
    ["GST and QST","GST and QST","Sales taxes: 5% federal (GST) plus 9.975% Quebec (QST), 14.975% in total, added to the price.","A $30,000 car really costs about $4,500 more at the till, so include it in your plan."],
    ["welcome tax","Welcome tax","A Quebec tax you pay once when you buy property (a land transfer tax).","It is a cost on top of your down payment, so save for it too."],
    ["closing costs","Closing costs","Fees paid when you finish buying a home: welcome tax, notary, inspection and more.","They are about 3% of the price on top of your down payment, so you need that cash as well."],
    ["\\binterest\\b","Interest","The fee a lender charges you for borrowing money.","Paying a loan off faster, or at a lower rate, means less interest and a cheaper car."],
    ["probation","Probation","The first months of a job when an employer can end it more easily. Yours ends mid-February.","Some bonus payments depend on you still being employed, so the plan treats them as extra."],
    ["\\bESOP\\b","ESOP (employee share ownership plan)","A plan to buy company shares through your pay. The employer may add a match.","It can grow your wealth, but keep it small: your job and your shares would both depend on one airline."],
    ["T4 and RL-1","T4 and RL-1","Tax slips from your employer showing what you earned and how much tax was already taken.","You need them to file your return, which is when your refund is worked out."],
    ["Aeroplan points","Aeroplan points","Air Canada's loyalty points, which you can use toward flights.","Free value from your job that can lower travel costs. It is not cash, so the plan leaves it out."],
    ["profit sharing","Profit sharing","A payment to employees when the company has a good year.","A possible bonus, but not guaranteed, so it is left out of your plan."],
    ["investment return","Investment return","How much invested money grows in a year, as a percentage.","Growth is what turns steady saving into a million. It is never guaranteed, so use a cautious number."],
    ["retro deductions","Retro deductions","Catch-up deductions taken from one paycheque for earlier pay periods.","They made September's pay lower than normal, so the plan adds them back to show your usual pay."],
    ["refund","Tax refund","Money the government returns when more tax was taken from your pay than you owed.","Putting money in an RRSP or FHSA lowers the tax you owe, which can raise your refund."],
    ["surplus","Surplus","What is left of your pay after expenses.","It is the money you can save each month, so growing it grows your savings."],
    ["\\bHorizon\\b","Horizon","How far ahead the charts and totals look.","A longer horizon shows bigger long-term results. A shorter one shows near-term cash."]
  ];
  const rx=new RegExp(T.map(t=>"(?:("+t[0]+"))").join("|"),"gi");
  const SKIP=new Set(["SCRIPT","STYLE","BUTTON","OPTION","SELECT","INPUT","TEXTAREA","OUTPUT"]);
  const UNIT=".kpis,.card,.panel,.duo,.ctl,.msg,.foot,header";
  const main=document.querySelector("main");
  const tip=document.createElement("div");tip.id="tipbox";tip.setAttribute("role","tooltip");document.body.appendChild(tip);
  let cur=null,pend=false;

  function hide(){tip.style.display="none";if(cur){cur.removeAttribute("aria-describedby");cur=null;}}
  function show(el){
    cur=el;const t=T[+el.dataset.k];
    tip.textContent="";
    const h=document.createElement("b");h.textContent=t[1];tip.appendChild(h);
    [["What it is",t[2]],["How it helps",t[3]]].forEach(([a,b])=>{
      const p=document.createElement("p"),s=document.createElement("span");
      s.textContent=a;p.appendChild(s);p.appendChild(document.createTextNode(b));tip.appendChild(p);
    });
    tip.style.display="block";
    const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
    const x=Math.min(Math.max(8,r.left+r.width/2-tw/2),innerWidth-tw-8);
    let y=r.bottom+8;if(y+th>innerHeight-8)y=Math.max(8,r.top-th-8);
    tip.style.left=x+"px";tip.style.top=y+"px";
    el.setAttribute("aria-describedby","tipbox");
  }

  function decorate(){
    pend=false;
    if(cur&&!document.contains(cur))hide();
    const used=new WeakMap();
    const mark=(u,k)=>{let s=used.get(u);if(!s){s=new Set();used.set(u,s);}if(s.has(k))return false;s.add(k);return true;};
    main.querySelectorAll(".gl").forEach(e=>mark(e.closest(UNIT)||main,+e.dataset.k));
    const w=document.createTreeWalker(main,NodeFilter.SHOW_TEXT,{acceptNode(n){
      const p=n.parentElement;
      if(!p||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      if(SKIP.has(p.tagName)||p.closest(".gl,svg,button"))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(n=>{
      const s=n.nodeValue,p=n.parentElement;rx.lastIndex=0;
      let m,last=0,frag=null;
      while((m=rx.exec(s))){
        const k=m.slice(1).findIndex(x=>x!==undefined);
        if(!mark(p.closest(UNIT)||main,k))continue;
        frag=frag||document.createDocumentFragment();
        if(m.index>last)frag.appendChild(document.createTextNode(s.slice(last,m.index)));
        const sp=document.createElement("span");
        sp.className="gl";sp.dataset.k=k;sp.tabIndex=0;sp.setAttribute("role","button");sp.textContent=m[0];
        frag.appendChild(sp);last=m.index+m[0].length;
      }
      if(!frag)return;
      if(last<s.length)frag.appendChild(document.createTextNode(s.slice(last)));
      if(/flex|grid/.test(getComputedStyle(p).display)){const wr=document.createElement("span");wr.appendChild(frag);p.replaceChild(wr,n);}
      else p.replaceChild(frag,n);
    });
  }

  const hit=e=>e.target&&e.target.closest?e.target.closest(".gl"):null;
  document.addEventListener("mouseover",e=>{const el=hit(e);if(el)show(el);});
  document.addEventListener("mouseout",e=>{if(hit(e)&&!(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest(".gl")))hide();});
  document.addEventListener("focusin",e=>{const el=hit(e);if(el)show(el);});
  document.addEventListener("focusout",e=>{if(hit(e))hide();});
  document.addEventListener("click",e=>{const el=hit(e);if(el){e.preventDefault();show(el);}else hide();},true);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")hide();});
  addEventListener("scroll",hide,{passive:true});addEventListener("resize",hide);

  const _r=run;
  run=function(){_r.apply(this,arguments);if(!pend){pend=true;requestAnimationFrame(decorate);}};
  decorate();
})();

/* ---- cloud sync: saves every input to MongoDB through /api/state so all devices match ---- */
(function(){
  const KEY="planner_pass",API="/api/state";
  let pass="",loaded=false,applying=false,bulk=false,timer=null,lastAt=0,saving=false,dirty=false;
  try{pass=localStorage.getItem(KEY)||"";}catch(e){}
  const toLogin=bad=>{try{localStorage.removeItem(KEY);}catch(e){}location.replace("/login"+(bad?"?e=1":""));};
  if(!pass){toLogin(false);return;}
  const endSkel=()=>document.body.classList.remove("sk");
  setTimeout(endSkel,8000);
  const bar=document.createElement("div");bar.className="chips";
  bar.innerHTML='<span class="chip" id="syncChip">Sync <b>starting</b></span><button type="button" class="chip" id="lockBtn" style="background:none;cursor:pointer;font:inherit;font-size:12.5px">Lock</button>';
  document.querySelector(".top-r").appendChild(bar);
  $("lockBtn").addEventListener("click",()=>toLogin(false));
  const setS=(t,c)=>{const el=$("syncChip");el.innerHTML="Sync <b></b>";el.lastChild.textContent=t;el.lastChild.style.color=c||"";};

  const fields=()=>[...document.querySelectorAll("input[id],select[id]")].filter(el=>!el.closest("#oolist,#oxlist")&&(el.type==="range"||el.type==="checkbox"||el.type==="number"||el.tagName==="SELECT"));
  function capture(){
    const v={};fields().forEach(el=>{v[el.id]=el.type==="checkbox"?el.checked:el.value;});
    return {v,oo:OO.map(o=>({...o})),ox:OX.map(o=>({...o}))};
  }
  const mkRow=o=>{
    const r=document.createElement("div");r.className="oo"+(o.on?"":" off");r.dataset.id=o.id;
    r.innerHTML=`<input class="oi" type="checkbox" ${o.on?"checked":""} aria-label="Include in projection"><input class="on" type="text" aria-label="Name"><input class="oa" type="number" min="0" step="50" aria-label="Amount"><select class="om" aria-label="Month">${MOPT}</select><button class="ox" type="button" aria-label="Remove">×</button>`;
    r.querySelector(".on").value=o.n;r.querySelector(".oa").value=+o.a||0;r.querySelector(".om").value=o.m;return r;
  };
  const rebuild=(arr,list,saved)=>{arr.length=0;list.innerHTML="";(saved||[]).forEach(o=>{const c={id:+o.id,n:String(o.n||""),a:Math.max(0,+o.a||0),m:Math.max(0,Math.min(59,+o.m||0)),on:!!o.on};arr.push(c);list.appendChild(mkRow(c));});};
  function apply(s){
    applying=true;bulk=true;
    try{
      Object.entries(s.v||{}).forEach(([id,val])=>{
        const el=$(id);if(!el)return;
        if(el.type==="checkbox"){el.checked=!!val;el.dispatchEvent(new Event("change",{bubbles:true}));}
        else{el.value=val;el.dispatchEvent(new Event(el.tagName==="SELECT"?"change":"input",{bubbles:true}));}
      });
      rebuild(OO,oolist,s.oo);rebuild(OX,oxlist,s.ox);
      ooN=Math.max(0,...OO.map(o=>o.id));oxN=Math.max(0,...OX.map(o=>o.id));
      ooTot();oxTot();
    }finally{bulk=false;}
    _run();applying=false;
  }

  async function call(method,body){
    const r=await fetch(API,{method,cache:"no-store",headers:{"Content-Type":"application/json","x-passcode":pass},body:body?JSON.stringify(body):undefined});
    if(r.status===401){const e=new Error("auth");e.auth=true;throw e;}
    if(!r.ok)throw new Error("http "+r.status);
    return r.json();
  }
  async function push(){
    if(saving){timer=setTimeout(push,500);return;}
    saving=true;
    try{const res=await call("PUT",{state:capture()});lastAt=res.updatedAt;dirty=false;setS("saved","var(--std)");}
    catch(e){if(e.auth)toLogin(true);else setS("offline, will retry","var(--neg)");}
    saving=false;
  }
  function schedule(){
    if(!loaded||applying||bulk)return;
    dirty=true;setS("saving…","var(--promo)");clearTimeout(timer);timer=setTimeout(push,800);
  }
  async function pull(){
    try{
      const res=await call("GET");
      if(res.state&&res.updatedAt>lastAt&&!dirty){apply(res.state);lastAt=res.updatedAt;}
      if(!loaded){loaded=true;if(!res.state){dirty=true;push();}}
      if(!dirty)setS("synced","var(--std)");
      endSkel();
    }catch(e){if(e.auth)toLogin(true);else{setS("offline","var(--neg)");endSkel();}}
  }

  const _run=run;
  run=function(){if(bulk)return;_run.apply(this,arguments);schedule();};
  document.addEventListener("input",schedule);document.addEventListener("change",schedule);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")pull();});
  setInterval(()=>{if(document.visibilityState==="visible"&&!dirty&&!saving)pull();},45000);
  pull();
})();

}
