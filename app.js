// Títulos de respaldo si el JSON de la semana no carga
const WEEK_NAMES=["Funciones y variables","Condicionales","Bucles","Excepciones","Bibliotecas","Tests unitarios","Archivos (File I/O)","Expresiones regulares","Programación orientada a objetos","Et cetera"];
let weeks={}; let current=0; let loaded=false;
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let done=store.get("cs50p-done",{}); let answers=store.get("cs50p-quiz",{}); let passed=store.get("cs50p-passed",{}); let codes=store.get("cs50p-code",{});
// Estado nuevo del rediseño (tema, última posición, días de estudio, secciones marcadas…). Las 4 claves de arriba no cambian.
let prefs=store.get("cs50p:v1",{});
if(typeof prefs!=="object"||!prefs)prefs={};
const savePrefs=()=>store.set("cs50p:v1",prefs);
if(!prefs.startedAt){const d=new Date();prefs.startedAt=[...(prefs.studyDays||[])].sort()[0]||`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;savePrefs()}
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

const reducedMotion=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileMQ=matchMedia("(max-width: 639px)");

function renderHeader(r){
  const home=r.name==="home";
  document.body.dataset.route=r.name;
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
// Pestañas de semana (fila 1 de 1g)
function renderTabs(){
  const box=document.getElementById("weeksInner");box.textContent="";
  for(let i=0;i<10;i++){
    const st=weekStatus(i),title=weeks[i]?.title||WEEK_NAMES[i];
    const kids=[el("span",{class:"status-dot","data-state":st,"aria-hidden":"true"}),`W${i}`,el("span",{class:"visually-hidden"},`, ${title}, ${STATUS_TEXT[st].toLowerCase()}`)];
    box.append(st==="empty"
      ?el("span",{class:"week-tab","data-state":st,"aria-disabled":"true"},...kids)
      :el("a",{class:"week-tab","data-state":st,href:"#/w/"+i,"aria-current":i===current?"page":null},...kids));
  }
  // scrollLeft y no scrollIntoView: este último mueve el punto de partida del Tab a las pestañas
  const cur=box.querySelector("[aria-current]");if(cur&&(cur.offsetLeft+cur.offsetWidth>box.scrollLeft+box.clientWidth||cur.offsetLeft<box.scrollLeft))box.scrollLeft=cur.offsetLeft-16;
}
function renderProgress(){renderHeader(route());renderTabs()}

// ── Vista de semana (1b / 1e)
let openSections=new Set();  // secciones hechas que el usuario abrió
let practiceSel=null;        // ejercicio seleccionado en la práctica
let sectionObserver=null;
let currentInView=null;      // sección marcada en el índice por el IntersectionObserver
let userScrolled=false,quietUntil=0; // el scroll a 0 que hace el router al cambiar de vista no cuenta
addEventListener("scroll",()=>{if(userScrolled||!sectionObserver||performance.now()<quietUntil)return;userScrolled=true;observeSections()},{passive:true});
const sectionIdx=key=>SECTIONS.findIndex(s=>s.key===key);

// Contador y resumen de cada sección
function sectionCount(key){
  const w=weeks[current],i=current;
  switch(key){
    case "summary":return`${w.summary.length} puntos`;
    case "jsToPy":return`${w.jsToPy.length} equivalencias`;
    case "examples":return[w.examples?.length&&`${w.examples.length} ejemplos`,w.traps?.length&&`${w.traps.length} trampas`].filter(Boolean).join(", ");
    case "quiz":{const a=answers[i]||{};const n=w.quiz.filter((_,q)=>a[q]!=null).length;const ok=w.quiz.filter((q,k)=>a[k]===q.answer).length;return sectionDone(i,"quiz")?`${ok} de ${w.quiz.length} correctas`:`${n}/${w.quiz.length}`}
    case "practice":{const n=w.practice.filter((_,j)=>passed[`${i}-${j}`]).length;return`${n} de ${w.practice.length} aprobados`}
    case "pset":{const n=w.pset.filter((_,j)=>done[`${i}-${j}`]).length;return`${n}/${w.pset.length} resueltos`}
    case "project":return`${w.project.steps?.length||0} pasos`;
  }
}
// Contador corto del índice lateral (solo secciones con ítems)
function indexCount(key){
  const w=weeks[current],i=current;
  if(key==="quiz")return`${w.quiz.filter((_,q)=>(answers[i]||{})[q]!=null).length}/${w.quiz.length}`;
  if(key==="practice")return`${w.practice.filter((_,j)=>passed[`${i}-${j}`]).length}/${w.practice.length}`;
  if(key==="pset")return`${w.pset.filter((_,j)=>done[`${i}-${j}`]).length}/${w.pset.length}`;
  return null;
}
const sectionTitle=key=>key==="project"?"Proyecto · finanzas tracker":SECTIONS[sectionIdx(key)].title;

function scrollToSection(key){
  const t=document.getElementById("s-"+key);if(!t)return;
  const bar=document.querySelector(".section-bar");const off=bar&&getComputedStyle(bar).display!=="none"?bar.offsetHeight+8:24;
  window.scrollTo({top:t.getBoundingClientRect().top+scrollY-off,behavior:reducedMotion()?"auto":"smooth"});
  (t.querySelector("h2")||t.querySelector("button"))?.focus({preventScroll:true});
}

// Índice lateral sticky (desktop) y barra de secciones (tablet/móvil)
function buildIndex(){
  const n=sectionsDone(current);const cur=currentInView;
  return el("aside",{class:"section-index",id:"sectionIndex","aria-label":"Secciones de la semana"},
    el("div",{class:"week-progress"},el("p",{class:"week-progress__label"},`W${current} · AVANCE`),segs(weekSegStates(current,sectionIdx(cur)+1)),el("p",{class:"week-progress__count"},`${n} de 7 secciones`)),
    el("nav",{"aria-label":"Secciones"},el("ol",{class:"section-index__list"},SECTIONS.map((s,k)=>{
      const d=sectionDone(current,s.key),c=s.key===cur,count=d?null:indexCount(s.key);
      return el("li",{},el("a",{class:"section-index__item",href:"#s-"+s.key,"data-state":d?"done":"pending","aria-current":c?"true":null,onclick:e=>{e.preventDefault();scrollToSection(s.key)}},
        d?el("span",{class:"section-index__mark","aria-hidden":"true"},"✓"):el("span",{class:"section-index__dot","aria-hidden":"true"}),
        el("span",{class:"section-index__num"},pad2(k+1)),el("span",{},s.short,d?el("span",{class:"visually-hidden"},", hecha"):null),
        count?el("span",{class:"section-index__count"},count):null));
    }))),
    el("button",{class:"btn--secondary focus-toggle",type:"button",onclick:()=>enterFocus()},"Modo foco",el("kbd",{},"F")),
    weekLinks("week-links only-desktop"));
}
function buildBar(){
  const cur=currentInView;
  return el("nav",{class:"section-bar",id:"sectionBar","aria-label":"Secciones de la semana"},SECTIONS.map((s,k)=>{
    const d=sectionDone(current,s.key),c=s.key===cur;
    return el("a",{class:"section-chip",href:"#s-"+s.key,"data-state":c?"current":d?"done":"pending","aria-current":c?"true":null,onclick:e=>{e.preventDefault();scrollToSection(s.key)}},
      d&&!c?"✓":null,pad2(k+1),c?" "+s.short:null,d?el("span",{class:"visually-hidden"},", hecha"):null,!c?el("span",{class:"visually-hidden"}," "+s.short):null);
  }));
}
function weekLinks(cls){
  const w=weeks[current];
  return el("div",{class:cls},
    w.notesUrl?el("a",{href:w.notesUrl,target:"_blank",rel:"noopener"},"Notas de la clase ↗"):null,
    w.videoUrl?el("a",{href:w.videoUrl,target:"_blank",rel:"noopener"},"Video ↗"):null,
    w.sources?.length?el("details",{class:"sources"},el("summary",{},`Fuentes oficiales (${w.sources.length})`),
      el("ul",{},w.sources.map(u=>el("li",{},el("a",{href:u,target:"_blank",rel:"noopener"},u.replace(/^https?:\/\//,"")))))):null);
}
// Repinta índice, barra, cabecera y pestañas tras un cambio de estado
let weekWasComplete=false;
function refreshChrome(){
  if(route().name==="week"&&!inFocus()){
    const now=weekStatus(current)==="complete";
    if(now&&!weekWasComplete&&bannerActive(current)){document.querySelector(".week-head .week-complete")?.remove();document.querySelector(".week-head__title")?.after(weekBanner(current,{animate:true}))}
    weekWasComplete=now;
  }
  document.getElementById("sectionIndex")?.replaceWith(buildIndex());
  const bar=buildBar();document.getElementById("sectionBar")?.replaceWith(bar);
  const chip=bar.querySelector("[aria-current]");if(chip)bar.scrollLeft=chip.offsetLeft-(bar.clientWidth-chip.offsetWidth)/2;
  document.querySelector(".week-head__segs .segments")?.replaceWith(segs(weekSegStates(current,sectionIdx(currentInView)+1)));
  renderProgress();
}
function setInView(key){
  if(key===currentInView)return;currentInView=key;
  document.querySelectorAll(".section-index__item").forEach(a=>{const on=a.getAttribute("href")==="#s-"+key;a.toggleAttribute("aria-current",on);if(on)a.setAttribute("aria-current","true")});
  const bar=buildBar();document.getElementById("sectionBar")?.replaceWith(bar);
  const chip=bar.querySelector("[aria-current]");if(chip)bar.scrollLeft=chip.offsetLeft-(bar.clientWidth-chip.offsetWidth)/2;
}

// Bloque de código de solo lectura con números de línea (mismo aspecto que el editor)
function codeBlock(code){
  const lines=String(code).replace(/\n$/,"").split("\n");
  return el("div",{class:"code-block"},el("ol",{class:"code-block__gutter","aria-hidden":"true"},lines.map((_,k)=>el("li",{},String(k+1)))),
    el("pre",{class:"code-block__code"},el("code",{},lines.join("\n"))));
}

// Contenido de cada sección
function sectionBody(key){
  const w=weeks[current];
  switch(key){
    case "summary":return[el("ul",{class:"section-list"},w.summary.map(s=>el("li",{html:md(s)})))];
    case "jsToPy":return[el("table",{class:"js-py"},el("colgroup",{},el("col",{class:"js-py__code"}),el("col",{class:"js-py__code"}),el("col",{class:"js-py__note"})),el("thead",{},el("tr",{},el("th",{scope:"col"},"JS"),el("th",{scope:"col"},"Python"),el("th",{scope:"col"},"Ojo"))),
      el("tbody",{},w.jsToPy.map(r=>el("tr",{},el("td",{"data-label":"JS"},el("code",{},r.js)),el("td",{"data-label":"Python"},el("code",{},r.py)),el("td",{"data-label":"Ojo"},el("span",{html:md(r.note||"")}))))))];
    case "examples":return[
      ...(w.examples||[]).map(e=>el("div",{class:"example"},e.label?el("p",{class:"example__label",html:md(e.label)}):null,codeBlock(e.code))),
      w.traps?.length?el("ul",{class:"traps"},w.traps.map(t=>el("li",{},el("span",{class:"traps__label"},"Trampa"),el("span",{html:md(t)})))):null];
    case "quiz":return[el("div",{class:"quiz"},w.quiz.map((q,qi)=>quizQuestion(q,qi)))];
    case "pset":return[el("div",{class:"pset"},w.pset.map((p,j)=>psetItem(p,j))),w.submit?el("p",{class:"pset__submit",html:md(w.submit)}):null];
    case "project":return[el("p",{class:"project__goal",html:md(w.project.goal||"")}),w.project.steps?.length?el("ol",{class:"section-list"},w.project.steps.map(x=>el("li",{html:md(x)}))):null];
  }
}
// "Marcar como hecho" solo en 01, 02, 03 y 07
const MANUAL=new Set(["summary","jsToPy","examples","project"]);
function markSectionDone(key){
  const wp=weekPrefs(current);wp.done??={};wp.done[key]=true;openSections.delete(key);
  markStudied();setLast(current,sectionIdx(key)+1,0);
  refreshSections({fade:key});refreshChrome();
  document.querySelector(`#s-${key} .section-row`)?.focus();
}
const plainText=s=>String(s).replace(/[`*]/g,"");

function buildSection(key){
  const w=weeks[current],k=sectionIdx(key),n=pad2(k+1),d=sectionDone(current,key);
  if(key==="practice")return buildPractice();
  const cur=firstOpenSection(current)===k+1;
  const folded=(d&&!openSections.has(key))||(key==="project"&&!d&&!cur&&!openSections.has(key));
  if(folded){
    const upcoming=!d;
    const right=upcoming?el("span",{class:"section-row__status"},sectionCount(key))
      :el("span",{class:"section-row__status","data-ok":"true"},"✓ Hecho · ",el("span",{class:"section-row__open"},"abrir"));
    const sub=key==="project"?` — ${plainText(w.project.goal||"")}`:` · ${sectionCount(key)}`;
    const open=()=>{openSections.add(key);const node=buildSection(key);document.getElementById("s-"+key).replaceWith(node);node.querySelector("h2")?.focus();refreshChrome()};
    // Quiz hecho: "revisar" lo abre en solo lectura (respuestas bloqueadas); "repetir" borra las respuestas y lo reinicia
    if(key==="quiz"&&d)return el("section",{class:"section-card",id:"s-quiz","data-state":"done"},
      el("div",{class:"section-row section-row--split"},el("span",{class:"num"},n),el("span",{class:"section-row__title"},sectionTitle(key),el("span",{class:"section-row__sub"},sub)),
        el("span",{class:"section-row__status","data-ok":"true"},"✓ Hecho · ",
          el("button",{class:"section-row__action",type:"button","aria-expanded":"false","aria-controls":"s-quiz-body",onclick:open},"revisar",el("span",{class:"visually-hidden"}," el quiz")),
          el("span",{class:"section-row__dot","aria-hidden":"true"}," · "),
          el("button",{class:"section-row__action",type:"button",onclick:()=>{delete answers[current];store.set("cs50p-quiz",answers);open()}},"repetir",el("span",{class:"visually-hidden"}," el quiz (borra tus respuestas)")))));
    return el("section",{class:"section-card",id:"s-"+key,"data-state":upcoming?"upcoming":"done"},
      el("button",{class:"section-row",type:"button","aria-expanded":"false","aria-controls":`s-${key}-body`,onclick:open},
        el("span",{class:"num"},n),el("span",{class:"section-row__title"},sectionTitle(key),el("span",{class:"section-row__sub"},sub)),right));
  }
  const counter=key==="quiz"||key==="pset"?el("span",{class:"section-card__count"},sectionCount(key)):null;
  const head=cur&&!d
    ?[el("div",{class:"section-card__label"},el("span",{},`${n} · Ahora`),counter),el("h2",{class:"section-card__title",id:`s-${key}-title`,tabindex:"-1"},sectionTitle(key))]
    :[el("div",{class:"section-card__head"},el("div",{class:"section-card__name"},el("span",{class:"num"},n),el("h2",{class:"section-card__title",id:`s-${key}-title`,tabindex:"-1"},sectionTitle(key))),
        d?el("div",{class:"section-card__done"},el("span",{},"✓ Hecho"),el("button",{class:"btn--small",type:"button","aria-controls":`s-${key}-body`,"aria-expanded":"true",onclick:()=>{openSections.delete(key);const node=buildSection(key);document.getElementById("s-"+key).replaceWith(node);node.querySelector(".section-row")?.focus()}},"Plegar")):counter)];
  return el("section",{class:"section-card",id:"s-"+key,"data-state":cur&&!d?"current":d?"done":"pending","aria-labelledby":`s-${key}-title`},
    ...head,
    el("div",{class:"section-card__body",id:`s-${key}-body`},...sectionBody(key)),
    MANUAL.has(key)&&!d?el("button",{class:"btn--small section-card__mark",type:"button",onclick:()=>markSectionDone(key)},"Marcar como hecho"):null);
}
// Reconstruye las secciones (menos la práctica, para no perder el editor) tras un cambio de estado
function refreshSections({fade,practice=false}={}){
  for(const s of SECTIONS){
    if(s.key==="practice"&&!practice)continue;
    if(!s.has(weeks[current]))continue;
    const old=document.getElementById("s-"+s.key);if(!old)continue;
    const node=buildSection(s.key);old.replaceWith(node);
    if(s.key===fade&&!reducedMotion()){node.classList.add("is-entering");requestAnimationFrame(()=>requestAnimationFrame(()=>node.classList.remove("is-entering")))}
  }
  observeSections();
}


// ── Banner de semana completa (§9). Persiste hasta abrir la siguiente semana.
// Ritmo: plan lineal desde el primer día de uso (startedAt) hasta el 31 dic; días de adelanto = (semanas hechas − esperadas) × días por semana
function paceText(){
  const now=new Date(),end=new Date(now.getFullYear(),11,31,23,59),start=new Date((prefs.startedAt||dayKey(now))+"T00:00");
  const total=Math.max(1,(end-start)/86400000),perWeek=total/10;
  const expected=Math.min(10,10*((now-start)/86400000)/total),actual=[...Array(10).keys()].reduce((a,i)=>a+sectionsDone(i)/7,0);
  const d=Math.round((actual-expected)*perWeek),u=Math.abs(d)===1?"día":"días";
  return d>0?`Vas ${d} ${u} por delante del ritmo.`:d<0?`Vas ${-d} ${u} por detrás del ritmo.`:"Vas justo al ritmo.";
}
const bannerActive=i=>weekStatus(i)==="complete"&&!prefs.weeks?.[i]?.bannerDone;
function weekBanner(i,{animate=false}={}){
  const next=i<9?i+1:null;
  const sg=segs(Array(7).fill(animate&&!reducedMotion()?"pending":"done"),"segments week-complete__segs");
  if(animate&&!reducedMotion())requestAnimationFrame(()=>requestAnimationFrame(()=>[...sg.children].forEach((x,k)=>{x.style.transitionDelay=`${k*60}ms`;x.dataset.s="done"})));
  return el("section",{class:"week-complete","aria-label":`Semana ${i} completa`},
    el("div",{class:"week-complete__head"},el("h2",{class:"week-complete__title"},`Semana ${i} completa`),el("span",{class:"week-complete__count"},"7/7")),
    sg,
    el("div",{class:"week-complete__foot"},el("span",{class:"week-complete__pace"},paceText()),
      next!=null&&weeks[next]?el("a",{class:"week-complete__next",href:"#/w/"+next},`Abrir W${next} →`):el("a",{class:"week-complete__next",href:"#/"},"Ir a Inicio →")));
}

// Pregunta de quiz (1g fila 3)
const LETTERS="ABCD";
const isCodeOption=o=>/`/.test(o)||!/\s/.test(o.trim());
function quizQuestion(q,qi){
  const fs=el("fieldset",{class:"quiz-q"});
  const why=el("p",{class:"quiz-why","aria-live":"polite"});
  const opts=q.options.map((o,oi)=>el("button",{class:"quiz-opt",type:"button",onclick:()=>{
    answers[current]={...(answers[current]||{}),[qi]:oi};store.set("cs50p-quiz",answers);
    markStudied();setLast(current,4,qi);paint();refreshChrome();
    const c=fs.closest(".section-card")?.querySelector(".section-card__count");if(c)c.textContent=sectionCount("quiz");
  }},el("span",{class:"quiz-opt__key"},LETTERS[oi]),
    isCodeOption(o)?el("span",{class:"quiz-opt__text","data-code":"true"},o.replace(/`/g,"")):el("span",{class:"quiz-opt__text",html:md(o)}),
    el("span",{class:"quiz-opt__flag"})));
  function paint(){
    const pick=(answers[current]||{})[qi];const answered=pick!=null;
    opts.forEach((b,oi)=>{
      const st=!answered?"idle":oi===q.answer?"correct":oi===pick?"wrong":"rest";
      b.dataset.state=st;b.disabled=answered;
      b.querySelector(".quiz-opt__flag").textContent=st==="correct"?"✓ Correcta":st==="wrong"?"✗ Tu respuesta":"";
    });
    why.hidden=!answered;
    if(answered){why.dataset.result=pick===q.answer?"ok":"bad";why.innerHTML=`<strong>Por qué:</strong> ${md(q.why||"")}`}
  }
  fs.append(el("legend",{class:"quiz-q__text",html:`<span class="visually-hidden">Pregunta ${qi+1}: </span>${md(q.q)}`}),el("div",{class:"quiz-q__opts"},opts),why);
  paint();return fs;
}

// Problema del pset con pistas progresivas (1g fila 5)
function psetItem(p,j){
  const key=`${current}-${j}`,wp=weekPrefs(current);
  const item=el("div",{class:"pset-item","data-done":done[key]?"true":null});
  const cb=el("input",{type:"checkbox",class:"pset-check",id:"p"+key,"aria-label":"Resuelto: "+p.name});cb.checked=!!done[key];
  cb.addEventListener("change",()=>{
    done[key]=cb.checked;store.set("cs50p-done",done);markStudied();setLast(current,6,j);
    item.toggleAttribute("data-done",cb.checked);if(cb.checked)item.dataset.done="true";
    const c=item.closest(".section-card")?.querySelector(".section-card__count");if(c)c.textContent=sectionCount("pset");
    refreshChrome();
  });
  const hints=p.hints||[];let expanded=false;
  const box=el("div",{class:"hints",id:`hints-${key}`,hidden:""});
  const toggle=hints.length?el("button",{class:"pset-item__hints-toggle",type:"button","aria-expanded":"false","aria-controls":`hints-${key}`},`Pistas (${hints.length})`):el("span");
  function paintHints(){
    const shown=Math.max(1,Math.min(hints.length,wp.hintsOpen?.[j]||1));
    box.textContent="";
    hints.slice(0,shown).forEach((h,k)=>box.append(el("p",{class:"hints__item"},el("span",{class:"hints__num"},String(k+1)),el("span",{html:md(h)}))));
    if(shown<hints.length)box.append(el("button",{class:"hints__more",type:"button",onclick:()=>{wp.hintsOpen??={};wp.hintsOpen[j]=shown+1;savePrefs();paintHints();box.querySelectorAll(".hints__item")[shown]?.setAttribute("tabindex","-1");box.querySelectorAll(".hints__item")[shown]?.focus()}},
      el("span",{class:"hints__num"},String(shown+1)),`Mostrar pista ${shown+1}`));
  }
  toggle.addEventListener?.("click",()=>{expanded=!expanded;box.hidden=!expanded;toggle.setAttribute("aria-expanded",String(expanded));toggle.textContent=expanded?"Pistas ▴":`Pistas (${hints.length})`;if(expanded)paintHints()});
  // Área táctil de 44×44 alrededor del checkbox (el cuadro visible mide 20)
  item.append(el("label",{class:"pset-item__hit",for:"p"+key,"aria-hidden":"true"}));
  item.append(cb,el("div",{class:"pset-item__main"},
    p.url?el("a",{class:"pset-item__name",href:p.url,target:"_blank",rel:"noopener"},p.name,el("span",{class:"pset-item__ext","aria-hidden":"true"}," ↗"),el("span",{class:"visually-hidden"}," (abre en otra pestaña)")):el("span",{class:"pset-item__name"},p.name),
    el("p",{class:"pset-item__task",html:md(p.task||"")}),box),toggle);
  return item;
}

// Práctica (centro de la semana). El editor y los resultados se rehacen en la fase 5.
function buildPractice(){
  const w=weeks[current],d=sectionDone(current,"practice");
  if(d&&!openSections.has("practice")){
    return el("section",{class:"section-card",id:"s-practice","data-state":"done"},
      el("button",{class:"section-row",type:"button","aria-expanded":"false","aria-controls":"s-practice-body",onclick:()=>{openSections.add("practice");const node=buildPractice();document.getElementById("s-practice").replaceWith(node);node.querySelector("h2").focus();refreshChrome()}},
        el("span",{class:"num"},"05"),el("span",{class:"section-row__title"},"Practica aquí",el("span",{class:"section-row__sub"},` · ${sectionCount("practice")}`)),
        el("span",{class:"section-row__status","data-ok":"true"},"✓ Hecho · ",el("span",{class:"section-row__open"},"abrir"))));
  }
  if(practiceSel==null||practiceSel>=w.practice.length){
    const l=prefs.last;practiceSel=l?.week===current&&l.section===5&&l.item<w.practice.length?l.item:Math.max(0,w.practice.findIndex((_,j)=>!passed[`${current}-${j}`]));
  }
  const count=el("span",{class:"practice__count"});
  const paintCount=()=>{const n=w.practice.filter((_,j)=>passed[`${current}-${j}`]).length;count.innerHTML=`<span class="hide-mobile">${n} de ${w.practice.length} aprobados</span><span class="only-mobile">${n}/${w.practice.length}</span>`};
  paintCount();
  const tabs=el("div",{class:"ex-tabs",role:"tablist","aria-label":"Ejercicios"});
  const panel=el("div",{class:"practice__body",role:"tabpanel",id:"ex-panel"});
  function paintTabs(){
    tabs.textContent="";
    w.practice.forEach((p,j)=>{
      const ok=passed[`${current}-${j}`],sel=j===practiceSel;
      tabs.append(el("button",{class:"ex-tab",role:"tab",type:"button",id:`ex-tab-${j}`,"aria-selected":String(sel),"aria-controls":"ex-panel",tabindex:sel?"0":"-1","data-state":ok?"passed":sel?"current":"pending",onclick:()=>select(j)},
        ok?el("span",{class:"ex-tab__mark","aria-hidden":"true"},"✓"):el("span",{class:"ex-tab__dot","aria-hidden":"true"}),`${j+1} · ${p.name}`,ok?el("span",{class:"visually-hidden"},", aprobado"):null));
    });
    panel.setAttribute("aria-labelledby",`ex-tab-${practiceSel}`);
  }
  function select(j,focus=true){practiceSel=j;paintTabs();panel.replaceChildren(...practicePanel(w.practice[j],j,hooksFor(j)));if(focus)tabs.children[j].focus()}
  // "Siguiente": el próximo ejercicio, o el problem set tras el último
  const hooksFor=j=>({onPass,next:j+1<w.practice.length?{label:`${j+2} · ${w.practice[j+1].name}`,go:()=>select(j+1)}:w.pset?.length?{label:"Problem set",go:()=>scrollToSection("pset")}:null});
  tabs.addEventListener("keydown",e=>{
    const n=w.practice.length;let j=null;
    if(e.key==="ArrowRight")j=(practiceSel+1)%n;else if(e.key==="ArrowLeft")j=(practiceSel-1+n)%n;else if(e.key==="Home")j=0;else if(e.key==="End")j=n-1;
    if(j!=null){e.preventDefault();select(j)}
  });
  function onPass(){paintCount();paintTabs();refreshChrome()}
  paintTabs();panel.append(...practicePanel(w.practice[practiceSel],practiceSel,hooksFor(practiceSel)));
  return el("section",{id:"s-practice",class:"practice","aria-labelledby":"practice-title"},
    el("header",{class:"practice__head"},el("div",{},el("p",{class:"label practice__label"},"05 · El centro de la semana"),el("h2",{id:"practice-title",tabindex:"-1"},"Practica aquí")),count),
    tabs,el("div",{id:"s-practice-body"},panel));
}
// ── Resaltado de Python (tokenizer regex, en este orden: comentario, string, número, keyword, builtin/llamada)
const PY_KW=new Set("False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case".split(" "));
const PY_BUILTINS=new Set("print input int str len range float list dict set tuple bool abs min max sum sorted round open type isinstance enumerate zip map filter super reversed any all format ord chr".split(" "));
const PY_TOKEN=/(#[^\n]*)|((?:[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_]\w*)/g;
// Devuelve las líneas como HTML. errLine (0-based) y errToken subrayan el nombre del error.
function highlightPy(src,errLine=-1,errToken=null){
  const out=[];let last=0,m;PY_TOKEN.lastIndex=0;
  const push=(text,cls)=>{if(text)out.push({text,cls})};
  while((m=PY_TOKEN.exec(src))){
    push(src.slice(last,m.index),null);
    let cls=null;
    if(m[1])cls="com";else if(m[2])cls="str";else if(m[3])cls="num";
    else if(PY_KW.has(m[4]))cls="kw";
    else if(PY_BUILTINS.has(m[4])||/^\s*\(/.test(src.slice(PY_TOKEN.lastIndex)))cls="fn";
    push(m[0],cls);last=PY_TOKEN.lastIndex;
  }
  push(src.slice(last),null);
  // Partir los tokens por línea para poder marcar el token del error
  const lines=[[]];
  for(const t of out){const parts=t.text.split("\n");parts.forEach((p,k)=>{if(k)lines.push([]);if(p)lines[lines.length-1].push({text:p,cls:t.cls})})}
  return lines.map((toks,i)=>toks.map(t=>{
    const err=i===errLine&&errToken&&t.text===errToken;
    const cls=[t.cls&&"tok-"+t.cls,err&&"tok-err"].filter(Boolean).join(" ");
    return cls?`<span class="${cls}">${esc(t.text)}</span>`:esc(t.text);
  }).join(""));
}

// ── Editor: <textarea> transparente encima de un <pre> resaltado (5.3)
const EDITOR_MIN=6,EDITOR_MAX=30,EDITOR_MOBILE_MAX=14;
function createEditor({value,starter,fileName,label,onChange,onSubmit}){
  const lineH=()=>mobileMQ.matches?22:24;
  const gutter=el("ol",{class:"editor__gutter","aria-hidden":"true"});
  const active=el("div",{class:"editor__active","aria-hidden":"true"});
  const errBg=el("div",{class:"editor__errline","aria-hidden":"true",hidden:""});
  const code=el("code");
  const pre=el("pre",{class:"editor__hl","aria-hidden":"true"},code);
  const ta=el("textarea",{class:"editor__input",spellcheck:"false",autocapitalize:"off",autocomplete:"off",autocorrect:"off",wrap:"off","aria-label":label,"aria-describedby":null});
  ta.value=value;
  const stack=el("div",{class:"editor__stack"},active,errBg,pre,ta);
  const scroll=el("div",{class:"editor__body"},gutter,stack);
  const modified=el("span",{class:"editor__modified"},"· modificado");
  const bar=el("div",{class:"editor__bar"},el("span",{class:"editor__file"},fileName),modified,el("span",{class:"editor__runtime"},"Python 3 · Skulpt"));
  const starterRows=Math.max(EDITOR_MIN,String(starter).split("\n").length+2);
  let rows=Math.min(EDITOR_MAX,Math.max(EDITOR_MIN,prefs.editorHeight||starterRows));
  const handle=el("div",{class:"editor__resize",role:"separator","aria-orientation":"horizontal","aria-label":"Ajustar alto del editor",tabindex:"0","aria-valuemin":String(EDITOR_MIN),"aria-valuemax":String(EDITOR_MAX)});
  const box=el("div",{class:"editor"},bar,scroll,handle);
  let err=null; // {line, text, token}: línea marcada hasta que cambie

  function setRows(n,save){
    rows=Math.min(EDITOR_MAX,Math.max(EDITOR_MIN,n));box.style.setProperty("--rows",rows);handle.setAttribute("aria-valuenow",String(rows));
    if(save){prefs.editorHeight=rows;savePrefs()}
  }
  setRows(rows);
  // ── Pintado (resaltado + números de línea + línea activa)
  let raf=0;
  function paint(){
    raf=0;const v=ta.value,lines=v.split("\n");
    if(err&&lines[err.line]!==err.text)err=null; // la marca dura hasta que cambia esa línea
    code.innerHTML=highlightPy(v,err?err.line:-1,err?.token).join("\n")+(v.endsWith("\n")?" ":"");
    if(gutter.children.length!==lines.length){gutter.replaceChildren(...lines.map((_,i)=>el("li",{},String(i+1))))}
    const caretLine=v.slice(0,ta.selectionStart).split("\n").length-1;
    [...gutter.children].forEach((li,i)=>{li.classList.toggle("is-active",i===caretLine&&document.activeElement===ta);li.classList.toggle("is-error",!!err&&i===err.line)});
    active.style.transform=`translateY(${caretLine*lineH()}px)`;active.hidden=document.activeElement!==ta;
    errBg.hidden=!err;if(err)errBg.style.transform=`translateY(${err.line*lineH()}px)`;
    modified.hidden=v===starter;
  }
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(paint)};
  // Mantiene el cursor visible dentro del área con scroll
  let charW=0;
  function revealCaret(){
    if(!charW){const c=document.createElement("canvas").getContext("2d");c.font=getComputedStyle(ta).font;charW=c.measureText("0").width||9}
    const before=ta.value.slice(0,ta.selectionEnd).split("\n");const line=before.length-1,col=before[before.length-1].length;
    const lh=lineH(),pad=parseFloat(getComputedStyle(stack).paddingTop)||0,top=pad+line*lh;
    if(top<scroll.scrollTop)scroll.scrollTop=top-pad;
    else if(top+lh>scroll.scrollTop+scroll.clientHeight)scroll.scrollTop=top+lh-scroll.clientHeight+pad;
    const gw=gutter.offsetWidth,padL=parseFloat(getComputedStyle(ta).paddingLeft)||0,x=padL+col*charW;
    const viewW=scroll.clientWidth-gw;
    if(x-scroll.scrollLeft<padL)scroll.scrollLeft=Math.max(0,x-padL);
    else if(x-scroll.scrollLeft>viewW-charW*2)scroll.scrollLeft=x-viewW+charW*2;
  }
  // Inserta texto conservando el historial de deshacer (⌘Z)
  function insert(text,start=ta.selectionStart,end=ta.selectionEnd){
    ta.setSelectionRange(start,end);
    if(!document.execCommand||!document.execCommand("insertText",false,text)){ta.setRangeText(text,start,end,"end");ta.dispatchEvent(new Event("input",{bubbles:true}))}
  }
  ta.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();onSubmit?.();return}
    if(e.key==="Escape"){e.preventDefault();ta.blur();return}
    if(e.isComposing)return;
    const v=ta.value,s=ta.selectionStart,en=ta.selectionEnd;
    if(e.key==="Tab"){
      const ls=v.lastIndexOf("\n",s-1)+1;
      const multi=v.slice(s,en).includes("\n");
      if(!e.shiftKey&&!multi){e.preventDefault();insert("    ");return}
      // Varias líneas o Shift+Tab: (des)indenta las líneas seleccionadas
      e.preventDefault();
      const le=en>s&&v[en-1]==="\n"?en-1:(v.indexOf("\n",en)<0?v.length:v.indexOf("\n",en));
      const block=v.slice(ls,le).split("\n");
      const out=block.map(l=>e.shiftKey?l.replace(/^ {1,4}/,""):"    "+l);
      const firstShift=out[0].length-block[0].length;
      insert(out.join("\n"),ls,le);
      if(multi)ta.setSelectionRange(ls,ls+out.join("\n").length);
      else{const p=Math.max(ls,s+firstShift);ta.setSelectionRange(p,p)}
      return;
    }
    if(e.key==="Enter"&&!e.shiftKey){
      e.preventDefault();
      const line=v.slice(v.lastIndexOf("\n",s-1)+1,s);
      let ind=line.match(/^[ \t]*/)[0];if(/:\s*(#.*)?$/.test(line))ind+="    ";
      insert("\n"+ind);return;
    }
  });
  ta.addEventListener("input",()=>{onChange?.(ta.value);schedule();requestAnimationFrame(revealCaret)});
  for(const ev of["keyup","click","focus","blur","select"])ta.addEventListener(ev,schedule);
  document.addEventListener("selectionchange",()=>{if(document.activeElement===ta)schedule()});
  ta.addEventListener("keyup",e=>{if(e.key.startsWith("Arrow")||e.key==="Home"||e.key==="End"||e.key.startsWith("Page"))revealCaret()});
  // Clic en el área vacía bajo el código lleva el cursor al final
  scroll.addEventListener("mousedown",e=>{if(e.target===scroll||e.target===gutter||e.target.parentNode===gutter){e.preventDefault();ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);schedule()}});
  // ── Tirador de alto: arrastre en saltos de una línea, o ↑/↓ con el teclado
  handle.addEventListener("pointerdown",e=>{
    e.preventDefault();handle.setPointerCapture(e.pointerId);const y0=e.clientY,r0=rows;
    const move=ev=>setRows(r0+Math.round((ev.clientY-y0)/lineH()));
    const up=()=>{handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",up);setRows(rows,true)};
    handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",up);
  });
  handle.addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();setRows(rows+(e.key==="ArrowDown"?1:-1),true)}});
  paint();
  return{
    el:box,textarea:ta,
    get value(){return ta.value},
    set value(v){ta.value=v;err=null;paint()},
    focus(){ta.focus()},
    // Marca la línea del error (0-based) y, si se conoce, el nombre culpable
    markError(line,token){const l=ta.value.split("\n");if(line>=0&&line<l.length){err={line,text:l[line],token};paint()}},
    clearError(){err=null;paint()},
  };
}

// ── Resultados (5.4)
const showWs=s=>esc(s).replace(/ +$/,m=>`<span class="ws">${"·".repeat(m.length)}</span>`);
// Texto con los saltos finales visibles: "↵" en --ink-3
function visibleTail(s){
  const m=s.match(/(\s*)$/)[1];const body=s.slice(0,s.length-m.length);
  return{body,tail:m.replace(/ /g,"·").replace(/\n/g,"↵")};
}
// Diff por carácter entre lo esperado (en contexto) y lo obtenido; el tramo distinto se amplía a palabras completas
function diffParts(a,b){
  let p=0;while(p<a.length&&p<b.length&&a[p]===b[p])p++;
  let s=0;while(s<a.length-p&&s<b.length-p&&a[a.length-1-s]===b[b.length-1-s])s++;
  const isW=c=>/[\wÀ-ÿ]/.test(c||"");
  while(p>0&&(isW(a[p-1])&&isW(a[p])||isW(b[p-1])&&isW(b[p])))p--;
  while(s>0&&(isW(a[a.length-s])&&isW(a[a.length-s-1])||isW(b[b.length-s])&&isW(b[b.length-s-1])))s--;
  return{a:[a.slice(0,p),a.slice(p,a.length-s),a.slice(a.length-s)],b:[b.slice(0,p),b.slice(p,b.length-s),b.slice(b.length-s)]};
}
const caseInput=t=>t.code?t.code:t.stdin?.length?t.stdin.join(", "):"(sin entrada)";
function renderMark(parts,cls){
  const[pre,mid,post]=parts;
  const vt=visibleTail(post);
  const midHtml=mid?`<mark class="${cls}">${esc(mid).replace(/\n/g,"↵\n")}</mark>`:"";
  return`${esc(pre)}${midHtml}${esc(vt.body)}${vt.tail?`<span class="ws">${vt.tail}</span>`:""}`;
}
// Fragmento del código con la línea del error (anterior, la del error, posterior)
function errorSnippet(code,line,token){
  const lines=code.split("\n"),html=highlightPy(code,line,token);
  const from=Math.max(0,line-1),to=Math.min(lines.length-1,line+1);
  const rows=[];for(let i=from;i<=to;i++)rows.push(el("div",{class:"err-snippet__row"+(i===line?" is-error":"")},el("span",{class:"err-snippet__num"},String(i+1)),el("span",{class:"err-snippet__code",html:html[i]||" "})));
  return el("div",{class:"err-snippet","aria-hidden":"true"},rows);
}
function renderResults(box,{p,results,code,next}){
  box.textContent="";
  const n=results.length,okN=results.filter(r=>r.pass).length;
  if(okN===n){
    box.append(el("div",{class:"results results--pass"},
      el("div",{class:"results__pass"},el("span",{class:"results__check","aria-hidden":"true"},"✓"),el("div",{},el("p",{class:"results__pass-title"},`Aprobado · ${n} de ${n}`),el("p",{class:"results__pass-sub"},"Guardado en tu progreso"))),
      next?el("div",{class:"results__next"},el("span",{},`Siguiente: ${next.label}`),el("button",{class:"results__go",type:"button",onclick:next.go},"Ir →")):null));
    return;
  }
  const firstFail=results.findIndex(r=>!r.pass);const ff=results[firstFail];
  // Error de ejecución en el primer caso que falla
  if(ff.info){
    const inf=ff.info,studentLines=code.split("\n").length;
    const inStudent=inf.line!=null&&inf.line>=1&&inf.line<=studentLines;
    box.append(el("div",{class:"results results--error"},
      el("div",{class:"results__head"},el("span",{class:"results__count"},`${okN} de ${n} casos`),segs(results.map(r=>r.pass?"done":"fail"),"segments results__segs")),
      inStudent?errorSnippet(code,inf.line-1,inf.token):null,
      el("div",{class:"err-foot"},el("p",{class:"err-foot__type"},el("span",{class:"err-foot__name"},inf.type),inStudent?` · línea ${inf.line}`:` · en la prueba del caso ${firstFail+1}`),
        el("p",{class:"err-foot__msg"},inf.msg),
        !inStudent&&p.tests[firstFail].code?el("p",{class:"err-foot__msg"},"Prueba: ",el("code",{},p.tests[firstFail].code)):null,
        // NameError dentro de la prueba: casi siempre la función no existe o se llama distinto
        !inStudent&&inf.type==="NameError"&&inf.token?el("p",{class:"err-foot__hint",html:md(`¿Definiste la función \`${inf.token}\`? Revisa que se llame igual que en el enunciado.`)}):null)));
    return inStudent?inf:null;
  }
  const list=el("div",{class:"results"},
    el("div",{class:"results__head"},el("span",{class:"results__count"},`${okN} de ${n} casos`),segs(results.map(r=>r.pass?"done":"fail"),"segments results__segs"),el("span",{class:"results__note"},"Un test pasa si la salida termina con lo esperado")));
  results.forEach((r,i)=>{
    const t=p.tests[i];
    if(r.pass){list.append(el("div",{class:"case"},el("span",{class:"case__mark","data-ok":"true","aria-label":"Aprobado"},"✓"),el("span",{class:"case__name"},`Caso ${i+1}`),el("span",{class:"case__io"},`${t.code?"":"entrada "}${caseInput(t)} → ${t.expect}`)));return}
    if(i!==firstFail){list.append(el("div",{class:"case"},el("span",{class:"case__mark","aria-label":"Falla"},"✗"),el("span",{class:"case__name"},`Caso ${i+1}`),el("span",{class:"case__io"},`${t.code?"":"entrada "}${caseInput(t)}`)));return}
    // Caso fallido: esperado en contexto (la salida real con `expect` en lugar del final) frente a lo obtenido
    // "Esperado" en contexto: la salida real con `expect` en lugar de sus últimas palabras (tantas como tenga `expect`)
    const gotT=r.out.replace(/\n$/,""); // el salto final de print() no cuenta
    const gl=gotT.trimEnd().split("\n"),el2=t.expect.split("\n"),L=el2.length;
    const headN=Math.max(0,gl.length-L),first=gl[headN]??"";
    const nW=el2[0].trim().split(/\s+/).filter(Boolean).length;
    const mm=nW?first.match(new RegExp(`^([\\s\\S]*?)(\\S+(?:\\s+\\S+){${nW-1}})\\s*$`)):null;
    const prefix=nW?(mm?mm[1]:""):first;
    const hk=Math.min(2,headN),ctx=gl.slice(headN-hk,headN); // hasta 2 líneas previas de contexto
    const a=[...ctx,prefix+t.expect].join("\n");
    const b=gotT.split("\n").slice(headN-hk).join("\n");
    const d=diffParts(a,b);
    list.append(el("div",{class:"case case--fail"},
      el("div",{class:"case__row"},el("span",{class:"case__mark","aria-label":"Falla"},"✗"),el("span",{class:"case__name"},`Caso ${i+1}`),
        el("span",{class:"case__io"},t.code?"":"entrada ",el("span",{class:"case__chip"},caseInput(t)))),
      // La regla real del test, literal, aunque el contexto se arme con la salida obtenida
      el("p",{class:"case__rule"},"El test pide que la salida termine en: ",el("code",{class:"case__expect"},t.expect)),
      el("div",{class:"diff"},
        el("div",{class:"diff__panel"},el("p",{class:"diff__title"},"Esperado"),el("pre",{class:"diff__body",html:renderMark(d.a,"diff__mark--ok")})),
        el("div",{class:"diff__panel diff__panel--bad"},el("p",{class:"diff__title"},"Obtenido"),el("pre",{class:"diff__body",html:b.length?renderMark(d.b,"diff__mark--bad"):'<span class="ws">(sin salida)</span>'})))));
  });
  box.append(list);
  return null;
}

