# TruffleHog – Historie, Zweck und Einsatz im DevSecOps-Umfeld

## 1. Was ist TruffleHog?

**TruffleHog** ist ein Open-Source-Sicherheitswerkzeug, das Zugangsdaten und andere sensible Informationen in unterschiedlichen Datenquellen aufspüren kann.

Solche Informationen werden im Bereich der Softwareentwicklung häufig als **Secrets** bezeichnet.

Typische Secrets sind beispielsweise:

| Secret-Typ | Beschreibung |
|---|---|
| API-Key | Schlüssel zur Authentifizierung gegenüber einer API |
| Access Token | Token für den Zugriff auf Anwendungen oder Dienste |
| Private Key | Privater kryptografischer Schlüssel |
| Database Credentials | Zugangsdaten zu Datenbanken |
| Cloud Credentials | Zugangsdaten für Cloud-Dienste |
| OAuth Token | Token zur Autorisierung von Anwendungen |
| SSH Private Key | Privater Schlüssel zur SSH-Authentifizierung |

TruffleHog unterstützt unter anderem das Scannen von:

- lokalen Dateien und Verzeichnissen
- Git-Repositories
- Git-Historien
- GitHub
- GitLab
- Docker-Images
- Cloud-Diensten
- weiteren Datenquellen

---

## 2. Welches Problem löst TruffleHog?

Während der Softwareentwicklung werden häufig Zugangsdaten benötigt.

Eine unsichere Implementierung könnte beispielsweise folgendermaßen aussehen:

```python
import psycopg2

connection = psycopg2.connect(
    host="database.example.local",
    user="admin",
    password="SuperSecretPassword123"
)
```

Wird eine solche Datei in ein Git-Repository committed und anschließend beispielsweise zu GitHub gepusht, befinden sich die Zugangsdaten im Repository.

Das kann verschiedene Sicherheitsrisiken verursachen:

- Zugangsdaten können versehentlich öffentlich werden
- Entwickleraccounts können kompromittiert werden
- Repository-Berechtigungen können zu weitreichend sein
- Repositories können versehentlich veröffentlicht werden
- Secrets können in Backups oder Forks landen
- Secrets können in der Git-Historie erhalten bleiben

Genau an dieser Stelle setzt TruffleHog an.

Das Tool soll sensible Zugangsdaten erkennen, bevor sie von Unbefugten missbraucht werden können.

> **Wichtig:** TruffleHog erkennt nicht automatisch jedes beliebige Passwort. Die Erkennung hängt unter anderem von den verfügbaren Detektoren und den verwendeten Secret-Formaten ab.

---

# 3. Historie von TruffleHog

## 3.1 Die Entstehung im Jahr 2017

TruffleHog wurde **2017 von Dylan Ayrey** entwickelt.

Ayrey beschäftigte sich unter anderem mit IT-Sicherheitsforschung und Bug-Bounty-Programmen.

Bei Bug-Bounty-Programmen suchen Sicherheitsforscher mit entsprechender Berechtigung nach Schwachstellen in Anwendungen oder Systemen.

Ayrey wollte die Suche nach versehentlich veröffentlichten Zugangsdaten automatisieren.

Die grundlegende Idee war:

> Was wäre, wenn man Git-Repositories automatisiert nach versehentlich veröffentlichten Zugangsdaten durchsuchen könnte?

Anstatt jedes Repository manuell zu überprüfen, sollte ein Werkzeug diese Aufgabe übernehmen.

Der ursprüngliche Schwerpunkt von TruffleHog lag deshalb auf der Suche nach **API-Keys und anderen Secrets in Git-Repositories**.

---

## 3.2 Warum Git-Repositories?

Git speichert nicht nur den aktuellen Zustand eines Softwareprojekts.

Git verwaltet außerdem die **Historie des Projekts**.

Vereinfacht:

```text
Commit A
   │
   ▼
Commit B
   │
   ▼
Commit C
   │
   ▼
Commit D
```

Jeder Commit enthält Änderungen am Projekt.

Angenommen, ein Entwickler committed versehentlich einen API-Key.

### Commit A

```python
API_KEY = "DEMO-SECRET-12345"
```

Später bemerkt der Entwickler seinen Fehler und entfernt das Secret.

### Commit B

```python
API_KEY = os.getenv("API_KEY")
```

