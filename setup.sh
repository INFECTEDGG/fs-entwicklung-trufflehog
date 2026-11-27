#!/usr/bin/env bash
# =============================================================================
# setup.sh – erzeugt die Übungsordner für den TruffleHog-Workshop in ./fall/
#
# Läuft unter macOS und unter Git Bash (Windows).
# Alle Secrets sind FAKE. Sie werden hier aus Teilstücken zusammengesetzt,
# damit dieses Skript selbst nicht als Secret erkannt wird.
#
# Das Skript kann beliebig oft ausgeführt werden. Der Ordner fall/ wird
# dabei jedes Mal komplett neu erzeugt.
# =============================================================================
set -eu

ROOT="$(cd "$(dirname "$0")" && pwd)"
FALL="$ROOT/fall"

say()  { printf '%s\n' "$*"; }
fail() { printf 'FEHLER: %s\n' "$*" >&2; exit 1; }

# -----------------------------------------------------------------------------
# Voraussetzungen
# -----------------------------------------------------------------------------
command -v git >/dev/null 2>&1 || fail "git ist nicht installiert."
if ! command -v trufflehog >/dev/null 2>&1; then
  say "HINWEIS: trufflehog wurde nicht gefunden."
  say "  macOS:          brew install trufflehog"
  say "  Windows/Linux:  https://github.com/trufflesecurity/trufflehog/releases"
  say "Die Übungsordner werden trotzdem angelegt."
fi

# -----------------------------------------------------------------------------
# Fake-Secrets (zusammengesetzt, damit dieses Skript sauber bleibt)
# -----------------------------------------------------------------------------
PG="postgres"'://'
DB_HOST="db.campus-app.internal:5432"

# Level 2/3: .env in Kevins Ordner
SECRET_PG_KEVIN="${PG}campusapp:Mensa2026@${DB_HOST}/campus"
# Level 4/5: Kevins Commit in campus-app
SECRET_PG_COMMIT="${PG}campusapp:Mensa2026@${DB_HOST}/campus"
# Level 9: Datenbank-URL in der Historie von campus-app-neu
SECRET_PG_NEU="${PG}campusapp_prod:Semesterstart2027@${DB_HOST}/campus"

AK="AKIA"
# Level 2/3: backup/alt.txt
AWS_ID_KEVIN="${AK}QX7MZK4R2PLN5HTW"
AWS_SECRET_KEVIN="hT3x9Qm/Lr7vK2pWz8""Yn4bC6dF1gJ5sA0eR+uVPq"
# Level 7: tests/
AWS_ID_TEST="${AK}TE5TQ3NR7KVX2MBD"
AWS_SECRET_TEST="b8Nw2Lk5Qz/Xr9Tm4Vh""7Cp1Ys6Gd3Fj0Ha+Ue5KZ"
# Level 9: tests/
AWS_ID_TEST2="${AK}TE5TW4PL6ZRM3QYC"
AWS_SECRET_TEST2="Zq4Rt8Wn1Yp6Hs3Lk7Mv""2Xb9Cd5Fg0Jh+Ae/Tu8N"

SK="sk_""live_"
# Level 7: src/payment.py (der echte Fund)
STRIPE_PAYMENT="${SK}51Pq8RtLmX4vKz2NwY7hB3jD9cF6gS1aE5uQ0oT"
# Level 8: geheim.txt
STRIPE_GEHEIM="${SK}51Hk3MvQz8RpL2xT7nW4yC9bF6dJ1gS5aE0uK2o"

SG="SG"'.'
# Level 7: tests/
SENDGRID_TEST="${SG}Xk7Rp2Lm9Qz4Vt8Nw3Yh6B.Jd5Fc1Gs0Ae4Uo7Ki2Mn9Pq3Rt8Wv6Xz1Yb5Cd0Fe"
# Level 9: tests/
SENDGRID_TEST2="${SG}Ab3Cd8Ef2Gh7Ij1Kl6Mn4Op.Qr9St5Uv0Wx3Yz8Ab2Cd7Ef1Gh6Ij4Kl0Mn5Op9Qr"

SLACK="https://hooks.slack"".com/services"
# Level 7: tests/
SLACK_TEST="${SLACK}/T04TESTDATA/B05TESTDATA/Xk7Rp2Lm9Qz4Vt8Nw3Yh6Bj1"

