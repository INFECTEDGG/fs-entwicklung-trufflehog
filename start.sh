#!/usr/bin/env bash
# =============================================================================
# start.sh – startet die Workshop-Website auf http://localhost:8000
# Läuft unter macOS und unter Git Bash (Windows).
# Beenden mit Strg+C.
# =============================================================================
set -eu

ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT=8000

# Passenden Python-3-Befehl suchen (unter Windows heißt er oft "python" oder "py")
PY=""
for cand in python3 python py; do
  if command -v "$cand" >/dev/null 2>&1 \
     && "$cand" -c 'import sys; sys.exit(0 if sys.version_info[0] == 3 else 1)' >/dev/null 2>&1; then
    PY="$cand"
    break
  fi
done
if [ -z "$PY" ]; then
  echo "FEHLER: Python 3 wurde nicht gefunden." >&2
  exit 1
fi

if [ ! -d "$ROOT/fall" ]; then
  echo "HINWEIS: Der Ordner fall/ fehlt noch. Bitte zuerst ./setup.sh ausführen."
fi

echo "Website läuft auf:  http://localhost:$PORT"
echo "Beenden mit Strg+C."
cd "$ROOT/website"
exec "$PY" -m http.server "$PORT" --bind 127.0.0.1