Im aktuellen Quellcode ist das Secret jetzt nicht mehr sichtbar.

Es kann sich allerdings weiterhin in **Commit A** befinden.

Die Situation sieht damit folgendermaßen aus:

```text
Commit A
│
├── API_KEY = "DEMO-SECRET-12345"
│
▼
Commit B
│
├── API_KEY = os.getenv("API_KEY")
│
▼
Aktueller Stand
│
└── Secret scheinbar entfernt
```

Ein Angreifer könnte allerdings die Git-Historie untersuchen und den ursprünglichen Wert wiederherstellen.

Daraus ergibt sich eine wichtige Erkenntnis:

> **Ein Secret aus dem aktuellen Quellcode zu löschen, entfernt es nicht automatisch aus der Git-Historie.**

Dieses Problem war einer der wesentlichen Ausgangspunkte von TruffleHog.

---

# 4. Funktionsweise der ursprünglichen Version

Die frühen Versionen von TruffleHog wurden in **Python** implementiert.

Der Schwerpunkt lag auf der Untersuchung von Git-Repositories und deren Commit-Historie.

Dabei kamen insbesondere unterschiedliche Methoden zur Erkennung verdächtiger Zeichenfolgen zum Einsatz.

---

## 4.1 Entropieanalyse

Die Entropie beschreibt vereinfacht, wie zufällig oder unvorhersehbar eine Zeichenfolge ist.

Vergleichen wir zwei Beispiele:

### Niedrige Entropie

```text
password123
```

### Höhere Entropie

```text
aK8$zP2!mQ9#vL4@xT7
```

Die zweite Zeichenfolge wirkt deutlich zufälliger.

API-Keys und Tokens werden häufig automatisch generiert und besitzen deshalb oftmals eine hohe Entropie.

Die ursprüngliche TruffleHog-Version konnte nach solchen auffälligen Zeichenfolgen suchen.

### Problem

Nicht jede zufällige Zeichenfolge ist ein Secret.

Auch folgende Daten können eine hohe Entropie besitzen:

- Hashwerte
- IDs
- zufällig generierte Testdaten
- kryptografische Werte
- andere technische Identifikatoren

Dadurch können sogenannte **False Positives** entstehen.

> Ein **False Positive** ist ein Fund, der vom Scanner als potenziell gefährlich eingestuft wird, tatsächlich aber kein relevantes Secret darstellt.

---

## 4.2 Reguläre Ausdrücke

Eine weitere Möglichkeit zur Secret-Erkennung sind **Regular Expressions (Regex)**.

Damit können Zeichenfolgen anhand bestimmter Muster identifiziert werden.

Ein stark vereinfachtes Beispiel:

```regex
API_KEY\s*=\s*["'][^"']+["']
```

Dieses Muster könnte beispielsweise folgende Zeile erkennen:

```python
API_KEY = "example123"
```

Musterbasierte Erkennung ermöglicht eine gezieltere Suche nach bestimmten Secret-Formaten.

---

# 5. Vom Open-Source-Projekt zum Security-Unternehmen

Mit der zunehmenden Verbreitung von:

- Cloud-Diensten
- APIs
- Microservices
- CI/CD
- DevOps
- Infrastructure as Code

stieg auch die Anzahl der Zugangsdaten, die innerhalb moderner Softwareprojekte benötigt werden.

Software kommuniziert beispielsweise mit:

```text
Application
    │
    ├──► Database
    │
    ├──► AWS / Azure / GCP
    │
    ├──► GitHub
    │
    ├──► Payment Provider
    │
    ├──► Monitoring
    │
    └──► External APIs
```

Für viele dieser Verbindungen werden Credentials benötigt.

Damit steigt gleichzeitig die Wahrscheinlichkeit, dass Secrets versehentlich an falschen Stellen gespeichert werden.

---

## 5.1 Gründung von Truffle Security

Anfang 2021 konzentrierten sich Dylan Ayrey und seine Mitgründer auf die Weiterentwicklung von TruffleHog und das Thema Credential Security.

Daraus entwickelte sich das Unternehmen **Truffle Security**.

Im Dezember 2021 gab das Unternehmen eine **Series-A-Finanzierungsrunde über 14 Millionen US-Dollar** bekannt.

Die Finanzierungsrunde wurde von Andreessen Horowitz angeführt.

