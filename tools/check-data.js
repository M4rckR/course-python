// Revisa que los 10 JSON de data/ estén completos antes de subir a Vercel.
const fs = require("fs");
const path = require("path");
let ok = true;
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
    console.log(`✓ Week ${i}: ${w.title}`);
  } catch (e) {
    ok = false;
    console.log(`✗ Week ${i}: ${e.message}`);
  }
}
process.exit(ok ? 0 : 1);
