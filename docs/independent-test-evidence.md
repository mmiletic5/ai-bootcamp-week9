# Independent source-eligibility RED evidence

## Purpose

This independent test checks the H1 policy-source eligibility requirement with
synthetic documents unrelated to the existing refund case. It exercises the
actual application `answer` function rather than duplicating source selection.

## Baseline provenance

- Original baseline: `c866b73fe6091c2fdaea06fa6d086a817111a54f`
- Test branch base: `a67866bd2a122a297c3e9e6e6847988c1c84c11e`
- `src/app.ts` is identical across those commits.
- The H1 correction is absent from this test branch.

## Synthetic test cases

### Exchange

An archived revision 1 document appears before an active revision 2 document.
Expected behavior is to select the active source, return the 14-day policy, and
cite `exchange-active`. On the baseline, the application returned the archived
30-day policy.

### Retired product

Only an archived document is available. Expected behavior is refusal with no
citations and zero controlled-model calls. On the baseline, the application
returned status `ok`.

## RED verification commands

| Command | Observed exit code |
| --- | ---: |
| `npm run build` | 0 |
| `node --test tests/source-eligibility.test.mjs > test-before.txt 2>&1` | 1 |

The Node test-runner capture initially displayed a failing-file wrapper. A
clearly labeled supplemental diagnostic transcript was preserved in
`test-before.txt`, without replacing that original capture.

## Results

| Scenario | Expected behavior | Actual baseline behavior | RED status |
| --- | --- | --- | --- |
| Exchange | Active 14-day text and `exchange-active` citation | Archived 30-day text | Failed assertion |
| Retired product | `refused`, no citations, zero model calls | `ok` | Failed assertion |

The supplemental diagnostic transcript records two executed tests and two
genuine assertion failures. Assertions after the first failure in each test
have not yet been demonstrated by this RED execution.

## Evidence

- Test: `tests/source-eligibility.test.mjs`
- RED output: `test-before.txt`
- Preserved initial evaluation:
  `runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06`
- Preserved initial regression:
  `runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1`

## Joint contribution

Mateja and Isidora jointly reviewed the independent synthetic-test design,
acceptance criteria, expected RED behavior, and evidence requirements. This
record does not assign unverified individual command execution.

## GREEN verification

- Integration branch: `feature/h1-source-eligibility`
- Integration merge: `61f297e539757e7dcbbcfdbe4a45cead54b87b65`
- Implementation parent: `55553e5dda2f50b89b6ca159af0f25142fdf2f99`
- Independent test parent: `68dd19da7ab40cbca7f6fb61a0e4e400ce2b083e`

| Check | Observed exit code | Outcome |
| --- | ---: | --- |
| `npm run build` | 0 | Passed |
| Independent test capture | 0 | Passed |
| Supplemental individual-test diagnostic | 0 | 2 passed, 0 failed |
| `npm run typecheck` | 0 | Passed |
| `npm test` | 0 | 2 test files passed, 0 failed |

| Scenario | RED baseline behavior | GREEN behavior |
| --- | --- | --- |
| Exchange | Archived 30-day text | `ok`; active 14-day text; `exchange-active` citation |
| Retired product | `ok` from archived-only source | `refused`; no citations; zero model calls |

The assertions and synthetic fixtures were unchanged between RED and GREEN.
The passing `exchange` test verifies the active text, exact citation,
`exchange-active` retrieval trace at revision 2, and one controlled-model call.
The passing `retired-product` test verifies refusal, empty citations, and zero
controlled-model calls.

The standard Node test-runner capture reports a file-level summary. A separately
labeled direct Node diagnostic in `test-after.txt` records both individual test
cases passing. `test-before.txt` remains preserved unchanged. Final evaluation,
regression, and release recommendation are still pending.

Mateja and Isidora jointly reviewed the recorded RED and GREEN outcomes; this
document does not assign unverified individual command execution.

## Pending steps

- Independent test commit: completed (`68dd19da7ab40cbca7f6fb61a0e4e400ce2b083e`)
- Integration with the approved H1 correction: completed
- GREEN verification: completed; evidence in `test-after.txt`
- Final evaluation and regression: pending
- Final evidence report: pending