Damit entwickelte sich aus einem ursprünglich für Security Research und Bug Bounties entwickelten Open-Source-Projekt ein professionell weiterentwickeltes Security-Werkzeug.

---

# 6. TruffleHog Version 3

Ein wichtiger Meilenstein war **TruffleHog v3**.

Die Software wurde vollständig in **Go** neu entwickelt.

Aus einem hauptsächlich auf Git-Repositories ausgerichteten Scanner entwickelte sich ein wesentlich umfangreicheres Werkzeug.

Zu den Funktionen gehören heute unter anderem:

- zahlreiche spezialisierte Secret-Detektoren
- Git Repository Scanning
- Filesystem Scanning
- GitHub Scanning
- GitLab Scanning
- Docker Image Scanning
- Cloud Source Scanning
- Credential Verification
- Pre-Commit-Integration
- CI/CD-Integration
- JSON-Ausgabe
- SARIF-Ausgabe
- Custom Detectors

Die ursprüngliche Idee war vereinfacht:

> Suche nach auffälligen Zeichenfolgen in Git-Repositories.

Die moderne Zielsetzung ist wesentlich umfangreicher:

> Erkenne potenziell kompromittierte Zugangsdaten in unterschiedlichen Datenquellen und überprüfe – soweit möglich – ob diese tatsächlich gültig sind.

---

# 7. Secret Detection

Bei der **Detection** versucht TruffleHog festzustellen, ob eine Zeichenfolge einem bekannten Secret-Muster entspricht.

Beispielsweise könnte ein Detektor erkennen, dass ein bestimmter String dem Aufbau eines bestimmten API-Keys entspricht.

Der Ablauf sieht vereinfacht so aus:

```text
Datei / Repository
        │
        ▼
    TruffleHog
        │
        ▼
     Detector
        │
        ▼
Bekanntes Secret-Muster?
        │
    ┌───┴───┐
    │       │
   Ja      Nein
    │
    ▼
Potential Secret
```

Ein Fund bedeutet zunächst:

> **TruffleHog hat einen Wert gefunden, der einem bekannten Secret-Muster entspricht.**

Das bedeutet noch nicht zwangsläufig, dass das Credential tatsächlich gültig ist.

---

# 8. Secret Verification

Eine wichtige Funktion von TruffleHog ist deshalb die **Credential Verification**.

TruffleHog kann bei unterstützten Diensten versuchen festzustellen, ob ein gefundenes Credential tatsächlich gültig ist.

Der Ablauf sieht vereinfacht folgendermaßen aus:

```text
Potential Secret
       │
       ▼
    Detection
       │
       ▼
  Verification
       │
   ┌───┴───────────┐
   │               │
   ▼               ▼
Verified        Unverified
```

Je nach Situation kann außerdem ein Status wie `Unknown` auftreten.

---

## 8.1 Verified

Ein Credential konnte erfolgreich als gültig bestätigt werden.

```text
Secret gefunden
      │
      ▼
Verification
      │
      ▼
Credential funktioniert
      │
      ▼
   VERIFIED
```

Ein solcher Fund kann für ein Security-Team besonders relevant sein.

---

## 8.2 Unverified

Ein Credential wurde erkannt, konnte aber nicht erfolgreich als gültig bestätigt werden.

Das bedeutet **nicht automatisch**, dass das Credential ungültig ist.

Mögliche Ursachen:

- Credential ist ungültig
- Credential wurde bereits deaktiviert
- Verification wird für diesen Secret-Typ nicht unterstützt
- weitere Informationen wären für die Überprüfung notwendig

---

## 8.3 Unknown

Eine Überprüfung wurde versucht, konnte jedoch nicht zuverlässig abgeschlossen werden.

Mögliche Ursachen sind beispielsweise:

- Netzwerkprobleme
- API nicht erreichbar
- Rate Limiting
- temporäre Fehler des externen Dienstes

---

# 9. Warum ist Verification wichtig?

Angenommen, ein Unternehmen besitzt:

```text
1.000 Git-Repositories
```

Ein Secret Scanner findet:

```text
500 potenzielle Secrets
```

Ohne weitere Informationen müsste ein Security-Team sehr viele Funde manuell untersuchen.

Durch Verification können Ergebnisse besser priorisiert werden.

Beispiel:

