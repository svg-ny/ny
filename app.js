const CONFIG = {
  logoUrl: "assets/vanity-logo.png",
  authStartUrl: "#discord-oauth-worker-url",
  verifyUrl: "",
  demoMode: true,
  approvedDiscordIds: ["123456789012345678", "987654321098765432"],
};

Object.assign(CONFIG, window.VANITY_PORTAL_CONFIG || {});

const state = {
  view: "overview",
  user: null,
  records: [
    {
      id: "VN-CASE-1042",
      player: "Liam Carter",
      discord: "liam.carter",
      type: "Warning",
      staff: "A. Bishop",
      date: "2026-06-09",
      details: "Combat logging after active pursuit near Legion Square.",
      severity: "warn",
    },
    {
      id: "VN-CASE-1039",
      player: "Noah Hughes",
      discord: "noahh",
      type: "Ban",
      staff: "M. Ellis",
      date: "2026-06-08",
      details: "Repeated VDM after prior final warning.",
      severity: "danger",
    },
    {
      id: "VN-CASE-1033",
      player: "Oliver Reed",
      discord: "oreed",
      type: "Note",
      staff: "S. Knight",
      date: "2026-06-07",
      details: "Positive RP conduct during police negotiation.",
      severity: "cyan",
    },
  ],
  tickets: [
    {
      id: "TCK-2218",
      subject: "Comp request: lost vehicle after restart",
      player: "Amelia W.",
      status: "Awaiting Review",
      priority: "Medium",
    },
    {
      id: "TCK-2217",
      subject: "Report: fail driving during pursuit",
      player: "Harry B.",
      status: "Needs Clip",
      priority: "High",
    },
    {
      id: "TCK-2215",
      subject: "Whitelist interview follow-up",
      player: "Mason C.",
      status: "Assigned",
      priority: "Low",
    },
  ],
};

const app = document.querySelector("#app");

function icon(name) {
  const icons = {
    login: "↗",
    close: "×",
    plus: "+",
    search: "⌕",
    dashboard: "◆",
    tickets: "◫",
    records: "◎",
    players: "◉",
    roster: "▦",
    tools: "⚙",
    logout: "↩",
  };
  return icons[name] || "•";
}

function persist() {
  localStorage.setItem("vanity-portal-state", JSON.stringify({
    user: state.user,
    records: state.records,
    tickets: state.tickets,
  }));
}

function restore() {
  const saved = localStorage.getItem("vanity-portal-state");
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    state.user = parsed.user || null;
    state.records = Array.isArray(parsed.records) ? parsed.records : state.records;
    state.tickets = Array.isArray(parsed.tickets) ? parsed.tickets : state.tickets;
  } catch {
    localStorage.removeItem("vanity-portal-state");
  }
}

function toast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  window.setTimeout(() => node.remove(), 3200);
}

async function verifySession(session) {
  if (!CONFIG.verifyUrl) {
    return CONFIG.demoMode
      ? { id: "discord-session", name: "Approved Staff", role: "Staff", avatar: "AS" }
      : null;
  }

  const response = await fetch(`${CONFIG.verifyUrl}?session=${encodeURIComponent(session)}`);
  if (!response.ok) return null;
  const verified = await response.json();
  return {
    id: verified.id,
    name: verified.username || "Approved Staff",
    role: verified.role || "Staff",
    avatar: (verified.username || "AS").slice(0, 2).toUpperCase(),
  };
}

