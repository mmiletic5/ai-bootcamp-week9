**Kratka beleška para: Nedelja 9**

# Tumačenje dokaza i preporuka izdanja

Priložite automatske `report.json`, `summary.md` i direktorijume tragova. Ne prepisujte metapodatke, hash-eve ili rezultate po slučaju. Popunite samo naredne odeljke kratkim odgovorima. Dokaz i kratko objašnjenje dopunjuju se, ne dupliraju.

## Promena i hipoteza

- Članovi para i ko ove nedelje vodi prikaz: Mateja Miletic i Isidora Prica; Isidora / zajedno.
- Polazni/završni commit i putanje generisanih početnih/završnih izveštaja: polazni commit je `c866b73fe6091c2fdaea06fa6d086a817111a54f`; izmereni integracioni commit je `b449f2ab53ba02d14b8e481555711553524fb81e`; trenutni dokumentacioni HEAD je `ae7b0777ea9b7a6a0345e5335a6bd45fc3b08e8e`. Početni izveštaji su `runs/evaluate-4aba6ff5-811d-4a77-a258-288d518bbe06/report.json` i `runs/regression-7b3aa34f-917a-42ee-976e-16c24a808cc1/report.json`; završni su `runs/evaluate-89687b42-d2dc-4ae0-a696-d10638db1d91/report.json` i `runs/regression-d649f469-f10c-4ebb-a959-89a2899baec4/report.json`.
- Koji problem smo opazili, koji trag ga podržava i zašto smo očekivali da ova izmena pomogne: H1 je birao prvi dokument iste teme bez provere aktivnog stanja. Početni trag za `refund` navodi arhivirani `refund-old`, revizija 1, a za `legacy` arhivirani `legacy-old`; oba su dovela do poziva modela. Zato smo očekivali da izbor samo izvora sa istom temom i `state === "active"` vrati aktivni izvor ili postojeće odbijanje kada prihvatljivog izvora nema.
- Granica izmene i dodatna regresiona provera: minimalna izmena je samo u `src/app.ts`: predikat izbora izvora sada zahteva temu i aktivno stanje. Nisu menjani javni podaci, evaluator, postojeći testovi, account putanja ni realna LLM integracija. Dodatna provera je nezavisni sintetički test sa arhiviranim izvorom pre aktivnog i temom koja ima samo arhivirani izvor.
- Ime dodatnog testa, zašto je pao pre izmene i prošao posle; reference na `test-before.txt` / `test-after.txt`: `tests/source-eligibility.test.mjs` je na grani zasnovanoj na `a67866bd2a122a297c3e9e6e6847988c1c84c11e`, gde je `src/app.ts` potvrđeno identičan izvornom baseline-u `c866b73fe6091c2fdaea06fa6d086a817111a54f`. Pre izmene su dve sintetičke provere stvarno pale (RED 0/2): `exchange` je vratio arhivirani 30-dnevni tekst umesto aktivnog 14-dnevnog, a `retired-product` je vratio `ok` umesto `refused`. Neizmenjeni test je posle integracije prošao 2/2 (GREEN). Dokazi su `test-before.txt` i `test-after.txt`.

## Tumačenje, ne prepisivanje

- Koji konkretni slučaj se promenio i koji dokaz to pokazuje: evaluacija se promenila sa 2/4 na 4/4, a regresija sa 5/7 na 7/7. `refund` je prešao sa arhiviranog `refund-old`, revizija 1, citata i teksta od 30 dana na aktivni `refund-current`, revizija 2, citat i tekst od 14 dana. `legacy` je prešao sa arhiviranog izvora, `ok` i jednog poziva modela na `refused` i nula poziva modela. To potvrđuju početni/završni `report.json`, odgovarajući tragovi i `comparison-evaluation-before-after.txt` / `comparison-regression-before-after.txt`.
- Šta kaže ceo regresioni skup; ima li pogoršanja ili neizvršene provere: završna regresija je 7/7. `shipping`, `unsupported`, `active-account`, `suspended-account` i `invalid` ostali su PASS; javni skup nema opaženu regresiju. Izvršeni su završni evaluate, regression, typecheck, postojeći testovi i nezavisni test; nisu izvršene produkcione ili real-LLM provere.
- Sa kojom slabom/modelskom ocenom se slažemo ili ne slažemo i zašto: ne prihvatamo `weakCheck` (neprazan odgovor) kao dokaz ispravnosti, jer je pogrešan refund od 30 dana bio neprazan. Početni `recordedJudge` 0.95 je autorski sintetički primer, ne rezultat realne LLM procene; zato ga ne tretiramo kao dokaz tačne politike ili citata.
- Šta Codex-ov kod/test/objašnjenje nije mogao nezavisno da potvrdi i kako smo proverili pretpostavku: Codex-ovo objašnjenje samo po sebi ne potvrđuje uzrok, stvarne pozive modela, citate, Git stanje ni pouzdanost u produkciji. Pretpostavke su proverene stvarnim testovima, `report.json`, tragovima, Git proverama i kontrolisanim poređenjem istog javnog skupa pre i posle izmene.

