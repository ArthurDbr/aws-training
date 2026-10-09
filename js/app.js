// AWS Developer – Associate practice quiz. Plain JS, no build step.
"use strict";

const PASS_PERCENT = 72; // 720 / 1000 scaled score
const EXAM_SIZE = 65;
const SECONDS_PER_QUESTION = 120; // 130 min for 65 questions
const STORAGE_KEY = "dva-quiz-stats-v1";

const app = document.getElementById("app");
const byId = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

let session = null;
let timerHandle = null;

// ───────────── persistence (per-browser convenience only) ─────────────

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { questions: {}, history: [] };
  } catch {
    return { questions: {}, history: [] };
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // storage unavailable (private mode, etc.) — the quiz still works
  }
}

function recordAnswer(qid, correct) {
  const stats = loadStats();
  const s = stats.questions[qid] || { seen: 0, correct: 0, lastCorrect: false };
  s.seen += 1;
  if (correct) s.correct += 1;
  s.lastCorrect = correct;
  stats.questions[qid] = s;
  saveStats(stats);
}

function missedIds() {
  const { questions } = loadStats();
  return Object.keys(questions).filter((id) => byId[id] && !questions[id].lastCorrect);
}

// ───────────── helpers ─────────────

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, "");
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sameSet(a, b) {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

function isCorrect(item) {
  return sameSet(item.selected, new Set(byId[item.qid].answer));
}

function letter(i) {
  return String.fromCharCode(65 + i);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function render(...nodes) {
  clearInterval(timerHandle);
  app.replaceChildren(...nodes);
  window.scrollTo(0, 0);
}

// ───────────── home ─────────────

function renderHome() {
  const stats = loadStats();
  const missed = missedIds();

  const domainBoxes = Object.entries(DOMAINS).map(([n, name]) => {
    const count = QUESTIONS.filter((q) => q.domain === Number(n)).length;
    return h(
      "label",
      { class: "check" },
      h("input", { type: "checkbox", name: "domain", value: n, checked: true }),
      `${n}. ${name} `,
      h("span", { class: "muted" }, `(${count})`)
    );
  });

  const includeAi = h("input", { type: "checkbox", id: "include-ai", checked: true });
  const countInput = h("input", { type: "number", id: "count", min: 1, max: QUESTIONS.length, value: 20 });

  function selectedPool() {
    const domains = [...app.querySelectorAll('input[name="domain"]:checked')].map((i) => Number(i.value));
    return QUESTIONS.filter(
      (q) => domains.includes(q.domain) && (includeAi.checked || !(q.tags || []).includes("c03"))
    );
  }

  function start(mode) {
    const pool = selectedPool();
    if (!pool.length) return alert("Select at least one domain.");
    if (mode === "practice") startSession("practice", pool, Number(countInput.value) || 20);
    else startSession("exam", pool, EXAM_SIZE);
  }

  return render(
    h(
      "section",
      { class: "card" },
      h("h2", {}, "Set up a session"),
      h("fieldset", {}, h("legend", {}, "Domains"), domainBoxes),
      h(
        "fieldset",
        {},
        h("legend", {}, "Options"),
        h("label", { class: "check" }, includeAi, "Include DVA-C03 generative AI topics (Bedrock, Guardrails, RAG)"),
        h("label", { class: "check" }, "Questions in practice mode:", countInput)
      ),
      h(
        "div",
        { class: "row" },
        h("button", { class: "primary", onclick: () => start("practice") }, "Practice (instant feedback)"),
        h("button", { onclick: () => start("exam") }, `Exam simulation (${EXAM_SIZE} q, timed)`),
        h(
          "button",
          {
            disabled: missed.length === 0,
            onclick: () => startSession("practice", missed.map((id) => byId[id]), missed.length),
          },
          `Review my mistakes (${missed.length})`
        )
      )
    ),
    renderStatsCard(stats)
  );
}

function renderStatsCard(stats) {
  const rows = Object.entries(DOMAINS).map(([n, name]) => {
    let seen = 0, correct = 0, covered = 0;
    const qs = QUESTIONS.filter((q) => q.domain === Number(n));
    for (const q of qs) {
      const s = stats.questions[q.id];
      if (!s) continue;
      covered += 1;
      seen += s.seen;
      correct += s.correct;
    }
    return h(
      "tr",
      {},
      h("td", {}, name),
      h("td", { class: "num" }, `${covered}/${qs.length}`),
      h("td", { class: "num" }, seen ? `${Math.round((100 * correct) / seen)}%` : "–")
    );
  });

  const history = stats.history.slice(-5).reverse().map((e) =>
    h("li", {}, `${new Date(e.date).toLocaleString()} — ${e.score}% (${e.correct}/${e.total}) `,
      h("span", { class: e.score >= PASS_PERCENT ? "pass" : "fail" }, e.score >= PASS_PERCENT ? "PASS" : "FAIL"))
  );

  return h(
    "section",
    { class: "card" },
    h("h2", {}, "Your progress"),
    h("table", {},
      h("thead", {}, h("tr", {}, h("th", {}, "Domain"), h("th", { class: "num" }, "Seen"), h("th", { class: "num" }, "Accuracy"))),
      h("tbody", {}, rows)
    ),
    history.length ? [h("h2", { style: "margin-top:16px" }, "Recent exam simulations"), h("ul", {}, history)] : null,
    h("div", { class: "actions" },
      h("span", { class: "muted small" }, "Stats are stored only in this browser."),
      h("button", { onclick: () => { if (confirm("Reset all progress?")) { saveStats({ questions: {}, history: [] }); renderHome(); } } }, "Reset progress")
    )
  );
}

// ───────────── session ─────────────

function startSession(mode, pool, count) {
  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
  session = {
    mode,
    index: 0,
    items: picked.map((q) => ({
      qid: q.id,
      order: shuffle(q.options.map((_, i) => i)),
      selected: new Set(),
      checked: false,
      flagged: false,
    })),
    endTime: mode === "exam" ? Date.now() + picked.length * SECONDS_PER_QUESTION * 1000 : null,
  };
  renderQuestion();
}

function renderQuestion() {
  const item = session.items[session.index];
  const q = byId[item.qid];
  const multi = q.answer.length > 1;
  const practice = session.mode === "practice";
  const total = session.items.length;

  const timer = h("span", {});
  const top = h(
    "div",
    { class: "topbar" },
    h("span", {}, `Question ${session.index + 1} / ${total}`),
    practice ? h("span", {}, `${session.items.filter((i) => i.checked && isCorrect(i)).length} correct so far`) : timer
  );

  const options = item.order.map((origIdx, pos) => {
    const classes = ["option"];
    if (item.selected.has(origIdx)) classes.push("selected");
    if (item.checked) {
      if (q.answer.includes(origIdx)) classes.push("correct");
      else if (item.selected.has(origIdx)) classes.push("wrong");
    }
    return h(
      "button",
      { class: classes.join(" "), disabled: item.checked, onclick: () => toggle(origIdx) },
      h("span", { class: "key" }, letter(pos)),
      h("span", {}, q.options[origIdx])
    );
  });

  function toggle(origIdx) {
    if (multi) {
      if (item.selected.has(origIdx)) item.selected.delete(origIdx);
      else if (item.selected.size < q.answer.length) item.selected.add(origIdx);
    } else {
      item.selected = new Set([origIdx]);
    }
    renderQuestion();
  }

  let feedback = null;
  if (item.checked) {
    const ok = isCorrect(item);
    feedback = h(
      "div",
      { class: `feedback ${ok ? "ok" : "bad"}` },
      h("strong", {}, ok ? "Correct. " : "Incorrect. "),
      q.explanation
    );
  }

  const last = session.index === total - 1;
  const actions = h("div", { class: "actions" });

  actions.append(
    h("button", { disabled: session.index === 0, onclick: () => go(session.index - 1) }, "← Previous")
  );

  if (practice) {
    if (!item.checked) {
      actions.append(
        h("button", {
          class: "primary",
          disabled: item.selected.size !== q.answer.length,
          onclick: () => {
            item.checked = true;
            recordAnswer(q.id, isCorrect(item));
            renderQuestion();
          },
        }, "Check answer")
      );
    } else {
      actions.append(
        last
          ? h("button", { class: "primary", onclick: renderResults }, "See results")
          : h("button", { class: "primary", onclick: () => go(session.index + 1) }, "Next →")
      );
    }
  } else {
    actions.append(
      h("button", { onclick: () => { item.flagged = !item.flagged; renderQuestion(); } },
        item.flagged ? "Unflag" : "Flag for review"),
      last
        ? h("button", { class: "primary", onclick: confirmSubmit }, "Submit exam")
        : h("button", { class: "primary", onclick: () => go(session.index + 1) }, "Next →")
    );
  }

  const nav = practice
    ? null
    : h("div", { class: "navgrid" },
        session.items.map((it, i) => {
          const cls = [it.selected.size ? "answered" : "", i === session.index ? "current" : "", it.flagged ? "flagged" : ""];
          return h("button", { class: cls.join(" "), onclick: () => go(i), title: it.flagged ? "Flagged" : "" }, i + 1);
        }),
        h("button", { style: "width:auto;padding:4px 10px", onclick: confirmSubmit }, "Submit")
      );

  render(
    h(
      "section",
      { class: "card" },
      top,
      h("div", { class: "progress" }, h("div", { style: `width:${(100 * (session.index + 1)) / total}%` })),
      h("span", { class: "badge" }, `Domain ${q.domain}: ${DOMAINS[q.domain]}`),
      (q.tags || []).includes("c03") ? h("span", { class: "badge new" }, "DVA-C03") : null,
      h("p", { class: "question" }, q.q),
      multi ? h("div", { class: "choose" }, `Select ${q.answer.length} answers.`) : null,
      options,
      feedback,
      actions,
      nav,
      h("div", { class: "actions" },
        h("button", { onclick: () => { if (confirm("Quit this session?")) renderHome(); } }, "Quit"))
    )
  );

  if (!practice) {
    const tick = () => {
      const left = Math.max(0, Math.round((session.endTime - Date.now()) / 1000));
      timer.textContent = `⏱ ${formatTime(left)} left`;
      if (left === 0) renderResults();
    };
    tick();
    timerHandle = setInterval(tick, 1000);
  }
}

function go(i) {
  session.index = i;
  renderQuestion();
}

function confirmSubmit() {
  const unanswered = session.items.filter((i) => i.selected.size === 0).length;
  const msg = unanswered ? `${unanswered} question(s) unanswered. Submit anyway?` : "Submit the exam?";
  if (confirm(msg)) renderResults();
}

// ───────────── results ─────────────

function renderResults() {
  const items = session.items;
  const exam = session.mode === "exam";

  if (exam) {
    for (const it of items) recordAnswer(it.qid, isCorrect(it));
  }

  const scored = exam ? items : items.filter((i) => i.checked);
  const correct = scored.filter(isCorrect).length;
  const score = scored.length ? Math.round((100 * correct) / scored.length) : 0;

  if (exam) {
    const stats = loadStats();
    stats.history.push({ date: Date.now(), score, correct, total: scored.length });
    saveStats(stats);
  }

  const perDomain = Object.entries(DOMAINS).map(([n, name]) => {
    const its = scored.filter((i) => byId[i.qid].domain === Number(n));
    if (!its.length) return null;
    const ok = its.filter(isCorrect).length;
    return h("tr", {}, h("td", {}, name), h("td", { class: "num" }, `${ok}/${its.length}`),
      h("td", { class: "num" }, `${Math.round((100 * ok) / its.length)}%`));
  });

  const wrong = scored.filter((i) => !isCorrect(i)).map((it) => {
    const q = byId[it.qid];
    return h(
      "div",
      { class: "review-item" },
      h("p", { class: "question" }, q.q),
      it.order.map((origIdx, pos) => {
        const cls = ["option"];
        if (q.answer.includes(origIdx)) cls.push("correct");
        else if (it.selected.has(origIdx)) cls.push("wrong");
        return h("div", { class: cls.join(" ") }, h("span", { class: "key" }, letter(pos)), h("span", {}, q.options[origIdx]));
      }),
      h("div", { class: "feedback" }, q.explanation)
    );
  });

  const passed = score >= PASS_PERCENT;
  render(
    h(
      "section",
      { class: "card" },
      h("h2", {}, exam ? "Exam simulation result" : "Practice result"),
      h("p", { class: `score ${passed ? "pass" : "fail"}` }, `${score}%`),
      h("p", {}, `${correct} / ${scored.length} correct · passing target ≈ ${PASS_PERCENT}% (720/1000)`),
      h("table", {},
        h("thead", {}, h("tr", {}, h("th", {}, "Domain"), h("th", { class: "num" }, "Score"), h("th", { class: "num" }, "%"))),
        h("tbody", {}, perDomain)
      ),
      h("div", { class: "actions" }, h("button", { class: "primary", onclick: renderHome }, "Back to home"))
    ),
    wrong.length ? h("section", { class: "card" }, h("h2", {}, `Review your ${wrong.length} mistake(s)`), wrong) : null
  );
}

renderHome();
