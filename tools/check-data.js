// Revisa que los 10 JSON de data/ estén completos antes de subir a Vercel.
const fs = require("fs");
const path = require("path");
let ok = true;
const isUrl = s => typeof s === "string" && /^https?:\/\/\S+$/.test(s);
const isText = s => typeof s === "string" && s.trim().length > 0;
for (let i = 0; i < 10; i++) {
  const file = path.join(__dirname, "..", "data", `w${i}.json`);
  try {
    const w = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const k of ["title", "summary", "quiz", "pset", "practice"]) {
      if (!w[k] || !w[k].length) throw new Error(`falta "${k}"`);
    }
    w.quiz.forEach((q, j) => {
      if (q.answer < 0 || q.answer >= q.options.length) throw new Error(`quiz ${j + 1}: answer fuera de rango`);
    });
    // Campos opcionales (handoff v1.1): si están, deben tener la forma correcta
    if (w.transcriptUrl !== undefined && !isUrl(w.transcriptUrl)) throw new Error(`"transcriptUrl" no es una URL`);
    if (w.tips !== undefined) {
      if (!Array.isArray(w.tips)) throw new Error(`"tips" debe ser una lista`);
      w.tips.forEach((t, j) => { if (!isText(t)) throw new Error(`tips ${j + 1}: texto vacío`) });
    }
    if (w.shorts !== undefined) {
      if (!Array.isArray(w.shorts)) throw new Error(`"shorts" debe ser una lista`);
      w.shorts.forEach((s, j) => {
        if (!s || !isText(s.title)) throw new Error(`shorts ${j + 1}: falta "title"`);
        if (s.url !== undefined && !isUrl(s.url)) throw new Error(`shorts ${j + 1}: "url" no es una URL`);
        if (s.confirmed !== undefined && typeof s.confirmed !== "boolean") throw new Error(`shorts ${j + 1}: "confirmed" debe ser true o false`);
      });
    }
    for (const k of ["lectureNotes", "shortsConfirmed"]) {
      if (w[k] !== undefined) throw new Error(`"${k}" es del esquema anterior (usa "tips" / "shorts[].confirmed")`);
    }
    const extra = [];
    if (w.shorts?.length) {
      const n = w.shorts.filter(s => s.confirmed).length;
      extra.push(`${w.shorts.length} ${w.shorts.length === 1 ? "short" : "shorts"}${n === w.shorts.length ? "" : n ? ` (${w.shorts.length - n} sin confirmar)` : " (sin confirmar)"}`);
    }
    if (w.tips?.length) extra.push(`${w.tips.length} consejos`);
    console.log(`✓ Week ${i}: ${w.title}${extra.length ? " · " + extra.join(", ") : ""}`);
  } catch (e) {
    ok = false;
    console.log(`✗ Week ${i}: ${e.message}`);
  }
}
process.exit(ok ? 0 : 1);
