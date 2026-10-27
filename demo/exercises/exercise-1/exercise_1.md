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