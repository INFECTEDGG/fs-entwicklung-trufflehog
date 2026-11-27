# Anforderungen an die Workshop-Story

Sammlung der Vorgaben des Teams für die Workshop-Story (aktuelle Fassung: `claude/fall-spezifikation.md`).

## Vorgaben

1. **Einfach statt kompliziert** (22.11.2026): Die bisherige Fall-Spezifikation ist zu kompliziert. Gewünscht ist eine gute, aber **leicht verständliche Story ohne viel Schnickschnack**. Niemand soll schon beim Lesen durcheinanderkommen.

2. **Am Anfang wird selbst ein Secret „aus Versehen“ gepusht** (22.11.2026):
   - Danach Perspektivwechsel: In den weiteren Aufgaben sind die Studierenden die Ermittler.
   - **Noch offen, wer den Fehler macht:**
     - **Option A – Live-Demo:** Das Workshop-Team macht den Fehler vor: Secret in eine Datei schreiben, committen, zu GitHub pushen, löschen, erneut pushen und zeigen, dass das Secret in der Historie auf GitHub noch sichtbar ist.
     - **Option B – Level 1 für alle:** Die Studierenden pushen selbst ein (Fake-)Secret in ihr eigenes Repo.
   - Die Story sollte so geschrieben werden, dass beide Optionen funktionieren.

3. **Alles in einem Repo, durchgeführt in Codespaces** (22.11.2026):
   - Alle Aufgaben und Materialien liegen in **einem** Workshop-Repo, das das Team pflegt.
   - Umsetzung: Das Repo wird als **Template-Repo** markiert. Jede Person erstellt sich am Anfang per „Use this template“ eine eigene Kopie und startet darin den Codespace.
   - So kann jeder in seiner Kopie pushen (Option B) und GitHub Actions nutzen (CI-Kapitel), ohne Schreibrechte im Original-Repo.
   - Die Übungsordner liegen unter `fall/` im Codespace. In den Aufgaben ist von „Ordnern“ die Rede, nicht von „Repos“.

4. **Story an der Hochschule Heilbronn** (23.11.2026): Die Story spielt an der HHN (fiktive „Campus-App“ eines Studierendenteams mit Mensaplan, Lernräumen und Mensa-Guthaben). Personen und Vorfall sind frei erfunden.

5. **Sachlicher Ton, normaler Fall** (23.11.2026): Keine witzigen oder albernen Elemente (keine Scherz-Nachrichten, keine Emojis, keine Spitznamen wie „Türsteher“). Der Vorfall wird wie ein realistischer Sicherheitsvorfall beschrieben, mit Fachbegriffen (Pre-Commit-Hook, CI-Pipeline).

6. **Level mit einfachen Lösungswörtern** (23.11.2026): Jedes Level wird mit einem **einfachen Lösungswort** abgeschlossen, das das nächste Level freischaltet. Das Lösungswort lässt sich direkt im TruffleHog-Output oder in einer Datei ablesen (z. B. `kevin`, `postgres`).

7. **Tipps für jedes Level** (23.11.2026): Jedes Level hat Hilfe in drei Stufen über einen Tipp-Button: Tipp 1 sofort, Tipp 2 nach 3 Minuten, vollständige Anleitung nach 6 Minuten.

## Website im Codespace

- Story und Level werden auf einer lokalen Website im Codespace angezeigt (Umsetzung von Vorgabe 6 und 7). Gearbeitet wird im Terminal daneben.

## Technisch zu klären

- **GitHub Push Protection:** Prüfen, ob GitHub den Push der Datenbank-URL aus Level 1 durchlässt. TruffleHog erkennt die URL (getestet).
- Template-Ablauf einmal mit einem fremden Account testen (Kopie erstellen → Codespace starten → pushen).

## Offen

- Entscheidung Option A oder B (Vorgabe 2).