| Fund | Status | Mögliche Priorität |
|---|---|---|
| Aktiver Cloud-Key | Verified | Hoch |
| Beispiel-Token | Unverified | Nach Prüfung ggf. niedrig |
| Potenzieller API-Key | Unknown | Weitere Untersuchung notwendig |

Die tatsächliche Priorität hängt allerdings von weiteren Faktoren ab:

- Welche Berechtigungen besitzt das Credential?
- Welche Systeme können damit erreicht werden?
- Ist das Credential öffentlich zugänglich?
- Welche Daten sind betroffen?
- Wie lange war das Secret exponiert?

---

# 10. Typische Anwendungsszenarien

## 10.1 Filesystem Scanning

TruffleHog kann lokale Dateien und Verzeichnisse untersuchen.

Beispiel:

```bash
trufflehog filesystem .
```

Dabei steht `.` für das aktuelle Verzeichnis.

Typische Einsatzgebiete:

- lokale Softwareprojekte
- Konfigurationsdateien
- Entwicklungsverzeichnisse
- Backups
- exportierte Daten

### Workshop-Idee

Die Teilnehmer erhalten einen vorbereiteten Ordner:

```text
demo/
├── app.py
├── config.json
├── .env
├── notes.txt
└── backup/
    └── old-config.txt
```

Anschließend sollen sie herausfinden, welche Dateien potenzielle Secrets enthalten.

---

# 11. Git Repository Scanning

Ein besonders wichtiges Einsatzgebiet ist das Scannen von Git-Repositories.

Beispiel:

```bash
trufflehog git file://.
```

Der Vorteil gegenüber einem einfachen Filesystem Scan:

> TruffleHog kann auch die **Git-Historie** untersuchen.

Dadurch können Secrets gefunden werden, die in älteren Commits enthalten sind.

### Workshop-Idee

```text
Commit 1
│
├── Secret hinzugefügt
│
▼
Commit 2
│
├── weitere Entwicklung
│
▼
Commit 3
│
├── Secret gelöscht
│
▼
Aktueller Code
    └── kein Secret sichtbar
```

Die Teilnehmer sollen herausfinden, ob TruffleHog das gelöschte Secret trotzdem findet.

---

# 12. GitHub und GitLab Scanning

TruffleHog kann auch Repositories auf Git-Hosting-Plattformen untersuchen.

Typische Einsatzgebiete:

- einzelne Repositories
- mehrere Unternehmens-Repositories
- GitHub-Organisationen
- GitLab-Projekte

Dadurch können Unternehmen ihre Entwicklungsumgebungen auf versehentlich veröffentlichte Credentials überprüfen.

---

# 13. Docker Image Scanning

TruffleHog kann außerdem Docker-Images untersuchen.

Problematisch wäre beispielsweise:

```dockerfile
FROM python:3.13

WORKDIR /app

COPY .env /app/.env
COPY . /app

CMD ["python", "app.py"]
```

Wenn `.env` echte Zugangsdaten enthält, könnten diese Bestandteil des Docker-Images werden.

TruffleHog kann Docker-Images auf entsprechende Secrets untersuchen.

---

# 14. Pre-Commit Scanning

TruffleHog kann bereits vor einem Git-Commit eingesetzt werden.

Ein möglicher Ablauf:

```text
Developer
    │
    ▼
Code schreiben
    │
    ▼
git add
    │
    ▼
git commit
    │
    ▼
Pre-Commit Hook
    │
    ▼
TruffleHog
    │
 ┌──┴──────────┐
 │             │
Secret      kein Secret
 │             │
 ▼             ▼
Commit       Commit
blockieren   erlauben
```

Der Vorteil:

> Das Secret gelangt im Idealfall gar nicht erst in die Git-Historie.

---

# 15. CI/CD-Integration

TruffleHog kann in automatisierte Entwicklungsprozesse integriert werden.

Beispielsweise mit GitHub Actions:

```text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub
    │
    ▼
CI/CD Pipeline
    │
    ▼
TruffleHog
    │
    ├── Secret gefunden
    │       │
    │       ▼
    │   Pipeline stoppen
    │
    └── Kein Secret
            │
            ▼
           Build
            │
            ▼
           Tests
            │
            ▼
         Deployment
```

Dadurch wird Secret Scanning automatisierter Bestandteil des Entwicklungsprozesses.

