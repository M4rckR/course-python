const WEEK_NAMES=["Functions, Variables","Conditionals","Loops","Exceptions","Libraries","Unit Tests","File I/O","Regular Expressions","Object-Oriented Programming","Et Cetera"];
let weeks={}; let current=0;
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let done=store.get("cs50p-done",{}); let answers=store.get("cs50p-quiz",{}); let passed=store.get("cs50p-passed",{}); let codes=store.get("cs50p-code",{});
try{const h=location.hash.match(/^#w(\d)$/);if(h)current=+h[1]}catch(e){}
const el=(t,a={},...c)=>{const n=document.createElement(t);for(const[k,v]of Object.entries(a)){if(k==="class")n.className=v;else if(k==="html")n.innerHTML=v;else if(k.startsWith("on"))n.addEventListener(k.slice(2),v);else n.setAttribute(k,v)}for(const x of c.flat()){if(x==null)continue;n.append(x.nodeType?x:document.createTextNode(x))}return n};
// inline: `code` y **negrita**, escapando todo lo demás
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const md=s=>esc(s).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>");

function renderNav(){
  const nav=document.getElementById("weeks");nav.textContent="";
  for(let i=0;i<10;i++){
    const w=weeks[i];const probs=w?.pset||[];
    const allDone=probs.length&&probs.every((_,j)=>done[`${i}-${j}`]);
    const b=el("button",{role:"tab","aria-selected":String(i===current),class:(w?"loaded":"")+(allDone?" done":""),title:WEEK_NAMES[i],onclick:()=>{current=i;try{history.replaceState(null,"","#w"+i)}catch(e){}render()}},el("span",{class:"dot"}),`W${i}`);
    nav.append(b);
  }
}
function renderProgress(){
  let total=0,ok=0;for(const[i,w]of Object.entries(weeks)){(w.pset||[]).forEach((_,j)=>{total++;if(done[`${i}-${j}`])ok++});(w.practice||[]).forEach((_,j)=>{total++;if(passed[`${i}-${j}`])ok++})}
  document.getElementById("progTxt").textContent=`${ok} / ${total}`;
  document.getElementById("progBar").style.width=total?`${ok/total*100}%`:"0";
}
function block(n,title,...kids){return el("section",{class:"block"},el("h3",{},el("span",{class:"n"},n),title),...kids)}

function renderWeek(){
  const main=document.getElementById("main");main.textContent="";
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
        const b=el("button",{class:"opt",html:md(o),onclick:()=>{answers[current]={...(answers[current]||{}),[qi]:oi};store.set("cs50p-quiz",answers);paint();why.hidden=false;upd()}});
        opts.append(b);
      });
      function paint(){const pick=(answers[current]||{})[qi];[...opts.children].forEach((b,oi)=>{b.disabled=pick!=null;b.classList.toggle("right",pick!=null&&oi===q.answer);b.classList.toggle("wrong",pick===oi&&oi!==q.answer)})}
      paint();
      box.append(el("div",{class:"q"},el("p",{html:`${qi+1}. ${md(q.q)}`}),opts,why));
    });
    upd();
    const reset=el("button",{class:"opt",style:"justify-self:start;font-size:13px",onclick:()=>{delete answers[current];store.set("cs50p-quiz",answers);render()}},"Reiniciar quiz");
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
      cb.addEventListener("change",()=>{done[key]=cb.checked;store.set("cs50p-done",done);card.classList.toggle("done",cb.checked);renderNav();renderProgress()});
      list.append(card);
    });
    const kids=[list];
    if(w.submit)kids.unshift(el("p",{style:"margin:0 0 12px;font-size:14.5px;color:var(--muted)",html:md(w.submit)}));
    main.append(block("06","Problem set",...kids));
  }

  if(w.project){
    const s=el("section",{class:"block project"},el("h3",{},el("span",{class:"n"},"07"),"Tu proyecto: finanzas tracker"),
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
  const check=el("button",{class:"btn primary"},"Comprobar");
  const run=el("button",{class:"btn"},"Ejecutar");
  const reset=el("button",{class:"btn"},"Volver al inicio");
  async function busy(b,fn){check.disabled=run.disabled=true;const t=b.textContent;b.textContent="Corriendo…";try{await fn()}catch(e){res.textContent="";res.append(el("div",{class:"res ko"},"No se pudo cargar Python en el navegador. Revisa tu conexión y vuelve a intentar."))}finally{b.textContent=t;check.disabled=run.disabled=false}}
  check.onclick=()=>busy(check,async()=>{
    codes[key]=ta.value;store.set("cs50p-code",codes);res.textContent="";let all=true;
    for(const[i,t]of p.tests.entries()){
      const r=await runTest(ta.value,t);all=all&&r.pass;
      const d=el("div",{class:"res "+(r.pass?"ok":"ko")},el("b",{},(r.pass?"✓ ":"✗ ")+`Caso ${i+1}`),t.stdin?.length?el("span",{class:"small"}," · entradas: "+t.stdin.map(x=>JSON.stringify(x)).join(", ")):null);
      if(!r.pass){d.append(el("div",{class:"lab"},"Esperado al final"),el("pre",{},t.expect),el("div",{class:"lab"},r.err?"Error":"Tu salida"),el("pre",{},r.err||r.out||"(nada)"))}
      res.append(d);
    }
    if(all){passed[key]=true;store.set("cs50p-passed",passed);card.classList.add("passed");badge.textContent="aprobado";res.prepend(el("div",{class:"res ok"},el("b",{},"Todo pasa. Ahora intenta el problem set de la semana.")));renderNav();renderProgress()}
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
function render(){renderNav();renderWeek();renderProgress()}
render();

// Carga las 10 semanas desde data/w0.json … data/w9.json
(async()=>{
  const res=await Promise.allSettled([...Array(10).keys()].map(i=>fetch(`data/w${i}.json`).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})));
  const next={};res.forEach(r=>{if(r.status==="fulfilled"&&typeof r.value.week==="number")next[r.value.week]=r.value});
  weeks=next;render();
})();
