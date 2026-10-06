# 🐷 TruffleHog – Secret Scanning in DevSecOps

> Studentisches Fallstudienprojekt im 4. Semester des Bachelorstudiengangs Wirtschaftsinformatik an der Hochschule Heilbronn.

Dieses Repository beschäftigt sich mit **TruffleHog**, einem Open-Source-Tool zur Erkennung von Secrets und Credentials in Quellcode, Git-Repositories und weiteren Datenquellen.

Im Rahmen der Fallstudie werden die Funktionsweise, Einsatzmöglichkeiten und Integration von TruffleHog in moderne Softwareentwicklungs- und DevSecOps-Prozesse untersucht und praktisch demonstriert.

---

## 🎯 Ziel des Projekts

Ziel ist es, TruffleHog sowohl theoretisch als auch praktisch kennenzulernen und typische Einsatzszenarien für **Secret Scanning** innerhalb des Software Development Lifecycle (SDLC) zu untersuchen.

Dabei beschäftigen wir uns unter anderem mit folgenden Fragen:

- Was sind Secrets und warum stellen geleakte Credentials ein Sicherheitsrisiko dar?
- Wie erkennt TruffleHog Secrets?
- Welche Datenquellen können gescannt werden?
- Wie können Secrets in Dateien und Git-Repositories gefunden werden?
- Können bereits gelöschte Secrets weiterhin in der Git-Historie gefunden werden?
- Was ist der Unterschied zwischen erkannten und verifizierten Secrets?
- Wie lässt sich TruffleHog in Entwicklungsprozesse integrieren?
- Wie kann Secret Scanning automatisiert werden?
- Welche Rolle spielt TruffleHog innerhalb von DevSecOps und Shift-Left-Security?
- Welche Grenzen und False Positives gibt es?

---

## 🔎 Was ist TruffleHog?

**TruffleHog** ist ein Open-Source-Tool zur Erkennung von Zugangsdaten und anderen sensiblen Informationen.

Es kann verschiedene Datenquellen nach potenziell kompromittierten Secrets durchsuchen, beispielsweise:

- lokale Dateien und Verzeichnisse
- Git-Repositories und deren Commit-Historie
- GitHub
- GitLab
- Docker-Images
- Cloud-Speicher
- CI/CD-Systeme

Typische Secrets sind beispielsweise:

```text
API Keys
Access Tokens
Private Keys
Database Credentials
Cloud Credentials
Authentication Tokens
```

Eine Besonderheit von TruffleHog ist, dass unterstützte Credentials nicht nur **erkannt**, sondern teilweise auch **verifiziert** werden können.

---

## ⚠️ Warum Secret Scanning?

Während der Softwareentwicklung können Zugangsdaten versehentlich im Quellcode landen.

Ein typisches Beispiel:

```python
API_KEY = "example-secret-key"
```

Wird eine solche Datei anschließend mit Git committed, kann das Secret Teil der Repository-Historie werden.

Selbst wenn der Entwickler das Secret später aus der aktuellen Datei entfernt, kann es weiterhin in einem älteren Commit vorhanden sein:

```text
Secret wird erstellt
        │
        ▼
Secret wird committed
        │
        ▼
Secret wird entdeckt
        │
        ▼
Secret wird aus der Datei gelöscht
        │
        ▼
Neuer Commit
        │
        ▼
Secret befindet sich weiterhin
in der Git-Historie
```

Secret-Scanning-Tools wie TruffleHog sollen solche Probleme erkennen und möglichst früh im Entwicklungsprozess verhindern.

---

## 🛡️ TruffleHog im DevSecOps-Prozess

TruffleHog kann an unterschiedlichen Stellen des Software Development Lifecycle eingesetzt werden.

```text
Developer
    │
    ▼
Source Code
    │
    ▼
Pre-Commit Scan
    │
    ▼
Git Repository
    │
    ▼
CI/CD Pipeline
    │
    ▼
TruffleHog Scan
    │
    ├── Secret gefunden ──► Pipeline stoppen
    │
    └── Kein Secret ──────► Build / Test / Deploy
```

Dadurch können Sicherheitsprüfungen frühzeitig in den Entwicklungsprozess integriert werden.

Dieses Vorgehen wird häufig dem Prinzip **Shift Left Security** zugeordnet.

---

## 🧪 Inhalte der Fallstudie

Im Rahmen des Projekts betrachten wir verschiedene Funktionen von TruffleHog praktisch.

### Filesystem Scanning

Scannen lokaler Dateien und Verzeichnisse:

```bash
trufflehog filesystem .
```

### Git Repository Scanning

Untersuchung von Git-Repositories und deren Historie.

