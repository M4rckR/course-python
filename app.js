// Títulos de respaldo si el JSON de la semana no carga
const WEEK_NAMES=["Funciones y variables","Condicionales","Bucles","Excepciones","Bibliotecas","Tests unitarios","Archivos (File I/O)","Expresiones regulares","Programación orientada a objetos","Et cetera"];
let weeks={}; let current=0; let loaded=false;
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let done=store.get("cs50p-done",{}); let answers=store.get("cs50p-quiz",{}); let passed=store.get("cs50p-passed",{}); let codes=store.get("cs50p-code",{});
// Estado nuevo del rediseño (tema, última posición, días de estudio, secciones marcadas…). Las 4 claves de arriba no cambian.
let prefs=store.get("cs50p:v1",{});
if(typeof prefs!=="object"||!prefs)prefs={};
const savePrefs=()=>store.set("cs50p:v1",prefs);
const el=(t,a={},...c)=>{const n=document.createElement(t);for(const[k,v]of Object.entries(a)){if(v==null||v===false)continue;if(k==="class")n.className=v;else if(k==="html")n.innerHTML=v;else if(k.startsWith("on"))n.addEventListener(k.slice(2),v);else n.setAttribute(k,v)}for(const x of c.flat()){if(x==null||x===false)continue;n.append(x.nodeType?x:document.createTextNode(x))}return n};
// inline: `code` y **negrita**, escapando todo lo demás
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const md=s=>esc(s).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
const pad2=n=>String(n).padStart(2,"0");
const snake=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");

// ── Secciones de una semana (01–07) y cuándo cuentan como hechas
const SECTIONS=[
  {key:"summary",title:"En corto",short:"En corto",has:w=>w.summary?.length},
  {key:"jsToPy",title:"De JavaScript a Python",short:"De JS a Python",has:w=>w.jsToPy?.length},
  {key:"examples",title:"Código clave y trampas",short:"Código y trampas",has:w=>w.examples?.length||w.traps?.length},
  {key:"quiz",title:"Quiz",short:"Quiz",has:w=>w.quiz?.length},
  {key:"practice",title:"Practica aquí",short:"Práctica",has:w=>w.practice?.length},
  {key:"pset",title:"Problem set",short:"Problem set",has:w=>w.pset?.length},
  {key:"project",title:"Proyecto",short:"Proyecto",has:w=>w.project},
];
const weekPrefs=i=>{prefs.weeks??={};return prefs.weeks[i]??={}};
function sectionDone(i,key){
  const w=weeks[i];if(!w)return false;
  const s=SECTIONS.find(x=>x.key===key);if(!s.has(w))return true; // sección ausente en el JSON: no bloquea el avance
  if(key==="quiz")return w.quiz.every((_,q)=>(answers[i]||{})[q]!=null);
  if(key==="practice")return w.practice.every((_,j)=>passed[`${i}-${j}`]);
  if(key==="pset")return w.pset.every((_,j)=>done[`${i}-${j}`]);
  return !!prefs.weeks?.[i]?.done?.[key];
}
const sectionsDone=i=>SECTIONS.filter(s=>sectionDone(i,s.key)).length;
// empty = sin JSON · loaded = 0 hechas · progress = ≥1 · complete = 7/7
function weekStatus(i){if(!weeks[i])return"empty";const n=sectionsDone(i);return n===7?"complete":n?"progress":"loaded"}
const STATUS_TEXT={empty:"Sin cargar",loaded:"Cargada",progress:"En curso",complete:"Completa"};
function globalProgress(){
  let total=0,ok=0;for(const[i,w]of Object.entries(weeks)){(w.pset||[]).forEach((_,j)=>{total++;if(done[`${i}-${j}`])ok++});(w.practice||[]).forEach((_,j)=>{total++;if(passed[`${i}-${j}`])ok++})}
  return{ok,total};
}
// Un día cuenta como estudiado al marcar o aprobar cualquier cosa
const dayKey=d=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
function markStudied(){
  const t=dayKey(new Date());prefs.studyDays=(prefs.studyDays||[]).filter(d=>d!==t).concat(t).slice(-120);savePrefs();
}
// Última posición: semana, sección (1–7) e ítem dentro de la sección
function setLast(week,section,item=0){prefs.last={week,section,item};savePrefs()}