Dieses Vorgehen passt zum Konzept der **Shift Left Security**.

Sicherheitsprobleme sollen möglichst früh im Software Development Lifecycle erkannt werden.

---

# 16. Vorteile von TruffleHog

| Vorteil | Erklärung |
|---|---|
| Open Source | Quellcode öffentlich verfügbar |
| Plattformübergreifend | macOS, Windows und Linux |
| Docker-Unterstützung | Plattformunabhängiger Einsatz möglich |
| Viele Datenquellen | Git, Filesystem, Cloud, Container usw. |
| Credential Verification | Unterstützte Credentials können überprüft werden |
| Git-Historie | Auch ältere Commits können untersucht werden |
| CI/CD-Integration | Automatisierte Sicherheitsprüfungen möglich |
| Pre-Commit | Secrets können bereits vor einem Commit erkannt werden |
| Custom Detectors | Eigene Erkennungsregeln können erstellt werden |
| JSON/SARIF | Ergebnisse können automatisiert weiterverarbeitet werden |

---

# 17. Nachteile und Grenzen

## False Positives

Nicht jeder erkannte Wert ist tatsächlich ein gültiges Secret.

Beispielsweise können auch Testwerte oder Beispieldaten erkannt werden.

---

## False Negatives

Nicht jedes Secret wird zwangsläufig erkannt.

Ein unbekanntes oder ungewöhnlich formatiertes Credential kann von vorhandenen Detektoren übersehen werden.

---

## Verification ist nicht immer möglich

Nicht jedes Credential kann automatisch überprüft werden.

Gründe können beispielsweise sein:

- fehlende API
- Netzwerkprobleme
- Rate Limits
- fehlende Unterstützung des Dienstes

---

## Performance

Das Scannen sehr großer Datenquellen kann Zeit und Ressourcen benötigen.

---

## Berechtigungen

Für private Repositories und andere geschützte Datenquellen benötigt TruffleHog entsprechende Zugriffsrechte.

---

## Scan-Ergebnisse können sensibel sein

Die Ergebnisse eines Secret Scans können selbst Zugangsdaten enthalten.

Daher müssen auch Scan-Ergebnisse geschützt werden.

---

## Keine automatische Behebung

TruffleHog erkennt potenzielle Sicherheitsprobleme.

Das Tool behebt diese aber nicht automatisch.

Wurde ein echtes Secret veröffentlicht, sollte es beispielsweise:

1. deaktiviert beziehungsweise widerrufen werden,
2. durch ein neues Secret ersetzt werden,
3. aus unsicheren Speicherorten entfernt werden,
4. hinsichtlich eines möglichen Missbrauchs untersucht werden.

---

# 18. Vergleich mit anderen Tools

Interessante Alternativen zu TruffleHog sind:

- Gitleaks
- detect-secrets

## Vergleich

| Eigenschaft | TruffleHog | Gitleaks | detect-secrets |
|---|---|---|---|
| Open Source | ✅ | ✅ | ✅ |
| Git Scanning | ✅ | ✅ | ✅ |
| Filesystem Scanning | ✅ | ✅ | ✅ |
| Git-Historie | ✅ | ✅ | teilweise / workflowabhängig |
| Regex Detection | ✅ | ✅ | ✅ |
| Entropie-basierte Verfahren | je nach Detector | ✅ | ✅ |
| Credential Verification | **starker Schwerpunkt** | kein zentraler Schwerpunkt | eingeschränkt |
| CI/CD | ✅ | ✅ | ✅ |
| Pre-Commit | ✅ | ✅ | ✅ |
| Custom Rules | ✅ | ✅ | ✅ |

### TruffleHog

Besonders interessant für:

- unterschiedliche Datenquellen
- Credential Detection
- Credential Verification
- Git-Historien
- DevSecOps-Automatisierung

### Gitleaks

Besonders interessant für:

- Git-Repositories
- schnelle Secret Scans
- CI/CD
- Entwicklungsworkflows

### detect-secrets

Besonders interessant für:

- Pre-Commit-Workflows
- Secret Prevention
- Baseline-basierte Verwaltung bekannter Funde

---

# 19. Workshop – Praktischer Hauptteil

Der praktische Teil sollte den größten Anteil des Workshops einnehmen.

Ein mögliches Szenario:

