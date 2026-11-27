# Fallbeschreibung: Datenleck bei der Campus-App

> Interne Datei für das Workshop-Team: Story, Level, Lösungswörter, Tipps und Lösungen auf einen Blick.
> Die Story spielt an der Hochschule Heilbronn. Personen, App und Vorfall sind frei erfunden.

---

## Ausgangslage

Ein Studierendenteam der Hochschule Heilbronn entwickelt die **Campus-App**. Die App zeigt den Mensaplan und freie Lernräume an, außerdem kann man darüber das Mensa-Guthaben aufladen.

Am Freitagabend hat der Werkstudent **Kevin Maier** die Zugangsdaten zur Datenbank der App in eine Konfigurationsdatei geschrieben, committet und gepusht. Am Samstag hat er die Zugangsdaten wieder aus der Datei gelöscht.

Am Montag stellt das Team fest, dass sich am Wochenende jemand Unbekanntes an der Datenbank angemeldet und die Nutzerdaten (Namen und E-Mail-Adressen) heruntergeladen hat.

**Prof. Brenner**, die das Projekt betreut, beauftragt euch als Security-Team:
1. Findet heraus, wie es zu dem Vorfall kommen konnte.
2. Sorgt dafür, dass so etwas nicht noch einmal passiert.

---

## So funktionieren die Level

- Story und Aufgaben werden auf einer **Website im Codespace** angezeigt. Gearbeitet wird im Terminal daneben.
- Jedes Level endet mit einer kurzen Frage. Die Antwort ist das **Lösungswort**, mit dem das nächste Level freigeschaltet wird.
- **Lösungswörter sind einfach:** ein Wort, das man direkt im TruffleHog-Output oder in einer Datei ablesen kann. Groß- und Kleinschreibung ist egal.
- **Tipps:** Jedes Level hat einen Button „Tipp anzeigen“ mit drei Stufen:

| Stufe | Inhalt | Verfügbar |
|---|---|---|
| **Tipp 1** | Hinweis, in welche Richtung es geht | sofort |
| **Tipp 2** | Konkreter Hinweis, z. B. welcher Befehl | nach 3 Minuten im Level |
| **Anleitung** | Schritt-für-Schritt-Lösung mit fertigem Befehl | nach 6 Minuten im Level |

  So probieren alle erst selbst, aber niemand bleibt länger als ein paar Minuten hängen.

---

## Übersicht

| Level | Thema | Lösungswort |
|---|---|---|
| 1 | Ein Secret pushen | `heilbronn` |
| 2 | Kevins Projektordner prüfen | `backup` |
| 3 | Ergebnisse auswerten | `postgres` |
| 4 | Den Commit finden | `kevin` |
| 5 | Gelöschte Secrets in der Historie | `aendern` (auch `ändern`) |
| 6 | Verifizierte Secrets | `aws` |
| 7 | Testdaten herausfiltern | `payment` |
| 8 | Pre-Commit-Hook | `stripe` |
| 9 | Abschlussbericht | `2` |
| Bonus | CI-Pipeline | – |

---

## Teil 1: Der Fehler

### Level 1 – Ein Secret pushen

> Ihr arbeitet neu im Team der Campus-App und sollt die App mit der Datenbank verbinden. Dafür tragt ihr die Zugangsdaten direkt in eine Datei ein, genau wie Kevin.

**Auftrag:**
1. Schreibt diese Zeile in die Datei `config.py`:
   `DATABASE_URL = "postgres://campusapp:heilbronn@db.campus-app.internal:5432/campus"`
2. Committet und pusht die Datei.
3. Löscht die Zeile wieder, committet und pusht erneut.
4. Prüft auf GitHub, ob die Zugangsdaten noch irgendwo zu sehen sind.

**Frage:** Welches Passwort steht im alten Commit auf GitHub?
**Lösungswort:** `heilbronn`

**Tipps:**
1. Schaut euch auf GitHub nicht nur die aktuelle Datei an.
2. Klickt auf GitHub auf „Commits“ und öffnet euren ersten Commit.
3. Anleitung: Repo auf GitHub öffnen → oben auf „X commits“ klicken → den ersten Commit öffnen. Dort seht ihr die Zeile mit der Datenbank-URL. Das Passwort steht zwischen `campusapp:` und `@`.

