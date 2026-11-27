"use strict";

/* ===========================================================================
   Workshop-Website: Datenleck bei der Campus-App
   - Lösungswörter sind nur als SHA-256-Hash gespeichert ("campus-app:" + Wort)
   - Tipp 1 sofort, Tipp 2 nach 3 Minuten, Anleitung nach 6 Minuten
   - Fortschritt bleibt im Browser (localStorage) gespeichert
   =========================================================================== */

const SALT = "campus-app:";
const TIP2_AFTER = 3 * 60 * 1000;
const TIP3_AFTER = 6 * 60 * 1000;
const STORAGE_KEY = "campusapp-workshop-v1";

/* ---------- Hilfen zum Schreiben der Inhalte ---------- */
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function cmd(text) {
  return `<div class="codeblock"><pre><code>${esc(text)}</code></pre><button class="copy" type="button">Kopieren</button></div>`;
}

/* ---------- Story ---------- */
const STORY = `
  <p>Ein Studierendenteam der Hochschule Heilbronn entwickelt die <strong>Campus-App</strong>. Die App zeigt den Mensaplan und freie Lernräume an, außerdem kann man darüber das Mensa-Guthaben aufladen.</p>
  <p>Am Freitagabend hat der Werkstudent <strong>Kevin Maier</strong> die Zugangsdaten zur Datenbank der App in eine Konfigurationsdatei geschrieben, committet und gepusht. Am Samstag hat er die Zugangsdaten wieder aus der Datei gelöscht.</p>
  <p>Am Montag stellt das Team fest, dass sich am Wochenende jemand Unbekanntes an der Datenbank angemeldet und die Nutzerdaten (Namen und E-Mail-Adressen) heruntergeladen hat.</p>
  <p><strong>Prof. Brenner</strong>, die das Projekt betreut, beauftragt euch als Security-Team:</p>
  <ol>
    <li>Findet heraus, wie es zu dem Vorfall kommen konnte.</li>
    <li>Sorgt dafür, dass so etwas nicht noch einmal passiert.</li>
  </ol>`;

/* ---------- Level ----------
   Level 1 ("Ein Secret pushen") ist noch offen (Option A/B) und kann
   später einfach vorne in dieses Array eingefügt werden.            */