> Ihr arbeitet im Security-Team eines fiktiven Unternehmens. Ein Entwickler vermutet, dass versehentlich Zugangsdaten in ein Softwareprojekt committed wurden. Eure Aufgabe ist es, den Vorfall mit TruffleHog zu untersuchen und anschließend Maßnahmen einzurichten, die zukünftige Secret-Leaks verhindern.

---

## Aufgabe 1 – Filesystem Scan

**Dauer:** ca. 10 Minuten

Die Teilnehmer erhalten einen vorbereiteten Ordner.

```text
exercise-01/
├── app.py
├── config.json
├── .env
├── notes.txt
└── backup/
    └── old-config.txt
```

Aufgaben:

1. Führt einen Filesystem Scan durch.
2. Welche Secrets werden erkannt?
3. In welchen Dateien befinden sie sich?
4. Welcher Detector wurde verwendet?

Beispiel:

```bash
trufflehog filesystem .
```

---

# 20. Aufgabe 2 – Das verschwundene Secret

**Dauer:** ca. 15 Minuten

Die Teilnehmer erhalten ein vorbereitetes Git-Repository.

```text
Commit A
│
├── Secret vorhanden
│
▼
Commit B
│
├── weitere Änderungen
│
▼
Commit C
│
├── Secret entfernt
│
▼
Aktueller Stand
    └── Secret nicht sichtbar
```

Aufgaben:

1. Untersucht zunächst die aktuellen Dateien.
2. Ist dort ein Secret vorhanden?
3. Scannt anschließend das Git-Repository.
4. Wird das alte Secret gefunden?
5. Warum?

---

# 21. Aufgabe 3 – Ergebnisse analysieren

**Dauer:** ca. 10 Minuten

Die Teilnehmer sollen einen Scan mit JSON-Ausgabe durchführen.

```bash
trufflehog filesystem . --json
```

Anschließend sollen sie untersuchen:

- Welcher Detector wurde ausgelöst?
- Welche Datei ist betroffen?
- Welche zusätzlichen Informationen werden ausgegeben?
- Welchen Verification-Status besitzt der Fund?

---

# 22. Aufgabe 4 – Pre-Commit

**Dauer:** ca. 15 Minuten

Die Teilnehmer sollen verhindern, dass neue Secrets committed werden.

Ziel:

```text
Developer
    │
    ▼
git commit
    │
    ▼
TruffleHog
    │
 ┌──┴──────────┐
 │             │
Secret      kein Secret
 │             │
 ▼             ▼
BLOCK        COMMIT
```

Anschließend wird getestet:

1. Datei mit Demo-Secret erstellen
2. `git add` ausführen
3. Commit versuchen
4. Secret entfernen
5. Commit erneut versuchen

---

# 23. Aufgabe 5 – CI/CD

**Dauer:** ca. 15–20 Minuten

TruffleHog soll in eine CI/CD-Pipeline integriert werden.

Ziel:

```text
Git Push
   │
   ▼
GitHub
   │
   ▼
GitHub Actions
   │
   ▼
TruffleHog
   │
   ├── Secret → Pipeline schlägt fehl
   │
   └── Kein Secret → Pipeline läuft weiter
```

Die Teilnehmer sollen anschließend testen, wie sich die Pipeline bei einem Secret verhält.

---

# 24. Abschluss-Challenge

**Dauer:** ca. 10–15 Minuten

Die Teilnehmer erhalten ein unbekanntes vorbereitetes Repository.

Diesmal gibt es keine vollständige Schritt-für-Schritt-Anleitung.

Aufgaben:

1. Welche Scan-Methode ist geeignet?
2. Welche Secrets befinden sich im Projekt?
3. Befinden sich Secrets in der Git-Historie?
4. Welche Funde sind besonders relevant?
5. Welche Maßnahmen würdet ihr ergreifen?
6. Wie könnte ein erneuter Secret-Leak verhindert werden?

---

# 25. Lessons Learned

## 1. Secrets gehören nicht in den Quellcode

Zugangsdaten sollten nicht direkt in Anwendungen hinterlegt werden.

Stattdessen können beispielsweise verwendet werden:

- Environment Variables
- Secret Stores
- Vault-Lösungen
- Cloud Secret Manager

---

## 2. Löschen bedeutet nicht automatisch Entfernen

Ein einmal committedes Secret kann weiterhin in der Git-Historie vorhanden sein.