# -----------------------------------------------------------------------------
# Hilfsfunktionen für Git
# -----------------------------------------------------------------------------
# Neues Git-Projekt anlegen, unabhängig von der globalen Git-Konfiguration
new_repo() {
  mkdir -p "$1"
  git -C "$1" init -q
  git -C "$1" symbolic-ref HEAD refs/heads/main
  git -C "$1" config core.autocrlf false
  git -C "$1" config commit.gpgsign false
}

# commit <repo> "<Name>" "<E-Mail>" "<Datum ISO>" "<Nachricht>"
commit() {
  git -C "$1" add -A
  GIT_AUTHOR_NAME="$2"    GIT_AUTHOR_EMAIL="$3"    GIT_AUTHOR_DATE="$4" \
  GIT_COMMITTER_NAME="$2" GIT_COMMITTER_EMAIL="$3" GIT_COMMITTER_DATE="$4" \
    git -C "$1" commit -q --no-verify -m "$5"
}

LENA_N="Lena Hoffmann";  LENA_M="lena.hoffmann@campus-app.example"
KEVIN_N="Kevin Maier";   KEVIN_M="kevin.maier@campus-app.example"
JONAS_N="Jonas Weber";   JONAS_M="jonas.weber@campus-app.example"

# Privaten Schlüssel erzeugen (frisch generiert, wird nirgends benutzt)
make_private_key() {
  if command -v ssh-keygen >/dev/null 2>&1; then
    ssh-keygen -q -t rsa -b 2048 -m PEM -N "" -C "" -f "$1" </dev/null >/dev/null
    rm -f "$1.pub"
  elif command -v openssl >/dev/null 2>&1; then
    openssl genrsa -traditional -out "$1" 2048 2>/dev/null || openssl genrsa -out "$1" 2048 2>/dev/null
  else
    fail "Weder ssh-keygen noch openssl gefunden."
  fi
}

# -----------------------------------------------------------------------------
# Start: fall/ neu anlegen
# -----------------------------------------------------------------------------
say "Lege Übungsordner in $FALL an ..."
rm -rf "$FALL"
mkdir -p "$FALL"

# =============================================================================
# Level 2/3 – fall/kevins-ordner (KEIN Git-Projekt)
# =============================================================================
K="$FALL/kevins-ordner"
mkdir -p "$K/backup"

cat > "$K/README.md" <<'EOF'
# Campus-App – Arbeitskopie Kevin Maier

Lokale Kopie des Projektordners. Enthält Konfiguration und alte Notizen.
EOF

cat > "$K/app.py" <<'EOF'
# Campus-App: Startpunkt
from flask import Flask

app = Flask(__name__)

# Admin-Zugang für die Testumgebung
ADMIN_USER = "admin"
ADMIN_PASSWORD = "Lernraum123"


@app.route("/")
def index():
    return "Campus-App läuft"
EOF

cat > "$K/.env" <<EOF
# Lokale Einstellungen
APP_ENV=development
DATABASE_URL=$SECRET_PG_KEVIN
EOF

cat > "$K/backup/alt.txt" <<EOF
Alte Notizen (Oktober)

Zugang für den Speicher der Mensa-Bilder:
aws_access_key_id = $AWS_ID_KEVIN
aws_secret_access_key = $AWS_SECRET_KEVIN
EOF

# =============================================================================
# Level 4/5 – fall/campus-app (Git-Projekt)
# =============================================================================
C="$FALL/campus-app"
new_repo "$C"

cat > "$C/README.md" <<'EOF'
# Campus-App

App für Studierende der Hochschule Heilbronn:
Mensaplan, freie Lernräume und Mensa-Guthaben.
EOF
cat > "$C/app.py" <<'EOF'
from config import DATABASE_URL

def main():
    print("Campus-App startet ...")

if __name__ == "__main__":
    main()
EOF
cat > "$C/config.py" <<'EOF'
# Konfiguration der Campus-App
DEBUG = False
EOF
commit "$C" "$LENA_N" "$LENA_M" "2026-11-02T10:15:00+01:00" "Projekt angelegt"

