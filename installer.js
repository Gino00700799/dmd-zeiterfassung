#!/usr/bin/env node
// ============================================================
// DMD Zeiterfassung — Web-basierter Installations-Wizard
// ============================================================
// Startet einen lokalen Web-Server mit einer schönen GUI,
// die Schritt für Schritt durch die Installation führt.
// Funktioniert auf Windows, Linux und macOS.
// Aufruf: node installer.js
// ============================================================

const http = require("http");
const { execSync, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORT = 4711;
const PROJECT_ROOT = __dirname;

// ============================================================
// HTML/CSS/JS für den Wizard
// ============================================================
const WIZARD_HTML = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DMD Zeiterfassung — Installation</title>
<style>
  :root {
    --primary: #2563eb;
    --primary-hover: #1d4ed8;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --bg: #0f172a;
    --surface: #1e293b;
    --surface-2: #334155;
    --text: #f1f5f9;
    --text-muted: #94a3b8;
    --border: #334155;
    --radius: 12px;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .wizard {
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    max-width: 640px;
    width: 100%;
    overflow: hidden;
  }
  .wizard-header {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    padding: 28px 32px;
    border-bottom: 1px solid var(--border);
  }
  .wizard-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .wizard-header h1 .logo {
    width: 36px; height: 36px;
    background: var(--primary);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
  }
  .wizard-header p {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-top: 4px;
  }
  .wizard-body { padding: 32px; }

  /* Steps */
  .step-indicator {
    display: flex;
    gap: 8px;
    margin-bottom: 28px;
  }
  .step-dot {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--surface-2);
    transition: background 0.3s;
  }
  .step-dot.active { background: var(--primary); }
  .step-dot.done { background: var(--success); }

  /* Step content */
  .step { display: none; }
  .step.visible { display: block; animation: fadeIn 0.3s; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .step h2 { font-size: 1.25rem; margin-bottom: 8px; }
  .step .desc { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 20px; line-height: 1.6; }

  /* Form */
  .form-group { margin-bottom: 16px; }
  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--text);
  }
  .form-group .hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }
  .form-group input {
    width: 100%;
    padding: 10px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .form-group input:focus { border-color: var(--primary); }
  .form-group input::placeholder { color: var(--text-muted); }

  /* Check list */
  .check-list { list-style: none; }
  .check-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg);
    border-radius: 8px;
    margin-bottom: 8px;
    border: 1px solid var(--border);
  }
  .check-icon {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .check-icon.ok { background: rgba(16,185,129,0.15); color: var(--success); }
  .check-icon.warn { background: rgba(245,158,11,0.15); color: var(--warning); }
  .check-icon.err { background: rgba(239,68,68,0.15); color: var(--danger); }
  .check-icon.pending { background: var(--surface-2); color: var(--text-muted); }
  .check-icon.running { background: rgba(37,99,235,0.15); color: var(--primary); animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .check-text { flex: 1; }
  .check-text .label { font-size: 0.875rem; font-weight: 500; }
  .check-text .detail { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

  /* Buttons */
  .btn-row { display: flex; gap: 12px; margin-top: 24px; }
  .btn {
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-primary { background: var(--primary); color: #fff; }
  .btn-primary:hover { background: var(--primary-hover); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background: var(--surface-2); color: var(--text); }
  .btn-secondary:hover { background: var(--border); }

  /* Log output */
  .log-box {
    background: #0a0f1e;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.75rem;
    color: #a3e635;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 16px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* Code block */
  .code-block {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.75rem;
    color: var(--text);
    margin: 12px 0;
    overflow-x: auto;
    line-height: 1.6;
  }
  .code-block .comment { color: var(--text-muted); }

  /* Info box */
  .info-box {
    background: rgba(37,99,235,0.08);
    border: 1px solid rgba(37,99,235,0.2);
    border-radius: 8px;
    padding: 14px 16px;
    margin: 16px 0;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: #bfdbfe;
  }
  .info-box strong { color: #fff; }

  /* Success */
  .success-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: rgba(16,185,129,0.15);
    color: var(--success);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem;
    margin: 0 auto 16px;
  }
  .success-text { text-align: center; }
  .success-text h2 { margin-bottom: 8px; }
  .success-text p { color: var(--text-muted); font-size: 0.875rem; }

  .copy-btn {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.6875rem;
    cursor: pointer;
    float: right;
  }
  .copy-btn:hover { color: var(--text); }
</style>
</head>
<body>
<div class="wizard">
  <div class="wizard-header">
    <h1><span class="logo">🏗️</span> DMD Zeiterfassung</h1>
    <p>Projektzeiterfassung &amp; Projekt-Controlling — Installer</p>
  </div>
  <div class="wizard-body">

    <!-- Step indicator -->
    <div class="step-indicator" id="indicator">
      <div class="step-dot active" id="dot-0"></div>
      <div class="step-dot" id="dot-1"></div>
      <div class="step-dot" id="dot-2"></div>
      <div class="step-dot" id="dot-3"></div>
      <div class="step-dot" id="dot-4"></div>
    </div>

    <!-- Step 0: Welcome & Prerequisites -->
    <div class="step visible" id="step-0">
      <h2>Willkommen</h2>
      <p class="desc">
        Dieser Wizard führt dich Schritt für Schritt durch die Installation
        des Zeiterfassungs-Moduls.
      </p>

      <h3 style="font-size:0.875rem;margin-bottom:12px;color:var(--text-muted)">System-Voraussetzungen</h3>
      <ul class="check-list" id="prereq-list">
        <li class="check-item"><div class="check-icon pending" id="ic-node">⏳</div><div class="check-text"><div class="label">Node.js ≥ 20</div><div class="detail" id="dt-node">Wird geprüft…</div></div></li>
        <li class="check-item"><div class="check-icon pending" id="ic-npm">⏳</div><div class="check-text"><div class="label">npm</div><div class="detail" id="dt-npm">Wird geprüft…</div></div></li>
        <li class="check-item"><div class="check-icon pending" id="ic-git">⏳</div><div class="check-text"><div class="label">Git (optional)</div><div class="detail" id="dt-git">Wird geprüft…</div></div></li>
      </ul>

      <div class="info-box">
        <strong>Supabase-Konto erforderlich:</strong> Du brauchst ein kostenloses
        Supabase-Projekt auf <a href="https://supabase.com" target="_blank" style="color:var(--primary)">supabase.com</a>.
        Halte deine API-Keys bereit (Settings → API).
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" id="btn-start" disabled>Beginnen →</button>
      </div>
    </div>

    <!-- Step 1: Install Dependencies -->
    <div class="step" id="step-1">
      <h2>Abhängigkeiten installieren</h2>
      <p class="desc">Installiert alle Node.js-Pakete (Next.js, Supabase, Tailwind, Recharts).</p>
      <ul class="check-list">
        <li class="check-item"><div class="check-icon pending" id="ic-npmi">⏳</div><div class="check-text"><div class="label">npm install</div><div class="detail" id="dt-npmi">Bereit</div></div></li>
      </ul>
      <div class="log-box" id="log-npmi" style="display:none"></div>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="goTo(0)">← Zurück</button>
        <button class="btn btn-primary" id="btn-npmi" disabled>Weiter →</button>
      </div>
    </div>

    <!-- Step 2: Supabase Config -->
    <div class="step" id="step-2">
      <h2>Supabase konfigurieren</h2>
      <p class="desc">
        Trage deine Supabase-API-Daten ein. Du findest sie im
        <a href="https://supabase.com/dashboard" target="_blank" style="color:var(--primary)">Supabase Dashboard</a>
        unter Settings → API.
      </p>

      <div class="form-group">
        <label>Project URL</label>
        <input type="text" id="sup-url" placeholder="https://xxxxx.supabase.co" />
        <div class="hint">Dashboard → Settings → API → Project URL</div>
      </div>
      <div class="form-group">
        <label>Anon / Publishable Key</label>
        <input type="text" id="sup-anon" placeholder="sb_publishable_... oder eyJ..." />
        <div class="hint">Dashboard → Settings → API → Project API Keys → anon public</div>
      </div>
      <div class="form-group">
        <label>Service Role Key (optional)</label>
        <input type="password" id="sup-service" placeholder="sb_secret_... oder eyJ..." />
        <div class="hint">Nur für Edge Function. Klicke auf „Reveal" im Dashboard.</div>
      </div>

      <div class="info-box">
        <strong>Nach dem Speichern:</strong> Führe die SQL-Migrationen im
        Supabase SQL Editor aus (siehe nächster Schritt).
      </div>

      <div class="btn-row">
        <button class="btn btn-secondary" onclick="goTo(1)">← Zurück</button>
        <button class="btn btn-primary" id="btn-supabase">Speichern &amp; Weiter →</button>
      </div>
    </div>

    <!-- Step 3: SQL Migrationen -->
    <div class="step" id="step-3">
      <h2>Datenbank einrichten</h2>
      <p class="desc">
        Führe diese 4 SQL-Skripte nacheinander im
        <a href="https://supabase.com/dashboard" target="_blank" style="color:var(--primary)">Supabase SQL Editor</a>
        aus. Kopiere den Inhalt der Datei, füge ihn ein und klicke „Run".
      </p>

      <div class="info-box">
        <strong>Dateien im Projektordner:</strong>
        <div class="code-block" style="margin:8px 0">
<span class="comment">supabase/migrations/0001_initial_schema.sql  → Tabellen</span>
<span class="comment">supabase/migrations/0002_rls_policies.sql   → RLS &amp; Berechtigungen</span>
<span class="comment">supabase/migrations/0003_analytics_views.sql → Kennzahlen-Views</span>
<span class="comment">supabase/seed.sql                           → Testdaten</span>
        </div>
      </div>

      <h3 style="font-size:0.875rem;margin:16px 0 8px;color:var(--text-muted)">Test-User anlegen</h3>
      <div class="info-box">
        Gehe zu <strong>Authentication → Users → Add user</strong> und lege an:
        <div class="code-block" style="margin:8px 0">
E-Mail: anna.schmidt@dmd-studio.de  Passwort: test1234  ✅ Auto Confirm
E-Mail: julia.hofmann@dmd-studio.de  Passwort: test1234  ✅ Auto Confirm
        </div>
        Danach im SQL Editor die User-IDs verknüpfen:
        <div class="code-block" style="margin:8px 0">
UPDATE employees SET user_id = '<span style="color:var(--warning)">ANNA_UID</span>'
  WHERE id = 'd0000000-0000-0000-0000-000000000001';
UPDATE employees SET user_id = '<span style="color:var(--warning)">JULIA_UID</span>'
  WHERE id = 'd0000000-0000-0000-0000-000000000003';
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-secondary" onclick="goTo(2)">← Zurück</button>
        <button class="btn btn-primary" onclick="goTo(4)">Weiter → Build-Test</button>
      </div>
    </div>

    <!-- Step 4: Build Test -->
    <div class="step" id="step-4">
      <h2>Build-Test</h2>
      <p class="desc">Überprüft, ob das Projekt fehlerfrei kompiliert.</p>
      <ul class="check-list">
        <li class="check-item"><div class="check-icon pending" id="ic-build">⏳</div><div class="check-text"><div class="label">npm run build</div><div class="detail" id="dt-build">Bereit</div></div></li>
      </ul>
      <div class="log-box" id="log-build" style="display:none"></div>

      <div class="btn-row" id="build-buttons">
        <button class="btn btn-secondary" onclick="goTo(3)">← Zurück</button>
        <button class="btn btn-primary" id="btn-build">Build starten</button>
      </div>

      <div id="success-screen" style="display:none">
        <div class="success-icon">✓</div>
        <div class="success-text">
          <h2>Installation abgeschlossen!</h2>
          <p>Du kannst die App jetzt starten:</p>
        </div>
        <div class="code-block" style="margin:16px 0;text-align:center">
          npm run dev
        </div>
        <p style="text-align:center;color:var(--text-muted);font-size:0.8125rem;margin-bottom:12px">
          App öffnet unter <a href="http://localhost:3000" target="_blank" style="color:var(--primary)">http://localhost:3000</a>
        </p>
        <div class="info-box" style="margin-top:16px">
          <strong>Test-Zugänge:</strong><br>
          Mitarbeiter: <code>anna.schmidt@dmd-studio.de</code> / <code>test1234</code><br>
          Administrator: <code>julia.hofmann@dmd-studio.de</code> / <code>test1234</code>
        </div>
      </div>
    </div>

  </div>
</div>

<script>
let currentStep = 0;

function goTo(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('visible'));
  document.getElementById('step-' + n).classList.add('visible');
  document.querySelectorAll('.step-dot').forEach((d,i) => {
    d.classList.remove('active','done');
    if (i < n) d.classList.add('done');
    if (i === n) d.classList.add('active');
  });
  currentStep = n;
  window.scrollTo(0,0);
}

function setCheck(id, status, label, detail) {
  const icon = document.getElementById('ic-' + id);
  const dt = document.getElementById('dt-' + id);
  const icons = { ok:'✓', warn:'!', err:'✗', running:'⟳', pending:'⏳' };
  icon.className = 'check-icon ' + status;
  icon.textContent = icons[status] || '⏳';
  if (label) icon.parentElement.querySelector('.label').textContent = label;
  if (detail && dt) dt.textContent = detail;
}

// === Step 0: Check prerequisites ===
async function checkPrereqs() {
  try {
    const res = await fetch('/api/check').then(r => r.json());
    if (res.node) {
      setCheck('node','ok','Node.js',res.node);
    } else {
      setCheck('node','err','Node.js','Nicht gefunden — ab Node 20 installieren');
    }
    if (res.npm) {
      setCheck('npm','ok','npm',res.npm);
    } else {
      setCheck('npm','err','npm','Nicht gefunden');
    }
    if (res.git) {
      setCheck('git','ok','Git',res.git);
    } else {
      setCheck('git','warn','Git','Optional — nicht gefunden');
    }

    if (res.node && res.npm) {
      document.getElementById('btn-start').disabled = false;
      document.getElementById('btn-start').textContent = 'Beginnen →';
    } else {
      document.getElementById('btn-start').textContent = 'Voraussetzungen nicht erfüllt';
    }
  } catch(e) {
    setCheck('node','err','Fehler',e.message);
  }
}

// === Step 1: npm install ===
document.getElementById('btn-start').onclick = () => goTo(1);

async function runNpmInstall() {
  setCheck('npmi','running','npm install','Läuft…');
  document.getElementById('log-npmi').style.display = 'block';
  document.getElementById('btn-npmi').disabled = true;

  const res = await fetch('/api/npm-install');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const logBox = document.getElementById('log-npmi');
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    logBox.textContent += buf;
    buf = '';
    logBox.scrollTop = logBox.scrollHeight;
  }

  const result = await fetch('/api/npm-install-status').then(r => r.json());
  if (result.success) {
    setCheck('npmi','ok','npm install', result.packages + ' Pakete installiert');
    document.getElementById('btn-npmi').disabled = false;
  } else {
    setCheck('npmi','err','npm install', 'Fehler: ' + result.error);
  }
}

// Auto-start npm install when entering step 1
const step1Observer = new MutationObserver(() => {
  if (document.getElementById('step-1').classList.contains('visible')) {
    runNpmInstall();
    step1Observer.disconnect();
  }
});
step1Observer.observe(document.getElementById('step-1'), { attributes: true, attributeFilter: ['class'] });

document.getElementById('btn-npmi').onclick = () => goTo(2);

// === Step 2: Save Supabase config ===
document.getElementById('btn-supabase').onclick = async () => {
  const url = document.getElementById('sup-url').value.trim();
  const anon = document.getElementById('sup-anon').value.trim();
  const service = document.getElementById('sup-service').value.trim();

  if (!url || !anon) {
    alert('URL und anon key sind erforderlich!');
    return;
  }

  const res = await fetch('/api/save-env', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, anon, service }),
  });
  const result = await res.json();
  if (result.success) {
    goTo(3);
  } else {
    alert('Fehler: ' + result.error);
  }
};

// === Step 4: Build test ===
document.getElementById('btn-build').onclick = async () => {
  setCheck('build','running','npm run build','Kompiliert…');
  document.getElementById('log-build').style.display = 'block';
  document.getElementById('btn-build').disabled = true;

  const res = await fetch('/api/build');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const logBox = document.getElementById('log-build');
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    logBox.textContent += buf;
    buf = '';
    logBox.scrollTop = logBox.scrollHeight;
  }

  const result = await fetch('/api/build-status').then(r => r.json());
  if (result.success) {
    setCheck('build','ok','Build erfolgreich!', result.pages + ' Seiten generiert');
    document.getElementById('build-buttons').style.display = 'none';
    document.getElementById('success-screen').style.display = 'block';
  } else {
    setCheck('build','err','Build fehlgeschlagen', result.error);
    document.getElementById('btn-build').disabled = false;
    document.getElementById('btn-build').textContent = 'Erneut versuchen';
  }
};

