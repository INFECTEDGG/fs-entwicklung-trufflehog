# Aufgabe 5 – CI/CD

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