cat > "$C/mensaplan.py" <<'EOF'
def mensaplan_heute():
    return ["Linsen mit Spätzle", "Gemüsecurry", "Salatbar"]
EOF
commit "$C" "$LENA_N" "$LENA_M" "2026-11-05T14:40:00+01:00" "Mensaplan hinzugefügt"

cat > "$C/lernraeume.py" <<'EOF'
def freie_lernraeume():
    return ["A-101", "B-204", "F-012"]
EOF
commit "$C" "$JONAS_N" "$JONAS_M" "2026-11-12T09:05:00+01:00" "Freie Lernräume anzeigen"

cat > "$C/config.py" <<EOF
# Konfiguration der Campus-App
DEBUG = False
DATABASE_URL = "$SECRET_PG_COMMIT"
EOF
commit "$C" "$KEVIN_N" "$KEVIN_M" "2026-11-20T19:47:00+01:00" "Datenbankverbindung eingerichtet"

cat > "$C/config.py" <<'EOF'
# Konfiguration der Campus-App
import os

DEBUG = False
DATABASE_URL = os.environ.get("DATABASE_URL")
EOF
commit "$C" "$KEVIN_N" "$KEVIN_M" "2026-11-21T11:12:00+01:00" "Zugangsdaten aus config.py entfernt"

# =============================================================================
# Level 6 – fall/test_keys (offizielles Übungsrepo von Truffle Security)
# =============================================================================
say "Lade fall/test_keys von GitHub ..."
if ! git clone -q https://github.com/trufflesecurity/test_keys "$FALL/test_keys"; then
  say "WARNUNG: test_keys konnte nicht geladen werden (Internet?). Level 6 funktioniert dann nicht."
fi

# =============================================================================
# Level 7 – fall/mensa-guthaben (Git-Projekt)
# =============================================================================
M="$FALL/mensa-guthaben"
new_repo "$M"
mkdir -p "$M/src" "$M/tests"

cat > "$M/README.md" <<'EOF'
# Mensa-Guthaben

Funktion "Mensa-Guthaben aufladen" der Campus-App.
EOF
cat > "$M/src/app.py" <<'EOF'
from payment import guthaben_aufladen

def main():
    guthaben_aufladen(matrikelnummer="000000", betrag_euro=10)
EOF
cat > "$M/src/payment.py" <<EOF
# Zahlungsanbindung für das Aufladen des Mensa-Guthabens
STRIPE_API_KEY = "$STRIPE_PAYMENT"


def guthaben_aufladen(matrikelnummer, betrag_euro):
    print(f"Lade {betrag_euro} EUR für {matrikelnummer} auf ...")
EOF
commit "$M" "$LENA_N" "$LENA_M" "2026-11-09T13:20:00+01:00" "Zahlung über Stripe angebunden"

cat > "$M/tests/test_aws.py" <<EOF
# Testdaten: Beispiel-Zugang für den Belegspeicher
AWS_ACCESS_KEY_ID = "$AWS_ID_TEST"
AWS_SECRET_ACCESS_KEY = "$AWS_SECRET_TEST"
EOF
cat > "$M/tests/test_mail.py" <<EOF
# Testdaten: Beispiel-Schlüssel für die Bestätigungsmail
SENDGRID_API_KEY = "$SENDGRID_TEST"
EOF
cat > "$M/tests/test_benachrichtigung.py" <<EOF
# Testdaten: Beispiel-Webhook für Benachrichtigungen
SLACK_WEBHOOK_URL = "$SLACK_TEST"
EOF
commit "$M" "$JONAS_N" "$JONAS_M" "2026-11-10T16:05:00+01:00" "Tests mit Beispieldaten ergänzt"

# =============================================================================
# Level 8 – fall/hook-uebung (Git-Projekt mit Pre-Commit-Hook)
# =============================================================================
H="$FALL/hook-uebung"
new_repo "$H"
mkdir -p "$H/hooks"

cat > "$H/README.md" <<'EOF'
# Übung: Pre-Commit-Hook

Der Hook in hooks/pre-commit prüft vor jedem Commit die vorgemerkten
Dateien mit TruffleHog. Wird ein Secret gefunden, bricht der Commit ab.
EOF

