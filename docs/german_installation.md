# TruffleHog – Installationsanleitung

Diese Anleitung beschreibt die Installation von **TruffleHog** unter **macOS, Windows und Linux**. Alternativ kann TruffleHog über **Docker** ausgeführt werden, wodurch eine weitgehend plattformunabhängige Nutzung möglich ist.

> **Hinweis:** Nach der Installation sollte mit `trufflehog --version` überprüft werden, ob TruffleHog korrekt installiert wurde.

---

## Inhaltsverzeichnis

1. [macOS](#1-macos)
2. [Windows](#2-windows)
3. [Linux](#3-linux)
4. [Docker](#4-docker)
5. [Installation überprüfen](#5-installation-überprüfen)
6. [Erster Filesystem-Scan](#6-erster-filesystem-scan)

---

# 1. macOS

Der einfachste Weg, TruffleHog unter macOS zu installieren, ist die Verwendung von **Homebrew**.

## Schritt 1 – Homebrew überprüfen

Öffne das Terminal und führe folgenden Befehl aus:

```bash id="13u86i"
brew --version
```

Wenn Homebrew installiert ist, wird eine Versionsnummer angezeigt.

Falls der Befehl nicht gefunden wird, muss zunächst Homebrew installiert werden:

https://brew.sh/

## Schritt 2 – TruffleHog installieren

Führe folgenden Befehl aus:

```bash id="n2oqe4"
brew install trufflehog
```

Homebrew lädt TruffleHog und die benötigten Abhängigkeiten herunter und installiert diese automatisch.

## Schritt 3 – Installation überprüfen

Führe folgenden Befehl aus:

```bash id="mbjhrd"
trufflehog --version
```

Wenn eine Versionsnummer angezeigt wird, wurde TruffleHog erfolgreich installiert.

---

# 2. Windows

Unter Windows kann TruffleHog über die offiziell bereitgestellte vorkompilierte Programmdatei installiert werden.

## Schritt 1 – TruffleHog herunterladen

Öffne die offizielle Release-Seite von TruffleHog:

https://github.com/trufflesecurity/trufflehog/releases

Unter **Assets** kann die passende Version für das eigene System heruntergeladen werden.

Für die meisten Windows-PCs:

```text id="kzbjtw"
trufflehog_*_windows_amd64.tar.gz
```

Für Windows-Geräte mit ARM-Prozessor:

```text id="t89sj6"
trufflehog_*_windows_arm64.tar.gz
```

## Schritt 2 – Archiv entpacken

Entpacke das heruntergeladene Archiv.

Darin befindet sich die Datei:

```text id="a4fq3m"
trufflehog.exe
```

Erstelle beispielsweise folgenden Ordner:

```text id="vb5mjw"
C:\Tools\TruffleHog\
```

und verschiebe `trufflehog.exe` dort hinein.

Die Ordnerstruktur sieht anschließend beispielsweise so aus:

```text id="2cxekr"
C:\
└── Tools\
    └── TruffleHog\
        └── trufflehog.exe
```

## Schritt 3 – PowerShell öffnen

Öffne **PowerShell** und navigiere zum TruffleHog-Verzeichnis:

```powershell id="ukr9zi"
cd C:\Tools\TruffleHog
```

## Schritt 4 – Installation überprüfen

Führe folgenden Befehl aus:

```powershell id="a4tzjk"
.\trufflehog.exe --version
```

Wenn eine Versionsnummer angezeigt wird, funktioniert TruffleHog korrekt.

## Optional – TruffleHog zum PATH hinzufügen

Damit TruffleHog aus jedem Verzeichnis aufgerufen werden kann, kann

```text id="ob6nki"
C:\Tools\TruffleHog
```

zur Windows-Umgebungsvariable `PATH` hinzugefügt werden.

Danach kann einfach

```powershell id="z2il4d"
trufflehog --version
```

anstelle von

```powershell id="0znkxd"
.\trufflehog.exe --version
```

verwendet werden.

---

# 3. Linux

Für Linux stellt TruffleHog ein offizielles Installationsskript bereit.

## Schritt 1 – Systemarchitektur überprüfen

Öffne ein Terminal und führe folgenden Befehl aus:

```bash id="wp8e0u"
uname -m
```

Typische Ergebnisse sind:

```text id="vgx5z4"
x86_64
```

oder:

```text id="98ws6a"
aarch64
```

TruffleHog stellt Builds für beide Architekturen bereit.

## Schritt 2 – TruffleHog installieren

Führe folgenden Befehl aus:

```bash id="3oq5qx"
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh \
  | sudo sh -s -- -b /usr/local/bin
```

Das Installationsskript lädt die passende TruffleHog-Version herunter und installiert sie unter:

```text id="fqwlb0"
/usr/local/bin
```

## Schritt 3 – Installation überprüfen

Führe folgenden Befehl aus:

```bash id="xypkwd"
trufflehog --version
```

Wenn eine Versionsnummer angezeigt wird, wurde TruffleHog erfolgreich installiert.

---

# 4. Docker

TruffleHog kann alternativ über **Docker** ausgeführt werden.

Diese Variante eignet sich besonders gut, da derselbe Container unter verschiedenen Betriebssystemen verwendet werden kann:

- macOS
- Windows
- Linux

Voraussetzung ist eine bereits vorhandene Docker-Installation.

## Schritt 1 – Docker überprüfen

Führe folgenden Befehl aus:

```bash id="92bv11"
docker --version
```

Wenn Docker installiert ist, wird eine Versionsnummer angezeigt.

## Schritt 2 – TruffleHog Docker-Image herunterladen

Führe folgenden Befehl aus:

```bash id="7xgtzz"
docker pull trufflesecurity/trufflehog:latest
```

Docker lädt anschließend das aktuelle TruffleHog-Image herunter.

## macOS / Linux

Um beispielsweise das aktuelle Verzeichnis zu scannen:

```bash id="np3hgo"
docker run --rm \
  -v "$PWD:/pwd" \
  trufflesecurity/trufflehog:latest \
  filesystem /pwd
```

Das aktuelle Verzeichnis wird dabei innerhalb des Containers unter

```text id="8w8qv6"
/pwd
```

eingebunden.

TruffleHog führt anschließend einen Filesystem-Scan dieses Verzeichnisses durch.

## Windows PowerShell

Unter Windows PowerShell:

```powershell id="9cjn8l"
docker run --rm `
  -v "${PWD}:/pwd" `
  trufflesecurity/trufflehog:latest `
  filesystem /pwd
```

---

# 5. Installation überprüfen

Bei einer nativen Installation kann die installierte Version mit folgendem Befehl überprüft werden:

```bash id="f3c9r1"
trufflehog --version
```

Zusätzlich können die verfügbaren Befehle angezeigt werden:

```bash id="ldmww7"
trufflehog --help
```

Dabei sollten unter anderem verschiedene Scan-Quellen angezeigt werden, beispielsweise:

```text id="5euwmc"
git
github
gitlab
filesystem
docker
s3
...
```

---

# 6. Erster Filesystem-Scan

Nach der Installation kann ein kleines Testverzeichnis erstellt werden.

## macOS / Linux

```bash id="4r5vlh"
mkdir trufflehog-demo
cd trufflehog-demo
```

## Windows PowerShell

```powershell id="urssb8"
mkdir trufflehog-demo
cd trufflehog-demo
```

Anschließend kann das aktuelle Verzeichnis gescannt werden:

```bash id="i2zlnh"
trufflehog filesystem .
```

TruffleHog durchsucht das Verzeichnis und dessen Unterverzeichnisse rekursiv nach unterstützten Secret-Typen.

Wenn der Scan ohne Installations- oder Ausführungsfehler abgeschlossen wird, funktioniert die Installation grundsätzlich korrekt.

---

# Plattformübersicht

| Plattform | Empfohlene Installation | Alternative |
|---|---|---|
| macOS | Homebrew | Docker |
| Windows | Vorkompilierte Binary | Docker |
| Linux | Offizielles Installationsskript | Docker |

Die verschiedenen Installationsmöglichkeiten lassen sich folgendermaßen zusammenfassen:

```text id="ujmmgg"
                    TruffleHog
                        │
          ┌─────────────┼─────────────┐
          │             │             │
        macOS         Windows        Linux
          │             │             │
      Homebrew         Binary    Installations-
          │             │           skript
          │             │             │
          └─────────────┼─────────────┘
                        │
                      Docker
                (plattformübergreifend)
```

---

# Offizielle Ressourcen

- TruffleHog GitHub Repository:  
  https://github.com/trufflesecurity/trufflehog

- TruffleHog Releases:  
  https://github.com/trufflesecurity/trufflehog/releases

- Truffle Security Dokumentation:  
  https://trufflesecurity.com/docs/

- Homebrew:  
  https://brew.sh/

---

> **Sicherheitshinweis:** Es sollten ausschließlich Repositories, Verzeichnisse, Systeme und Accounts gescannt werden, für die eine entsprechende Berechtigung vorliegt. Für Übungen und Demonstrationen sollten ausschließlich vorbereitete Test-Repositories und Test-Credentials verwendet werden.