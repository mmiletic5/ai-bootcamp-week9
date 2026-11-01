# Week 9 baseline evidence

## Identification

- Project: `ai-bootcamp-week9` — Support Reliability Lab
- Team: Mateja and Isidora
- Branch: `main`
- Verified baseline commit: `c866b73fe6091c2fdaea06fa6d086a817111a54f`
- Environment: Node.js `v24.13.0`; npm `11.6.2`

This is an internal checkpoint record. It does not replace the official
`evidence-template.md`, which was not present in this repository when checked.

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
