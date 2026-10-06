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
/* plain-language explanations for stat cards, matched by the start of the card label */
const KTIPS=[
  ["Saved by","Your projected savings at the end of the period you picked: what you have now, plus your monthly surplus, plus any bonuses."],
  ["Savings rate","The share of your take-home pay left after all expenses. Saving 20% or more is a common target."],
  ["Emergency fund","When your savings cover one month of expenses, and then three. This cushion protects you from a job loss or a surprise bill."],
  ["Next milestone","The next savings level you will reach, and the month you are expected to get there."],
  ["Bonuses and one-time money","Signing payments, the yearly incentive and other one-off money in this period, and how much of your savings they make up."],
  ["Lowest balance","The lowest your bank account gets, usually just before payday. Below $0 means you would be overdrawn."],
  ["Balance by","Your savings at the end of the period, after every month's deposit."],
  ["Typical month","The average you save in a month. The first month is left out so this reflects a normal month."],
  ["Best month","The month you save the most, usually because a bonus arrives then."],
  ["Bonuses and one-time","All bonus and one-off money in the period, and its share of everything you save. Do not count on it for bills."],
  ["You reach","The month your invested savings reach your target, if returns match the rate you chose."],
  ["Invest each month","What goes into your investments each month: your surplus plus any extra you add. It grows each year by the increase you set."],
  ["You put in","The total of your own money invested by the time you reach the target."],
  ["Growth from returns","Money your investments earn on their own. Over long periods it can overtake what you put in."],
  ["In today's dollars","What the target would buy in today's money once prices rise 2% a year. A million in the future buys less than a million today."],
  ["Total pension at 65","The projected value of your Air Canada pension account when you turn 65: your contributions, Air Canada's match and the growth on both."],
  ["Your contributions","The 6% of your salary taken from every paycheque and paid into the pension, added up until you turn 65."],
  ["Air Canada adds","Air Canada matches your 6% with 6% of its own. It is extra pay that goes straight into your pension."],
  ["Investment growth","What the pension fund earns by investing the contributions. Money that goes in early has the longest time to grow."],
  ["Monthly income at 65","What you could spend each month in retirement, in today's money, from your pension, your own investments, QPP and OAS."],
  ["Monthly payment","Your car loan payment each month. Try to keep it under 10 to 15% of take-home pay."],
  ["Extra you pay in interest","What the loan costs on top of the car's price. A shorter loan or a lower rate cuts it."],
  ["Total cost of the car","The price, plus sales tax, plus all the interest you pay over the life of the loan."],
  ["You borrow","The loan amount: the price with tax, minus your down payment."],
  ["Paid off by","The month you make your last car payment."],
  ["Left over after the payment","Your monthly surplus after the car payment. This is what you can still save."]];