const LEVELS = [
  {
    nr: 2, part: "Teil 2: Die Untersuchung", title: "Kevins Projektordner prüfen",
    story: `<p>Ihr habt eine Kopie von Kevins Projektordner bekommen. Prüft, ob dort Zugangsdaten gespeichert sind.</p>`,
    task: `
      <ol>
        <li>Schaut euch die Dateien im Ordner <code>fall/kevins-ordner/</code> an.</li>
        <li>Scannt den Ordner mit TruffleHog:</li>
      </ol>
      ${cmd("trufflehog filesystem fall/kevins-ordner/")}`,
    question: "Einer der Funde liegt nicht direkt in kevins-ordner, sondern in einem weiteren Ordner darin. Wie heißt dieser Ordner?",
    hashes: ["51aae8e136af00982ece0175c72e5e911b675c82ceac5260545d8b17f275c786"],
    tips: [
      `<p>Achtet im Output auf die Zeile <code>File:</code>.</p>`,
      `<p>Vergleicht die beiden Pfade: Bei einem Fund steht zwischen <code>kevins-ordner/</code> und dem Dateinamen noch ein weiterer Ordner.</p>`,
      `<p>Befehl ausführen und bei den Funden die Zeilen <code>File:</code> lesen:</p><ul><li><code>fall/kevins-ordner/.env</code>: liegt direkt in <code>kevins-ordner</code></li><li><code>fall/kevins-ordner/backup/alt.txt</code>: liegt im Ordner <code>backup</code></li></ul>`
    ]
  },
  {
    nr: 3, part: "Teil 2: Die Untersuchung", title: "Ergebnisse auswerten",
    story: `<p>Wertet die Funde aus Level 2 genauer aus.</p>`,
    task: `
      <p>Beantwortet für jeden Fund:</p>
      <ul>
        <li>Um welche Art von Secret handelt es sich? (<code>Detector Type</code>)</li>
        <li>In welcher Datei liegt es?</li>
        <li>Ist es <code>verified</code> oder <code>unverified</code>?</li>
      </ul>`,
    question: "Welcher Detector Type wurde für die Datei .env angezeigt?",
    hashes: ["686d7ae35ba64795128f9ef3667d203cb68720a3b9da655630474d9ddd1c414b"],
    tips: [
      `<p>Jeder Fund im Output hat eine Zeile <code>Detector Type</code>.</p>`,
      `<p>Sucht den Fund, bei dem unter <code>File:</code> die Datei <code>.env</code> steht.</p>`,
      `<p>Scan aus Level 2 erneut ausführen:</p>${cmd("trufflehog filesystem fall/kevins-ordner/")}<p>Beim Fund mit <code>File: fall/kevins-ordner/.env</code> steht <code>Detector Type: Postgres</code>.</p>`
    ]
  },
  {
    nr: 4, part: "Teil 2: Die Untersuchung", title: "Den Commit finden",
    story: `<p>Untersucht jetzt das Git-Projekt der Campus-App. Git speichert zu jeder Änderung, wer sie wann gemacht hat.</p>`,
    task: `
      <p>Scannt den Ordner <code>fall/campus-app</code> und findet heraus, wer die Zugangsdaten wann in welche Datei committet hat.</p>
      ${cmd("trufflehog git file://fall/campus-app")}`,
    question: "Wie lautet der Vorname der Person, die die Zugangsdaten committet hat?",
    hashes: ["7447a830b2226d692f1490d43d748597fbd897e8767fd57cb6f2a5203c6f1210"],
    tips: [
      `<p>TruffleHog zeigt bei Git-Scans zusätzliche Informationen zu jedem Commit an.</p>`,
      `<p>Achtet auf die Zeile <code>Email:</code>.</p>`,
      `<p>Befehl ausführen:</p>${cmd("trufflehog git file://fall/campus-app")}<p>Beim Fund steht <code>Email: Kevin Maier &lt;kevin.maier@campus-app.example&gt;</code>.</p>`
    ]
  },
  {
    nr: 5, part: "Teil 2: Die Untersuchung", title: "Gelöschte Secrets in der Historie",
    story: `<p>Kevin gibt an, dass er die Zugangsdaten am Samstag gelöscht hat.</p>`,
    task: `
      <ol>
        <li>Öffnet <code>fall/campus-app/config.py</code>. Stehen dort noch Zugangsdaten?</li>
        <li>Überlegt, warum TruffleHog sie trotzdem gefunden hat.</li>
      </ol>`,
    question: "Löschen reicht nicht. Was muss mit dem Passwort passieren? (ein Wort)",
    hashes: [
      "08f66c6ec12d1b78e9073d69f5845b665dffc825654db0f6c84518e28e10ce2c", // aendern
      "60a4691be9bcdd522fa69a99abd8319547a6e7742b411909b167a80e7c24eb43"  // ändern
    ],
    tips: [
      `<p>Das Passwort ist noch in einem älteren Commit gespeichert. Jeder mit Zugriff kann es lesen.</p>`,
      `<p>Wie sorgt man dafür, dass ein bekanntes Passwort nicht mehr funktioniert?</p>`,
      `<p>Ein geleaktes Passwort gilt als bekannt. Es muss <strong>geändert</strong> werden, damit es nicht mehr benutzt werden kann.</p>`
    ]
  },
  {
    nr: 6, part: "Teil 2: Die Untersuchung", title: "Verifizierte Secrets",
    story: `<p>TruffleHog kann bei vielen Diensten prüfen, ob gefundene Zugangsdaten noch gültig sind. Probiert das an einem offiziellen Übungsprojekt von Truffle Security aus.</p>`,
    task: `
      <ol>
        <li>Scannt den Ordner <code>fall/test_keys</code>.</li>
        <li>Lasst euch nur die verifizierten Funde anzeigen.</li>
      </ol>`,
    question: "Welcher Detector Type wurde für die Datei new_key als verified angezeigt?",
    hashes: ["8a9364688964bb6cd196da539fd4b1f576e610e6bbcae6dfae1713fd875559c5"],
    tips: [
      `<p>Der Scan funktioniert wie in Level 4, nur mit einem anderen Ordner.</p>`,
      `<p>Mit der Option <code>--results=verified</code> seht ihr nur gültige Funde.</p>`,
      `<p>Befehl ausführen:</p>${cmd("trufflehog git file://fall/test_keys --results=verified")}<p>Beim Fund mit <code>File: new_key</code> steht <code>Detector Type: AWS</code>.</p>`
    ]
  },
  {
    nr: 7, part: "Teil 2: Die Untersuchung", title: "Testdaten herausfiltern",
    story: `<p>Für die Funktion „Mensa-Guthaben aufladen“ gibt es ein eigenes Projekt. Darin liegen viele Testdateien mit Beispiel-Schlüsseln.</p>`,
    task: `
      <ol>
        <li>Scannt den Ordner <code>fall/mensa-guthaben</code>. Wie viele Funde gibt es?</li>
        <li>Schließt den Ordner <code>tests/</code> vom Scan aus. Was bleibt übrig?</li>
      </ol>`,
    question: "Wie heißt die Datei mit dem echten Fund (ohne Endung)?",
    hashes: ["5f4ec848b1169cbeec20a30a74d60e65d09aaa0de2ad173fee2e46f62da1a2bd"],
    tips: [
      `<p>Die meisten Funde liegen im Ordner <code>tests/</code>. Die sind nur Testdaten.</p>`,
      `<p>Mit der Option <code>--exclude-paths</code> könnt ihr Ordner vom Scan ausschließen. Die Option braucht eine Datei, in der die Ordner stehen.</p>`,
      `<p>Befehle ausführen:</p>${cmd('echo "tests/" > ignorieren.txt\ntrufflehog git file://fall/mensa-guthaben --exclude-paths=ignorieren.txt')}<p>Übrig bleibt der Fund in <code>src/payment.py</code>.</p>`
    ]
  },
  {
    nr: 8, part: "Teil 3: Vorbeugung", title: "Pre-Commit-Hook",
    story: `<p>Ein Pre-Commit-Hook prüft jeden Commit, bevor er gespeichert wird. So gelangen Secrets gar nicht erst ins Repo.</p>`,
    task: `
      <p>Wechselt in den Ordner <code>fall/hook-uebung</code>:</p>
      ${cmd("cd fall/hook-uebung")}
      <ol>
        <li>Aktiviert den Pre-Commit-Hook.</li>
        <li>Versucht, die Datei <code>geheim.txt</code> zu committen.</li>
        <li>Committet die Datei <code>harmlos.txt</code>.</li>
      </ol>`,
    question: "Welcher Detector Type hat den Commit von geheim.txt blockiert?",
    hashes: ["513c691187653f0b37a37bf71b8901a68d791ee8e3f6e43dc471d4cfadb660e1"],
    tips: [
      `<p>Der Hook liegt bereits im Ordner <code>hooks/</code>. Git muss nur wissen, dass es ihn benutzen soll.</p>`,
      `<p>Mit <code>git config core.hooksPath hooks</code> aktiviert ihr den Hook.</p>`,
      `<p>Im Ordner <code>fall/hook-uebung</code> ausführen:</p>${cmd('git config core.hooksPath hooks\ngit add geheim.txt\ngit commit -m "Test"')}<p>Der Commit wird abgebrochen. In der Ausgabe steht <code>Detector Type: Stripe</code>.</p><p>Danach <code>geheim.txt</code> wieder aus dem Commit nehmen und <code>harmlos.txt</code> committen:</p>${cmd('git restore --staged geheim.txt\ngit add harmlos.txt\ngit commit -m "Öffnungszeiten ergänzt"')}<p>Zum Schluss zurück in den Hauptordner: <code>cd ../..</code></p>`
    ]
  },
  {
    nr: 9, part: "Teil 3: Vorbeugung", title: "Abschlussbericht",
    story: `<p>Die Campus-App soll zum Semesterstart wieder online gehen. Vorher soll die neue Version vollständig geprüft werden.</p>`,
    task: `
      <p>Scannt den Ordner <code>fall/campus-app-neu</code> und beantwortet:</p>
      <ol>
        <li>Welche Secrets habt ihr gefunden? (Typ, Datei)</li>
        <li>Welche sind echte Zugangsdaten, welche sind Testdaten?</li>
        <li>Welche Maßnahmen muss das Team ergreifen, bevor die App wieder online geht?</li>
      </ol>
      <p>Frage 3 besprechen wir am Ende gemeinsam.</p>`,
    question: "Wie viele echte Secrets (ohne Testdaten) habt ihr gefunden?",
    hashes: ["cf28f311a0118c1d0c3596a53e52e2dfbed681f79f0c340eedba4078495b132a"],
    tips: [
      `<p>Ihr kennt alle nötigen Befehle schon aus den vorherigen Leveln.</p>`,
      `<p>Denkt an die Git-Historie (Level 4) und an Testdaten (Level 7).</p>`,
      `<p>Befehle ausführen:</p>${cmd('echo "tests/" > ignorieren.txt\ntrufflehog git file://fall/campus-app-neu --exclude-paths=ignorieren.txt')}<p>Übrig bleiben 2 Funde: ein privater Server-Schlüssel und eine Datenbank-URL.</p>`
    ]
  }
];