> **Option A oder B (noch offen):**
> - **A:** Das Workshop-Team zeigt dieses Level als Live-Demo. Die Studierenden starten dann direkt mit Level 2.
> - **B:** Alle machen das Level selbst in ihrem eigenen Repo.

---

## Teil 2: Die Untersuchung

### Level 2 – Kevins Projektordner prüfen

> Ihr habt eine Kopie von Kevins Projektordner bekommen. Prüft, ob dort Zugangsdaten gespeichert sind.

**Auftrag:**
1. Schaut euch die Dateien im Ordner `fall/kevins-ordner/` an.
2. Scannt den Ordner mit TruffleHog:
   ```bash
   trufflehog filesystem fall/kevins-ordner/
   ```

**Frage:** Einer der Funde liegt nicht direkt in `kevins-ordner`, sondern in einem weiteren Ordner darin. Wie heißt dieser Ordner?
**Lösungswort:** `backup`

**Tipps:**
1. Achtet im Output auf die Zeile `File:`.
2. Vergleicht die beiden Pfade: Bei einem Fund steht zwischen `kevins-ordner/` und dem Dateinamen noch ein weiterer Ordner.
3. Anleitung: Befehl ausführen und bei den Funden die Zeilen `File:` lesen. Einer lautet `…/kevins-ordner/backup/alt.txt`.

**Lösung (für das Team):** 2 Funde: Datenbank-URL in `.env`, AWS-Zugangsdaten in `backup/alt.txt`. Das Passwort `Lernraum123` in `app.py` wird nicht gefunden, weil es kein bekanntes Format hat.

---

### Level 3 – Ergebnisse auswerten

> Wertet die Funde aus Level 2 genauer aus.

**Auftrag:** Beantwortet für jeden Fund:
- Um welche Art von Secret handelt es sich? (`Detector Type`)
- In welcher Datei liegt es?
- Ist es `verified` oder `unverified`?

**Frage:** Welcher Detector Type wurde für die Datei `.env` angezeigt?
**Lösungswort:** `postgres`

**Tipps:**
1. Jeder Fund im Output hat eine Zeile `Detector Type`.
2. Sucht den Fund, bei dem unter `File:` die Datei `.env` steht.
3. Anleitung: Scan aus Level 2 erneut ausführen. Beim Fund mit `File: …/.env` steht `Detector Type: Postgres`.

**Lösung (für das Team):**

| Detector | Datei | Status |
|---|---|---|
| Postgres | `.env` | unverified |
| AWS | `backup/alt.txt` | unverified |

---

### Level 4 – Den Commit finden

> Untersucht jetzt das Git-Projekt der Campus-App. Git speichert zu jeder Änderung, wer sie wann gemacht hat.

**Auftrag:** Scannt den Ordner `fall/campus-app` und findet heraus, wer die Zugangsdaten wann in welche Datei committet hat.
```bash
trufflehog git file://fall/campus-app
```

**Frage:** Wie lautet der Vorname der Person, die die Zugangsdaten committet hat?
**Lösungswort:** `kevin`

**Tipps:**
1. TruffleHog zeigt bei Git-Scans zusätzliche Informationen zu jedem Commit an.
2. Achtet auf die Zeile `Email:`.
3. Anleitung: Befehl ausführen. Beim Fund steht `Email: Kevin Maier <kevin.maier@…>`.

---

### Level 5 – Gelöschte Secrets in der Historie

> Kevin gibt an, dass er die Zugangsdaten am Samstag gelöscht hat.

**Auftrag:**
1. Öffnet `fall/campus-app/config.py`. Stehen dort noch Zugangsdaten?
2. Überlegt, warum TruffleHog sie trotzdem gefunden hat.

**Frage:** Löschen reicht nicht. Was muss mit dem Passwort passieren? (ein Wort)
**Lösungswort:** `aendern` (auch `ändern`)

**Tipps:**
1. Das Passwort ist noch in einem älteren Commit gespeichert. Jeder mit Zugriff kann es lesen.
2. Wie sorgt man dafür, dass ein bekanntes Passwort nicht mehr funktioniert?
3. Anleitung: Ein geleaktes Passwort gilt als bekannt. Es muss geändert werden, damit es nicht mehr benutzt werden kann.

---

### Level 6 – Verifizierte Secrets

