# Aufgabe 2 – Das verschwundene Secret

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