(() => {
  "use strict";

  /* ---------- Tabs ---------- */

  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
    });
  });

  /* ---------- Usage & Kosten ---------- */

  const KEY_STORAGE = "claude-dashboard-admin-key";
  const ADMIN_API_BASE = "https://api.anthropic.com/v1/organizations";

  const el = {
    keyInput: document.getElementById("admin-key"),
    keySave: document.getElementById("key-save"),
    keyClear: document.getElementById("key-clear"),
    keyStatus: document.getElementById("key-status"),
    daysSelect: document.getElementById("days-select"),
    refresh: document.getElementById("usage-refresh"),
    empty: document.getElementById("usage-empty"),
    errorCard: document.getElementById("usage-error"),
    content: document.getElementById("usage-content"),
    statCost: document.getElementById("stat-cost"),
    statInput: document.getElementById("stat-input"),
    statOutput: document.getElementById("stat-output"),
    statRequests: document.getElementById("stat-requests"),
    chart: document.getElementById("cost-chart"),
    rawToggle: document.getElementById("raw-toggle"),
    rawJson: document.getElementById("raw-json"),
  };

  function getStoredKey() {
    try { return localStorage.getItem(KEY_STORAGE) || ""; }
    catch { return ""; }
  }

  function setStoredKey(key) {
    try {
      if (key) localStorage.setItem(KEY_STORAGE, key);
      else localStorage.removeItem(KEY_STORAGE);
    } catch { /* private mode etc — ignore, key just won't persist */ }
  }

  function showStatus(msg, kind) {
    el.keyStatus.textContent = msg;
    el.keyStatus.className = "hint" + (kind ? ` ${kind}` : "");
  }

  el.keyInput.value = getStoredKey();

  el.keySave.addEventListener("click", () => {
    const key = el.keyInput.value.trim();
    if (!key) { showStatus("Kein Key eingegeben.", "bad"); return; }
    setStoredKey(key);
    showStatus("Gespeichert — lädt Daten …", "good");
    loadUsage();
  });

  el.keyClear.addEventListener("click", () => {
    setStoredKey("");
    el.keyInput.value = "";
    showStatus("Key gelöscht.", "");
    el.content.hidden = true;
    el.errorCard.hidden = true;
    el.empty.hidden = false;
  });

  el.refresh.addEventListener("click", loadUsage);
  el.daysSelect.addEventListener("change", loadUsage);

  el.rawToggle.addEventListener("click", () => {
    const hidden = el.rawJson.hidden;
    el.rawJson.hidden = !hidden;
    el.rawToggle.textContent = hidden ? "Verbergen" : "Anzeigen";
  });

  function isoDaysAgo(days) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  }

  async function fetchAdminReport(path, params) {
    const url = new URL(`${ADMIN_API_BASE}/${path}`);
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, item));
      else url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": getStoredKey(),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
    });

    if (!res.ok) {
      let detail = "";
      try { detail = (await res.json())?.error?.message || ""; } catch { /* ignore */ }
      throw new Error(`${res.status} ${res.statusText}${detail ? " — " + detail : ""}`);
    }
    return res.json();
  }

  // Walks an arbitrary JSON tree and sums numeric values found under keys
  // matching the given regex — the Admin API's exact field names have
  // shifted across API versions, so this stays correct either way.
  function sumMatchingKeys(node, keyRegex, acc = { total: 0 }) {
    if (node === null || typeof node !== "object") return acc;
    if (Array.isArray(node)) {
      node.forEach((item) => sumMatchingKeys(item, keyRegex, acc));
      return acc;
    }
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === "number" && keyRegex.test(k)) acc.total += v;
      else if (typeof v === "string" && keyRegex.test(k) && !isNaN(parseFloat(v))) acc.total += parseFloat(v);
      else if (v && typeof v === "object") sumMatchingKeys(v, keyRegex, acc);
    }
    return acc;
  }

  function countResultEntries(node) {
    let count = 0;
    if (Array.isArray(node)) {
      node.forEach((item) => { count += countResultEntries(item); });
    } else if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) {
        if (k === "results" && Array.isArray(v)) count += v.length;
        else if (v && typeof v === "object") count += countResultEntries(v);
      }
    }
    return count;
  }

  function fmtInt(n) {
    return new Intl.NumberFormat("de-DE").format(Math.round(n));
  }

  function fmtMoney(n) {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD" }).format(n);
  }

  function renderChart(buckets) {
    const svg = el.chart;
    svg.innerHTML = "";
    if (!buckets.length) return;

    const w = 640, h = 220, pad = 28;
    const max = Math.max(...buckets.map((b) => b.cost), 0.0001);
    const barW = (w - pad * 2) / buckets.length;

    buckets.forEach((b, i) => {
      const barH = (b.cost / max) * (h - pad * 2);
      const x = pad + i * barW;
      const y = h - pad - barH;

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x + barW * 0.15);
      rect.setAttribute("y", y);
      rect.setAttribute("width", Math.max(barW * 0.7, 1));
      rect.setAttribute("height", Math.max(barH, 1));
      rect.setAttribute("rx", 2);
      rect.setAttribute("fill", "#d97757");
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = `${b.label}: ${fmtMoney(b.cost)}`;
      rect.appendChild(title);
      svg.appendChild(rect);
    });

    const baseline = document.createElementNS("http://www.w3.org/2000/svg", "line");
    baseline.setAttribute("x1", pad);
    baseline.setAttribute("x2", w - pad);
    baseline.setAttribute("y1", h - pad);
    baseline.setAttribute("y2", h - pad);
    baseline.setAttribute("stroke", "#232830");
    svg.appendChild(baseline);
  }

  async function loadUsage() {
    const key = getStoredKey();
    if (!key) {
      el.empty.hidden = false;
      el.content.hidden = true;
      el.errorCard.hidden = true;
      return;
    }

    el.empty.hidden = true;
    el.errorCard.hidden = true;
    showStatus("Lädt …", "");

    const days = parseInt(el.daysSelect.value, 10);
    const startingAt = isoDaysAgo(days);

    try {
      const [usage, cost] = await Promise.all([
        fetchAdminReport("usage_report/messages", { starting_at: startingAt, bucket_width: "1d", limit: 31 }),
        fetchAdminReport("cost_report", { starting_at: startingAt, bucket_width: "1d", limit: 31 }),
      ]);

      const inputTotal = sumMatchingKeys(usage, /input_tokens/i).total;
      const outputTotal = sumMatchingKeys(usage, /output_tokens/i).total;
      const requestsTotal = countResultEntries(usage) || 0;
      const costTotal = sumMatchingKeys(cost, /amount/i).total;

      el.statCost.textContent = fmtMoney(costTotal);
      el.statInput.textContent = fmtInt(inputTotal);
      el.statOutput.textContent = fmtInt(outputTotal);
      el.statRequests.textContent = fmtInt(requestsTotal);

      const buckets = (cost.data || []).map((bucket) => ({
        label: (bucket.starting_at || "").slice(5, 10),
        cost: sumMatchingKeys(bucket, /amount/i).total,
      }));
      renderChart(buckets);

      el.rawJson.textContent = JSON.stringify({ usage, cost }, null, 2);

      el.content.hidden = false;
      showStatus(`Zuletzt aktualisiert: ${new Date().toLocaleTimeString("de-DE")}`, "good");
    } catch (err) {
      el.content.hidden = true;
      el.errorCard.hidden = false;
      el.errorCard.innerHTML = `
        <strong>Konnte Usage-Daten nicht laden.</strong>
        <p>${escapeHtml(err.message || String(err))}</p>
        <p class="hint">Mögliche Ursachen: falscher oder abgelaufener Admin-Key, der Key hat keine
        Berechtigung für Usage/Cost-Reports, oder der Browser wird von der Anthropic-API für diesen
        Endpoint per CORS blockiert (Admin-Endpoints sind primär für Server-zu-Server-Zugriffe gedacht —
        falls das der Fall ist, hilft ein kleiner serverseitiger Proxy).</p>`;
      showStatus("Fehler beim Laden.", "bad");
    }
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  if (getStoredKey()) loadUsage();

  /* ---------- Projekte ---------- */

  const PROJECTS = [
    { name: "fpv-portfolio-react", desc: "Ghost Line FPV — Portfolio, Komponenten aus Magic UI, Smooth UI, Retro UI und unlumen UI", stack: "Vite · React 19 · Tailwind 4 · shadcn/ui · Motion", repo: "fpv-portfolio-react", live: "https://samkof10.github.io/Claude_Code/" },
    { name: "fpv-portfolio", desc: "Ghost Line FPV — dieselbe Seite als Ur-Version", stack: "statisches HTML/CSS/JS, kein Build", repo: "fpv-portfolio" },
    { name: "aurel", desc: "AUREL — Premium-Store für eine zirkadiane Schreibtischleuchte", stack: "Next.js 16 · React 19 · Tailwind 4 · Motion", repo: "aurel" },
    { name: "mudroom", desc: "MUDROOM — Premium-Store für eine automatische Bike-Waschbox", stack: "Next.js 16 · React 19 · Tailwind 4 · Motion", repo: "mudroom" },
    { name: "gym-tracker", desc: "Gym Tracker — PWA für einen 5-Tage-Split, mit echtem Background-Push", stack: "Vanilla JS PWA + Node/Express", repo: "gym-tracker" },
    { name: "studyhub", desc: "StudyHub — KI-gestützte Lernplattform: Anmeldung, Dokumente, Notizen, Karteikarten, Quizze, Prüfungspläne, Fokustimer, AI-Tutor", stack: "Next.js 16 · React 19 · Tailwind 4 · Zustand · Tiptap · Recharts", repo: "studyhub" },
    { name: "claude-dashboard", desc: "Dieses Dashboard — Usage & Kosten, Projektübersicht, Sessions & Tasks", stack: "statisches HTML/CSS/JS, kein Build", repo: "claude-dashboard" },
  ];

  const REPO_BASE = "https://github.com/SamKof10/Claude_Code/tree/main/";
  const grid = document.getElementById("project-grid");

  grid.innerHTML = PROJECTS.map((p) => `
    <div class="card project-card">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <span class="project-stack">${p.stack}</span>
      <div class="project-links">
        <a href="${REPO_BASE}${p.repo}" target="_blank" rel="noopener">Repo</a>
        ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener">Live</a>` : ""}
      </div>
    </div>
  `).join("");

  /* ---------- Sessions & Tasks ---------- */

  const TASK_STORAGE = "claude-dashboard-tasks";
  const STATUS_COLS = [
    { key: "open", label: "Offen" },
    { key: "running", label: "Läuft" },
    { key: "review", label: "Review" },
    { key: "done", label: "Fertig" },
  ];

  function loadTasks() {
    try { return JSON.parse(localStorage.getItem(TASK_STORAGE) || "[]"); }
    catch { return []; }
  }

  function saveTasks(tasks) {
    try { localStorage.setItem(TASK_STORAGE, JSON.stringify(tasks)); }
    catch { /* ignore */ }
  }

  let tasks = loadTasks();

  function renderTasks() {
    const board = document.getElementById("task-board");
    board.innerHTML = STATUS_COLS.map((col) => {
      const items = tasks.filter((t) => t.status === col.key);
      return `
        <div class="task-col">
          <h3>${col.label} (${items.length})</h3>
          ${items.length ? items.map((t) => `
            <div class="task-item" data-id="${t.id}">
              <div class="task-row">
                <span>${escapeHtml(t.title)}</span>
                <button class="task-del" title="Löschen" data-id="${t.id}">×</button>
              </div>
              ${t.link ? `<a href="${escapeHtml(t.link)}" target="_blank" rel="noopener">Link ↗</a>` : ""}
              <div>
                <select class="task-status-select" data-id="${t.id}">
                  ${STATUS_COLS.map((c) => `<option value="${c.key}" ${c.key === t.status ? "selected" : ""}>${c.label}</option>`).join("")}
                </select>
              </div>
            </div>
          `).join("") : `<p class="task-empty">—</p>`}
        </div>
      `;
    }).join("");

    board.querySelectorAll(".task-del").forEach((btn) => {
      btn.addEventListener("click", () => {
        tasks = tasks.filter((t) => t.id !== btn.dataset.id);
        saveTasks(tasks);
        renderTasks();
      });
    });

    board.querySelectorAll(".task-status-select").forEach((sel) => {
      sel.addEventListener("change", () => {
        const t = tasks.find((t) => t.id === sel.dataset.id);
        if (t) { t.status = sel.value; saveTasks(tasks); renderTasks(); }
      });
    });
  }

  document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("task-title").value.trim();
    if (!title) return;
    const status = document.getElementById("task-status").value;
    const link = document.getElementById("task-link").value.trim();
    tasks.push({ id: crypto.randomUUID(), title, status, link });
    saveTasks(tasks);
    renderTasks();
    e.target.reset();
  });

  renderTasks();
})();