const FINALE = `
  <h2>Auflösung</h2>
  <p>Der Angreifer hat die Zugangsdaten aus Kevins altem Commit verwendet, um sich an der Datenbank anzumelden.</p>
  <h2>Zusammenfassung</h2>
  <ol>
    <li>Zugangsdaten gehören nicht in den Code.</li>
    <li>Ein gelöschtes Secret ist in der Git-Historie weiterhin vorhanden, deshalb muss es geändert werden.</li>
    <li><code>verified</code> bedeutet, dass die Zugangsdaten gültig sind. Diese Funde haben Vorrang.</li>
    <li>Nicht jeder Fund ist ein echtes Secret.</li>
    <li>Pre-Commit-Hook und CI-Pipeline helfen, Secrets frühzeitig abzufangen.</li>
  </ol>
  <p>Die Maßnahmen aus Level 9 besprechen wir jetzt gemeinsam.</p>`;

/* ---------- Zustand ---------- */
function defaultState() {
  return { page: "start", started: false, solved: {}, openedAt: {}, tipsShown: {} };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* Speicher nicht verfügbar */ }
  return defaultState();
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignorieren */ }
}
let state = loadState();

/* ---------- Freischaltung ---------- */
function isUnlocked(i) {
  if (!state.started) return false;
  return i === 0 || !!state.solved[LEVELS[i - 1].nr];
}
function allSolved() {
  return LEVELS.every(l => state.solved[l.nr]);
}
function pageAllowed(page) {
  if (page === "start") return true;
  if (page === "finale") return allSolved();
  const i = LEVELS.findIndex(l => "level-" + l.nr === page);
  return i >= 0 && isUnlocked(i);
}

