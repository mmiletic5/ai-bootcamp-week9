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

## W09-02 — Minimal Change Specification

### Hypothesis and intended correction

H1 can be addressed by restricting policy document selection to a source whose
topic matches the request and whose `state` is `active`. The existing no-source
refusal path should handle the absence of an eligible source without invoking
the controlled model. This specification introduces neither a highest-revision
rule, topic-specific exceptions, nor hardcoded policy text.

### Acceptance criteria

- Active documents matching the requested topic are eligible sources.
- Archived documents are never selected merely because of array ordering.
- Archived-only and missing topics return `refused` without model execution.
- Successful responses preserve the selected source's text and citation
  identity.
- Existing `shipping`, `unsupported`, account-route, and invalid-request
  behavior remains unchanged.

### Expected before/after behavior

Measured baseline results are 2/4 for evaluation and 5/7 for regression.
`refund` returned the archived 30-day policy with an incorrect citation, and
`legacy` returned an incorrect response after model invocation.

The following are expected outcomes, not yet measured post-change results:

- `refund`: the active 14-day policy with citation `refund-current`.
- `legacy`: `refused` with zero model calls.
- `shipping` and `unsupported`: retained PASS.
- Account and invalid cases: retained PASS.
- Evaluation: potentially 4/4; regression: potentially 7/7.

### Independent test specification — Isidora

Add `tests/source-eligibility.test.mjs`, importing and executing the actual
application function from built `dist/app.js`, consistent with existing tests.
Use only synthetic local documents unrelated to refund:

- For topic `exchange`, put an archived source before an active source, with
  different IDs and text. Assert `ok`, the active source's exact text, and its
  sole citation.
- For topic `retired-product`, provide only an archived source. Assert
  `refused` and zero model calls.

Run this test against the original, unmodified baseline commit so it produces a
genuine assertion failure rather than a build or import failure. Preserve that
output in `test-before.txt`; after integration, run the same test and preserve
the passing output in `test-after.txt`. The test is supplementary evidence and
must not duplicate or replace the application implementation or public
evaluation dataset.

### Scope and regression boundaries

The planned implementation changes only necessary policy-selection logic in
`src/app.ts`. It must not change account-route behavior, invalid-request
behavior, model-error handling, the public dataset, existing tests, evaluation
or comparison scripts, configuration, or the controlled model implementation.
No UI, network integration, real LLM, or new evaluation framework is required.

### Reproducibility and evidence

The original baseline is `c866b73fe6091c2fdaea06fa6d086a817111a54f`. Preserve
and compare the same public suite before and after the correction using
`runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06` and
`runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1` as initial evidence.
Inspect actual traces, model-call counts, and citations; preserve all generated
evidence. The independent test adds evidence but does not change the public
evaluation dataset.

### Remaining limitations

- Multiple simultaneously active revisions are not explicitly resolved by the
  public contract.
- The known unknown-account risk is outside H1.
- A deterministic model substitute and small evaluation set do not establish
  general production reliability.
- No independent test or post-fix measurement has yet been executed.

## W09-03 — Implementation Verification

### Implementation

Commit `5e4f992d48eb314038c1c8ec9282240ee9154029` changed `src/app.ts` only.
The policy source-selection predicate now requires both a matching topic and
`state === "active"`. The correction uses the existing no-source refusal path;
it adds no highest-revision sorting, hardcoded policy answers, or unrelated
behavior changes.

### Verification results

- `npm run typecheck` exited 0 and passed.
- `npm test` exited 0; the Node runner reported one passing test file containing
  the three existing basic assertions.
- `shipping` returned `ok`, the three-day policy, and citation
  `shipping-current`.
- `refund` returned `ok`, the 14-day policy, and citation `refund-current`.
- `legacy` returned `refused` with no citations.
- `unknown` returned `refused` with no citations.

The observed `shipping` retrieval trace identified `shipping-current`, revision
1; the observed `refund` retrieval trace identified `refund-current`, revision
2. `legacy` and `unknown` each had refusal-only traces. Zero model calls for
those refusal cases were inferred from unchanged control flow and the absence
of model events; they were not independently counted during CLI verification.

### Evidence preservation

The preserved baseline remains evaluation 2/4 and regression 5/7, at
`runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06` and
`runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1`. This section does not
claim final evaluation or regression has passed.

### Outstanding work and limitations

- Isidora's independent synthetic test has not been integrated or executed in
  this implementation.
- `test-before.txt` and `test-after.txt` are not available on this branch.
- Final evaluation, regression, and controlled comparisons remain pending.
- The unknown-account risk remains outside H1.
- The controlled model and small public dataset do not establish production
  reliability.