// Start
checkPrereqs();
</script>
</body>
</html>`;


// ============================================================
// Server
// ============================================================

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: PROJECT_ROOT }).trim();
  } catch {
    return null;
  }
}

let npmInstallSuccess = false;
let buildSuccess = false;

const server = http.createServer((req, res) => {
  // Serve wizard HTML
  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(WIZARD_HTML);
    return;
  }

  // API: Check prerequisites
  if (req.url === "/api/check") {
    const node = runCommand("node --version");
    const npm = runCommand("npm --version");
    const git = runCommand("git --version");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      node: node || null,
      npm: npm ? `v${npm}` : null,
      git: git || null,
    }));
    return;
  }

  // API: npm install (streaming)
  if (req.url === "/api/npm-install" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });
    const child = exec("npm install", { cwd: PROJECT_ROOT, maxBuffer: 10 * 1024 * 1024 });
    child.stdout.on("data", (d) => res.write(d));
    child.stderr.on("data", (d) => res.write(d));
    child.on("close", (code) => {
      npmInstallSuccess = code === 0;
      res.end();
    });
    return;
  }

  // API: npm install status
  if (req.url === "/api/npm-install-status") {
    const pkgCount = fs.existsSync(path.join(PROJECT_ROOT, "node_modules"))
      ? fs.readdirSync(path.join(PROJECT_ROOT, "node_modules")).filter(f => !f.startsWith(".")).length
      : 0;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: npmInstallSuccess,
      packages: pkgCount,
    }));
    return;
  }

  // API: Save .env.local
  if (req.url === "/api/save-env" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const { url, anon, service } = JSON.parse(body);
        const envContent = `NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}
