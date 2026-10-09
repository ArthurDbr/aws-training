// Sanity checks for js/questions.js. Run: node scripts/validate-questions.js
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "js", "questions.js"), "utf8");
const { DOMAINS, QUESTIONS } = new Function(src + "; return { DOMAINS, QUESTIONS };")();

const errors = [];
const ids = new Set();
for (const q of QUESTIONS) {
  if (ids.has(q.id)) errors.push(`${q.id}: duplicate id`);
  ids.add(q.id);
  if (!DOMAINS[q.domain]) errors.push(`${q.id}: unknown domain ${q.domain}`);
  if (!q.q || !q.explanation) errors.push(`${q.id}: missing text`);
  if (!Array.isArray(q.options) || q.options.length < 3) errors.push(`${q.id}: needs at least 3 options`);
  if (!q.answer.length || new Set(q.answer).size !== q.answer.length) errors.push(`${q.id}: bad answer list`);
  if (q.answer.some((a) => !Number.isInteger(a) || a < 0 || a >= q.options.length)) errors.push(`${q.id}: answer out of range`);
  if (q.answer.length > 1 && !/Choose (TWO|THREE)/.test(q.q)) errors.push(`${q.id}: multi-answer question should say "Choose N"`);
  if (new Set(q.options).size !== q.options.length) errors.push(`${q.id}: duplicate options`);
}

const perDomain = Object.keys(DOMAINS).map((d) => `${d}: ${QUESTIONS.filter((q) => q.domain == d).length}`);
console.log(`${QUESTIONS.length} questions (${perDomain.join(", ")})`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("OK");