// ── Celebración ligera: toast de ejercicio aprobado (§9)
let toastState=null;
function showToast({title,sub,action}){
  toastState?.close(true);
  const bar=el("span",{class:"toast__time","aria-hidden":"true"});
  const t=el("div",{class:"toast",role:"status","aria-live":"polite"},
    el("span",{class:"toast__check","aria-hidden":"true"},"✓"),
    el("div",{class:"toast__text"},el("p",{class:"toast__title"},title),el("p",{class:"toast__sub"},sub)),
    action?el("button",{class:"toast__action",type:"button",onclick:()=>{close();action.go()}},action.label):null,bar);
  // En móvil, encima de la barra de acciones fija
  const actions=[...document.querySelectorAll(".ex-actions")].find(a=>{const r=a.getBoundingClientRect();return r.height&&r.bottom>=innerHeight-2&&getComputedStyle(a).position==="sticky"});
  if(mobileMQ.matches&&actions)t.style.setProperty("--toast-lift",actions.offsetHeight+"px");
  document.body.append(t);
  let left=4000,started=performance.now(),timer=0,closed=false;
  const run=()=>{started=performance.now();bar.style.transition=`transform ${left}ms linear`;bar.style.transform="scaleX(0)";timer=setTimeout(close,left)};
  const pause=()=>{if(!timer)return;clearTimeout(timer);timer=0;left-=performance.now()-started;const k=Math.max(0,left/4000);bar.style.transition="none";bar.style.transform=`scaleX(${k})`};
  function close(instant){
    if(closed)return;closed=true;clearTimeout(timer);removeEventListener("keydown",onKey);
    if(instant||reducedMotion()){t.remove()}else{t.classList.add("is-leaving");setTimeout(()=>t.remove(),120)}
    if(toastState?.el===t)toastState=null;
  }
  const onKey=e=>{if(e.key==="Escape"&&(t.matches(":hover")||t.contains(document.activeElement)||document.activeElement===document.body)){close()}};
  addEventListener("keydown",onKey);
  t.addEventListener("mouseenter",pause);t.addEventListener("mouseleave",()=>{if(!t.contains(document.activeElement))run()});
  t.addEventListener("focusin",pause);t.addEventListener("focusout",e=>{if(!t.contains(e.relatedTarget)&&!t.matches(":hover"))run()});
  requestAnimationFrame(()=>{t.classList.add("is-in");requestAnimationFrame(run)});
  toastState={el:t,close};
}