cat > "$H/hooks/pre-commit" <<'EOF'
#!/bin/sh
# Pre-Commit-Hook: prüft alle vorgemerkten (gestagten) Dateien mit TruffleHog.
# Wird ein Secret gefunden, wird der Commit abgebrochen.

if ! command -v trufflehog >/dev/null 2>&1; then
  echo "Pre-Commit-Hook: trufflehog ist nicht installiert. Commit abgebrochen."
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Vorgemerkte Fassung jeder Datei in einen temporären Ordner kopieren
git diff --cached --name-only --diff-filter=ACMR | while IFS= read -r f; do
  mkdir -p "$TMP/$(dirname "$f")"
  git show ":$f" > "$TMP/$f"
done

if [ -z "$(ls -A "$TMP")" ]; then
  exit 0
fi

echo "Pre-Commit-Hook: prüfe vorgemerkte Dateien mit TruffleHog ..."
cd "$TMP" || exit 1
trufflehog filesystem . --fail --no-update
status=$?

if [ "$status" -eq 183 ]; then
  echo ""
  echo "Pre-Commit-Hook: Secret gefunden. Commit abgebrochen."
  exit 1
elif [ "$status" -ne 0 ]; then
  echo "Pre-Commit-Hook: TruffleHog-Fehler (Code $status). Commit abgebrochen."
  exit 1
fi

echo "Pre-Commit-Hook: keine Secrets gefunden."
exit 0
EOF
chmod +x "$H/hooks/pre-commit"
commit "$H" "$LENA_N" "$LENA_M" "2026-11-23T09:00:00+01:00" "Pre-Commit-Hook hinzugefügt"

# Diese beiden Dateien bleiben absichtlich uncommittet
cat > "$H/geheim.txt" <<EOF
Zahlungsschlüssel für die Mensa-Kasse:
$STRIPE_GEHEIM
EOF
cat > "$H/harmlos.txt" <<'EOF'
Öffnungszeiten Mensa: Mo–Fr 11:30–14:00 Uhr
EOF

# =============================================================================
# Level 9 – fall/campus-app-neu (Git-Projekt)
# =============================================================================
N="$FALL/campus-app-neu"
new_repo "$N"
mkdir -p "$N/deploy" "$N/tests"

cat > "$N/README.md" <<'EOF'
# Campus-App (neue Version)

Version für den Semesterstart.
EOF
cat > "$N/config.py" <<'EOF'
import os

DATABASE_URL = os.environ.get("DATABASE_URL")
EOF
commit "$N" "$LENA_N" "$LENA_M" "2026-11-16T10:00:00+01:00" "Neue Version angelegt"

make_private_key "$N/deploy/server.key"
cat > "$N/deploy/README.md" <<'EOF'
Schlüssel für den Zugang zum Server.
EOF
commit "$N" "$JONAS_N" "$JONAS_M" "2026-11-17T15:30:00+01:00" "Deployment vorbereitet"

cat > "$N/config.py" <<EOF
import os

DATABASE_URL = "$SECRET_PG_NEU"
EOF
commit "$N" "$JONAS_N" "$JONAS_M" "2026-11-18T18:10:00+01:00" "Datenbank für Produktion eingetragen"

cat > "$N/config.py" <<'EOF'
import os

DATABASE_URL = os.environ.get("DATABASE_URL")
EOF
commit "$N" "$JONAS_N" "$JONAS_M" "2026-11-19T08:45:00+01:00" "Konfiguration aufgeräumt"

cat > "$N/tests/test_upload.py" <<EOF
# Testdaten: Beispiel-Zugang für Bild-Uploads
AWS_ACCESS_KEY_ID = "$AWS_ID_TEST2"
AWS_SECRET_ACCESS_KEY = "$AWS_SECRET_TEST2"
EOF
cat > "$N/tests/test_mail.py" <<EOF
# Testdaten: Beispiel-Schlüssel für Mails
SENDGRID_API_KEY = "$SENDGRID_TEST2"
EOF
commit "$N" "$LENA_N" "$LENA_M" "2026-11-20T11:30:00+01:00" "Tests ergänzt"

# -----------------------------------------------------------------------------
say ""
say "Fertig. Übungsordner:"
for d in "$FALL"/*; do say "  fall/$(basename "$d")"; done
say ""
say "Website starten mit:  ./start.sh"