> TruffleHog kann bei vielen Diensten prüfen, ob gefundene Zugangsdaten noch gültig sind. Probiert das an einem offiziellen Übungsprojekt von Truffle Security aus.

**Auftrag:**
1. Scannt den Ordner `fall/test_keys`.
2. Lasst euch nur die verifizierten Funde anzeigen.

**Frage:** Welcher Detector Type wurde für die Datei `new_key` als `verified` angezeigt? (Eindeutig formuliert, weil `test_keys` auch einen verifizierten `URI`-Fund enthält.)
**Lösungswort:** `aws`

**Tipps:**
1. Der Scan funktioniert wie in Level 4, nur mit einem anderen Ordner.
2. Mit der Option `--results=verified` seht ihr nur gültige Funde.
3. Anleitung:
   ```bash
   trufflehog git file://fall/test_keys --results=verified
   ```
   Beim Fund steht `Detector Type: AWS`.

**Hinweis (für das Team):** Es handelt sich um einen harmlosen Test-Schlüssel von Truffle Security. Für dieses Level wird Internet benötigt.

---

### Level 7 – Testdaten herausfiltern

> Für die Funktion „Mensa-Guthaben aufladen“ gibt es ein eigenes Projekt. Darin liegen viele Testdateien mit Beispiel-Schlüsseln.

**Auftrag:**
1. Scannt den Ordner `fall/mensa-guthaben`. Wie viele Funde gibt es?
2. Schließt den Ordner `tests/` vom Scan aus. Was bleibt übrig?

**Frage:** Wie heißt die Datei mit dem echten Fund (ohne Endung)?
**Lösungswort:** `payment`

**Tipps:**
1. Die meisten Funde liegen im Ordner `tests/`. Die sind nur Testdaten.
2. Mit der Option `--exclude-paths` könnt ihr Ordner vom Scan ausschließen. Die Option braucht eine Datei, in der die Ordner stehen.
3. Anleitung:
   ```bash
   echo "tests/" > ignorieren.txt
   trufflehog git file://fall/mensa-guthaben --exclude-paths=ignorieren.txt
   ```
   Übrig bleibt der Fund in `src/payment.py`.

**Lösung (für das Team):** Ohne Filter 4 Funde, mit Filter 1 Fund (Stripe-Schlüssel in `src/payment.py`).

---

## Teil 3: Vorbeugung

### Level 8 – Pre-Commit-Hook

> Ein Pre-Commit-Hook prüft jeden Commit, bevor er gespeichert wird. So gelangen Secrets gar nicht erst ins Repo.

**Auftrag:**
1. Aktiviert den Pre-Commit-Hook.
2. Versucht, die Datei `geheim.txt` zu committen.
3. Committet die Datei `harmlos.txt`.

**Frage:** Welcher Detector Type hat den Commit von `geheim.txt` blockiert?
**Lösungswort:** `stripe`

**Tipps:**
1. Der Hook liegt bereits im Ordner `hooks/`. Git muss nur wissen, dass es ihn benutzen soll.
2. Mit `git config core.hooksPath hooks` aktiviert ihr den Hook.
3. Anleitung:
   ```bash
   git config core.hooksPath hooks
   git add geheim.txt
   git commit -m "Test"
   ```
   Der Commit wird abgebrochen. In der Ausgabe steht `Detector Type: Stripe`.

---

### Level 9 – Abschlussbericht

> Die Campus-App soll zum Semesterstart wieder online gehen. Vorher soll die neue Version vollständig geprüft werden.

**Auftrag:** Scannt den Ordner `fall/campus-app-neu` und beantwortet:
1. Welche Secrets habt ihr gefunden? (Typ, Datei)
2. Welche sind echte Zugangsdaten, welche sind Testdaten?
3. Welche Maßnahmen muss das Team ergreifen, bevor die App wieder online geht?

**Frage:** Wie viele echte Secrets (ohne Testdaten) habt ihr gefunden?
**Lösungswort:** `2`

**Tipps:**
1. Ihr kennt alle nötigen Befehle schon aus den vorherigen Leveln.
2. Denkt an die Git-Historie (Level 4) und an Testdaten (Level 7).
3. Anleitung:
   ```bash
   echo "tests/" > ignorieren.txt
   trufflehog git file://fall/campus-app-neu --exclude-paths=ignorieren.txt
   ```
   Übrig bleiben 2 Funde: ein privater Server-Schlüssel und eine Datenbank-URL.