// ── Router: #/ = Inicio, #/w/N = semana. El formato antiguo #wN redirige.
function route(){
  const h=location.hash;
  const old=h.match(/^#w(\d)$/);if(old){history.replaceState(null,"","#/w/"+old[1]);return{name:"week",week:+old[1]}}
  const m=h.match(/^#\/w\/(\d)$/);if(m)return{name:"week",week:+m[1]};
  return{name:"home"};
}
let pendingScroll=null; // sección a la que ir al llegar desde "Continuar"

function renderHeader(r){
  const home=r.name==="home";
  const nh=document.getElementById("navHome"),nw=document.getElementById("navWeeks");
  nh.toggleAttribute("aria-current",home);if(home)nh.setAttribute("aria-current","page");
  nw.toggleAttribute("aria-current",!home);if(!home)nw.setAttribute("aria-current","page");
  nw.href="#/w/"+(home?(prefs.last?.week??current):current);
  const{ok,total}=globalProgress();
  const gp=document.getElementById("globalProgress");gp.setAttribute("aria-valuenow",ok);gp.setAttribute("aria-valuemax",total);
  document.getElementById("progTxt").textContent=`${ok}/${total}`;
  document.getElementById("progBar").style.width=total?`${ok/total*100}%`:"0";
  document.getElementById("weeks").hidden=home;
}
function renderNav(){
  const nav=document.getElementById("weeks");nav.textContent="";
  for(let i=0;i<10;i++){
    const st=weekStatus(i);
    const b=el("button",{role:"tab","aria-selected":String(i===current),class:st,title:weeks[i]?.title||WEEK_NAMES[i],onclick:()=>{location.hash="#/w/"+i}},el("span",{class:"dot"}),`W${i}`);
    nav.append(b);
  }
}
function renderProgress(){renderHeader(route())}

function block(n,title,...kids){return el("section",{class:"block",id:"s-"+SECTIONS[+n-1].key},el("h3",{tabindex:"-1"},el("span",{class:"n"},n),title),...kids)}

function renderWeek(){
  const main=document.getElementById("main");main.textContent="";main.className="legacy-week";
  const w=weeks[current];
  if(!w){
    main.append(el("div",{class:"empty"},el("div",{class:"eyebrow"},`Week ${current}`),el("h2",{},WEEK_NAMES[current]),
      el("p",{},"Cargando el contenido de esta semana…")));
    return;
  }
  main.append(el("div",{class:"weekhead"},
    el("div",{class:"eyebrow"},`Week ${current} · ${w.time||""}`),
    el("h2",{},w.title||WEEK_NAMES[current]),
    el("div",{class:"meta"},
      ...(w.topics||[]).map(t=>el("span",{class:"chip"},t)),
      w.notesUrl?el("a",{href:w.notesUrl,target:"_blank",rel:"noopener"},"Notas oficiales ↗"):null,
      w.videoUrl?el("a",{href:w.videoUrl,target:"_blank",rel:"noopener"},"Video ↗"):null,
      w.sources?.length?el("span",{},`Verificado con ${w.sources.length} páginas oficiales`):null)));

  if(w.summary?.length)main.append(block("01","En corto",el("ul",{class:"tight"},w.summary.map(s=>el("li",{html:md(s)})))));

  if(w.jsToPy?.length){
    const tb=el("tbody",{},w.jsToPy.map(r=>el("tr",{},el("td",{class:"js",html:`<code>${esc(r.js)}</code>`}),el("td",{class:"py",html:`<code>${esc(r.py)}</code>`}),el("td",{html:md(r.note||"")}))));
    main.append(block("02","De JavaScript a Python",el("div",{class:"tablewrap"},el("table",{},el("thead",{},el("tr",{},el("th",{},"JS"),el("th",{},"Python"),el("th",{},"Ojo"))),tb))));
  }

  if(w.examples?.length||w.traps?.length){
    const kids=[];
    (w.examples||[]).forEach(e=>{if(e.label)kids.push(el("p",{style:"margin:10px 0 0",html:md(e.label)}));kids.push(el("pre",{},e.code))});
    (w.traps||[]).forEach(t=>kids.push(el("div",{class:"trap"},el("b",{},"TRAMPA"),el("span",{html:md(t)}))));
    main.append(block("03","Código clave y trampas",...kids));
  }

  if(w.quiz?.length){
    const qa=answers[current]||{};const box=el("div",{class:"quiz"});
    const score=el("span",{class:"score"});
    const upd=()=>{const a=answers[current]||{};const n=Object.keys(a).length;const ok=w.quiz.filter((q,i)=>a[i]===q.answer).length;score.textContent=n?`${ok} de ${w.quiz.length} correctas`:`${w.quiz.length} preguntas`};
    w.quiz.forEach((q,qi)=>{
      const opts=el("div",{class:"opts"});const why=el("div",{class:"why",html:md(q.why||"")});why.hidden=qa[qi]==null;
      q.options.forEach((o,oi)=>{
        const b=el("button",{class:"opt",html:md(o),onclick:()=>{answers[current]={...(answers[current]||{}),[qi]:oi};store.set("cs50p-quiz",answers);markStudied();setLast(current,4,qi);paint();why.hidden=false;upd();renderNav();renderProgress()}});
        opts.append(b);
      });
      function paint(){const pick=(answers[current]||{})[qi];[...opts.children].forEach((b,oi)=>{b.disabled=pick!=null;b.classList.toggle("right",pick!=null&&oi===q.answer);b.classList.toggle("wrong",pick===oi&&oi!==q.answer)})}
      paint();
      box.append(el("div",{class:"q"},el("p",{html:`${qi+1}. ${md(q.q)}`}),opts,why));
    });
    upd();
    const reset=el("button",{class:"btn--small",onclick:()=>{delete answers[current];store.set("cs50p-quiz",answers);render()}},"Reiniciar quiz");
    main.append(block("04","Quiz antes del problem set",el("div",{style:"margin:-4px 0 12px"},score),box,el("div",{style:"margin-top:14px"},reset)));
  }

  if(w.practice?.length){
    const kids=[el("p",{class:"small",style:"margin:0 0 12px",html:"Escribe tu código y pulsa <b>Comprobar</b>: se corre aquí mismo contra casos de prueba, como <code>check50</code>. Este Python del navegador es simplificado (sin archivos, <code>csv</code>, <code>json</code> ni <code>match</code>); los problem sets van en cs50.dev."})];
    w.practice.forEach((p,j)=>kids.push(practiceCard(p,`${current}-${j}`)));
    main.append(block("05","Practica aquí",...kids));
  }

  if(w.pset?.length){
    const list=el("div",{class:"pset"});
    w.pset.forEach((p,j)=>{
      const key=`${current}-${j}`;
      const cb=el("input",{type:"checkbox",id:"p"+key,"aria-label":"Resuelto: "+p.name});cb.checked=!!done[key];
      const card=el("div",{class:"prob"+(done[key]?" done":"")},cb,
        el("div",{class:"t"},el("span",{},p.name),p.url?el("a",{href:p.url,target:"_blank",rel:"noopener"},"enunciado ↗"):null),
        el("div",{class:"d",html:md(p.task||"")}),
        p.hints?.length?el("details",{},el("summary",{},"Ver pistas"),el("ul",{class:"tight",style:"margin-top:6px"},p.hints.map(h=>el("li",{html:md(h)})))):null);
      cb.addEventListener("change",()=>{done[key]=cb.checked;store.set("cs50p-done",done);markStudied();setLast(current,6,j);card.classList.toggle("done",cb.checked);renderNav();renderProgress()});
      list.append(card);
    });
    const kids=[list];
    if(w.submit)kids.unshift(el("p",{style:"margin:0 0 12px;font-size:14.5px;color:var(--ink-2)",html:md(w.submit)}));
    main.append(block("06","Problem set",...kids));
  }

  if(w.project){
    const s=el("section",{class:"block project",id:"s-project"},el("h3",{tabindex:"-1"},el("span",{class:"n"},"07"),"Tu proyecto: finanzas tracker"),
      el("p",{class:"goal",style:"margin:0",html:md(w.project.goal||"")}),
      w.project.steps?.length?el("ul",{class:"tight",style:"margin-top:10px"},w.project.steps.map(x=>el("li",{html:md(x)}))):null);
    main.append(s);
  }
}

// ── Python en el navegador (Skulpt, se carga al primer uso)
let skReady=null;
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=()=>ko(new Error("No se pudo cargar "+src));document.head.append(s)})}
function loadSkulpt(){if(!skReady)skReady=loadScript("vendor/skulpt.min.js").then(()=>loadScript("vendor/skulpt-stdlib.js")).catch(e=>{skReady=null;throw e});return skReady}
async function runPy(src,inputs,offset){
  await loadSkulpt();const Sk=window.Sk;let out="";const q=[...inputs];
  Sk.configure({__future__:Sk.python3,execLimit:4000,yieldLimit:100,output:t=>{out+=t},
    read:f=>{const x=Sk.builtinFiles&&Sk.builtinFiles.files[f];if(x===undefined)throw "File not found: '"+f+"'";return x},
    inputfun:p=>{out+=p;return q.length?Promise.resolve(q.shift()):Promise.reject(new Sk.builtin.EOFError("se acabaron las entradas de prueba"))},inputfunTakesPrompt:true});
  let err=null;
  try{await Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody("<stdin>",false,src,true))}
  catch(e){err=String(e).replace(/on line (\d+)/,(m,n)=>"en la línea "+Math.max(1,n-offset))}
  return{out,err};
}
async function runTest(code,t){
  const src=t.code?`__name__ = "student"\n${code}\n\n__name__ = "__main__"\n${t.code}`:code;
  const r=await runPy(src,t.stdin||[],t.code?1:0);
  return{...r,pass:!r.err&&r.out.trimEnd().endsWith(t.expect)};
}
function practiceCard(p,key){
  const card=el("div",{class:"ex"+(passed[key]?" passed":"")});
  const badge=el("span",{class:"badge"},passed[key]?"aprobado":"pendiente");
  const ta=el("textarea",{class:"editor",id:"code-"+key,spellcheck:"false","aria-label":"Código: "+p.name});
  ta.value=codes[key]??p.starter;
  let saveT;ta.addEventListener("input",()=>{clearTimeout(saveT);saveT=setTimeout(()=>{codes[key]=ta.value;store.set("cs50p-code",codes)},400)});
  ta.addEventListener("keydown",e=>{
    if(e.key==="Tab"&&!e.shiftKey){e.preventDefault();ta.setRangeText("    ",ta.selectionStart,ta.selectionEnd,"end")}
    else if(e.key==="Enter"){const st=ta.selectionStart;const line=ta.value.slice(0,st).split("\n").pop();let ind=line.match(/^\s*/)[0];if(/:\s*$/.test(line))ind+="    ";e.preventDefault();ta.setRangeText("\n"+ind,st,ta.selectionEnd,"end")}
  });
  const res=el("div",{class:"results",role:"status"});
  const stdin=el("input",{class:"stdin",id:"in-"+key,placeholder:"Entradas para Ejecutar, separadas por | (ej: 100|300)"});
  const check=el("button",{class:"btn--primary"},"Comprobar");
  const run=el("button",{class:"btn--secondary"},"Ejecutar");
  const reset=el("button",{class:"btn--ghost",style:"margin-left:auto"},"Volver al inicio");
  async function busy(b,fn){check.disabled=run.disabled=true;const t=b.textContent;b.textContent="Corriendo…";try{await fn()}catch(e){res.textContent="";res.append(el("div",{class:"res ko"},"No se pudo cargar Python en el navegador. Revisa tu conexión y vuelve a intentar."))}finally{b.textContent=t;check.disabled=run.disabled=false}}
  check.onclick=()=>busy(check,async()=>{
    codes[key]=ta.value;store.set("cs50p-code",codes);res.textContent="";let all=true;
    const [wk,j]=key.split("-").map(Number);setLast(wk,5,j);
    for(const[i,t]of p.tests.entries()){
      const r=await runTest(ta.value,t);all=all&&r.pass;
      const d=el("div",{class:"res "+(r.pass?"ok":"ko")},el("b",{},(r.pass?"✓ ":"✗ ")+`Caso ${i+1}`),t.stdin?.length?el("span",{class:"small"}," · entradas: "+t.stdin.map(x=>JSON.stringify(x)).join(", ")):null);
      if(!r.pass){d.append(el("div",{class:"lab"},"Esperado al final"),el("pre",{},t.expect),el("div",{class:"lab"},r.err?"Error":"Tu salida"),el("pre",{},r.err||r.out||"(nada)"))}
      res.append(d);
    }
    if(all){passed[key]=true;store.set("cs50p-passed",passed);markStudied();card.classList.add("passed");badge.textContent="aprobado";res.prepend(el("div",{class:"res ok"},el("b",{},"Todo pasa. Ahora intenta el problem set de la semana.")));renderNav();renderProgress()}
  });
  run.onclick=()=>busy(run,async()=>{
    codes[key]=ta.value;store.set("cs50p-code",codes);res.textContent="";
    const ins=stdin.value?stdin.value.split("|"):[];
    const r=await runPy(ta.value,ins,0);
    res.append(el("div",{class:"res"+(r.err?" ko":"")},el("div",{class:"lab",style:"margin-top:0"},"Salida"),el("pre",{},(r.out||"")+(r.err?"\n"+r.err:"")||"(nada)")));
  });
  reset.onclick=()=>{ta.value=p.starter;delete codes[key];store.set("cs50p-code",codes);res.textContent=""};
  card.append(el("div",{class:"t"},el("span",{},p.name),badge),el("p",{class:"p",html:md(p.prompt)}),ta,stdin,el("div",{class:"row"},check,run,reset),res);
  return card;
}
// ── Inicio
const DAY_LETTERS=["L","M","X","J","V","S","D"];
// Primera sección sin hacer de una semana (1–7), o null si está completa
const firstOpenSection=i=>{const k=SECTIONS.findIndex(s=>!sectionDone(i,s.key));return k<0?null:k+1};
// A dónde lleva "Continuar": state.last si sigue pendiente; si no, la primera sección sin hacer
function continueTarget(){
  const l=prefs.last;
  if(l&&weeks[l.week]&&weekStatus(l.week)!=="complete"){
    const sec=sectionDone(l.week,SECTIONS[l.section-1]?.key)?firstOpenSection(l.week):l.section;
    return{week:l.week,section:sec,item:sec===l.section?l.item||0:0};
  }
  for(let i=0;i<10;i++)if(weeks[i]&&weekStatus(i)!=="complete")return{week:i,section:firstOpenSection(i),item:0};
  return null;
}
// Detalle de la sección para el subtítulo: [texto largo, texto corto móvil, nombre en mono]
function continueDetail(t){
  const w=weeks[t.week],s=SECTIONS[t.section-1],n=pad2(t.section);
  if(s.key==="practice"){
    let j=t.item;if(j==null||j>=w.practice.length||passed[`${t.week}-${j}`])j=Math.max(0,w.practice.findIndex((_,k)=>!passed[`${t.week}-${k}`]));
    return[`${n} ${s.title} — ejercicio ${j+1} de ${w.practice.length}: `,`${n} Practica · ejercicio ${j+1} de ${w.practice.length}`,snake(w.practice[j].name)];
  }
  if(s.key==="quiz"){const q=Math.max(0,w.quiz.findIndex((_,k)=>(answers[t.week]||{})[k]==null));return[`${n} ${s.title} — pregunta ${q+1} de ${w.quiz.length}`,`${n} Quiz · pregunta ${q+1} de ${w.quiz.length}`]}
  if(s.key==="pset"){const k=w.pset.filter((_,j)=>done[`${t.week}-${j}`]).length;return[`${n} ${s.title} — ${k} de ${w.pset.length} resueltos`,`${n} Problem set · ${k}/${w.pset.length}`]}
  return[`${n} ${s.title}`,`${n} ${s.short}`];
}
const segs=(states,cls="segments")=>el("div",{class:cls,"aria-hidden":"true"},states.map(x=>el("span",{"data-s":x})));
const weekSegStates=(i,cur)=>SECTIONS.map((s,k)=>sectionDone(i,s.key)?"done":k+1===cur?"current":"pending");