function renderLogin() {
  app.innerHTML = `
    <section class="login-page">
      <div class="login-panel">
        <aside class="brand-pane">
          <div class="brand-lockup">
            <img class="logo-mark" src="${CONFIG.logoUrl}" alt="Vanity Network logo" />
            <div>
              <p class="brand-name">Vanity Network</p>
              <p class="brand-subtitle">British FiveM Staff Portal</p>
            </div>
          </div>
          <div class="brand-statement">
            <h1>Staff Control</h1>
            <p>Case handling, player records, duty oversight, moderation logs, and Discord-only staff access in one fast Carrd-ready portal.</p>
          </div>
          <div class="status-strip">
            <div class="status-line"><span>Server</span><strong>Online</strong></div>
            <div class="status-line"><span>Access</span><strong>Approved Discord only</strong></div>
            <div class="status-line"><span>Region</span><strong>United Kingdom RP</strong></div>
          </div>
        </aside>

        <section class="login-form-pane">
          <p class="eyebrow">Restricted Area</p>
          <h2>Sign in through Discord</h2>
          <p>Only Discord accounts approved by Vanity Network leadership should be allowed past this screen. Use the Worker template included with this project for the live approval check.</p>
          <button class="discord-button" data-login>
            <span>${icon("login")}</span>
            Continue with Discord
          </button>
          <div class="login-note">
            Demo mode is enabled for local preview. In Carrd, set the login button to your deployed OAuth Worker URL and turn off demo mode.
          </div>
          <div class="approval-list">
            <div class="approval-item"><span>1</span><p>Discord sends the user to your auth callback.</p></div>
            <div class="approval-item"><span>2</span><p>The Worker checks their Discord ID against the approved staff list.</p></div>
            <div class="approval-item"><span>3</span><p>Approved users return to Carrd with a signed session token.</p></div>
          </div>
        </section>
      </div>
    </section>
  `;
  document.querySelector("[data-login]").addEventListener("click", handleLogin);
}

function handleLogin() {
  if (!CONFIG.demoMode && CONFIG.authStartUrl && !CONFIG.authStartUrl.startsWith("#")) {
    window.location.href = CONFIG.authStartUrl;
    return;
  }

  state.user = {
    id: "123456789012345678",
    name: "Vanity Admin",
    role: "Head Staff",
    avatar: "VA",
  };
  persist();
  renderPortal();
}

function renderPortal() {
  app.innerHTML = `
    <div class="app-frame">
      <aside class="sidebar">
        <div class="brand-lockup">
          <img class="logo-mark" src="${CONFIG.logoUrl}" alt="Vanity Network logo" />
          <div>
            <p class="brand-name">Vanity Network</p>
            <p class="brand-subtitle">Staff Portal</p>
          </div>
        </div>
        <nav class="nav-list" aria-label="Staff portal">
          ${navButton("overview", "dashboard", "Overview")}
          ${navButton("tickets", "tickets", "Tickets", state.tickets.length)}
          ${navButton("records", "records", "Player Records", state.records.length)}
          ${navButton("players", "players", "Live Players")}
          ${navButton("roster", "roster", "Staff Roster")}
          ${navButton("tools", "tools", "Admin Tools")}
        </nav>
        <div class="sidebar-footer">
          <div class="staff-card">
            <span class="avatar">${state.user.avatar}</span>
            <div>
              <strong>${state.user.name}</strong>
              <p>${state.user.role}</p>
            </div>
          </div>
          <button class="ghost-button" data-logout>${icon("logout")} Sign out</button>
        </div>
      </aside>
      <section class="content">
        <div class="topbar">
          <div>
            <h1>${viewTitle()}</h1>
            <p>${viewSubtitle()}</p>
          </div>
          <div class="top-actions">
            <button class="ghost-button" data-open-drawer="ticket">${icon("plus")} Ticket</button>
            <button class="primary-button" data-open-drawer="record">${icon("plus")} Record</button>
          </div>
        </div>
        <div id="view">${renderView()}</div>
      </section>
    </div>
    <aside class="drawer" id="drawer"></aside>
  `;

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      renderPortal();
    });
  });
  document.querySelector("[data-logout]").addEventListener("click", () => {
    state.user = null;
    persist();
    renderLogin();
  });
  document.querySelectorAll("[data-open-drawer]").forEach((button) => {
    button.addEventListener("click", () => openDrawer(button.dataset.openDrawer));
  });
  bindViewEvents();
}