## Preporuka i ograničenja

- Definisana simulirana upotreba; izdati / ograničiti / ne izdati, sa razlogom: preporuka tima je ograničeno izdanje samo za kontrolisani sintetički laboratorijski slučaj. Ne preporučujemo produkciono izdanje. Nezavisni RED/GREEN test je prošao nakon korekcije, završna evaluacija je 4/4, završna regresija 7/7 i u javnom skupu nema opažene regresije.
- Najvažniji preostali rizik i šta ne možemo zaključiti iz kontrolisane modelske zamene/malog skupa: ponašanje za nepoznat nalog je van H1 opsega; ugovor ne određuje izbor kada postoji više istovremeno aktivnih revizija. Deterministička sintetička zamena modela i mali javni skup ne dokazuju opštu produkcionu pouzdanost, ponašanje pravog LLM-a niti produkcionu integraciju.
- Jedan signal za praćenje, uslov za reakciju i sledeća provera: dogovorena predložena operativna procedura, a ne već implementirana monitoring funkcija u aplikacionom kodu: signal je bilo koji odgovor politike koji citira arhivirani izvor ili poziv modela kada nema prihvatljivog aktivnog izvora. Jedan potvrđen slučaj je okidač: pauzirati pogođenu policy putanju, sačuvati trag, reprodukovati problem i proveriti izbor izvora pre nastavka. Sledeća provera je ponovno pokretanje nezavisnog sintetičkog testa i relevantnih evaluate/regression slučajeva.

## AI pomoć i pojedinačni doprinos

- Za šta smo koristili Codex, šta prihvatili/izmenili/odbacili i kako proverili: Codex je korišćen za pregled koda, H1 analizu, dizajn i implementaciju testa, izvršavanje provera, Git tok rada i dokumentaciju. Prihvaćeni zaključci su proveravani prema stvarnom ponašanju aplikacije, testovima, izveštajima, tragovima i Git stanju. Opseg izmene je zadržan minimalnim; nisu menjani account ponašanje, javni podaci ni realna LLM integracija.
- Član 1: konkretan doprinos i lično proveren rezultat: Mateja Miletic — Analizirao sam početni H1 problem, definisao minimalnu izmenu i učestvovao u implementaciji ispravke u `src/app.ts`, integraciji i završnom poređenju. Lično sam proverio da `refund` koristi aktivnu politiku od 14 dana, da se `legacy` odbija bez modelskog poziva i da završna evaluacija prolazi 4/4, a regresija 7/7.
- Član 2: konkretan doprinos i lično proveren rezultat: Isidora Prica — Učestvovala sam u definisanju i proveri nezavisnog sintetičkog testa, pregledu RED/GREEN rezultata i tumačenju regresionih provera. Lično sam proverila da test pre korekcije otkriva dve greške, a da nakon korekcije oba scenarija prolaze (2/2), uz ispravne citate i nula modelskih poziva za arhiviranu temu.

## Dopuna u sredu

- Referenca na tutorov nezavisni rezultat i eventualno obrazloženo neslaganje: [CEKA TUTOROV NEZAVISNI REZULTAT].
- Šta incident pokazuje o dostupnosti i kontrolama; koja operativna reakcija je opravdana: [CEKA ANALIZU INCIDENTA I KONTROLA].
- Da li menjamo preporuku i zašto; bez obaveze novog kodiranja: [CEKA ODLUKU NAKON TUTOROVE PROVERE].