Dabei wird unter anderem demonstriert, dass ein Secret weiterhin gefunden werden kann, obwohl es aus der aktuellen Version einer Datei bereits entfernt wurde.

### Secret Detection

Analyse der verschiedenen Möglichkeiten, mit denen TruffleHog potenzielle Secrets erkennen kann.

### Secret Verification

Untersuchung des Unterschieds zwischen:

```text
Detected Secret
       │
       ▼
┌──────────────┐
│ Verification │
└──────┬───────┘
       │
   ┌───┴───┐
   ▼       ▼
Verified  Unverified
```

### Pre-Commit Scanning

Secret Scanning kann bereits vor einem Git-Commit eingesetzt werden.

```text
Developer
    │
    ▼
git commit
    │
    ▼
TruffleHog
    │
    ├── Secret ──────► Commit verhindern
    │
    └── Kein Secret ─► Commit durchführen
```

### CI/CD Integration

TruffleHog kann in CI/CD-Pipelines integriert werden, um Repositories automatisiert auf Secrets zu überprüfen.

Dadurch können beispielsweise Builds oder Deployments verhindert werden, wenn ein Secret erkannt wird.

### Docker

TruffleHog kann außerdem als Docker-Container ausgeführt werden.

Dadurch lässt sich das Tool weitgehend unabhängig vom verwendeten Betriebssystem einsetzen.

---

## 💻 Unterstützte Plattformen

| Plattform | Installation |
|---|---|
| macOS | Homebrew / Binary / Docker |
| Windows | Binary / Docker |
| Linux | Installationsskript / Binary / Docker |

Eine detaillierte Installationsanleitung befindet sich unter [`docs/installation.md`](docs/installation.md).

---

## 📁 Repository-Struktur

```text
.
├── README.md
├── docs/
│   ├── installation.md
│   ├── filesystem-scanning.md
│   ├── git-scanning.md
│   └── ci-cd-integration.md
├── demo/
│   └── ...
└── exercises/
    └── ...
```

- **`docs/`** – Dokumentationen und Anleitungen zu TruffleHog.
- **`demo/`** – Vorbereitete Beispiele für Live-Demonstrationen.
- **`exercises/`** – Übungen zum selbstständigen Ausprobieren der Funktionen.

---

## 🚀 Quick Start

### 1. Repository klonen

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. TruffleHog installieren

Die Installationsanleitung für macOS, Windows, Linux und Docker befindet sich unter [`docs/installation.md`](docs/installation.md).

### 3. Installation überprüfen

```bash
trufflehog --version
```

### 4. Filesystem Scan durchführen

```bash
trufflehog filesystem .
```

---

## 🧑‍💻 Verwendete Technologien und Konzepte

- TruffleHog
- Git
- GitHub
- Docker
- CI/CD
- DevSecOps
- Secret Scanning
- Credential Detection
- Credential Verification
- Pre-Commit Hooks
- Shift Left Security

---

## 🔐 Sicherheitshinweis

> **Dieses Repository dient ausschließlich Lehr- und Demonstrationszwecken.**

Für Übungen und Demonstrationen sollten ausschließlich dafür vorgesehene **Testdaten und Test-Credentials** verwendet werden.

Es dürfen keine fremden Systeme, Accounts oder Repositories ohne entsprechende Berechtigung gescannt werden.

Echte Zugangsdaten, API-Keys, Tokens oder andere produktive Secrets dürfen **nicht für Demonstrationen verwendet oder in dieses Repository committed werden**.

---

## 🎓 Hochschulprojekt

Dieses Repository wurde im Rahmen einer **Fallstudie im 4. Semester des Bachelorstudiengangs Wirtschaftsinformatik an der Hochschule Heilbronn** erstellt.

Ziel ist die praktische Auseinandersetzung mit einem modernen Entwicklungswerkzeug sowie die Vermittlung grundlegender Konzepte aus den Bereichen:

**Softwareentwicklung · IT-Security · DevSecOps · Git · CI/CD**

---

## 🔗 Weiterführende Informationen

- TruffleHog GitHub Repository: https://github.com/trufflesecurity/trufflehog
- Truffle Security Dokumentation: https://trufflesecurity.com/docs/
- TruffleHog Releases: https://github.com/trufflesecurity/trufflehog/releases

---

## 📄 Lizenz

Dieses Repository wurde zu Lehrzwecken im Rahmen einer Hochschulveranstaltung erstellt.

TruffleHog selbst wird als Open-Source-Software unter der **GNU Affero General Public License v3.0 (AGPL-3.0)** veröffentlicht.

Weitere Informationen befinden sich im offiziellen TruffleHog Repository.