function navButton(view, iconName, label, count = "") {
  return `
    <button class="nav-button" data-view="${view}" aria-current="${state.view === view ? "page" : "false"}">
      <span>${icon(iconName)}</span>
      <strong>${label}</strong>
      ${count ? `<b>${count}</b>` : ""}
    </button>
  `;
}

function viewTitle() {
  return {
    overview: "Command Overview",
    tickets: "Support Tickets",
    records: "Player Records",
    players: "Live Player Watch",
    roster: "Staff Roster",
    tools: "Admin Tools",
  }[state.view];
}

function viewSubtitle() {
  return {
    overview: "Operational view for moderation, reports, and daily staff activity.",
    tickets: "Track reports, compensation requests, whitelist issues, and appeals.",
    records: "Searchable warnings, bans, notes, kicks, and moderation history.",
    players: "A Carrd-ready mock feed that can be connected to your FiveM API later.",
    roster: "Duty coverage, roles, permissions, and promotion readiness.",
    tools: "Quick links and templates staff need during live RP moderation.",
  }[state.view];
}

function renderView() {
  const views = {
    overview: renderOverview,
    tickets: renderTickets,
    records: renderRecords,
    players: renderPlayers,
    roster: renderRoster,
    tools: renderTools,
  };
  return views[state.view]();
}

function renderOverview() {
  return `
    <section class="metric-grid">
      ${metric("Open Tickets", state.tickets.length, "+2 today")}
      ${metric("Active Staff", "8", "3 on patrol")}
      ${metric("Pending Appeals", "4", "1 urgent")}
      ${metric("Records Logged", state.records.length, "+6 week")}
    </section>
    <section class="dashboard-grid">
      <div class="panel">
        <div class="section-head">
          <div><h2>Priority Queue</h2><p>Items needing staff action.</p></div>
          <button class="ghost-button" data-view="tickets">Open Tickets</button>
        </div>
        <div class="queue">
          ${state.tickets.map((ticket) => `
            <article class="queue-item">
              <div>
                <h3>${ticket.subject}</h3>
                <p>${ticket.player} · ${ticket.id}</p>
                <div class="tag-row">
                  <span class="tag ${ticket.priority === "High" ? "danger" : "cyan"}">${ticket.priority}</span>
                  <span class="tag">${ticket.status}</span>
                </div>
              </div>
              <button class="icon-button" title="Claim ticket">✓</button>
            </article>
          `).join("")}
        </div>
      </div>
      <div class="panel">
        <div class="section-head">
          <div><h2>Audit Feed</h2><p>Recent staff actions.</p></div>
        </div>
        <div class="timeline">
          ${timeline("20:42", "Ban issued", "Noah Hughes removed for repeated VDM.")}
          ${timeline("19:18", "Ticket assigned", "Comp request moved to Senior Admin review.")}
          ${timeline("18:55", "Warning logged", "Combat logging warning added to Liam Carter.")}
          ${timeline("17:30", "Roster update", "Two moderators marked on duty.")}
        </div>
      </div>
    </section>
  `;
}

function renderTickets() {
  return `
    <div class="filters">
      <label class="field">Search<input data-ticket-search placeholder="Search ticket, player, status" /></label>
      <label class="field">Priority<select><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select></label>
    </div>
    <section class="tickets-grid" data-ticket-list>
      ${ticketCards(state.tickets)}
    </section>
  `;
}

function ticketCards(tickets) {
  if (!tickets.length) return `<div class="empty">No tickets match this search.</div>`;
  return tickets.map((ticket) => `
    <article class="ticket-card">
      <div class="section-head">
        <div>
          <h3>${ticket.subject}</h3>
          <p>${ticket.player} · ${ticket.id}</p>
        </div>
        <span class="tag ${ticket.priority === "High" ? "danger" : "warn"}">${ticket.priority}</span>
      </div>
      <div class="tag-row">
        <span class="tag cyan">${ticket.status}</span>
        <span class="tag">Discord linked</span>
      </div>
    </article>
  `).join("");
}