// Panel de un ejercicio: enunciado, editor, acciones y resultados.
// hooks: onPass() tras aprobar, next {label, go} para "Siguiente" / "Ir →"
function practicePanel(p,j,hooks={}){
  const key=`${current}-${j}`,w=weeks[current];
  const ed=createEditor({value:codes[key]??p.starter,starter:p.starter,fileName:(snake(p.name)||"ejercicio")+".py",label:"Código Python: "+p.name,
    onChange:v=>{codes[key]=v;store.set("cs50p-code",codes)},onSubmit:()=>check.click()});
  const res=el("div",{class:"results-box","aria-live":"polite"});
  const stdin=el("input",{class:"stdin",id:"in-"+key,placeholder:"Entradas para Ejecutar, separadas por | (ej: 100|300)","aria-label":"Entradas para Ejecutar, separadas por |",autocomplete:"off"});
  const check=el("button",{class:"btn--primary",type:"button"},"Comprobar",el("kbd",{class:"hide-mobile","aria-label":"atajo Comando Enter"},"⌘↵"));
  const run=el("button",{class:"btn--secondary",type:"button"},"Ejecutar");
  // "Volver al inicio" pide confirmación inline
  const resetBox=el("span",{class:"ex-reset"});
  function paintReset(){
    resetBox.replaceChildren(el("button",{class:"btn--ghost",type:"button",onclick:()=>{
      resetBox.replaceChildren(el("span",{class:"ex-reset__q"},"¿Borrar tu código?"),
        el("button",{class:"btn--ghost",type:"button",onclick:()=>{ed.value=p.starter;delete codes[key];store.set("cs50p-code",codes);res.textContent="";paintReset();ed.focus()}},"Sí"),
        el("button",{class:"btn--ghost",type:"button",onclick:()=>{paintReset();resetBox.querySelector("button").focus()}},"No"));
      resetBox.querySelector("button").focus();
    }},"Volver al inicio"));
  }
  paintReset();
  // En móvil "Volver al inicio" va debajo del editor; en desktop, al final de la fila de acciones
  const resetDesk=el("span",{class:"ex-actions__reset"}),resetMobile=el("div",{class:"ex-reset-row"});
  const placeReset=()=>{if(!resetBox.isConnected&&resetBox.parentNode){mobileMQ.removeEventListener("change",placeReset);return}(mobileMQ.matches?resetMobile:resetDesk).append(resetBox)};
  placeReset();mobileMQ.addEventListener("change",placeReset);
  const label=b=>b.firstChild; // nodo de texto del botón (sin el <kbd>)
  async function busy(b,fn){
    check.disabled=run.disabled=true;const t=label(b).textContent;label(b).textContent="Corriendo…";
    try{await fn()}catch(e){res.replaceChildren(el("div",{class:"results results--error"},el("div",{class:"err-foot"},el("p",{class:"err-foot__msg"},"No se pudo cargar Python en el navegador. Revisa tu conexión y vuelve a intentar."))))}
    finally{label(b).textContent=t;check.disabled=run.disabled=false}
  }
  check.onclick=()=>busy(check,async()=>{
    const code=ed.value;codes[key]=code;store.set("cs50p-code",codes);
    const results=[];for(const t of p.tests)results.push(await runTest(code,t));
    const all=results.every(r=>r.pass),was=!!passed[key];
    const errAt=renderResults(res,{p,results,code,next:hooks.next});
    if(errAt)ed.markError(errAt.line-1,errAt.token);else ed.clearError();
    if(all){
      passed[key]=true;store.set("cs50p-passed",passed);markStudied();setLast(current,5,j);hooks.onPass?.();
      if(!was){
        const n=w.practice.filter((_,k)=>passed[`${current}-${k}`]).length;
        showToast({title:"Ejercicio aprobado",sub:`${p.name} · ${n} de ${w.practice.length} en la semana`,action:hooks.next?{label:"Siguiente",go:hooks.next.go}:null});
      }
    }
  });
  run.onclick=()=>busy(run,async()=>{
    const code=ed.value;codes[key]=code;store.set("cs50p-code",codes);
    const ins=stdin.value?stdin.value.split("|"):[];
    const r=await runPy(code,ins,0);
    res.replaceChildren(el("div",{class:"run-out"},el("p",{class:"run-out__title"},"Salida"),
      el("pre",{class:"run-out__body"},r.out||(r.err?"":"(sin salida)"),r.err?el("span",{class:"run-out__err"},(r.out&&!r.out.endsWith("\n")?"\n":"")+(r.info?`${r.info.type}: ${r.info.msg}${r.info.line?` (línea ${r.info.line})`:""}`:r.err)):null)));
    if(r.info?.line)ed.markError(r.info.line-1,r.info.token);
  });
  return[
    el("p",{class:"ex-prompt",html:md(p.prompt)}),
    ed.el,stdin,resetMobile,
    el("div",{class:"ex-actions"},check,run,resetDesk),
    el("p",{class:"practice__note",html:"Este Python del navegador es simplificado (sin archivos, <code>csv</code>, <code>json</code> ni <code>match</code>); los problem sets van en cs50.dev."}),
    res];
}