```text
Secret committed
      │
      ▼
Secret gelöscht
      │
      ▼
Neuer Commit
      │
      ▼
Secret weiterhin
in Git History
```

---

## 3. Detection ist nicht Verification

Ein erkannter Wert ist nicht automatisch ein gültiges Credential.

```text
Detection
    │
    ▼
Potential Secret
    │
    ▼
Verification
    │
 ┌──┴─────────┐
 ▼            ▼
Verified   Unverified
```

---

## 4. Sicherheit sollte möglichst früh stattfinden

Secret Scanning sollte nicht erst nach einem Sicherheitsvorfall durchgeführt werden.

Mögliche Kontrollpunkte:

```text
Developer
    │
    ▼
IDE / Filesystem
    │
    ▼
Pre-Commit
    │
    ▼
Git Repository
    │
    ▼
CI/CD
    │
    ▼
Deployment
```

Das entspricht dem Prinzip:

> **Shift Left Security**

---

## 5. Secret Scanning ist nur ein Teil von DevSecOps

TruffleHog ersetzt kein vollständiges Sicherheitskonzept.

Zusätzlich sind unter anderem notwendig:

- sichere Softwareentwicklung
- Identity & Access Management
- Least Privilege
- Secret Management
- Credential Rotation
- Monitoring
- Incident Response
- Security Awareness

---

# 26. Möglicher Ablauf des Workshops

| Abschnitt | Inhalt | Dauer |
|---|---|---:|
| 1 | Einführung: Secrets und Sicherheitsrisiken | 5 Min. |
| 2 | Historie und Entwicklung von TruffleHog | 5 Min. |
| 3 | Detection und Verification | 10 Min. |
| 4 | Typische Anwendungsszenarien | 5 Min. |
| 5 | Vor- und Nachteile | 5 Min. |
| 6 | Vergleich mit anderen Tools | 5 Min. |
| 7 | Live-Demo: Filesystem Scan | 10 Min. |
| 8 | Teilnehmerübung: Secrets finden | 10 Min. |
| 9 | Git-History-Demo | 10 Min. |
| 10 | Teilnehmerübung: Git Scanning | 10 Min. |
| 11 | Pre-Commit / CI/CD | 15 Min. |
| 12 | Abschluss-Challenge | 10 Min. |
| 13 | Lessons Learned / Fragen | 5 Min. |
| **Gesamt** | | **ca. 105 Min.** |

---

# 27. Empfohlener roter Faden

Der Workshop kann unter folgende Leitfrage gestellt werden:

> **Wie können Entwickler verhindern, dass Zugangsdaten versehentlich über Git-Repositories und automatisierte Entwicklungsprozesse offengelegt werden?**

Daraus ergibt sich der rote Faden:

```text
Problem verstehen
       │
       ▼
Secrets erkennen
       │
       ▼
Git-Historie untersuchen
       │
       ▼
Funde analysieren
       │
       ▼
Funde priorisieren
       │
       ▼
Leaks vor dem Commit verhindern
       │
       ▼
CI/CD automatisieren
       │
       ▼
Lessons Learned
```

---

# 28. Quellen

## TruffleHog

- TruffleHog GitHub Repository:  
  https://github.com/trufflesecurity/trufflehog

- Truffle Security Dokumentation:  
  https://trufflesecurity.com/docs/

- TruffleHog CLI-Dokumentation:  
  https://github.com/trufflesecurity/trufflehog/blob/main/docs/man/trufflehog.1

## Historie

- Truffle Security – Series A / Entstehungsgeschichte:  
  https://trufflesecurity.com/blog/truffle-security-raises-14-million-series-a-led-by-a16z

## Vergleichswerkzeuge

- Gitleaks:  
  https://github.com/gitleaks/gitleaks

- detect-secrets:  
  https://github.com/Yelp/detect-secrets

---

# Sicherheitshinweis

> Für sämtliche Demonstrationen und Übungen sollten ausschließlich **Test-Credentials und kontrollierte Demo-Daten** verwendet werden.

Es sollten keine fremden Repositories, Accounts oder Systeme ohne entsprechende Berechtigung gescannt werden.

Echte produktive API-Keys, Tokens, Passwörter oder andere Credentials sollten nicht für Workshop-Demonstrationen verwendet werden.