function renderRecords() {
  return `
    <div class="filters">
      <label class="field">Search<input data-record-search placeholder="Search player, Discord, case ID" /></label>
      <label class="field">Type<select><option>All records</option><option>Ban</option><option>Warning</option><option>Note</option><option>Kick</option></select></label>
    </div>
    <section class="records-grid" data-record-list>
      ${recordCards(state.records)}
    </section>
  `;
}

function recordCards(records) {
  if (!records.length) return `<div class="empty">No records match this search.</div>`;
  return records.map((record) => `
    <article class="record-card">
      <div class="section-head">
        <div>
          <h3>${record.player}</h3>
          <p>${record.discord} · ${record.id}</p>
        </div>
        <span class="tag ${record.severity}">${record.type}</span>
      </div>
      <p>${record.details}</p>
      <div class="tag-row">
        <span class="tag">${record.staff}</span>
        <span class="tag">${record.date}</span>
      </div>
    </article>
  `).join("");
}

function renderPlayers() {
  const players = [
    ["42", "Arthur Mills", "Police", "Stable", "cyan"],
    ["39", "Freya Stone", "NHS", "Voice issue", "warn"],
    ["31", "Jack Turner", "Civilian", "Recent report", "danger"],
    ["24", "Ruby Clarke", "Mechanic", "Stable", "cyan"],
  ];
  return `
    <section class="tools-grid">
      ${players.map(([id, name, job, flag, tone]) => `
        <article class="tool-card">
          <span class="icon">#${id}</span>
          <div>
            <h3>${name}</h3>
            <p>${job}</p>
          </div>
          <span class="tag ${tone}">${flag}</span>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRoster() {
  const staff = [
    ["A. Bishop", "Head Staff", "On duty", "cyan"],
    ["M. Ellis", "Senior Admin", "Case review", "magenta"],
    ["S. Knight", "Moderator", "Patrol", "cyan"],
    ["T. Moore", "Trial Mod", "Off duty", ""],
  ];
  return `
    <section class="records-grid">
      ${staff.map(([name, role, status, tone]) => `
        <article class="record-card">
          <div class="section-head">
            <div><h3>${name}</h3><p>${role}</p></div>
            <span class="tag ${tone}">${status}</span>
          </div>
          <p>Permissions: tickets, records, player notes, staff radio.</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderTools() {
  const tools = [
    ["Penalty Guide", "Consistent warnings, kicks, temporary bans, and permanent bans.", "⚖"],
    ["Incident Template", "Structured report format for clips, IDs, timestamps, and evidence.", "▣"],
    ["Whitelist Notes", "Interview outcomes, cooldowns, and roleplay quality notes.", "◫"],
    ["Comp Calculator", "Vehicle, inventory, and restart compensation helper.", "£"],
    ["Staff Radio", "Quick reference for escalation and handover channels.", "◉"],
    ["Announcements", "Draft server notices before posting to Discord.", "✦"],
  ];
  return `
    <section class="tools-grid">
      ${tools.map(([title, text, mark]) => `
        <article class="tool-card">
          <span class="icon">${mark}</span>
          <div><h3>${title}</h3><p>${text}</p></div>
          <button class="ghost-button" data-tool="${title}">Open</button>
        </article>
      `).join("")}
    </section>
  `;
}

function metric(label, value, change) {
  return `<article class="metric"><p>${label}</p><strong>${value}</strong><span>${change}</span></article>`;
}

function timeline(time, title, body) {
  return `<article class="timeline-item"><span class="time">${time}</span><div><strong>${title}</strong><p>${body}</p></div></article>`;
}

function openDrawer(type) {
  const drawer = document.querySelector("#drawer");
  drawer.classList.add("open");
  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <p class="eyebrow">${type === "record" ? "Moderation" : "Support"}</p>
        <h2>${type === "record" ? "Add Player Record" : "Create Ticket"}</h2>
      </div>
      <button class="icon-button" data-close-drawer title="Close">${icon("close")}</button>
    </div>
    ${type === "record" ? recordForm() : ticketForm()}
  `;
  drawer.querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);
  drawer.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (type === "record") {
      state.records.unshift({
        id: `VN-CASE-${1043 + state.records.length}`,
        player: data.player,
        discord: data.discord,
        type: data.type,
        staff: state.user.name,
        date: new Date().toISOString().slice(0, 10),
        details: data.details,
        severity: data.type === "Ban" ? "danger" : data.type === "Warning" ? "warn" : "cyan",
      });
      state.view = "records";
      toast("Player record added.");
    } else {
      state.tickets.unshift({
        id: `TCK-${2219 + state.tickets.length}`,
        subject: data.subject,
        player: data.player,
        status: "Awaiting Review",
        priority: data.priority,
      });
      state.view = "tickets";
      toast("Ticket created.");
    }
    persist();
    closeDrawer();
    renderPortal();
  });
}

function closeDrawer() {
  document.querySelector("#drawer").classList.remove("open");
}

function recordForm() {
  return `
    <form class="form-grid">
      <label>Player name<input name="player" required placeholder="Firstname Lastname" /></label>
      <label>Discord<input name="discord" required placeholder="username or ID" /></label>
      <label>Record type<select name="type"><option>Warning</option><option>Ban</option><option>Kick</option><option>Note</option></select></label>
      <label>Evidence status<select name="evidence"><option>Clip attached</option><option>Staff witnessed</option><option>Awaiting clip</option></select></label>
      <label class="wide">Details<textarea name="details" required placeholder="What happened, rule broken, action taken..."></textarea></label>
      <button class="primary-button wide" type="submit">Save Record</button>
    </form>
  `;
}

function ticketForm() {
  return `
    <form class="form-grid">
      <label>Player<input name="player" required placeholder="Player name" /></label>
      <label>Priority<select name="priority"><option>Medium</option><option>High</option><option>Low</option></select></label>
      <label class="wide">Subject<input name="subject" required placeholder="Short ticket summary" /></label>
      <label class="wide">Notes<textarea name="notes" placeholder="Evidence, Discord link, timestamps..."></textarea></label>
      <button class="primary-button wide" type="submit">Create Ticket</button>
    </form>
  `;
}

function bindViewEvents() {
  const ticketSearch = document.querySelector("[data-ticket-search]");
  if (ticketSearch) {
    ticketSearch.addEventListener("input", () => {
      const query = ticketSearch.value.toLowerCase();
      const filtered = state.tickets.filter((ticket) => Object.values(ticket).join(" ").toLowerCase().includes(query));
      document.querySelector("[data-ticket-list]").innerHTML = ticketCards(filtered);
    });
  }

  const recordSearch = document.querySelector("[data-record-search]");
  if (recordSearch) {
    recordSearch.addEventListener("input", () => {
      const query = recordSearch.value.toLowerCase();
      const filtered = state.records.filter((record) => Object.values(record).join(" ").toLowerCase().includes(query));
      document.querySelector("[data-record-list]").innerHTML = recordCards(filtered);
    });
  }

  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => toast(`${button.dataset.tool} is ready to connect to your staff docs.`));
  });
}

async function boot() {
  restore();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("session");
  const denied = params.get("denied");

  if (denied) {
    renderLogin();
    toast(denied);
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  if (token) {
    const verified = await verifySession(token);
    if (verified) {
      state.user = verified;
      persist();
      window.history.replaceState({}, document.title, window.location.pathname);
      renderPortal();
      return;
    }
    state.user = null;
    persist();
    renderLogin();
    toast("Discord session could not be verified.");
    return;
  }

  state.user ? renderPortal() : renderLogin();
}

boot();