**Lösung zu Frage 3 (für das Team, wird gemeinsam besprochen):**
1. Alle betroffenen Zugangsdaten ändern
2. Prüfen, auf welche Daten zugegriffen wurde
3. Betroffene Nutzer informieren und Datenschutzbeauftragte einbeziehen
4. Zugangsdaten künftig nicht mehr im Code speichern, sondern z. B. in Umgebungsvariablen
5. Pre-Commit-Hook und CI-Scan für das Projekt einrichten

---

## Bonus – CI-Pipeline

> Ein Pre-Commit-Hook lässt sich mit `git commit --no-verify` umgehen. Deshalb prüft zusätzlich eine CI-Pipeline auf GitHub jeden Push.

**Auftrag:** Pusht eine Datei mit Secret in euer Repo und schaut im Reiter **Actions** nach: Die Pipeline schlägt fehl. Entfernt das Secret und pusht erneut, dann läuft die Pipeline durch.

**Tipps:**
1. Den Push mit Secret kennt ihr schon aus Level 1.
2. Der Reiter „Actions“ ist oben in eurem Repo auf GitHub.
3. Anleitung: Datei mit der Datenbank-URL aus Level 1 anlegen → committen → `git push` → auf GitHub „Actions“ öffnen → roter Lauf. Danach Datei löschen → committen → pushen → grüner Lauf.

---

## Abschluss (alle zusammen)

Auflösung: Der Angreifer hat die Zugangsdaten aus Kevins altem Commit verwendet, um sich an der Datenbank anzumelden.

Zusammenfassung:
1. Zugangsdaten gehören nicht in den Code.
2. Ein gelöschtes Secret ist in der Git-Historie weiterhin vorhanden, deshalb muss es geändert werden.
3. `verified` bedeutet, dass die Zugangsdaten gültig sind. Diese Funde haben Vorrang.
4. Nicht jeder Fund ist ein echtes Secret.
5. Pre-Commit-Hook und CI-Pipeline helfen, Secrets frühzeitig abzufangen.

---

## Hinweise für die Technik

- Alle Secrets sind Fake und werden erst beim Start des Codespace erzeugt (`setup.sh`), und zwar im Ordner `fall/`.
- **Lösungswörter dürfen nicht vom Zufall abhängen.** Sie basieren deshalb nur auf Dingen, die bei allen gleich sind: Detector Types, Datei- und Ordnernamen, Autor, Anzahl der Funde. Das Setup-Skript muss genau die hier beschriebenen Dateien, Autoren und Secret-Typen erzeugen.
- Lösungswörter auf der Website nicht im Klartext speichern, sondern als Hash. Vergleich ohne Groß-/Kleinschreibung, bei Level 5 `ändern` und `aendern` akzeptieren.
- Der Tipp-Timer startet, wenn ein Level geöffnet wird. Der Fortschritt bleibt beim Neuladen der Seite erhalten.
- In Fake-Secrets keine echten Hostnamen der Hochschule verwenden (z. B. `db.campus-app.internal`), sonst versucht TruffleHog bei der Verifikation, echte Server zu erreichen.
- Getestet mit TruffleHog v3.100.0. Erkannt werden: Private Key, Postgres-URL, AWS, Stripe, SendGrid, Slack-Webhook.
- Nicht erkannt werden ausgedachte Formate und normale Passwörter.
- `fall/kevins-ordner/` darf kein Git-Projekt sein, sonst gibt es doppelte Funde.
- Die Ordner `fall/campus-app`, `fall/mensa-guthaben` und `fall/campus-app-neu` sind kleine Git-Projekte mit vorbereiteter Historie. Sie liegen nur im Codespace und werden nie gepusht (`fall/` steht in der `.gitignore`).
- Level 1 und Bonus: Die Datenbank-URL muss von GitHub beim Push **durchgelassen** werden (Push Protection). Das muss noch getestet werden.
- Getestet: TruffleHog erkennt die Datenbank-URL aus Level 1 (mit Passwort `heilbronn`) als `Postgres`. Sie funktioniert also auch für den Bonus.
- Der Pre-Commit-Hook (Level 8) muss noch gebaut und getestet werden. `geheim.txt` enthält einen Stripe-Schlüssel.