/* ---------- Hash ---------- */
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function normalize(answer) {
  return answer.normalize("NFC").trim().toLowerCase().replace(/^["'`]+|["'`.]+$/g, "");
}

/* ---------- Rendering ---------- */
const $content = document.getElementById("content");
const $sidebar = document.getElementById("sidebar");
const $progress = document.getElementById("progress");
let tipTimer = null;

function go(page) {
  if (!pageAllowed(page)) page = "start";
  state.page = page;
  const lvl = LEVELS.find(l => "level-" + l.nr === page);
  if (lvl && !state.openedAt[lvl.nr]) state.openedAt[lvl.nr] = Date.now();
  saveState();
  render();
  window.scrollTo(0, 0);
}

function renderSidebar() {
  let html = `<button class="nav-item ${state.page === "start" ? "active" : ""}" data-page="start">
      <span class="nav-badge">i</span>Ausgangslage</button>`;
  let lastPart = "";
  LEVELS.forEach((l, i) => {
    if (l.part !== lastPart) { html += `<div class="nav-group">${l.part}</div>`; lastPart = l.part; }
    const cls = ["nav-item"];
    if (state.page === "level-" + l.nr) cls.push("active");
    if (state.solved[l.nr]) cls.push("solved");
    const badge = state.solved[l.nr] ? "✓" : l.nr;
    html += `<button class="${cls.join(" ")}" data-page="level-${l.nr}" ${isUnlocked(i) ? "" : "disabled"}>
      <span class="nav-badge">${badge}</span>Level ${l.nr}: ${l.title}</button>`;
  });
  html += `<div class="nav-group">Abschluss</div>
    <button class="nav-item ${state.page === "finale" ? "active" : ""} ${allSolved() ? "solved" : ""}" data-page="finale" ${allSolved() ? "" : "disabled"}>
      <span class="nav-badge">${allSolved() ? "✓" : "–"}</span>Abschluss</button>`;
  $sidebar.innerHTML = html;

  const done = LEVELS.filter(l => state.solved[l.nr]).length;
  $progress.textContent = `${done} von ${LEVELS.length} Leveln gelöst`;
}

function renderStart() {
  $content.innerHTML = `
    <section class="card">
      <div class="eyebrow">Ausgangslage</div>
      <h1>Datenleck bei der Campus-App</h1>
      <div class="story">${STORY}</div>
      <h2>So funktionieren die Level</h2>
      <ul>
        <li>Gearbeitet wird im Terminal. Alle Befehle führt ihr im Hauptordner des Workshops aus.</li>
        <li>Jedes Level endet mit einer kurzen Frage. Die Antwort ist das <strong>Lösungswort</strong>, mit dem das nächste Level freigeschaltet wird. Groß- und Kleinschreibung ist egal.</li>
        <li>Wenn ihr nicht weiterkommt, gibt es Tipps: Tipp 1 sofort, Tipp 2 nach 3 Minuten, die vollständige Anleitung nach 6 Minuten.</li>
      </ul>
      <button class="btn" id="start-btn">${state.started ? "Weiter" : "Untersuchung starten"}</button>
    </section>`;
  document.getElementById("start-btn").onclick = () => {
    state.started = true;
    const next = LEVELS.find(l => !state.solved[l.nr]);
    go(next ? "level-" + next.nr : "finale");
  };
}

function renderFinale() {
  $content.innerHTML = `
    <section class="card">
      <div class="eyebrow">Abschluss</div>
      <h1>Alle Level gelöst</h1>
      ${FINALE}
    </section>`;
}

function renderLevel(l) {
  const idx = LEVELS.indexOf(l);
  const solved = !!state.solved[l.nr];
  const next = LEVELS[idx + 1];
  const nextLabel = next ? `Weiter zu Level ${next.nr}` : "Zum Abschluss";
  const nextPage = next ? "level-" + next.nr : "finale";

  $content.innerHTML = `
    <section class="card">
      <div class="eyebrow">${l.part} · Level ${l.nr}</div>
      <h1>${l.title}</h1>
      <div class="story">${l.story}</div>
      <h2>Auftrag</h2>
      ${l.task}
      <div class="question">
        <div class="question-text">Frage: ${esc(l.question)}</div>
        <form class="answer-row" id="answer-form" autocomplete="off">
          <input type="text" id="answer" placeholder="Lösungswort" aria-label="Lösungswort" ${solved ? "disabled" : ""}>
          <button class="btn" type="submit" ${solved ? "disabled" : ""}>Prüfen</button>
        </form>
        <div id="feedback">${solved ? successHtml(nextLabel) : ""}</div>
      </div>
    </section>
    <section class="card tips" id="tips"></section>`;

  const form = document.getElementById("answer-form");
  const input = document.getElementById("answer");
  const feedback = document.getElementById("feedback");
  if (!solved) input.focus();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const value = normalize(input.value);
    if (!value) return;
    const hash = await sha256(SALT + value);
    if (l.hashes.includes(hash)) {
      state.solved[l.nr] = true;
      saveState();
      renderSidebar();
      input.disabled = true;
      form.querySelector("button").disabled = true;
      feedback.innerHTML = successHtml(nextLabel);
      bindNext(nextPage);
    } else {
      feedback.innerHTML = `<div class="feedback err">Leider falsch. Versucht es noch einmal oder schaut in die Tipps.</div>`;
    }
  };
  if (solved) bindNext(nextPage);

  renderTips(l);
}

function successHtml(nextLabel) {
  return `<div class="feedback ok"><strong>Richtig.</strong> Das nächste Level ist freigeschaltet.<br>
    <button class="btn" type="button" id="next-btn">${nextLabel}</button></div>`;
}
function bindNext(page) {
  const b = document.getElementById("next-btn");
  if (b) b.onclick = () => go(page);
}

/* ---------- Tipps ---------- */
const TIP_LABELS = ["Tipp 1", "Tipp 2", "Anleitung"];

function tipAvailableAt(l, n) {
  const opened = state.openedAt[l.nr] || Date.now();
  return [opened, opened + TIP2_AFTER, opened + TIP3_AFTER][n];
}
function fmt(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function renderTips(l) {
  const box = document.getElementById("tips");
  const shown = state.tipsShown[l.nr] || 0;

  let html = `<div class="tips-head"><h2>Tipps</h2><div class="tips-actions"></div></div>`;
  for (let n = 0; n < shown; n++) {
    html += `<div class="tip"><div class="tip-label">${TIP_LABELS[n]}</div>${l.tips[n]}</div>`;
  }
  box.innerHTML = html;

  const actions = box.querySelector(".tips-actions");
  if (shown >= l.tips.length) {
    actions.innerHTML = `<span class="tip-status">Alle Tipps angezeigt</span>`;
    return;
  }
  actions.innerHTML = `<span class="tip-status" id="tip-status"></span>
    <button class="btn secondary" type="button" id="tip-btn">${TIP_LABELS[shown]} anzeigen</button>`;
  const btn = document.getElementById("tip-btn");
  const status = document.getElementById("tip-status");

  const update = () => {
    const wait = tipAvailableAt(l, shown) - Date.now();
    btn.disabled = wait > 0;
    status.textContent = wait > 0 ? `verfügbar in ${fmt(wait)}` : "";
  };
  update();
  clearInterval(tipTimer);
  tipTimer = setInterval(update, 1000);

  btn.onclick = () => {
    if (tipAvailableAt(l, shown) > Date.now()) return;
    state.tipsShown[l.nr] = shown + 1;
    saveState();
    renderTips(l);
    copyButtons();
  };
}

/* ---------- Kopieren-Buttons ---------- */
function copyButtons() {
  document.querySelectorAll(".codeblock .copy").forEach(b => {
    b.onclick = async () => {
      const text = b.parentElement.querySelector("code").textContent;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e2) { /* ignorieren */ }
        ta.remove();
      }
      b.textContent = "Kopiert";
      setTimeout(() => { b.textContent = "Kopieren"; }, 1500);
    };
  });
}

/* ---------- Hauptfunktion ---------- */
function render() {
  clearInterval(tipTimer);
  if (!pageAllowed(state.page)) state.page = "start";
  renderSidebar();
  if (state.page === "start") renderStart();
  else if (state.page === "finale") renderFinale();
  else renderLevel(LEVELS.find(l => "level-" + l.nr === state.page));
  copyButtons();
}

$sidebar.addEventListener("click", (e) => {
  const b = e.target.closest("[data-page]");
  if (b && !b.disabled) go(b.dataset.page);
});

document.getElementById("reset").onclick = () => {
  if (confirm("Fortschritt wirklich zurücksetzen? Alle gelösten Level und Tipps werden gelöscht.")) {
    state = defaultState();
    saveState();
    render();
  }
};

render();