const ktip=k=>{const t=KTIPS.filter(t=>k.startsWith(t[0])).sort((a,b)=>b[0].length-a[0].length)[0];return t?t[1]:"";};
const kpi=(k,v,n,c="",tip="")=>{const t=tip||ktip(k);return `<div class="kpi ${c}"><div class="k">${k}${t?`<button type="button" class="ktip" aria-label="What this means" data-tip="${t.replace(/"/g,"&quot;")}">i</button>`:""}</div><div class="v">${v}</div><div class="n">${n}</div></div>`;};
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

  /* needs / wants / savings: waffle of take-home */
  const needs=V.cats.filter(c=>c.need).reduce((t,c)=>t+c.m,0),wants=V.exp-needs,sv=Math.max(0,left),nt=V.net||1;
  {
    const over=left<0,base=over?V.exp:nt,parts=[["Needs",needs,"var(--scotia)",.5,"rent, bills, groceries, transit, health"],["Wants",wants,"var(--promo)",.3,"subscriptions, eating out, shopping, other"],["Savings",sv,"var(--std)",.2,"what is left over"]];
    const raw=parts.map(p=>p[1]/base*100),cnt=raw.map(Math.floor);let rem=100-cnt.reduce((t,c)=>t+c,0);
    raw.map((r,i)=>[r-Math.floor(r),i]).sort((x,y)=>y[0]-x[0]).forEach(([,i])=>{if(rem>0){cnt[i]++;rem--;}});
    $("waf").innerHTML=parts.map((p,i)=>`<i style="background:${p[2]}"></i>`.repeat(cnt[i])).join("");
    $("waf").setAttribute("aria-label",parts.map((p,i)=>p[0]+" "+cnt[i]+"%").join(", "));
    $("wafd").textContent=over?"You spend more than you earn, so each square here is 1% of your spending.":"Each square is 1% of your "+f(V.net)+" take-home, about "+f(V.net/100)+". The 50/30/20 guideline is 50 needs, 30 wants, 20 savings.";
    $("rule").innerHTML=parts.map(p=>{const pct=p[1]/nt,d=Math.round((pct-p[3])*100),good=p[0]==="Savings"?d>=0:d<=0;
      return `<div class="wl"><div class="wlh"><span><i style="background:${p[2]}"></i>${p[0]}</span><b>${pc(pct)}</b></div><div class="wls">${f(p[1])} · ${p[4]}</div>`+
        `<div class="wlv ${good?"ok":"bad"}">${d===0?"Right on the "+pc(p[3])+" guideline":(Math.abs(d)+" points "+(d>0?"above":"below")+" the "+pc(p[3])+" guideline")}</div></div>`;}).join("");
  }

  /* tax-sheltered room */
  const tf=Math.max(0,+$("tfsa").value||0),fh=Math.max(0,+$("fhsa").value||0);
  $("tfsab").style.width=Math.min(100,tf?last.a/tf*100:0)+"%";
  $("tfsat").innerHTML=tf?"Your savings by <b>"+last.lab+"</b> would use <b>"+pc(Math.min(1,last.a/tf))+"</b> of this room. Room fills up: <b>"+eta(tf)+"</b>.":"Enter your TFSA room.";
  const dec=calc(3)[2].a,fc=Math.min(Math.max(0,dec),fh),est=fc<=4000?fc*.36:1450+(fc-4000)*.3;
  $("fhsab").style.width=Math.min(100,fh?Math.max(0,dec)/fh*100:0)+"%";
  $("fhsat").innerHTML=fh?"By Dec 31 your savings would be about <b>"+f(Math.max(0,dec))+"</b>. Contributing that to an FHSA by Dec 31 could add roughly <b>"+f(est)+"</b> to your 2026 refund (estimate). Cover your 1-month fund first.":"Enter your FHSA room.";

  /* health check */
  const rent=V.cats.find(c=>c.n==="Rent"),rm=rent?rent.m:0,addTot=Math.max(0,last.a-(V.start+V.lump));
  const mo3=far.findIndex(r=>r.a>=V.exp*3),rel=addTot>0?extra/addTot:0;
  const IC={ok:["Good","M3.5 8.5l3 3 6-7"],watch:["Watch","M8 4v5M8 12v.5"],act:["Act","M5 5l6 6M11 5l-6 6"]};
  const tile=(t,lv,v,g,ex)=>`<div class="hct ${lv}"><div class="hctt"><span>${t}</span><span class="pill"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${IC[lv][1]}"/></svg>${IC[lv][0]}</span></div><div class="hcv">${v}</div><div class="hcg">${g}</div><p>${ex}</p></div>`;
  const hcs=[
    tile("Savings rate",left<0?"act":rate>=.2?"ok":rate>=.1?"watch":"act",pc(rate),"Target 20% or more",
      left<0?"You spend more than you earn.":rate>=.2?"You keep more than a fifth of your pay.":"Saving "+f(.2*V.net-left)+" more a month reaches 20%."),
    tile("Rent",!rm?"ok":rm/nt<=.3?"ok":rm/nt<=.4?"watch":"act",pc(rm/nt),"Guideline about 30% of take-home",
      !rm?"No rent entered.":rm/nt<=.3?"Housing is within the guideline.":"About "+f(rm-.3*V.net)+" a month above 30%. Your biggest single cost."),
    tile("Needs",needs/nt<=.5?"ok":needs/nt<=.6?"watch":"act",pc(needs/nt),"Guideline 50% of take-home",
      needs/nt<=.5?"Essentials leave room for the rest.":"Essentials crowd out wants and savings. Rent is most of it."),
    tile("Safety net",mo3<0?"act":mo3<=12?"ok":mo3<=24?"watch":"act",mo3<0?"Not reached":mo3===0?"Reached":far[mo3].lab,f(V.exp*3)+" covers 3 months of costs",
      mo3<0?"Raise your savings to build a cushion.":mo3===0?"You already have it.":"That is "+mo3+" months away. 1 month arrives "+e1+"."),
    tile("Lowest cash",lo.bal<0?"act":lo.bal<V.fx?"watch":"ok",f(lo.bal),"on "+MN[lod.getMonth()]+" "+lod.getDate(),
      lo.bal<0?"Your account would go negative. Keep "+f(-lo.bal)+" extra in chequing.":lo.bal<V.fx?"Thin cushion before payday. Avoid big purchases late in the month.":"Comfortable cushion all month."),
    tile("Bonus reliance",rel<=.25?"ok":rel<=.5?"watch":"act",pc(rel),"of what you add by "+last.lab,
      !extra?"None in this period. Your plan runs on pay alone.":rel<=.25?"Most of your savings come from steady pay.":"A big share depends on bonuses you might not get.")];
  $("hc").innerHTML=hcs.join("");

  /* guidelines vs you */
  {
    const cm=n=>V.cats.filter(c=>n.includes(c.n)).reduce((t,c)=>t+c.m,0);
    const P=v=>v/nt,mo=v=>V.exp?v/V.exp:0,pf=v=>Math.abs(v)<.1&&v!==0?(v*100).toFixed(1)+"%":pc(v),mf=v=>v.toFixed(1)+" mo";
    /* [group, name, what it covers, guideline text, value, fmt, good, ok, higherIsBetter, bar max] */
    const G=[
      ["Big picture","Savings rate","left over after all costs","20% or more",P(left),pf,.2,.15,1,.4],
      ["Big picture","Needs","rent, bills, groceries, transit, health","50% or less",P(needs),pf,.5,.55,0,1],
      ["Big picture","Wants","subscriptions, eating out, shopping, fun","30% or less",P(wants),pf,.3,.35,0,.6],
      ["Spending","Rent","","30% or less",P(rm),pf,.3,.35,0,.6],
      ["Spending","Bills","electricity, phone, Wi-Fi","10% or less",P(cm(["Electricity (bill every 2 months)","Phone","Wi-Fi"])),pf,.1,.12,0,.2],
      ["Spending","Transit","Opus Metro pass","10% or less",P(cm(["Opus Metro pass"])),pf,.1,.15,0,.3],
      ["Spending","Groceries","","15% or less",P(cm(["Groceries"])),pf,.15,.18,0,.3],
      ["Spending","Eating out","","5% or less",P(cm(["Eating out"])),pf,.05,.08,0,.15],
      ["Spending","Shopping and fun","shopping, entertainment, other","10% or less",P(cm(["Shopping","Entertainment & misc","Other"])),pf,.1,.15,0,.3],
      ["Spending","Subscriptions","","2% or less",P(V.grp[1]),pf,.02,.03,0,.06],
      ["Safety","Emergency fund today","savings you hold now","3 to 6 months of costs",mo(start0),mf,3,1,1,6],
      ["Safety","Emergency fund by "+last.lab,"projected","3 to 6 months of costs",mo(last.a),mf,3,1,1,6],
      ["Safety","Lowest cash balance","on "+MN[lod.getMonth()]+" "+lod.getDate(),"never below $0",lo.bal,f,V.fx,0,1,Math.max(V.fx*2,lo.bal,1)],
      ["Safety","Bonus reliance","share of what you add","25% or less",rel,pf,.25,.5,0,1],
      ["Safety","Pension","employer matches up to 6%","take the full match",1,()=>"6%",1,1,1,1]];
    const ST={good:["Good","M3.5 8.5l3 3 6-7"],ok:["OK","M4 8h8"],bad:["Off track","M5 5l6 6M11 5l-6 6"]};
    let cnt={good:0,ok:0,bad:0},grp="";
    const rowsH=G.map(g=>{
      const [gr,nm,sub,gl,v,fm,gd,ok,hi,mx]=g;
      const st=hi?(v>=gd?"good":v>=ok?"ok":"bad"):(v<=gd?"good":v<=ok?"ok":"bad");cnt[st]++;
      const w=Math.max(0,Math.min(1,v/mx)),mk=Math.max(0,Math.min(1,(hi&&ok===0?ok:gd)/mx));
      const head=gr!==grp?`<div class="gvg">${gr}</div>`:"";grp=gr;
      return head+`<div class="gvr ${st}" role="row"><div class="gvn" role="cell"><b>${nm}</b>${sub?`<span>${sub}</span>`:""}</div>`+
        `<div class="gvgl" role="cell"><span class="gvk">Guideline</span>${gl}</div>`+
        `<div class="gvy" role="cell"><span class="gvk">You</span><b>${fm(v)}</b></div>`+
        `<div class="gvb" role="cell" aria-hidden="true"><i style="width:${w*100}%"></i><s style="left:${mk*100}%"></s></div>`+
        `<div class="gvs" role="cell"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${ST[st][1]}"/></svg>${ST[st][0]}</div></div>`;
    }).join("");
    $("gv").innerHTML=`<div class="gvr gvh" role="row"><div role="columnheader">Check</div><div role="columnheader">Guideline</div><div role="columnheader">You</div><div role="columnheader"><span class="vh">Bar</span></div><div role="columnheader">Status</div></div>`+rowsH;
    $("gvd").textContent="Common rules of thumb for your take-home pay, next to your numbers. The white tick on each bar is the guideline.";
    $("gvl").innerHTML=`<span class="good"><b>${cnt.good}</b> good</span><span class="ok"><b>${cnt.ok}</b> OK, close to the line</span><span class="bad"><b>${cnt.bad}</b> off track</span>`;
  }

  /* income target */
  {
    const NR=4680.90/7917,need=[["For rent to be 30% of take-home",rm/.3],["For needs to be 50% of take-home",needs/.5],["To save 20% at today's spending",V.exp/.8]];
    const tgt=Math.ceil(Math.max(...need.map(x=>x[1]))/50)*50,gap=Math.max(0,tgt-V.net),bind=need.reduce((a,b)=>b[1]>a[1]?b:a);
    const SAL=95000,KEEP=.5,gross=v=>v<=V.net?SAL*v/(V.net||1):SAL+(v-V.net)*12/KEEP,gy=v=>f(Math.round(gross(v)/1000)*1000);
    $("itd").textContent="The highest of three checks sets the target. Gross pay assumes each extra dollar of salary adds about 50¢ to take-home (41 to 47.5% tax at this level plus 6% to your pension).";
    $("itgt").innerHTML=`<div class="itn"><span>Target take-home</span><b>${f(tgt)}</b><em>a month · about ${gy(tgt)} a year before tax</em></div>`+
      `<div class="itc"><div><span>You now</span><b>${f(V.net)}</b><em>about ${gy(V.net)} gross</em></div><div class="${gap?"bad":"good"}"><span>${gap?"Gap":"Above target by"}</span><b>${f(gap||V.net-tgt)}</b><em>${gap?"+"+pc(gap/V.net)+" a month":"you are there"}</em></div></div>`+
      need.map(x=>`<div class="itr${x===bind?" on":""}"><div class="lrow" style="margin:0 0 5px"><span>${x[0]}${x===bind?' <em class="tag">sets the target</em>':""}</span><span>${f(x[1])}</span></div>${bar(x[1]/Math.max(tgt,V.net),x===bind?"var(--text)":"#52525b",V.net/Math.max(tgt,V.net))}</div>`).join("")+
      `<p class="note" style="margin-top:12px">The tick on each bar is your take-home today.</p>`;
    {
      const r25=v=>Math.round(v/25)*25,autoT=Math.max(0,last.a)*.03/12+Math.max(0,V.exp-rm)*.015+1400/12;
      const mix=[["rs_raise",225],["rs_room",Math.min(1500,Math.round(rm/2/50)*50)],["rs_free",400],["rs_side",225]];
      const left2=gap-autoT-mix.reduce((t,m)=>t+m[1],0);if(left2>0)mix.push(["rs_dig",Math.min(2000,Math.ceil(left2/25)*25)]);
      const nm=Object.fromEntries(RS.map(r=>[r[0],r[1]]));
      $("itplan").innerHTML=gap?`<div class="grp"><span>An example plan</span><span>${f(mix.reduce((t,m)=>t+m[1],0)+autoT)}</span></div>`+
        mix.map(m=>`<div class="kv"><span>${nm[m[0]]}</span><span>${f(m[1])}</span></div>`).join("")+
        `<div class="kv"><span><em>Interest, cashback and tax refund</em></span><span>${f(autoT)}</span></div>`+
        `<div class="itb"><button type="button" class="add" data-mix='${JSON.stringify(mix)}'>Try this plan</button><button type="button" class="add" data-mix='${JSON.stringify(RS.map(r=>[r[0],0]))}'>Clear sliders</button></div>`+
        `<p class="note">No single stream closes a ${f(gap)} gap. Several small ones together can.</p>`:"";
    }
    /* pay package needed */
    {
      const B=Math.ceil(gross(tgt)/1000)*1000,pk=b=>[["Base salary",b],["Annual incentive (target 8%)",b*.08],["Employer pension match (6%)",b*.06],["Employer-paid health and dental",2996]];
      const now=pk(SAL),nd=pk(B),tn=now.reduce((t,x)=>t+x[1],0),td=nd.reduce((t,x)=>t+x[1],0),mx=td*1.02;
      const yrs=r=>Math.ceil(Math.log(B/SAL)/Math.log(1+r));
      const C=["var(--text)","var(--promo)","var(--scotia)","var(--mix)"];
      const sb=(lab,arr,tot)=>`<div class="pkr"><div class="lrow" style="margin:0 0 6px"><span>${lab}</span><span><b style="color:var(--text)">${f(tot)}</b> a year</span></div><div class="istk">${arr.map((x,i)=>`<i style="width:${x[1]/mx*100}%;background:${C[i]}" title="${x[0]}"></i>`).join("")}</div></div>`;
      $("pkgd").textContent=B>SAL?"To take home "+f(tgt)+" a month from salary alone, your base pay would need to be about "+f(B)+", "+pc(B/SAL-1)+" more than today. Here is the full package at that salary, using your Air Canada offer terms.":"Your current salary already reaches the target.";
      $("pkgbars").innerHTML=sb("Today",now,tn)+sb("Needed",nd,td)+
        '<div class="legend" style="margin:6px 0 16px">'+now.map((x,i)=>`<span><i style="background:${C[i]}"></i>${x[0].replace(/ \(.*\)/,"")}</span>`).join("")+'</div>';
      $("pkgt").innerHTML="<tr><th></th><th>Today</th><th>Needed</th><th>Change</th></tr>"+
        now.map((x,i)=>`<tr><td>${x[0]}</td><td>${f(x[1])}</td><td>${f(nd[i][1])}</td><td class="${nd[i][1]>x[1]?"up":""}">${nd[i][1]>x[1]?"+"+f(nd[i][1]-x[1]):"–"}</td></tr>`).join("")+
        `<tr class="tt"><td>Total yearly package</td><td>${f(tn)}</td><td>${f(td)}</td><td class="up">+${f(td-tn)}</td></tr>`+
        `<tr><td>Monthly take-home</td><td>${f(V.net)}</td><td>${f(tgt)}</td><td class="up">+${f(gap)}</td></tr>`;
      $("pkgn").innerHTML=B>SAL?`<div class="pkf"><div><b>${pc(B/SAL-1)}</b><span>raise needed on base pay</span></div><div><b>${yrs(.03)} years</b><span>with 3% yearly raises</span></div><div><b>${yrs(.05)} years</b><span>with 5% yearly raises</span></div><div><b>${f(B-SAL)}</b><span>more base pay a year</span></div></div>`+
        '<p class="note" style="margin-top:12px">The incentive pays once a year in March, so it does not raise your monthly take-home and is not counted toward the target. The one-time $5,000 signing bonus, Aeroplan points, profit sharing and ESOP are left out. A promotion, a job change or a mix with the side income above can get there faster than raises alone.</p>':"";
    }
    const rn=$("rs_room_n");if(rn)rn.textContent=rm?"Splitting rent with one roommate frees about "+f(rm/2)+" a month.":"";
    const auto=[["Interest on savings","3% in a high-interest account on your "+f(Math.max(0,last.a))+" balance",Math.max(0,last.a)*.03/12],
      ["Cashback credit card","1.5% back on everyday spending, paid off monthly",Math.max(0,V.exp-rm)*.015],
      ["Tax refund (FHSA or RRSP)","about $1,400 a year, spread over 12 months",1400/12]];
    const CL=["var(--scotia)","var(--mix)","var(--mix)","var(--mix)","var(--promo)"];
    const segs=RS.map((r,i)=>[r[1],V[r[0]]||0,CL[i]]).concat(auto.map(a=>[a[0],a[2],"var(--std)"])).filter(x=>x[1]>0);
    const add=segs.reduce((t,x)=>t+x[1],0),nn=V.net+add,mx=Math.max(tgt,nn)*1.02,pct=tgt?nn/tgt:1,st=pct>=1?"good":pct>=.9?"ok":"bad";
    $("istack").innerHTML=`<div class="istk"><i style="width:${V.net/mx*100}%;background:#52525b" title="Take-home now"></i>${segs.map(x=>`<i style="width:${x[1]/mx*100}%;background:${x[2]}" title="${x[0]}"></i>`).join("")}<s style="left:${tgt/mx*100}%"></s></div>`+
      `<div class="legend" style="margin:8px 0 0"><span><i style="background:#52525b"></i>Take-home now</span><span><i style="background:var(--scotia)"></i>Work</span><span><i style="background:var(--mix)"></i>Side income</span><span><i style="background:var(--promo)"></i>Housing</span><span><i style="background:var(--std)"></i>Automatic</span><span><i style="background:var(--text);width:2px;height:12px"></i>Target</span></div>`+
      `<div class="isum ${st}"><b>${f(nn)}</b> a month with these streams, <b>${pc(pct)}</b> of the ${f(tgt)} target. ${pct>=1?"Rent, needs and savings would all fit the guidelines.":"Still "+f(tgt-nn)+" a month to go."}</div>`;
    $("iauto").innerHTML='<div class="grp" style="margin-top:20px"><span>Already counted, no extra work</span><span>'+f(auto.reduce((t,a)=>t+a[2],0))+'</span></div>'+
      auto.map(a=>`<div class="kv"><span><i class="sw" style="background:var(--std)"></i>${a[0]} <em>· ${a[1]}</em></span><span>${f(a[2])}</span></div>`).join("")+
      '<p class="note" style="margin-top:10px">Side income is taxed at your marginal rate, roughly 37% in Quebec at $95,000, so the slider amounts are after that. Check your employment contract before taking outside work.</p>';
  }

  /* what to do next, ranked by monthly value */
  const acts=[];
  const wantsC=V.cats.filter(c=>!c.need&&c.m>0).sort((a,b)=>b.m-a.m);
  if(lo.bal<0)acts.push([1e9,"Keep a buffer in chequing",`Your balance dips to <b>${f(lo.bal)}</b> on ${MN[lod.getMonth()]} ${lod.getDate()}. Leave <b>${f(-lo.bal)}</b> extra in chequing or move a bill after payday.`]);
  if(rm/nt>.3)acts.push([rm-.3*V.net,"Lower your housing cost",`Rent is <b>${f(rm)}</b>, ${pc(rm/nt)} of take-home. Getting to 30% would free <b>${f(rm-.3*V.net)}</b> a month. A roommate or a cheaper place at renewal is your biggest lever.`]);
  if(wantsC[0])acts.push([wantsC[0].m/2,"Trim your biggest want",`<b>${wantsC[0].n}</b> costs ${f(wantsC[0].m)} a month. Halving it saves <b>${f(wantsC[0].m/2)}</b> a month, <b>${f(wantsC[0].m*6)}</b> a year.`]);
  if(V.grp[1]>0)acts.push([V.grp[1]/3,"Review subscriptions",`They add up to <b>${f(V.grp[1]*12)}</b> a year. Cancel anything you have not used this month.`]);
  if(left>0)acts.push([left,"Automate your savings",`Set a <b>${f(left)}</b> transfer for payday so it leaves chequing before you can spend it.`]);
  if(mo3>0)acts.push([V.exp/12,"Build your safety net first",`Park savings in a high-interest account until you hold <b>${f(V.exp*3)}</b> (three months of costs), expected <b>${far[mo3].lab}</b>.`]);
  if(extra>0)acts.push([extra/Math.max(1,V.n),"Bank bonuses on arrival",`<b>${f(extra)}</b> in bonuses and one-time money lands by ${last.lab}. Send it straight to savings; do not plan bills around it.`]);
  acts.sort((a,b)=>b[0]-a[0]);
  $("ins").innerHTML=acts.slice(0,5).map(a=>`<li><b class="at">${a[1]}</b><span>${a[2]}</span></li>`).join("");

  /* quick facts */
  const D=30.4,wd=21.7;
  const FX=[[f(Math.max(0,left)/D,2),"saved per day","from your monthly surplus"],
    [f(V.vr/D,2),"day-to-day spending per day","groceries, eating out, shopping"],
    [rm?(rm/V.net*wd).toFixed(1)+" days":"–","of work each month pays rent","out of about 22 working days"],
    [f(V.exp*12),"spent in a year","at today's budget"],
    [f(Math.max(0,left)*12),"saved from pay in a year","before bonuses"],
    [f(V.grp[1]*12),"on subscriptions a year",f(V.grp[1])+" a month"]];
  $("facts").innerHTML=FX.map(x=>`<div class="fact"><b>${x[0]}</b><span>${x[1]}</span><em>${x[2]}</em></div>`).join("");

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

  drawMonthly(rows);
  drawMil(far);
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
/* month by month page */
const fk=v=>{const a=Math.abs(v),s=v<0?"-":"";if(a>=1e6)return s+"$"+(+(a/1e6).toFixed(2))+"M";return a>=1000?s+"$"+(a/1000).toFixed(a>=10000?0:1)+"k":s+f(a);};
const mtip=document.createElement("div");mtip.id="mtip";mtip.setAttribute("role","tooltip");document.body.appendChild(mtip);
let MROWS=[];
(function(){
  let cur=null,at=0;
  const show=b=>{cur=b;at=Date.now();mtip.textContent=b.dataset.tip;mtip.classList.add("txt");mtip.style.display="block";
    const r=b.getBoundingClientRect(),tw=mtip.offsetWidth,th=mtip.offsetHeight;
    mtip.style.left=Math.min(Math.max(8,r.left+r.width/2-tw/2),innerWidth-tw-8)+"px";
    mtip.style.top=(r.bottom+8+th>innerHeight?r.top-th-8:r.bottom+8)+"px";b.setAttribute("aria-describedby","mtip");};
  const hide=()=>{if(cur)cur.removeAttribute("aria-describedby");cur=null;mtip.style.display="none";mtip.classList.remove("txt");};
  document.addEventListener("pointerover",e=>{const b=e.target.closest&&e.target.closest(".ktip");if(b&&e.pointerType==="mouse")show(b);});
  document.addEventListener("pointerout",e=>{const b=e.target.closest&&e.target.closest(".ktip");if(b&&e.pointerType==="mouse")hide();});
  document.addEventListener("focusin",e=>{const b=e.target.closest&&e.target.closest(".ktip");if(b)show(b);});
  document.addEventListener("focusout",e=>{if(e.target.closest&&e.target.closest(".ktip"))hide();});
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".ktip");if(b){e.preventDefault();if(cur===b&&Date.now()-at>400)hide();else show(b);}else if(cur)hide();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&cur)hide();});
  addEventListener("scroll",()=>{if(cur)hide();},{passive:true});
})();
function mtipShow(r,x,y){
  mtip.innerHTML=`<b>${r.lab}</b><div><i style="background:var(--std)"></i>From pay<span>${f(r.base)}</span></div>`+
    (r.extra?`<div><i style="background:var(--promo)"></i>Bonuses and one-time<span>${f(r.extra)}</span></div>`:"")+
    `<div class="tt">Saved<span>${f(r.dep)}</span></div><div>Balance<span>${f(r.a)}</span></div>`;
  mtip.style.display="block";
  const tw=mtip.offsetWidth,th=mtip.offsetHeight;
  mtip.style.left=Math.min(Math.max(8,x+14),innerWidth-tw-8)+"px";
  mtip.style.top=(y+th+14>innerHeight?y-th-14:y+14)+"px";
}
const mtipHide=()=>{mtip.style.display="none";};
function drawMonthly(rows){
  MROWS=rows;
  const n=rows.length,tot=rows.reduce((t,r)=>t+r.dep,0),ex=rows.reduce((t,r)=>t+r.extra,0);
  const paid=rows.filter(r=>r.i>0),avg=paid.length?paid.reduce((t,r)=>t+r.dep,0)/paid.length:0;
  const best=rows.reduce((b,r)=>r.dep>b.dep?r:b,rows[0]),bm=rows.filter(r=>r.extra>0).length,last=rows[n-1];
  document.querySelectorAll(".mhz").forEach(s=>{s.value=String(V.n);});
  $("mkpi").innerHTML=
    kpi("Balance by "+last.lab,f(last.a),f(tot)+" saved over "+n+" months","hero")+
    kpi("Typical month",f(avg),"average saved from "+(paid.length?paid[0].lab:"–")+" on",avg<0?"neg":"")+
    kpi("Best month",f(best.dep),best.lab+(best.extra?" · includes "+f(best.extra)+" bonus":""),"pos")+
    kpi("Bonuses and one-time",f(ex),bm?bm+" month"+(bm>1?"s":"")+" · "+pc(tot>0?ex/tot:0)+" of all you save":"none in this period",ex?"warn":"");
  $("mbd").textContent="Hover a bar for the details. "+(ex>0?"Amber tops are bonuses and one-time payments; the green is your steady surplus from pay.":"Every bar is your steady surplus from pay.");
  /* stacked bars */
  const svg=$("mbars"),W=Math.round(svg.clientWidth)||640,H=W<520?220:260,L=56,R=12,T=12,B=28,pw=W-L-R,ph=H-T-B,g={s:""};
  svg.dataset.w=String(W);
  let mx=Math.max(1,...rows.map(r=>Math.max(0,r.base)+r.extra)),mn=Math.min(0,...rows.map(r=>r.base));
  mx*=1.08;
  const Y=v=>T+ph-(v-mn)/(mx-mn)*ph,cw=pw/n,bw=Math.max(2,Math.min(36,cw*.68));
  grid(g,mn,mx,Y,W,L,R);
  const top=(x,y,w,h,c)=>{const r=Math.min(4,w/2,h);return `<path d="M${x} ${y+h}V${y+r}Q${x} ${y} ${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h}Z" fill="${c}"/>`;};
  const step=Math.max(1,Math.ceil(n/Math.max(2,Math.floor(pw/(n<=12?34:52)))));
  rows.forEach((r,k)=>{
    const x=L+k*cw+(cw-bw)/2,y0=Y(0);
    g.s+=`<rect class="hl" data-k="${k}" x="${L+k*cw}" y="${T}" width="${cw}" height="${ph}" fill="transparent"/>`;
    if(r.base<0){const h=Y(r.base)-y0;g.s+=`<rect x="${x}" y="${y0}" width="${bw}" height="${h}" fill="var(--neg)" pointer-events="none"/>`;}
    const hb=Math.max(0,y0-Y(Math.max(0,r.base))),he=y0-Y(Math.max(0,r.base)+r.extra)-hb;
    if(hb>0)g.s+=he>0?`<rect x="${x}" y="${y0-hb}" width="${bw}" height="${hb}" fill="var(--std)" pointer-events="none"/>`:top(x,y0-hb,bw,hb,"var(--std)").replace("/>",' pointer-events="none"/>');
    if(he>0){const gap=hb>0?2:0;g.s+=top(x,y0-hb-he,bw,Math.max(0,he-gap),"var(--promo)").replace("/>",' pointer-events="none"/>');}
    const dt=new Date(2026,9+r.i,1);
    if(k%step===0)g.s+=`<text x="${L+k*cw+cw/2}" y="${H-8}" text-anchor="middle" fill="#a1a1aa" font-size="11" pointer-events="none">${n<=12?MN[dt.getMonth()]:MN[dt.getMonth()]+" ’"+String(dt.getFullYear()).slice(2)}</text>`;
  });
  if(avg>0){const ya=Y(avg);g.s+=`<line x1="${L}" x2="${W-R}" y1="${ya}" y2="${ya}" stroke="#fafafa" stroke-opacity=".7" stroke-dasharray="4 4" pointer-events="none"/>`;}
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.innerHTML=g.s;
  $("mavg").textContent="Monthly average "+f(avg);
  /* balance line */
  {
    const sv=$("mline"),W=Math.round(sv.clientWidth)||640,H=W<520?220:260,L=56,R=16,T=16,B=28,pw=W-L-R,ph=H-T-B,g={s:""};
    sv.dataset.w=String(W);
    let hi=Math.max(1,...rows.map(r=>r.a))*1.06,lo=Math.min(0,...rows.map(r=>r.a));
    const X=k=>L+(n>1?k/(n-1):.5)*pw,Y=v=>T+ph-(v-lo)/(hi-lo)*ph;
    grid(g,lo,hi,Y,W,L,R);
    if(lo<0)g.s+=`<line x1="${L}" x2="${W-R}" y1="${Y(0)}" y2="${Y(0)}" stroke="#52525b"/>`;
    const d=rows.map((r,k)=>(k?"L":"M")+X(k).toFixed(1)+" "+Y(r.a).toFixed(1)).join(" ");
    g.s+=`<defs><linearGradient id="mlg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#34d399" stop-opacity=".22"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></linearGradient></defs>`;
    g.s+=`<path d="${d} L${X(n-1).toFixed(1)} ${Y(Math.max(lo,0))} L${X(0).toFixed(1)} ${Y(Math.max(lo,0))}Z" fill="url(#mlg)"/>`;
    g.s+=`<path d="${d}" fill="none" stroke="var(--std)" stroke-width="2" stroke-linejoin="round"/>`;
    rows.forEach((r,k)=>{if(r.extra)g.s+=`<circle cx="${X(k)}" cy="${Y(r.a)}" r="4" fill="var(--promo)" stroke="#09090b" stroke-width="2"/>`;});
    const ls=Math.max(1,Math.ceil(n/Math.max(2,Math.floor(pw/(n<=12?34:52)))));
    rows.forEach((r,k)=>{if(k%ls===0){const dt=new Date(2026,9+r.i,1);g.s+=`<text x="${X(k)}" y="${H-8}" text-anchor="middle" fill="#a1a1aa" font-size="11">${n<=12?MN[dt.getMonth()]:MN[dt.getMonth()]+" ’"+String(dt.getFullYear()).slice(2)}</text>`;}});
    g.s+=`<circle cx="${X(n-1)}" cy="${Y(last.a)}" r="4" fill="var(--std)" stroke="#09090b" stroke-width="2"/><text x="${X(n-1)-8}" y="${Y(last.a)-10}" text-anchor="end" fill="#fafafa" font-size="12" font-weight="600">${f(last.a)}</text>`;
    g.s+=`<g class="xh" style="display:none"><line y1="${T}" y2="${T+ph}" stroke="#a1a1aa" stroke-dasharray="3 3"/><circle r="5" fill="var(--std)" stroke="#09090b" stroke-width="2"/></g>`;
    g.s+=`<rect class="hit" x="${L}" y="${T}" width="${pw}" height="${ph}" fill="transparent"/>`;
    sv.setAttribute("viewBox",`0 0 ${W} ${H}`);sv.innerHTML=g.s;
    sv._geo={X,Y,L,pw,W,n};
    const first=rows[0];
    $("mld").textContent="From "+f(first.a)+" in "+first.lab+" to "+f(last.a)+" by "+last.lab+". Hover the line for any month.";
  }
  /* year at a glance */
  const dmax=Math.max(1,...rows.map(r=>r.dep));
  const yrs=[...new Set(rows.map(r=>new Date(2026,9+r.i,1).getFullYear()))];
  $("mcal").innerHTML='<div class="mcal"><span></span>'+MN.map(m=>`<span class="mh">${m[0]}<em>${m.slice(1)}</em></span>`).join("")+
    yrs.map(y=>`<span class="my">${y}</span>`+MN.map((_,mi)=>{
      const k=(y-2026)*12+mi-9,r=rows[k];
      if(k<0||!r)return '<span class="mc off"></span>';
      const p=r.dep<=0?0:Math.round(18+82*r.dep/dmax),bg=r.dep<0?"color-mix(in srgb,var(--neg) 55%,#18181b)":`color-mix(in srgb,var(--std) ${p}%,#18181b)`;
      return `<span class="mc${p>55?" lt":""}" data-k="${k}" tabindex="0" style="background:${bg}">${r.extra?"<b></b>":""}${fk(r.dep)}</span>`;
    }).join("")).join("")+'</div>';
  /* table */
  const ms=[["1 month of expenses",V.exp],["3 months of expenses",V.exp*3],["$10k",10000],["$25k",25000],["$50k",50000],["$100k",100000]].filter(t=>t[1]>0);
  const amax=Math.max(1,...rows.map(r=>r.a));
  let prev=rows.length?rows[0].a-rows[0].dep:0,py=0;
  $("tbl").innerHTML="<thead><tr><th>Month</th><th>From pay</th><th>Bonuses and one-time</th><th>Saved</th><th class=\"bc\">Balance</th></tr></thead><tbody>"+
    rows.map(r=>{
      const y=new Date(2026,9+r.i,1).getFullYear(),hit=ms.filter(t=>prev<t[1]&&r.a>=t[1]).map(t=>t[0]);prev=r.a;
      const yr=y!==py?`<tr class="yr"><td colspan="5">${y}</td></tr>`:"";py=y;
      const sp=dmax>0?Math.max(0,r.base)/dmax:0,se=r.extra/dmax;
      return yr+`<tr class="${r.extra?"bn":""}" data-k="${r.i}"><td>${r.lab}${hit.map(h=>`<span class="tag">${h}</span>`).join("")}</td>`+
        `<td class="${r.base<0?"n":""}">${f(r.base)}</td><td class="p">${r.extra?f(r.extra):"–"}</td>`+
        `<td><div class="sv"><span>${f(r.dep)}</span><div class="mini"><i style="width:${sp*100}%;background:var(--std)"></i>${r.extra?`<i style="width:${se*100}%;background:var(--promo)"></i>`:""}</div></div></td>`+
        `<td class="bc"><div class="sv"><span class="s">${f(r.a)}</span><div class="mini"><i style="width:${Math.max(0,r.a)/amax*100}%;background:var(--std)"></i></div></div></td></tr>`;
    }).join("")+"</tbody>";
}
document.querySelectorAll(".mhz").forEach(sel=>{sel.innerHTML=$("hz").innerHTML;});
document.querySelectorAll(".mhz").forEach(sel=>sel.addEventListener("change",e=>{const h=$("hz");h.value=e.target.value;h.dispatchEvent(new Event("change",{bubbles:true}));}));
(function(){
  const svg=$("mbars"),cal=$("mcal");let on=null;
  const mark=k=>{if(on)on.classList.remove("on");on=svg.querySelector(`.hl[data-k="${k}"]`);if(on)on.classList.add("on");};
  svg.addEventListener("pointermove",e=>{const t=e.target.closest(".hl");if(!t){mtipHide();mark(-1);return;}const k=+t.dataset.k;mark(k);mtipShow(MROWS[k],e.clientX,e.clientY);});
  svg.addEventListener("pointerleave",()=>{mtipHide();mark(-1);});
  cal.addEventListener("pointermove",e=>{const t=e.target.closest(".mc[data-k]");if(!t){mtipHide();return;}mtipShow(MROWS[+t.dataset.k],e.clientX,e.clientY);});
  cal.addEventListener("pointerleave",mtipHide);
  cal.addEventListener("focusin",e=>{const t=e.target.closest(".mc[data-k]");if(!t)return;const b=t.getBoundingClientRect();mtipShow(MROWS[+t.dataset.k],b.left,b.bottom);});
  cal.addEventListener("focusout",mtipHide);
  const ln=$("mline");
  ln.addEventListener("pointermove",e=>{
    const G=ln._geo;if(!G||!MROWS.length)return;
    const b=ln.getBoundingClientRect(),vx=(e.clientX-b.left)*G.W/b.width;
    const k=Math.max(0,Math.min(G.n-1,Math.round((vx-G.L)/G.pw*(G.n-1)))),r=MROWS[k];
    const xh=ln.querySelector(".xh");xh.style.display="";
    const x=G.X(k),y=G.Y(r.a);xh.querySelector("line").setAttribute("x1",x);xh.querySelector("line").setAttribute("x2",x);
    xh.querySelector("circle").setAttribute("cx",x);xh.querySelector("circle").setAttribute("cy",y);
    mtipShow(r,e.clientX,e.clientY);
  });
  ln.addEventListener("pointerleave",()=>{mtipHide();const xh=ln.querySelector(".xh");if(xh)xh.style.display="none";});
  const ro=new ResizeObserver(()=>{if(!MROWS.length)return;const a=Math.round(svg.clientWidth),b=Math.round(ln.clientWidth);if((a&&String(a)!==svg.dataset.w)||(b&&String(b)!==ln.dataset.w))drawMonthly(MROWS);});
  ro.observe(svg);ro.observe(ln);
})();
/* road to millionaire page */
const ym=m=>m===null?"Not within 50 years":(Math.floor(m/12)?Math.floor(m/12)+" yrs ":"")+(m%12?m%12+" mo":"").trim()||"now";
function msim(start,c0,ret,rais,tgt,N=600){
  const r=ret/1200;let b=start,c=c0,put=start;const bal=[b],inn=[put];let hit=b>=tgt?0:null;
  for(let m=1;m<=N;m++){b=b*(1+r)+c;put+=c;if(m%12===0)c*=1+rais/100;bal.push(b);inn.push(put);if(hit===null&&b>=tgt)hit=m;}
  return{bal,inn,hit};
}
let MIL=null;
function drawMil(far){
  const rsOn=V.mil_rs,rsSum=rsOn&&typeof RS!=="undefined"?RS.reduce((t,r)=>t+(V[r[0]]||0),0):0;
  const start=far[0].a,c0=Math.max(0,V.dep)+(V.mil_extra||0)+rsSum,tgt=V.target;
  const S=msim(start,c0,V.ret,V.rais,tgt),hit=S.hit;
  document.querySelectorAll(".mirror").forEach(el=>{const src=$(el.dataset.for);if(!src)return;el.value=src.value;setP(el);el.closest(".ctl").querySelector("output").textContent=el._fm(+src.value);});
  const T=hit===null?600:hit,putT=S.inn[T],grT=S.bal[T]-putT,infl=tgt/Math.pow(1.02,T/12);
  $("mkp").innerHTML=
    kpi("You reach "+f(tgt),hit===null?"Not within 50 yrs":dl(hit),hit===null?"raise what you invest":"in "+ym(hit),"hero")+
    kpi("Invest each month",f(c0),"growing "+V.rais+"% a year · "+V.ret+"% return")+
    kpi("You put in",f(putT),hit===null?"over 50 years":pc(putT/S.bal[T])+" of the total")+
    kpi("Growth from returns",f(grT),hit===null?"over 50 years":pc(grT/S.bal[T])+" of the total","pos")+
    kpi("In today's dollars",f(infl),"what "+f(tgt)+" buys after 2% yearly inflation");
  $("milin").innerHTML=`<div class="grp" style="margin-top:20px"><span>Monthly investment</span><span>${f(c0)}</span></div>`+
    `<div class="kv"><span>Surplus from your plan</span><span>${f(Math.max(0,V.dep))}</span></div>`+
    `<div class="kv"><span>Extra you add</span><span>${f(V.mil_extra||0)}</span></div>`+
    `<div class="kv"><span>Income streams from Insights${rsOn?"":" <em>· off</em>"}</span><span>${f(rsSum)}</span></div>`+
    `<div class="kv"><span>Starting balance</span><span>${f(start)}</span></div>`;
  /* chart */
  const Y=Math.min(50,hit===null?50:Math.max(10,Math.ceil(hit/12)+5)),M=Y*12;
  MIL={S,M,tgt,c0};
  $("mct").textContent="The road to "+f(tgt);
  $("mcd").textContent=hit===null?"At this pace you do not reach the target within 50 years. Try a higher monthly amount.":"Blue is your own money; green is what the market adds on top. By year "+Math.ceil(hit/12)+" growth is doing "+pc(grT/S.bal[T])+" of the work.";
  drawMilChart();
  /* road */
  const stops=[.1,.25,.5,.75,1].map(x=>x*tgt);
  $("road").innerHTML=stops.map((v,i)=>{const m=S.bal.findIndex(b=>b>=v),ok=m>=0&&m<=600;const g=ok?Math.max(0,S.bal[m]-S.inn[m])/S.bal[m]:0;
    return `<div class="stop${i===stops.length-1?" end":""}"><div class="dotw"><i></i></div><b>${fk(v)}</b><span>${ok?dl(m):"Not reached"}</span><em>${ok?(m===0?"already there":"in "+ym(m)):""}</em>${ok?`<div class="gs"><div class="bar"><i style="width:${g*100}%;background:var(--std)"></i></div><small>${pc(g)} from returns</small></div>`:""}</div>`;}).join("");
  /* returns table */
  const rets=[...new Set([0,4,6,8,10,V.ret])].sort((a,b)=>a-b);
  const rr=rets.map(r=>[r,msim(start,c0,r,V.rais,tgt)]),ymax=Math.max(...rr.map(x=>x[1].hit===null?600:x[1].hit));
  $("mret").innerHTML=rr.map(([r,x])=>`<div class="sc${r===V.ret?" cur":""}"><b style="font-weight:${r===V.ret?600:500}">${r}% a year</b><span>${x.hit===null?"50+ yrs":ym(x.hit)}</span><span style="min-width:74px;text-align:right">${x.hit===null?"–":dl(x.hit)}</span>${bar((x.hit===null?600:x.hit)/ymax,r===V.ret?"var(--std)":"var(--scotia)")}</div>`).join("")+
    '<p class="note">Shorter bars are better. 0% is like keeping it all in a regular savings account.</p>';
  /* faster */
  const F=[["Invest $250 more a month",msim(start,c0+250,V.ret,V.rais,tgt)],["Invest $500 more a month",msim(start,c0+500,V.ret,V.rais,tgt)],["Invest $1,000 more a month",msim(start,c0+1000,V.ret,V.rais,tgt)],
    ["Earn 1% more a year (lower fees, more stocks)",msim(start,c0,V.ret+1,V.rais,tgt)],["Grow what you invest 2% faster each year",msim(start,c0,V.ret,V.rais+2,tgt)],["Add a one-time $10,000 now",msim(start+10000,c0,V.ret,V.rais,tgt)]];
  $("mfast").innerHTML=F.map(([n,x])=>{const d=hit===null||x.hit===null?null:hit-x.hit;
    return `<div class="kv"><span>${n}</span><span class="${d>0?"fs":""}">${x.hit===null?"still 50+ yrs":d===null?dl(x.hit):d>0?ym(d)+" sooner":"no change"}</span></div>`;}).join("")+
    '<p class="note" style="margin-top:10px">The first years matter most. Money invested early has the longest time to grow.</p>';
  /* where */
  const W=[["Safety net first","Hold three months of costs ("+f(V.exp*3)+") in a high-interest savings account. Do not invest money you might need soon."],
    ["FHSA if you may buy a home","Up to $8,000 a year, $40,000 lifetime. Deductible going in, tax-free coming out for a first home."],
    ["TFSA","$7,000 of new room each year. Growth and withdrawals are tax-free, so it suits long-term investing."],
    ["RRSP","Up to 18% of last year's income. Best when your tax rate is high; your refund can go straight back in."],
    ["Low-cost index funds","An all-in-one index ETF holds thousands of companies for about 0.2% a year in fees. High fees quietly cost years."]];
  /* retirement at 65 (born 2 Jul 1997, so 65 on 2 Jul 2062) */
  {
    const R65=new Date(2062,6,2),m65=(R65.getFullYear()-2026)*12+R65.getMonth()-9;
    const sg=V.ret_sg/100,pr=V.ret_pr/1200,wr=V.ret_wr/100,inf=V.ret_inf/100;
    let pot=2*950,sal=95000,mine=950,match=950;const pots=[pot];
    for(let m=1;m<=m65;m++){const c=sal/12*.06;pot=pot*(1+pr)+2*c;mine+=c;match+=c;if(m%12===0)sal*=1+sg;pots.push(pot);}
    const grow=pot-mine-match;
    const dfl=m=>Math.pow(1+inf,m/12),real=pot/dfl(m65),lastSal=sal;
    const own=S.bal[Math.min(m65,600)],ownR=Math.max(0,own)/dfl(m65);
    const SRC=[["Air Canada pension",real*wr/12,pot*wr/12,"var(--scotia)",`${f(real)} pot at ${V.ret_wr}% a year`],
      ["Your own investments",ownR*wr/12,Math.max(0,own)*wr/12,"var(--std)",`${f(ownR)} from the millionaire plan above`],
      ["Quebec Pension Plan (QPP)",1450,1450*dfl(m65),"var(--mix)","near the maximum after a full career"],
      ["Old Age Security (OAS)",740,740*dfl(m65),"var(--promo)","full amount with 40 years in Canada"]];
    const tot=SRC.reduce((t,x)=>t+x[1],0),totN=SRC.reduce((t,x)=>t+x[2],0),rep=V.net?tot/V.net:0,rst=rep>=.7?"good":rep>=.5?"ok":"bad";
    $("rtd").textContent="You turn 65 on July 2, 2062, "+ym(m65)+" from now. Amounts are monthly and shown in today's dollars, so you can compare them with what you live on now.";
    $("pkp").innerHTML=
      kpi("Total pension at 65",f(pot),f(real)+" in today's dollars · Jul 2062","hero","Your contributions "+f(mine)+" (automatic) + Air Canada's match "+f(match)+" (automatic) + investment growth "+f(grow)+" (grows on its own) = "+f(pot)+". See the breakdown below.")+
      kpi("Your contributions",f(mine),"6% of your salary · "+pc(mine/pot)+" of the pot")+
      kpi("Air Canada adds",f(match),"the 6% employer match · "+pc(match/pot),"")+
      kpi("Investment growth",f(grow),"at "+V.ret_pr+"% a year · "+pc(grow/pot)+" of the pot","pos")+
      kpi("Monthly income at 65",f(tot),"today's dollars, all sources · "+pc(rep)+" of take-home",rst==="good"?"pos":rst==="bad"?"neg":"");
    const mx=Math.max(tot,V.net)*1.05;
    $("rtbar").innerHTML=`<div class="lrow" style="margin:18px 0 6px"><span>Monthly income at 65</span><span><b style="color:var(--text)">${f(tot)}</b> vs ${f(V.net)} today</span></div><div class="istk">${SRC.map(x=>`<i style="width:${x[1]/mx*100}%;background:${x[3]}" title="${x[0]}"></i>`).join("")}<s style="left:${V.net/mx*100}%"></s></div>`+
      `<div class="legend" style="margin:8px 0 14px">${SRC.map(x=>`<span><i style="background:${x[3]}"></i>${x[0].replace(/ \(.*\)/,"")}</span>`).join("")}<span><i style="background:var(--text);width:2px;height:12px"></i>Take-home today</span></div>`;
    /* breakdown: how the totals are built, and what needs action */
    {
      const TG={auto:"Automatic",org:"Grows on its own",act:"You must act"};
      const tg=k=>`<span class="tg ${k}">${TG[k]}</span>`;
      const row=(c,n,v,k,why)=>`<div class="bkr"><span class="bkop">${c}</span><div class="bkn"><b>${n}</b>${tg(k)}<p>${why}</p></div><div class="bkv">${v}</div></div>`;
      const potRows=[
        ["",`Your contributions`,f(mine),"auto",`6% of every paycheque goes in before you see it, ${f(950/2)} a month today and rising with your salary. Nothing to do; just do not opt out or lower it.`],
        ["+",`Air Canada's match`,f(match),"auto",`Air Canada adds the same 6% as long as you contribute 6% and stay employed. Check the vesting rules: leaving very early can forfeit part of the match.`],
        ["+",`Investment growth`,f(grow),"org",`The fund earns about ${V.ret_pr}% a year on everything above, and the earnings compound for ${Math.round(m65/12)} years. Your only job is to pick a growth fund once, not leave it in cash.`]];
      $("bkd").textContent="Your pension pot at 65 is three pieces added together. Two arrive through payroll with no effort, and the biggest one is growth on that money.";
      $("bkpot").innerHTML=`<div class="grp"><span>Air Canada pension pot at 65</span><span></span></div>`+
        `<div class="istk" style="margin:12px 0 4px"><i style="width:${mine/pot*100}%;background:var(--scotia)"></i><i style="width:${match/pot*100}%;background:var(--mix)"></i><i style="width:${grow/pot*100}%;background:var(--std)"></i></div>`+
        `<div class="legend" style="margin:6px 0 8px"><span><i style="background:var(--scotia)"></i>You ${pc(mine/pot)}</span><span><i style="background:var(--mix)"></i>Air Canada ${pc(match/pot)}</span><span><i style="background:var(--std)"></i>Growth ${pc(grow/pot)}</span></div>`+
        potRows.map(r=>row(...r)).join("")+
        `<div class="bkr tot"><span class="bkop">=</span><div class="bkn"><b>Total pension at 65</b><p>${f(real)} in today's dollars. Everything here happens without extra effort beyond picking the fund.</p></div><div class="bkv">${f(pot)}</div></div>`;
      const ACT=[["auto","Paid from the pot above at "+V.ret_wr+"% a year. Automatic once you set up withdrawals at retirement."],
        ["act",`Only exists if you invest about ${f(c0)} a month yourself, every month until 65, as on the Millionaire page. Skip it and this line is $0.`],
        ["auto","Already deducted from every paycheque. Apply when you retire; it pays more if you wait past 65."],
        ["auto","Paid by the government with 40 years in Canada after age 18. Usually starts automatically at 65; it shrinks if your retirement income is high."]];
      const noAct=SRC.filter((x,i)=>ACT[i][0]!=="act").reduce((t,x)=>t+x[1],0);
      $("bkinc").innerHTML=`<div class="grp" style="margin-top:28px"><span>Monthly income at 65, today's dollars</span><span></span></div>`+
        SRC.map((x,i)=>row(i?"+":"",x[0],f(x[1]),ACT[i][0],ACT[i][1])).join("")+
        `<div class="bkr tot"><span class="bkop">=</span><div class="bkn"><b>Total a month</b><p>${f(totN)} in 2062 dollars.</p></div><div class="bkv">${f(tot)}</div></div>`+
        `<div class="isum ${noAct/(V.net||1)>=.7?"good":noAct/(V.net||1)>=.5?"ok":"bad"}">If you do nothing extra: <b>${f(noAct)}</b> a month, <b>${pc(noAct/(V.net||1))}</b> of today's take-home. Investing on your own adds <b>${f(tot-noAct)}</b> on top.</div>`;
    }
    const ages=[35,45,55,65].map(A=>{const m=Math.min(m65,(A-29)*12-3);return [A,pots[m]/dfl(m),dl(m)];}),amx=ages[ages.length-1][1]||1;
    $("rtages").innerHTML=ages.map(a=>`<div class="sc"><b style="font-weight:500">Age ${a[0]} <em style="font-style:normal;color:var(--mute)">· ${a[2]}</em></b><span>${f(a[1])}</span><span style="min-width:74px"></span>${bar(a[1]/amx,"var(--scotia)")}</div>`).join("");
    $("rtn").textContent="Assumes the Air Canada plan works like a defined-contribution account: your 6% plus the 6% employer match ("+f(950)+" a month today) on a salary rising "+V.ret_sg+"% a year to about "+f(lastSal)+" by 2062. If your plan is defined-benefit, the pension follows a formula instead; check your plan booklet on HR Connex. QPP ($1,450) and OAS ($740) are rough 2026 estimates; OAS is reduced if your retirement income is high, and both can start earlier or later. Withdrawing "+V.ret_wr+"% a year is a common rule of thumb for making savings last about 30 years.";
  }
  $("mwhere").innerHTML=W.map(w=>`<li><b class="at">${w[0]}</b><span>${w[1]}</span></li>`).join("");
}
function drawMilChart(){
  if(!MIL)return;
  const {S,M,tgt}=MIL,svg=$("milchart"),W=Math.round(svg.clientWidth)||640,H=W<520?240:320,L=64,R=16,T=16,B=28,pw=W-L-R,ph=H-T-B,g={s:""};
  svg.dataset.w=String(W);
  const raw=Math.max(tgt*1.05,S.bal[M])/4,p10=Math.pow(10,Math.floor(Math.log10(raw))),stp=[1,2,2.5,5,10].map(x=>x*p10).find(x=>x>=raw),top=stp*4;
  const X=m=>L+m/M*pw,Yv=v=>T+ph-Math.max(0,v)/top*ph;
  for(let k=0;k<=4;k++){const v=stp*k,y=Yv(v);g.s+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="#27272a"/><text x="${L-8}" y="${y+4}" text-anchor="end" fill="#a1a1aa" font-size="11">${fk(v)}</text>`;}
  const yStep=Math.max(1,Math.ceil(M/12/Math.max(2,Math.floor(pw/56))));
  for(let y=0;y<=M/12;y+=yStep)g.s+=`<text x="${X(y*12)}" y="${H-8}" text-anchor="middle" fill="#a1a1aa" font-size="11">${y===0?"Now":2026+y}</text>`;
  const pts=k=>{let d="";for(let m=0;m<=M;m++)d+=(m?"L":"M")+X(m).toFixed(1)+" "+Yv(k(m)).toFixed(1);return d;};
  const base=`L${X(M).toFixed(1)} ${Yv(0)} L${X(0).toFixed(1)} ${Yv(0)}Z`;
  g.s+=`<path d="${pts(m=>S.bal[m])} ${base}" fill="var(--std)" fill-opacity=".35"/>`;
  g.s+=`<path d="${pts(m=>Math.min(S.inn[m],S.bal[m]))} ${base}" fill="var(--scotia)" fill-opacity=".45"/>`;
  g.s+=`<path d="${pts(m=>S.bal[m])}" fill="none" stroke="var(--std)" stroke-width="2"/>`;
  const yt=Yv(tgt);g.s+=`<line x1="${L}" x2="${W-R}" y1="${yt}" y2="${yt}" stroke="#fafafa" stroke-opacity=".7" stroke-dasharray="4 4"/>`;
  [.1,.25,.5,.75,1].forEach(x=>{const m=S.bal.findIndex(b=>b>=x*tgt);if(m<0||m>M)return;g.s+=`<circle cx="${X(m)}" cy="${Yv(S.bal[m])}" r="5" fill="#fafafa" stroke="#09090b" stroke-width="2"/>`;
    if(x===1)g.s+=`<text x="${X(m)-10}" y="${Yv(S.bal[m])-12}" text-anchor="end" fill="#fafafa" font-size="12" font-weight="600">${f(tgt)} · ${dl(m)}</text>`;});
  g.s+=`<g class="xh" style="display:none"><line y1="${T}" y2="${T+ph}" stroke="#a1a1aa" stroke-dasharray="3 3"/><circle r="5" fill="var(--std)" stroke="#09090b" stroke-width="2"/></g>`;
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.innerHTML=g.s;
  svg._geo={X,Yv,L,pw,W,M};
}
(function(){
  const svg=$("milchart");
  svg.addEventListener("pointermove",e=>{const G=svg._geo;if(!G||!MIL)return;const b=svg.getBoundingClientRect(),vx=(e.clientX-b.left)*G.W/b.width;
    const m=Math.max(0,Math.min(G.M,Math.round((vx-G.L)/G.pw*G.M))),bal=MIL.S.bal[m],inn=MIL.S.inn[m];
    const xh=svg.querySelector(".xh");xh.style.display="";const x=G.X(m);xh.querySelector("line").setAttribute("x1",x);xh.querySelector("line").setAttribute("x2",x);xh.querySelector("circle").setAttribute("cx",x);xh.querySelector("circle").setAttribute("cy",G.Yv(bal));
    mtip.innerHTML=`<b>${dl(m)}</b><div><i style="background:var(--scotia)"></i>You put in<span>${f(inn)}</span></div><div><i style="background:var(--std)"></i>Growth<span>${f(bal-inn)}</span></div><div class="tt">Balance<span>${f(bal)}</span></div>`;
    mtip.style.display="block";const tw=mtip.offsetWidth,th=mtip.offsetHeight;mtip.style.left=Math.min(Math.max(8,e.clientX+14),innerWidth-tw-8)+"px";mtip.style.top=(e.clientY+th+14>innerHeight?e.clientY-th-14:e.clientY+14)+"px";});
  svg.addEventListener("pointerleave",()=>{mtip.style.display="none";const xh=svg.querySelector(".xh");if(xh)xh.style.display="none";});
  new ResizeObserver(()=>{const w=Math.round(svg.clientWidth);if(w&&String(w)!==svg.dataset.w)drawMilChart();}).observe(svg);
})();
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
/* millionaire page controls: mirrors of the goal sliders plus its own extras */
function mirrorCtl(parent,src,lab,fm){
  const s0=$(src),d=document.createElement("div");d.className="ctl";
  d.innerHTML=`<label>${lab}<output>${fm(+s0.value)}</output></label><input type="range" class="mirror" data-for="${src}" min="${s0.min}" max="${s0.max}" step="${s0.step}" value="${s0.value}" aria-label="${lab}">`;
  parent.appendChild(d);const inp=d.querySelector("input");inp._fm=fm;setP(inp);
  inp.addEventListener("input",e=>{s0.value=e.target.value;s0.dispatchEvent(new Event("input",{bubbles:true}));});
}
mirrorCtl($("milctl"),"target","Target",v=>f(v));
mirrorCtl($("milctl"),"ret","Yearly investment return",v=>v+"%");
mirrorCtl($("milctl"),"rais","Yearly increase in what you invest",v=>v+"%");
addCtl($("milctl"),"mil_extra","Extra you invest each month",0,3000,50,0,v=>f(v));
/* retirement at 65 controls */
addCtl($("retctl"),"ret_sg","Yearly salary growth",0,6,.5,2.5,v=>v+"%");
addCtl($("retctl"),"ret_pr","Pension fund return",2,9,.5,5,v=>v+"%");
addCtl($("retctl"),"ret_wr","Yearly withdrawal in retirement",3,6,.5,4,v=>v+"%");
addCtl($("retctl"),"ret_inf","Inflation",1,4,.5,2,v=>v+"%");
{const d=document.createElement("label");d.className="chk";d.innerHTML='<input type="checkbox" id="mil_rs"> Add my income streams from Insights';$("milctl").appendChild(d);
 V.mil_rs=false;$("mil_rs").addEventListener("change",e=>{V.mil_rs=e.target.checked;run();});}
/* income streams for the Insights income target */
const RS=[["rs_raise","Raise or promotion at work",0,1500,25,0,"A 5% raise on $95,000 is about $234 a month after tax.",0],
  ["rs_free","Freelance or consulting",0,3000,50,0,"10 hours a month at $60 an hour is about $380 after tax.",1],
  ["rs_side","Side gig (tutoring, delivery, reselling)",0,1500,25,0,"4 hours a week at $20 an hour is about $220 after tax.",1],
  ["rs_dig","Digital products or content",0,2000,25,0,"Templates, courses, writing. Slow to start, so treat it as upside.",1],
  ["rs_room","Roommate or renting a room",0,1500,50,0,"",2]];
RS.forEach(r=>{addCtl($("isl"),r[0],`<span><i class="sw" style="background:${["var(--scotia)","var(--mix)","var(--promo)"][r[7]]}"></i>${r[1]}</span>`,r[2],r[3],r[4],r[5],v=>f(v));
  const n=document.createElement("p");n.className="note rsn";n.id=r[0]+"_n";n.textContent=r[6];$("isl").appendChild(n);});
$("itplan").addEventListener("click",e=>{const b=e.target.closest("button[data-mix]");if(!b)return;
  JSON.parse(b.dataset.mix).forEach(([id,v])=>{const el=$(id);if(!el)return;el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}));});});
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
  $("syncSlot").innerHTML='<span id="syncChip">Sync <b>starting</b></span>';
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