function observeSections(){
  sectionObserver?.disconnect();
  // Hasta el primer scroll, la sección actual es la primera sin hacer (no la que cae en mitad de la pantalla al cargar)
  sectionObserver=new IntersectionObserver(es=>{if(!userScrolled)return;for(const e of es)if(e.isIntersecting)setInView(e.target.id.slice(2))},{rootMargin:"-40% 0px -55% 0px"});
  SECTIONS.forEach(s=>{const t=document.getElementById("s-"+s.key);if(t)sectionObserver.observe(t)});
}

function renderWeek(){
  const main=document.getElementById("main");main.textContent="";main.className="app week";
  sectionObserver?.disconnect();
  const w=weeks[current];
  if(!w){
    main.append(el("div",{class:"week-empty"},el("p",{class:"label"},`Semana ${current}`),el("h1",{},WEEK_NAMES[current]),
      el("p",{},loaded?"No se pudo cargar el contenido de esta semana.":"Cargando el contenido de esta semana…")));
    return;
  }
  weekWasComplete=weekStatus(current)==="complete";
  currentInView=SECTIONS[(firstOpenSection(current)??1)-1].key;userScrolled=false;quietUntil=performance.now()+150;
  const select=el("select",{class:"week-switch__select","aria-label":"Cambiar de semana",onchange:e=>{location.hash="#/w/"+e.target.value}},
    [...Array(10).keys()].map(i=>el("option",{value:String(i),selected:i===current?"":null,disabled:weeks[i]?null:""},`W${i} · ${weeks[i]?.title||WEEK_NAMES[i]}`)));
  const head=el("header",{class:"week-head"},
    el("div",{class:"week-head__mobile only-mobile"},
      el("div",{class:"week-switch"},el("a",{href:"#/",class:"week-switch__back","aria-label":"Ir a Inicio"},"←"),el("span",{class:"week-switch__label","aria-hidden":"true"},`W${current} ▾`),select),
      el("div",{class:"week-head__actions"},el("button",{class:"btn--small focus-toggle--mobile",type:"button",onclick:()=>enterFocus()},"Foco"),themeButton("theme-toggle theme-toggle--icon"))),
    el("p",{class:"week-head__meta"},`Semana ${current} · ${w.time||""}`),
    el("h1",{class:"week-head__title"},w.title),
    el("p",{class:"week-head__time only-mobile"},w.time||""),
    bannerActive(current)?weekBanner(current):null,
    el("div",{class:"only-mobile week-head__segs"},segs(weekSegStates(current,sectionIdx(currentInView)+1))),
    weekLinks("week-links week-links--head below-desktop"));
  const sections=SECTIONS.filter(s=>s.has(w)).map(s=>buildSection(s.key));
  main.append(el("div",{class:"week-layout"},buildIndex(),el("div",{class:"week-main"},head,buildBar(),...sections)));
  observeSections();
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
  let err=null,info=null;
  try{await Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody("<stdin>",false,src,true))}
  catch(e){err=String(e).replace(/on line (\d+)/,(m,n)=>"en la línea "+Math.max(1,n-offset));info=errorInfo(e,offset)}
  return{out,err,info};
}
function errorInfo(e,offset){
  const s=String(e),m=s.match(/^(\w+): ([\s\S]*?)(?: on line (\d+))?\s*$/);
  const raw=e?.traceback?.[0]?.lineno??(m&&m[3]?+m[3]:null);
  const msg=m?m[2]:s,type=m?m[1]:(e?.tp$name||"Error");
  return{type,msg,line:raw!=null?raw-offset:null,token:(msg.match(/name '(\w+)' is not defined/)||[])[1]||null};
}
async function runTest(code,t){
  const src=t.code?`__name__ = "student"\n${code}\n\n__name__ = "__main__"\n${t.code}`:code;
  const r=await runPy(src,t.stdin||[],t.code?1:0);
  return{...r,pass:!r.err&&r.out.trimEnd().endsWith(t.expect)};
}
// ── Modo foco (1c / 1f): un paso a la vez. 01–03, 06 y 07 = 1 paso; 04 = 1 por pregunta; 05 = 1 por ejercicio.
let focusStep=0,focusSkipArmed=false;
function focusSteps(){
  const w=weeks[current],steps=[];
  for(const s of SECTIONS){
    if(!s.has(w))continue;
    if(s.key==="quiz")w.quiz.forEach((_,q)=>steps.push({key:"quiz",sub:q,subs:w.quiz.length}));
    else if(s.key==="practice")w.practice.forEach((_,j)=>steps.push({key:"practice",sub:j,subs:w.practice.length}));
    else steps.push({key:s.key,sub:0,subs:1});
  }
  return steps;
}
const inFocus=()=>document.documentElement.dataset.mode==="focus";
// Paso inicial: la sección actual de la vista de semana (pregunta sin responder / ejercicio seleccionado)
function focusStartStep(){
  const steps=focusSteps(),key=currentInView||SECTIONS[(firstOpenSection(current)??1)-1].key;
  let sub=0;
  if(key==="quiz")sub=Math.max(0,weeks[current].quiz.findIndex((_,q)=>(answers[current]||{})[q]==null));
  if(key==="practice")sub=practiceSel??0;
  const k=steps.findIndex(s=>s.key===key&&s.sub===sub);return k<0?0:k;
}
function enterFocus(step=focusStartStep()){
  if(!weeks[current])return;
  focusStep=step;document.documentElement.dataset.mode="focus";
  sectionObserver?.disconnect();document.getElementById("main").textContent=""; // evita ids duplicados (editor) con la vista de semana
  document.getElementById("focus").hidden=false;
  renderFocus();
}
// Oculta el modo foco sin repintar la semana (lo usa el router)
function leaveFocusView(){delete document.documentElement.dataset.mode;const f=document.getElementById("focus");f.hidden=true;f.textContent=""}
function exitFocus(){
  if(!inFocus())return;
  const st=focusSteps()[focusStep];
  delete document.documentElement.dataset.mode;delete prefs.focus;savePrefs();
  const f=document.getElementById("focus");f.hidden=true;f.textContent="";
  if(route().name==="week"){
    if(st?.key==="practice")practiceSel=st.sub;
    renderWeek();renderHeader(route());renderTabs();
    const k=st?.key;if(k){currentInView=k;scrollToSection(k)}
  }
}
function focusGo(step){
  const steps=focusSteps();if(step<0||step>=steps.length)return;
  focusStep=step;focusSkipArmed=false;renderFocus({animate:true});scrollTo(0,0);
}
// mark=true solo desde el botón principal "Marcar hecho y seguir"; Saltar, → y Siguiente no marcan nada
function focusNext({mark=false}={}){
  const steps=focusSteps(),st=steps[focusStep];
  // Quiz sin responder: el primer clic avisa, el segundo salta
  if(st.key==="quiz"&&(answers[current]||{})[st.sub]==null&&!focusSkipArmed){
    focusSkipArmed=true;const n=document.querySelector(".focus__hint");if(n)n.hidden=false;return;
  }
  if(mark&&MANUAL.has(st.key)&&!sectionDone(current,st.key)){const wp=weekPrefs(current);wp.done??={};wp.done[st.key]=true;markStudied();setLast(current,sectionIdx(st.key)+1,0)}
  if(focusStep===steps.length-1){exitFocus();return}
  focusGo(focusStep+1);
}
function renderFocus({animate=false}={}){
  const w=weeks[current],steps=focusSteps(),st=steps[focusStep],k=sectionIdx(st.key),s=SECTIONS[k];
  prefs.focus={week:current,step:focusStep};savePrefs();
  const secState=SECTIONS.map((x,i)=>i===k?"current":sectionDone(current,x.key)?"done":"pending");
  const subDone=j=>st.key==="quiz"?(answers[current]||{})[j]!=null:st.key==="practice"?!!passed[`${current}-${j}`]:sectionDone(current,st.key);
  const subTxt=st.key==="quiz"?`Pregunta ${st.sub+1} de ${st.subs}`:st.key==="practice"?`Ejercicio ${st.sub+1} de ${st.subs}`:"";
  const f=document.getElementById("focus");f.textContent="";
  const segBar=el("div",{class:"focus__segments","aria-hidden":"true"},secState.map(x=>el("span",{"data-s":x})));
  const exit=el("button",{class:"btn--small focus__exit",type:"button",onclick:exitFocus},el("span",{class:"hide-mobile"},"Salir del foco"),el("span",{class:"only-mobile"},"✕ Salir"),el("kbd",{class:"hide-mobile"},"Esc"));
  const pos=el("p",{class:"focus__pos"},el("span",{class:"hide-mobile"},`W${current} · ${pad2(k+1)} de 07`),el("span",{class:"only-mobile"},`${pad2(k+1)}/07`+(st.subs>1?` · ${st.sub+1} de ${st.subs}`:"")));
  // Contenido del paso
  const title=t=>el("h2",{class:"focus__title",tabindex:"-1"},t);
  let body;
  if(st.key==="quiz"){
    const fs=quizQuestion(w.quiz[st.sub],st.sub);fs.classList.add("quiz-q--focus");
    const lg=fs.querySelector("legend");lg.classList.add("focus__title");lg.tabIndex=-1;
    fs.addEventListener("click",()=>setTimeout(paintFocusProgress,0));
    body=[fs];
  }else if(st.key==="practice"){
    const p=w.practice[st.sub];
    const nx=steps[focusStep+1];
    const next=nx?{label:nx.key==="practice"?`${nx.sub+1} · ${w.practice[nx.sub].name}`:sectionTitle(nx.key),go:()=>focusGo(focusStep+1)}:null;
    body=[title(`${st.sub+1} · ${p.name}`),...practicePanel(p,st.sub,{onPass:paintFocusProgress,next})];
  }else body=[title(sectionTitle(st.key)),...sectionBody(st.key)];
  const prev=el("button",{class:"btn--ghost focus__prev",type:"button","aria-disabled":focusStep===0?"true":null,onclick:()=>{if(focusStep>0)focusGo(focusStep-1)}},"← Anterior");
  const last=focusStep===steps.length-1;
  // 01, 02, 03 y 07 sin hacer: "Marcar hecho y seguir" (principal) + "Saltar" (secundario)
  const manual=MANUAL.has(st.key)&&!sectionDone(current,st.key);
  const next=manual
    ?el("div",{class:"focus__next-group"},
      el("button",{class:"btn--secondary focus__skip",type:"button",onclick:()=>focusNext()},last?"Terminar":"Saltar"),
      el("button",{class:"btn--primary focus__next",type:"button",onclick:()=>focusNext({mark:true})},last?"Marcar hecho y terminar":"Marcar hecho y seguir →"))
    :el("button",{class:"btn--primary focus__next",type:"button",onclick:()=>focusNext()},last?"Terminar":"Siguiente →");
  const dots=el("div",{class:"focus__dots","aria-hidden":"true"},st.subs>1?[...Array(st.subs).keys()].map(j=>el("span",{"data-s":subDone(j)?"done":"pending","data-current":j===st.sub?"true":null})):null);
  const step=el("div",{class:"focus__step"+(animate&&!reducedMotion()?" is-entering":"")},
    el("div",{class:"focus__label"},el("span",{},s.short),el("span",{},subTxt)),...body);
  f.append(
    el("header",{class:"focus__head"},exit,segBar,pos),
    el("div",{class:"focus__segments-mobile only-mobile","aria-hidden":"true"},secState.map(x=>el("span",{"data-s":x}))),
    el("div",{class:"focus__content"},step),
    el("footer",{class:"focus__foot"},el("div",{class:"focus__foot-inner"},
      el("p",{class:"focus__hint",hidden:"","aria-live":"polite"},"Responde o pulsa otra vez para saltar"),
      prev,dots,next)),
    el("p",{class:"visually-hidden","aria-live":"polite"},`Paso ${focusStep+1} de ${steps.length}: ${s.title}${subTxt?", "+subTxt.toLowerCase():""}`));
  if(animate&&!reducedMotion())requestAnimationFrame(()=>requestAnimationFrame(()=>step.classList.remove("is-entering")));
  (step.querySelector(".focus__title"))?.focus({preventScroll:true});
  function paintFocusProgress(){
    dots.querySelectorAll("span").forEach((d,j)=>d.dataset.s=subDone(j)?"done":"pending");
    segBar.querySelectorAll("span").forEach((d,i)=>{if(i!==k)d.dataset.s=sectionDone(current,SECTIONS[i].key)?"done":"pending"});
    renderHeader(route());
  }
}
// Teclado: F entra, Esc sale, ←/→ mueven, 1–4 responden. Nada de esto mientras se escribe (salvo Esc, que el editor usa para soltar el foco).
const typing=t=>t&&(t.tagName==="TEXTAREA"||t.tagName==="INPUT"||t.tagName==="SELECT"||t.isContentEditable);
addEventListener("keydown",e=>{
  if(e.metaKey||e.ctrlKey||e.altKey||typing(e.target))return;
  if(!inFocus()){
    if((e.key==="f"||e.key==="F")&&route().name==="week"&&weeks[current]){e.preventDefault();enterFocus()}
    return;
  }
  if(e.key==="Escape"){e.preventDefault();exitFocus()}
  else if(e.key==="ArrowRight"&&!e.target.closest?.("[role=tablist]")){e.preventDefault();focusNext()}
  else if(e.key==="ArrowLeft"&&!e.target.closest?.("[role=tablist]")){e.preventDefault();focusGo(focusStep-1)}
  else if(/^[1-4]$/.test(e.key)){const o=document.querySelectorAll("#focus .quiz-opt")[+e.key-1];if(o&&!o.disabled){e.preventDefault();o.click()}}
});

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
  const main=document.getElementById("main");main.textContent="";main.className="app home";
  const top=el("div",{class:"home__top"});
  const col=el("div",{class:"home__main"});top.append(col);
  const bw=[...Array(10).keys()].reverse().find(bannerActive);if(bw!=null)col.append(weekBanner(bw));
  // Continuar
  const t=continueTarget();
  if(t){
    const [long,short,code]=continueDetail(t);const top=col;
    const go=el("a",{class:"btn--primary",href:"#/w/"+t.week,onclick:()=>{pendingScroll=SECTIONS[t.section-1].key}},"Continuar →");
    top.append(el("article",{class:"continue-card","aria-labelledby":"continue-title"},
      el("p",{class:"label continue-card__label"},el("span",{class:"hide-mobile"},"Continuar donde lo dejé"),el("span",{class:"only-mobile"},"Continuar")),
      el("h2",{class:"continue-card__title",id:"continue-title"},`W${t.week} · ${weeks[t.week].title}`),
      el("p",{class:"continue-card__sub"},el("span",{class:"hide-mobile"},long,code?el("span",{class:"mono-ink"},code):null),el("span",{class:"only-mobile"},short)),
      el("div",{class:"hide-mobile"},segs(weekSegStates(t.week,t.section),"segments segments--continue")),
      el("div",{class:"continue-card__actions"},go)));
  }else if(loaded){
    col.append(el("article",{class:"continue-card"},el("p",{class:"label continue-card__label"},"Curso completo"),el("h2",{class:"continue-card__title"},"Terminaste las 10 semanas"),el("p",{class:"continue-card__sub"},"Puedes repasar cualquier semana desde la lista.")));
  }else col.append(el("article",{class:"continue-card"},el("p",{class:"continue-card__sub"},"Cargando semanas…")));

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
function toggleTheme(){prefs.theme=shownTheme()==="dark"?"light":"dark";savePrefs();applyTheme()}
function paintThemeButton(b){
  const label=shownTheme()==="dark"?"Modo claro":"Modo oscuro";
  b.querySelector(".theme-toggle__text").textContent=label;b.setAttribute("aria-label",label);b.dataset.shown=shownTheme();
}
function applyTheme(){
  if(prefs.theme==="light"||prefs.theme==="dark")document.documentElement.dataset.theme=prefs.theme;else delete document.documentElement.dataset.theme;
  document.querySelectorAll(".theme-toggle").forEach(paintThemeButton);
}
// Copia del botón del header (la vista de semana en móvil no muestra el header)
function themeButton(cls){const b=document.getElementById("themeToggle").cloneNode(true);b.removeAttribute("id");b.className=cls;b.addEventListener("click",toggleTheme);paintThemeButton(b);return b}
document.getElementById("themeToggle").addEventListener("click",toggleTheme);
darkMQ.addEventListener("change",applyTheme);
applyTheme();

