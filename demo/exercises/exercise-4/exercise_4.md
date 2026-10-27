# Aufgabe 4 – Pre-Commit

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