function renderHome(){
  const main=document.getElementById("main");main.textContent="";main.className="home";
  const top=el("div",{class:"home__top"});
  // Continuar
  const t=continueTarget();
  if(t){
    const [long,short,code]=continueDetail(t);
    const go=el("a",{class:"btn--primary",href:"#/w/"+t.week,onclick:()=>{pendingScroll=SECTIONS[t.section-1].key}},"Continuar →");
    top.append(el("article",{class:"continue-card","aria-labelledby":"continue-title"},
      el("p",{class:"label continue-card__label"},el("span",{class:"hide-mobile"},"Continuar donde lo dejé"),el("span",{class:"only-mobile"},"Continuar")),
      el("h2",{class:"continue-card__title",id:"continue-title"},`W${t.week} · ${weeks[t.week].title}`),
      el("p",{class:"continue-card__sub"},el("span",{class:"hide-mobile"},long,code?el("span",{class:"mono-ink"},code):null),el("span",{class:"only-mobile"},short)),
      el("div",{class:"hide-mobile"},segs(weekSegStates(t.week,t.section),"segments segments--continue")),
      el("div",{class:"continue-card__actions"},go)));
  }else if(loaded){
    top.append(el("article",{class:"continue-card"},el("p",{class:"label continue-card__label"},"Curso completo"),el("h2",{class:"continue-card__title"},"Terminaste las 10 semanas"),el("p",{class:"continue-card__sub"},"Puedes repasar cualquier semana desde la lista.")));
  }else top.append(el("article",{class:"continue-card"},el("p",{class:"continue-card__sub"},"Cargando semanas…")));

  // Cuenta atrás al 31 dic y semana de estudio
  const now=new Date();const end=new Date(now.getFullYear(),11,31,23,59);
  const days=Math.max(0,Math.ceil((end-now)/86400000));
  const left=[...Array(10).keys()].reduce((a,i)=>a+(1-sectionsDone(i)/7),0); // semanas que faltan, con fracción
  const every=left>0?Math.max(1,Math.round(days/left)):0;
  const leftTxt=left.toLocaleString("es",{maximumFractionDigits:1});
  const studied=new Set(prefs.studyDays||[]);
  const monday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()+6)%7));
  const week=DAY_LETTERS.map((l,k)=>{const d=new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+k);const key=dayKey(d);
    const today=key===dayKey(now);return{l,key,today,studied:studied.has(key),future:d>now&&!today}});
  const nStudied=week.filter(d=>d.studied).length;
  const countdown=el("section",{class:"countdown","aria-label":"Cuenta atrás"},
    el("div",{class:"countdown__row"},el("span",{class:"countdown__num"},String(days)),el("span",{class:"countdown__unit"},el("span",{class:"hide-mobile"},"días hasta el 31 dic"),el("span",{class:"only-mobile"},"días al 31 dic"))),
    el("span",{class:"countdown__days only-mobile"},`${nStudied}/5 días`),
    el("p",{class:"countdown__pace hide-mobile"},left>0?["Quedan ",`${leftTxt} semanas de curso → `,el("strong",{},`1 semana cada ${every} días`)," para llegar."]:"Terminaste todas las semanas."));
  const studyWeek=el("section",{class:"study-week hide-mobile","aria-labelledby":"study-week-title"},
    el("div",{class:"study-week__head"},el("h2",{id:"study-week-title"},"Esta semana"),el("span",{},`${nStudied} de 5 días`)),
    el("ol",{class:"study-week__days"},week.map(d=>el("li",{"data-state":d.studied?"studied":d.today?"today":d.future?"future":"missed","aria-current":d.today?"date":null},
      el("span",{class:"study-week__dot","aria-hidden":"true"}),el("span",{"aria-hidden":"true"},d.l),
      el("span",{class:"visually-hidden"},`${d.key}: ${d.studied?"estudiado":d.future?"por venir":"sin estudiar"}`)))));
  top.append(el("aside",{class:"home__aside"},countdown,studyWeek));
  main.append(top);

  // Lista de semanas
  const list=el("div",{class:"weeks-list__rows"});
  for(let i=0;i<10;i++){
    const cur=t?.week===i?t.section:weekStatus(i)==="progress"?firstOpenSection(i):0;
    const st=weekStatus(i),n=sectionsDone(i);const title=weeks[i]?.title||WEEK_NAMES[i];
    const kids=[el("span",{class:"status-dot","data-state":st,"aria-hidden":"true"}),el("span",{class:"week-row__id"},`W${i}`),el("span",{class:"week-row__title"},title),
      segs(weekSegStates(i,cur),"segments week-row__segs"),
      el("span",{class:"week-row__pct"},n?`${Math.floor(n/7*100)}%`:"—"),
      el("span",{class:"week-row__status"},STATUS_TEXT[st])];
    list.append(st==="empty"
      ?el("div",{class:"week-row","data-state":st,"aria-disabled":"true"},...kids)
      :el("a",{class:"week-row","data-state":st,href:"#/w/"+i},...kids));
  }
  const legend=el("div",{class:"weeks-list__legend","aria-hidden":"true"},["complete","progress","loaded","empty"].map(x=>el("span",{},el("span",{class:"status-dot","data-state":x}),STATUS_TEXT[x].toLowerCase())));
  main.append(el("section",{class:"weeks-list","aria-labelledby":"weeks-title"},
    el("div",{class:"weeks-list__head"},el("h2",{id:"weeks-title"},"Las 10 semanas"),legend),list,
    el("p",{class:"home__note"},"Tu avance se guarda solo en este navegador. Si cambias de navegador o dispositivo, empieza en cero.")));
}