function render(){
  const r=route();
  if(r.name==="week"){
    if(current!==r.week){openSections=new Set();practiceSel=null}
    if(loaded&&r.week>0&&weekStatus(r.week-1)==="complete"&&weeks[r.week]&&!prefs.weeks?.[r.week-1]?.bannerDone){weekPrefs(r.week-1).bannerDone=true;savePrefs()}
    current=r.week;
    if(prefs.focus&&prefs.focus.week!==current){delete prefs.focus;savePrefs()}
    if(prefs.focus&&weeks[current]){enterFocus(Math.min(prefs.focus.step,focusSteps().length-1))}
    else{
      if(inFocus())leaveFocusView();
      renderWeek();
      if(pendingScroll){const k=pendingScroll;pendingScroll=null;scrollToSection(k)}
    }
  }else{if(inFocus()){leaveFocusView();delete prefs.focus;savePrefs()}sectionObserver?.disconnect();renderHome()}
  renderHeader(r);renderTabs();
}
addEventListener("hashchange",()=>{
  if(!/^(#\/.*|#w\d|#?)$/.test(location.hash))return; // anclas internas (#main…) no cambian de vista
  const jump=!!pendingScroll;render();if(!jump)scrollTo(0,0);
});
document.querySelector(".skip-link").addEventListener("click",e=>{e.preventDefault();(inFocus()?document.querySelector("#focus .focus__title"):document.getElementById("main"))?.focus()});
render();

// Carga las 10 semanas desde data/w0.json … data/w9.json
(async()=>{
  const res=await Promise.allSettled([...Array(10).keys()].map(i=>fetch(`data/w${i}.json`).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})));
  const next={};res.forEach(r=>{if(r.status==="fulfilled"&&typeof r.value.week==="number")next[r.value.week]=r.value});
  weeks=next;loaded=true;render();
})();
