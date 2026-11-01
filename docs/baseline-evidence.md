# Week 9 baseline evidence

## Identification

- Project: `ai-bootcamp-week9` — Support Reliability Lab
- Team: Mateja and Isidora
- Branch: `main`
- Verified baseline commit: `c866b73fe6091c2fdaea06fa6d086a817111a54f`
- Environment: Node.js `v24.13.0`; npm `11.6.2`

This document preserves verified baseline results and serves as an internal
checkpoint record throughout Week 9. The official submission template is
maintained separately in `docs/evidence-template.md`.

## Commands and observed results

| Command | Exit code | Observed result |
| --- | ---: | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | 0 | Added 1 package. |
| `npm run typecheck` | 0 | Completed with no TypeScript diagnostics. |
| `npm test` | 0 | Build completed; the Node test runner reported 1 passing test file and 0 failures. The file contains the 3 intended basic assertions. |
| `npm start -- shipping` | 0 | `ok`; `Policy: Shipping takes 3 days.`; citation `shipping-current`. |
| `npm start -- refund` | 0 | `ok`; `Policy: Refund period: 30 days.`; citation `refund-old`. |
| `npm start -- legacy` | 0 | `ok`; `Policy: Legacy service is available.`; citation `legacy-old`. |
| `npm start -- unknown` | 0 | `refused`; `Nema odgovarajućeg izvora.`; no citations. |
| `npm run evaluate` | 1 | 2/4 deterministic checks passed; valid evidence was generated. |
| `npm run regression` | 1 | 5/7 deterministic checks passed; valid evidence was generated. |

A successful CLI exit code means the command executed; it does not prove the
business response satisfies the policy acceptance criteria. The refund and
legacy CLI outputs above are business-incorrect despite exiting 0.

## Initial evaluation evidence

- Run directory: `runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06`
- Report: `runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06/report.json`
- Summary: `runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06/summary.md`
- Traces: `runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06/traces/`
- Score: 2/4
- Passing case IDs: `shipping`, `unsupported`
- Failing case IDs: `refund`, `legacy`

`refund` returned status `ok` but failed text and citation checks: it cited
`refund-old` and returned 30 days rather than the active current policy.
`legacy` returned `ok` and made one model call, where the criterion required a
refusal without a model call.

## Initial regression evidence

- Run directory: `runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1`
- Report: `runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1/report.json`
- Summary: `runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1/summary.md`
- Traces: `runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1/traces/`
- Score: 5/7
- Passing case IDs: `shipping`, `unsupported`, `active-account`,
  `suspended-account`, `invalid`
- Failing case IDs: `refund`, `legacy`

The same refund and legacy acceptance failures occurred in regression.

## Trace and dataset findings

Both runs contain these relevant traces:

- `refund`: `traces/refund.json` records retrieval of `refund-old`, revision
  `1`, then a returned model response and `ok` result.
- `legacy`: `traces/legacy.json` records retrieval of `legacy-old`, revision
  `1`, then a returned model response and `ok` result.

The public dataset, `data/lab.json`, identifies `refund-old` as archived,
revision 1, with a 30-day period; `refund-current` as active, revision 2, with
a 14-day period; and `legacy-old` as archived, revision 1. These states explain
the observed acceptance failures.

## Confirmed observations

- The baseline branch and commit were independently verified with Git as
  `main` at `c866b73fe6091c2fdaea06fa6d086a817111a54f`.
- The initial evidence directories each contain `report.json`, `summary.md`,
  and their expected trace files (4 for evaluation, 7 for regression).
- The original public dataset, application source, existing tests, scripts, and
  configuration were unchanged through evidence capture.
- No H1 source-selection correction has been implemented.

## Hypotheses, not yet changes

- The evidence is consistent with the H1 hypothesis that policy selection uses
  the first topic match without excluding archived sources or preferring the
  current revision. No corrective implementation or new independent test has
  been made in this checkpoint.

## Git metadata limitation in generated reports

Each generated report records `git.revision: null` and `git.dirty: null`.
The reports therefore do not themselves contain the baseline commit. Repository
state was instead verified independently with Git commands; the evidence
harness, generated reports, and scripts were not edited to fill these fields.

## Limitations and unexecuted work

- No H1 correction was implemented.
- No independent Isidora test was created or run.
- No final/post-fix evaluation, regression, comparison, commit, or push was
  performed.
- The official `evidence-template.md` was not found in this repository.

## W09-01 — Root Cause Analysis

### Observed defect

The preserved evaluation (`runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06`)
and regression (`runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1`) reports
both record failures for `refund` and `legacy`.

- `refund` requested policy topic `refund`, retrieved archived `refund-old`,
  revision `1`, and returned `Policy: Refund period: 30 days.` with citation
  `refund-old`. It failed exact text and citation checks. The dataset identifies
  `refund-current`, revision `2`, as active and specifies a 14-day period.
- `legacy` retrieved archived `legacy-old`, called the model, and returned
  `ok`. Its criterion requires `refused` with zero model calls because no
  eligible source exists.

The recorded traces are
`runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06/traces/refund.json`,
`runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06/traces/legacy.json`, and
their corresponding files under the preserved regression run.

### Verified root cause

In `src/app.ts`, policy retrieval uses the first document whose `topic` equals
the request topic. It does not check document eligibility (`state ===
"active"`). The public dataset orders archived `refund-old` before active
`refund-current`, so the first-match code selects `refund-old`; the traces
record that exact source ID and revision. The same logic selects archived-only
`legacy-old` instead of finding no eligible source.

This establishes the active-state omission as the cause in the supplied
dataset. It does not establish a general policy for choosing among multiple
active revisions; the public acceptance contract does not require a
highest-revision rule.

### Acceptance criteria and preserved behavior

- Select an active source that matches the requested topic; never select
  archived material merely because it appears first.
- If no eligible source exists, return `refused` without invoking the model.
- Preserve the correct source ID and citation.
- Preserve accepted `shipping` and `unsupported` behavior.
- Preserve the account route, including active and suspended account responses
  and invalid-request handling.

### Evaluation limitations

The three basic tests cover invalid input, an unsupported topic with an empty
document list, and a suspended account. They do not exercise a topic with both
archived and active documents or an archived-only topic, so they did not detect
H1.

`weakCheck` only tests whether response text is nonempty; it is true for the
incorrect refund and legacy responses and therefore does not establish policy
correctness. The refund `recordedJudge` score of `0.95` is an authored
synthetic example (`judge-fixture-1`), explicitly not a real model run; it is
not evidence that the answer used the correct policy. Traces establish the
recorded source ID/revision, model outcome, and response outcome for this
deterministic run. They do not prove real-world policy truth, source provenance
beyond the supplied dataset, or general production behavior.

### Minimal proposed correction

Restrict policy document selection to documents matching both the requested
topic and active state. If no such document exists, preserve the existing
refusal path without a model call. This is a conceptual proposal only; no
source, test, dataset, script, or generated evidence was changed in W09-01.

### Remaining risks and unexecuted checks

- The public contract does not explicitly resolve multiple active revisions.
- Unknown-account behavior is outside the H1 correction.
- The small deterministic evaluation set does not establish general production
  reliability.
- An independent synthetic test and post-fix measurements have not yet been
  executed.

### Documentation consistency

The earlier statement that the official template was not found is a preserved
historical baseline observation. The template is now available separately at
`docs/evidence-template.md`; this section does not claim it is currently
missing.