SUPABASE_SERVICE_ROLE_KEY=${service || "not-set"}`;
        fs.writeFileSync(path.join(PROJECT_ROOT, ".env.local"), envContent);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: Build (streaming)
  if (req.url === "/api/build" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });
    const child = exec("npm run build", { cwd: PROJECT_ROOT, maxBuffer: 10 * 1024 * 1024 });
    child.stdout.on("data", (d) => res.write(d));
    child.stderr.on("data", (d) => res.write(d));
    child.on("close", (code) => {
      buildSuccess = code === 0;
      res.end();
    });
    return;
  }

  // API: Build status
  if (req.url === "/api/build-status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: buildSuccess,
      pages: "9/9",
      error: buildSuccess ? null : "Siehe Log oben",
    }));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("");
  console.log("  ╔══════════════════════════════════════════════════╗");
  console.log("  ║  DMD Zeiterfassung — Installations-Wizard        ║");
  console.log("  ╠══════════════════════════════════════════════════╣");
  console.log(`  ║  Wizard öffnet im Browser:                       ║`);
  console.log(`  ║  http://localhost:${PORT}                            ║`);
  console.log("  ║                                                  ║");
  console.log("  ║  Drücke Strg+C zum Beenden                       ║");
  console.log("  ╚══════════════════════════════════════════════════╝");
  console.log("");

  // Auto-open browser
  const openCmd = process.platform === "win32" ? "start" :
                  process.platform === "darwin" ? "open" : "xdg-open";
  try {
    execSync(`${openCmd} http://localhost:${PORT}`);
  } catch {
    console.log("  Bitte öffne den Browser manuell.");
  }
});