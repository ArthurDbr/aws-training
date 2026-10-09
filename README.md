# AWS Developer – Associate practice quiz (DVA-C02 / DVA-C03)

A small multiple-choice quiz app (no install, no build) to prepare for the
AWS Certified Developer – Associate exam.

- **DVA-C02** can be taken until **30 Nov 2026**.
- **DVA-C03** registration opens 27 Oct 2026, exam available from **1 Dec 2026**.
  It keeps the format (65 questions, 130 min, 720/1000 to pass) and adds
  generative AI topics (Amazon Bedrock, Guardrails, RAG, AI security).

## Run it

Open `index.html` in a browser. That's it.
(Or serve it: `python3 -m http.server` then open http://localhost:8000.)

## Modes

| Mode | What it does |
|------|--------------|
| Practice | Pick domains and a number of questions; get the answer and explanation after each one. |
| Exam simulation | 65 questions (or the whole pool if smaller), 130-minute timer, flag/navigate, score + per-domain breakdown at the end. |
| Review my mistakes | Replays every question whose last answer was wrong, until you get it right. |

Progress is saved in your browser's localStorage.

## Exam domains (DVA-C02 weights)

1. Development with AWS Services — 32%
2. Security — 26%
3. Deployment — 24%
4. Troubleshooting and Optimization — 18%

DVA-C03 weights will be confirmed in the official exam guide.

## Adding questions

Edit `js/questions.js`. Each entry:

```js
{
  id: "dev-99",            // unique
  domain: 1,               // 1–4
  tags: ["c03"],           // optional: DVA-C03-only topic
  q: "Question text… (Choose TWO.)",
  options: ["A", "B", "C", "D", "E"],
  answer: [0, 2],          // indexes into options; >1 => multiple response
  explanation: "Why.",
}
```

Then check the bank:

```sh
node scripts/validate-questions.js
```

Options are shuffled at display time, so the order in the file doesn't matter.