// ── Tema: sin elección sigue al sistema; el botón alterna claro/oscuro según lo que se ve
const darkMQ=matchMedia("(prefers-color-scheme: dark)");
const shownTheme=()=>prefs.theme==="light"||prefs.theme==="dark"?prefs.theme:darkMQ.matches?"dark":"light";
function applyTheme(){
  if(prefs.theme==="light"||prefs.theme==="dark")document.documentElement.dataset.theme=prefs.theme;else delete document.documentElement.dataset.theme;
  document.getElementById("themeToggle").textContent=shownTheme()==="dark"?"Modo claro":"Modo oscuro";
}
document.getElementById("themeToggle").addEventListener("click",()=>{prefs.theme=shownTheme()==="dark"?"light":"dark";savePrefs();applyTheme()});
darkMQ.addEventListener("change",applyTheme);
applyTheme();

function render(){
  const r=route();
  if(r.name==="week"){
    current=r.week;
    if(loaded&&weeks[current]&&prefs.last?.week!==current)setLast(current,firstOpenSection(current)??1);
    renderNav();renderWeek();
    if(pendingScroll){const t=document.getElementById("s-"+pendingScroll);pendingScroll=null;if(t){t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});t.querySelector("h3")?.focus({preventScroll:true})}}
  }else renderHome();
  renderHeader(r);
}
addEventListener("hashchange",()=>{const jump=!!pendingScroll;render();if(!jump)scrollTo(0,0)});
render();

// Carga las 10 semanas desde data/w0.json … data/w9.json
(async()=>{
  const res=await Promise.allSettled([...Array(10).keys()].map(i=>fetch(`data/w${i}.json`).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})));
  const next={};res.forEach(r=>{if(r.status==="fulfilled"&&typeof r.value.week==="number")next[r.value.week]=r.value});
  weeks=next;loaded=true;render();
})();
