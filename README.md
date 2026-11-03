# Support Reliability Lab

## O projektu

Sintetički asistent za podršku za Nedelju 9 koristi lokalne dokumente, jedan
read-only lookup i deterministički kontrolisani model. Ne zahteva API ključ ni
plaćeni model. H1 ispravka ograničava izbor policy izvora na traženu temu i
`state === "active"`.

## Pokretanje

Potreban je Node.js 24 ili noviji i npm.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm test
npm start -- shipping
npm run evaluate
npm run regression
```

Nezavisni H1 test se po potrebi pokreće sa `npm run build` i
`node --test tests/source-eligibility.test.mjs`.

## Struktura projekta

```text
.
├── src/app.ts                         # aplikaciona logika
├── data/lab.json                      # javni sintetički podaci
├── tests/                             # app.test.mjs i source-eligibility.test.mjs
├── scripts/                           # pokretanje, evidencija i poređenje
├── docs/                              # baseline, nezavisna i zvanična evidencija
├── runs/                              # Git-ignored generisani izveštaji i tragovi
├── test-before.txt / test-after.txt   # RED/GREEN transkripti
├── comparison-*-before-after.txt      # izlazi kontrolisanih poređenja
└── package.json                       # podržane npm skripte
```

## Rezultati

| Provera | Pre izmene | Posle izmene |
| --- | --- | --- |
| Evaluacija | 2/4 | 4/4 |
| Regresija | 5/7 | 7/7 |
| Nezavisni H1 test | RED 0/2 | GREEN 2/2 |

Nezavisni test je napravljen kasnije i izvršen nad izvornom neispravnom implementacijom. `refund` je prešao sa arhivirane 30-dnevne na aktivnu 14-dnevnu politiku, a `legacy` na odbijanje bez izvršavanja modela. Prethodno prolazni slučajevi javnog skupa ostali su prolazni.

## Dokazi i ograničenja

Detaljna dokumentacija nalazi se u `docs/`. Rezultati poređenja sačuvani su u `comparison-evaluation-before-after.txt` i `comparison-regression-before-after.txt`, a nezavisna RED/GREEN provera u `test-before.txt` i `test-after.txt`.
Za poređenje istog skupa koristite:

```sh
npm run compare -- runs/IME-POCETNOG/report.json runs/IME-ZAVRSNOG/report.json
```