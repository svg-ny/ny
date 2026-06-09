const CONFIG = {
  logoUrl: "vanity-logo.png",
  authStartUrl: "#discord-oauth-worker-url",
  verifyUrl: "",
  demoMode: true,
};

Object.assign(CONFIG, window.VANITY_PORTAL_CONFIG || {});

const initialData = {
  roster: [
    { name: "A. Bishop", discord: "a.bishop", rank: "Head Staff", department: "Management", status: "Active", joined: "2026-04-12" },
    { name: "M. Ellis", discord: "m.ellis", rank: "Senior Admin", department: "Support", status: "Active", joined: "2026-04-18" },
    { name: "S. Knight", discord: "s.knight", rank: "Moderator", department: "Reports", status: "LOA", joined: "2026-05-02" },
    { name: "T. Moore", discord: "t.moore", rank: "Trial Moderator", department: "Training", status: "Probation", joined: "2026-05-26" },
  ],
  meetings: [
    { title: "Weekly staff sync", date: "2026-06-09", lead: "A. Bishop", notes: "Review response times, trial moderator standards, and new escalation rules." },
    { title: "Management review", date: "2026-06-07", lead: "M. Ellis", notes: "Discuss voucher requests, LOA cover, and staff activity expectations." },
  ],
  todos: [
    { task: "Update staff handbook templates", owner: "Management", due: "2026-06-11", status: "In Progress" },
    { task: "Review open applications", owner: "Senior Staff", due: "2026-06-10", status: "Pending" },
    { task: "Check inactive staff list", owner: "Head Staff", due: "2026-06-12", status: "Pending" },
  ],
  team: [
    { group: "Management", lead: "A. Bishop", members: "3", focus: "Policy, promotions, strikes, appeals" },
    { group: "Senior Staff", lead: "M. Ellis", members: "5", focus: "Reports, interviews, training support" },
    { group: "Moderation", lead: "S. Knight", members: "12", focus: "Tickets, patrol, clips, daily cover" },
  ],
  stats: [
    { name: "A. Bishop", tickets: 22, hours: 18, meetings: 3, score: "Excellent" },
    { name: "M. Ellis", tickets: 31, hours: 24, meetings: 2, score: "Excellent" },
    { name: "S. Knight", tickets: 14, hours: 9, meetings: 1, score: "Stable" },
    { name: "T. Moore", tickets: 7, hours: 5, meetings: 1, score: "Training" },
  ],
  vouchers: [
    { staff: "M. Ellis", reason: "Handled high priority report queue", value: "15 GBP", status: "Approved" },
    { staff: "S. Knight", reason: "Extra patrol cover during peak hours", value: "10 GBP", status: "Pending" },
  ],
  strikes: [
    { staff: "T. Moore", level: "Verbal", date: "2026-06-05", reason: "Missed activity check without notice", status: "Active" },
  ],
  applications: [
    { applicant: "Ruby Clarke", discord: "ruby.c", stage: "Interview", reviewer: "M. Ellis", outcome: "Pending" },
    { applicant: "Noah Hughes", discord: "noahh", stage: "Screening", reviewer: "A. Bishop", outcome: "Needs Review" },
  ],
  loas: [
    { staff: "S. Knight", from: "2026-06-08", to: "2026-06-15", reason: "Exams", status: "Approved" },
  ],
  pcChecks: [
    { staff: "T. Moore", date: "2026-06-06", checker: "A. Bishop", result: "Passed", notes: "No issues found." },
    { staff: "S. Knight", date: "2026-06-03", checker: "M. Ellis", result: "Scheduled", notes: "Awaiting availability." },
  ],
  templates: [
    { title: "Staff Strike Notice", category: "Discipline", body: "Staff Member:\nStrike Level:\nReason:\nEvidence:\nExpected Improvement:\nReview Date:" },
    { title: "LOA Approval", category: "LOA", body: "Your LOA has been approved from [date] to [date]. Please update management if anything changes." },
    { title: "Application Interview", category: "Applications", body: "Discord:\nAge:\nExperience:\nScenario Answers:\nDecision:\nReviewer Notes:" },
  ],
  blacklist: [
    { name: "Example Staff", discord: "example#0000", reason: "Leaked staff information", date: "2026-05-20", addedBy: "A. Bishop" },
  ],
};

const sections = [
  ["overview", "Overview", "Dashboard summary for staff management."],
  ["roster", "Staff Roster", "Ranks, Discords, departments, and current staff status."],
  ["meetings", "Meeting Notes", "Management notes, decisions, and follow-up actions."],
  ["todos", "To-Do List", "Tasks for management, senior staff, and moderation teams."],
  ["team", "Staff Team", "Team structure, leads, and areas of responsibility."],
  ["stats", "Staff Stats", "Activity numbers ready to automate later."],
  ["vouchers", "Staff Vouchers", "Reward requests and approved staff vouchers."],
  ["strikes", "Staff Strikes", "Disciplinary notes, strike levels, and active warnings."],
  ["applications", "Applications", "Staff applications and interview pipeline."],
  ["loas", "Staff LOAs", "Leave of absence requests and coverage planning."],
  ["pcChecks", "PC Checks", "PC check schedule, checker, result, and notes."],
  ["templates", "Templates", "Reusable staff messages and management formats."],
  ["blacklist", "Blacklisted Staff", "Staff who must not be rehired or given access."],
];

const state = {
  view: "overview",
  user: null,
  data: clone(initialData),
};

const app = document.querySelector("#app");

function icon(name) {
  const icons = {
    login: "->",
    close: "x",
    plus: "+",
    logout: "<-",
    overview: "#",
    roster: "R",
    meetings: "M",
    todos: "T",
    team: "S",
    stats: "%",
    vouchers: "V",
    strikes: "!",
    applications: "A",
    loas: "L",
    pcChecks: "P",
    templates: "D",
    blacklist: "X",
  };
  return icons[name] || "*";
}

function persist() {
  localStorage.setItem("vanity-staff-portal-state", JSON.stringify({
    user: state.user,
    data: state.data,
  }));
}

function restore() {
  const saved = localStorage.getItem("vanity-staff-portal-state");
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    state.user = parsed.user || null;
    state.data = { ...clone(initialData), ...(parsed.data || {}) };
  } catch {
    localStorage.removeItem("vanity-staff-portal-state");
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
    return CONFIG.demoMode ? { id: "demo", name: "Vanity Admin", role: "Head Staff", avatar: "VA" } : null;
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
              <p class="brand-subtitle">Staff Portal</p>
            </div>
          </div>
          <div class="brand-statement">
            <h1>Staff Hub</h1>
            <p>Roster control, meeting notes, tasks, applications, LOAs, staff discipline, vouchers, PC checks, templates, and blacklist tracking.</p>
          </div>
          <div class="status-strip">
            <div class="status-line"><span>Access</span><strong>Discord only</strong></div>
            <div class="status-line"><span>Mode</span><strong>Management portal</strong></div>
            <div class="status-line"><span>Server</span><strong>Vanity Network</strong></div>
          </div>
        </aside>

        <section class="login-form-pane">
          <p class="eyebrow">Restricted Area</p>
          <h2>Sign in through Discord</h2>
          <p>Only approved Vanity Network staff accounts should access the portal. Demo mode is currently enabled so you can test the layout before live Discord auth is connected.</p>
          <button class="discord-button" data-login>
            <span>${icon("login")}</span>
            Continue with Discord
          </button>
          <div class="login-note">Use the portal in demo mode for now. When the Discord Worker is connected, set demoMode to false in Carrd.</div>
          <div class="approval-list">
            <div class="approval-item"><span>1</span><p>Staff sign in through Discord.</p></div>
            <div class="approval-item"><span>2</span><p>The auth worker checks approved accounts.</p></div>
            <div class="approval-item"><span>3</span><p>Approved staff access the management dashboard.</p></div>
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

  state.user = { id: "demo", name: "Vanity Admin", role: "Head Staff", avatar: "VA" };
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
          ${sections.map(([key, label]) => navButton(key, label, sectionCount(key))).join("")}
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
          <div class="top-actions">${topActions()}</div>
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

function navButton(view, label, count = "") {
  return `
    <button class="nav-button" data-view="${view}" aria-current="${state.view === view ? "page" : "false"}">
      <span>${icon(view)}</span>
      <strong>${label}</strong>
      ${count ? `<b>${count}</b>` : ""}
    </button>
  `;
}

function sectionCount(key) {
  return Array.isArray(state.data[key]) ? state.data[key].length : "";
}

function viewTitle() {
  return sections.find(([key]) => key === state.view)?.[1] || "Staff Portal";
}

function viewSubtitle() {
  return sections.find(([key]) => key === state.view)?.[2] || "";
}

function topActions() {
  if (state.view === "overview") {
    return `
      <button class="ghost-button" data-open-drawer="todos">${icon("plus")} Task</button>
      <button class="primary-button" data-open-drawer="roster">${icon("plus")} Staff</button>
    `;
  }

  return `<button class="primary-button" data-open-drawer="${state.view}">${icon("plus")} Add ${viewTitle()}</button>`;
}

function renderView() {
  if (state.view === "overview") return renderOverview();
  if (state.view === "templates") return renderTemplates();
  if (state.view === "stats") return renderStats();
  return renderGenericSection(state.view);
}

function renderOverview() {
  const activeStaff = state.data.roster.filter((staff) => staff.status === "Active").length;
  const openApps = state.data.applications.filter((applicant) => applicant.outcome !== "Accepted" && applicant.outcome !== "Declined").length;
  const activeStrikes = state.data.strikes.filter((strike) => strike.status === "Active").length;
  const activeLoas = state.data.loas.filter((loa) => loa.status === "Approved").length;

  return `
    <section class="metric-grid">
      ${metric("Active Staff", activeStaff, "Roster live")}
      ${metric("Open Applications", openApps, "Needs review")}
      ${metric("Active Strikes", activeStrikes, "Discipline")}
      ${metric("Approved LOAs", activeLoas, "Coverage needed")}
    </section>
    <section class="dashboard-grid">
      <div class="panel">
        <div class="section-head">
          <div><h2>Management To-Do</h2><p>Current tasks needing staff action.</p></div>
          <button class="ghost-button" data-view="todos">Open List</button>
        </div>
        <div class="queue">
          ${state.data.todos.map((task) => `
            <article class="queue-item">
              <div>
                <h3>${task.task}</h3>
                <p>${task.owner} - due ${task.due}</p>
                <div class="tag-row">
                  <span class="tag ${task.status === "In Progress" ? "cyan" : "warn"}">${task.status}</span>
                </div>
              </div>
              <button class="icon-button" data-complete-task="${task.task}" title="Mark complete">OK</button>
            </article>
          `).join("")}
        </div>
      </div>
      <div class="panel">
        <div class="section-head">
          <div><h2>Recent Notes</h2><p>Latest management activity.</p></div>
        </div>
        <div class="timeline">
          ${timeline("Today", "Meeting note added", state.data.meetings[0]?.title || "No meeting notes yet")}
          ${timeline("Apps", "Applications open", `${openApps} applications need review`)}
          ${timeline("LOA", "Coverage check", `${activeLoas} approved LOA records`)}
          ${timeline("PC", "PC checks", `${state.data.pcChecks.length} records logged`)}
        </div>
      </div>
    </section>
  `;
}

function renderGenericSection(key) {
  const items = state.data[key] || [];
  return `
    <div class="filters">
      <label class="field">Search<input data-search="${key}" placeholder="Search ${viewTitle().toLowerCase()}" /></label>
    </div>
    <section class="records-grid" data-list="${key}">
      ${genericCards(key, items)}
    </section>
  `;
}

function genericCards(key, items) {
  if (!items.length) return `<div class="empty">No ${viewTitle().toLowerCase()} added yet.</div>`;
  return items.map((item, index) => cardFor(key, item, index)).join("");
}

function cardFor(key, item, index) {
  const fields = Object.entries(item);
  const [titleKey, titleValue] = fields[0] || ["Item", "Untitled"];
  const secondary = fields.slice(1, 3).map(([, value]) => value).join(" - ");
  const body = fields.slice(3).map(([label, value]) => `<span class="tag">${titleCase(label)}: ${value}</span>`).join("");
  const tone = key === "blacklist" || key === "strikes" ? "danger" : key === "vouchers" || key === "loas" ? "cyan" : "";

  return `
    <article class="record-card">
      <div class="section-head">
        <div>
          <h3>${titleValue}</h3>
          <p>${secondary || titleCase(titleKey)}</p>
        </div>
        <span class="tag ${tone}">${viewTitle()}</span>
      </div>
      <div class="tag-row">${body}</div>
      <div class="tag-row">
        <button class="ghost-button" data-delete="${key}:${index}">Remove</button>
      </div>
    </article>
  `;
}

function renderStats() {
  return `
    <div class="panel">
      <div class="section-head">
        <div><h2>Staff Activity Stats</h2><p>Manual for now, ready to connect to automation later.</p></div>
        <button class="primary-button" data-open-drawer="stats">${icon("plus")} Add Stats</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Staff</th><th>Tickets</th><th>Hours</th><th>Meetings</th><th>Score</th><th></th></tr></thead>
          <tbody>
            ${state.data.stats.map((row, index) => `
              <tr>
                <td>${row.name}</td>
                <td>${row.tickets}</td>
                <td>${row.hours}</td>
                <td>${row.meetings}</td>
                <td><span class="tag cyan">${row.score}</span></td>
                <td><button class="ghost-button" data-delete="stats:${index}">Remove</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTemplates() {
  return `
    <div class="filters">
      <label class="field">Search<input data-search="templates" placeholder="Search templates" /></label>
    </div>
    <section class="records-grid" data-list="templates">
      ${templateCards(state.data.templates)}
    </section>
  `;
}

function templateCards(items) {
  if (!items.length) return `<div class="empty">No templates added yet.</div>`;
  return items.map((item, index) => `
    <article class="record-card">
      <div class="section-head">
        <div><h3>${item.title}</h3><p>${item.category}</p></div>
        <span class="tag cyan">Template</span>
      </div>
      <pre class="template-body">${item.body}</pre>
      <div class="tag-row">
        <button class="ghost-button" data-copy-template="${index}">Copy</button>
        <button class="ghost-button" data-delete="templates:${index}">Remove</button>
      </div>
    </article>
  `).join("");
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
        <p class="eyebrow">Add Entry</p>
        <h2>${drawerTitle(type)}</h2>
      </div>
      <button class="icon-button" data-close-drawer title="Close">${icon("close")}</button>
    </div>
    ${formFor(type)}
  `;
  drawer.querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);
  drawer.querySelector("form").addEventListener("submit", (event) => saveForm(event, type));
}

function drawerTitle(type) {
  return sections.find(([key]) => key === type)?.[1] || "Entry";
}

function formFor(type) {
  const forms = {
    roster: [
      ["name", "Staff name", "text"], ["discord", "Discord", "text"], ["rank", "Rank", "text"],
      ["department", "Department", "text"], ["status", "Status", "select:Active|LOA|Probation|Suspended|Inactive"], ["joined", "Joined date", "date"],
    ],
    meetings: [["title", "Meeting title", "text"], ["date", "Date", "date"], ["lead", "Lead", "text"], ["notes", "Notes", "textarea"]],
    todos: [["task", "Task", "text"], ["owner", "Owner", "text"], ["due", "Due date", "date"], ["status", "Status", "select:Pending|In Progress|Complete"]],
    team: [["group", "Team name", "text"], ["lead", "Lead", "text"], ["members", "Members", "number"], ["focus", "Focus", "textarea"]],
    stats: [["name", "Staff name", "text"], ["tickets", "Tickets", "number"], ["hours", "Hours", "number"], ["meetings", "Meetings", "number"], ["score", "Score", "select:Training|Stable|Good|Excellent"]],
    vouchers: [["staff", "Staff", "text"], ["reason", "Reason", "textarea"], ["value", "Value", "text"], ["status", "Status", "select:Pending|Approved|Declined|Paid"]],
    strikes: [["staff", "Staff", "text"], ["level", "Level", "select:Verbal|Strike 1|Strike 2|Final Strike"], ["date", "Date", "date"], ["reason", "Reason", "textarea"], ["status", "Status", "select:Active|Expired|Appealed|Removed"]],
    applications: [["applicant", "Applicant", "text"], ["discord", "Discord", "text"], ["stage", "Stage", "select:Screening|Interview|Trial|Accepted|Declined"], ["reviewer", "Reviewer", "text"], ["outcome", "Outcome", "select:Pending|Needs Review|Accepted|Declined"]],
    loas: [["staff", "Staff", "text"], ["from", "From", "date"], ["to", "To", "date"], ["reason", "Reason", "textarea"], ["status", "Status", "select:Pending|Approved|Declined|Returned"]],
    pcChecks: [["staff", "Staff", "text"], ["date", "Date", "date"], ["checker", "Checker", "text"], ["result", "Result", "select:Scheduled|Passed|Failed|Needs Review"], ["notes", "Notes", "textarea"]],
    templates: [["title", "Title", "text"], ["category", "Category", "text"], ["body", "Template body", "textarea"]],
    blacklist: [["name", "Name", "text"], ["discord", "Discord", "text"], ["reason", "Reason", "textarea"], ["date", "Date", "date"], ["addedBy", "Added by", "text"]],
  };

  const fields = forms[type] || forms.todos;
  return `
    <form class="form-grid">
      ${fields.map(([name, label, kind]) => field(name, label, kind)).join("")}
      <button class="primary-button wide" type="submit">Save ${drawerTitle(type)}</button>
    </form>
  `;
}

function field(name, label, kind) {
  if (kind === "textarea") {
    return `<label class="wide">${label}<textarea name="${name}" required></textarea></label>`;
  }
  if (kind.startsWith("select:")) {
    const options = kind.replace("select:", "").split("|").map((option) => `<option>${option}</option>`).join("");
    return `<label>${label}<select name="${name}">${options}</select></label>`;
  }
  return `<label>${label}<input name="${name}" type="${kind}" required /></label>`;
}

function saveForm(event, type) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  state.data[type].unshift(data);
  state.view = type;
  persist();
  closeDrawer();
  renderPortal();
  toast(`${drawerTitle(type)} saved.`);
}

function closeDrawer() {
  document.querySelector("#drawer").classList.remove("open");
}

function bindViewEvents() {
  document.querySelectorAll("[data-search]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.search;
      const query = input.value.toLowerCase();
      const filtered = state.data[key].filter((item) => Object.values(item).join(" ").toLowerCase().includes(query));
      const list = document.querySelector(`[data-list="${key}"]`);
      if (key === "templates") list.innerHTML = templateCards(filtered);
      else list.innerHTML = genericCards(key, filtered);
      bindViewEvents();
    });
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const [key, index] = button.dataset.delete.split(":");
      state.data[key].splice(Number(index), 1);
      persist();
      renderPortal();
      toast("Entry removed.");
    });
  });

  document.querySelectorAll("[data-copy-template]").forEach((button) => {
    button.addEventListener("click", async () => {
      const template = state.data.templates[Number(button.dataset.copyTemplate)];
      await navigator.clipboard.writeText(template.body);
      toast("Template copied.");
    });
  });

  document.querySelectorAll("[data-complete-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.data.todos.find((item) => item.task === button.dataset.completeTask);
      if (task) task.status = "Complete";
      persist();
      renderPortal();
      toast("Task marked complete.");
    });
  });
}

function titleCase(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
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

boot().catch((error) => {
  console.error(error);
  app.innerHTML = `
    <section class="login-page">
      <div class="login-panel">
        <section class="login-form-pane">
          <p class="eyebrow">Portal Error</p>
          <h2>The staff portal could not load</h2>
          <p>Please refresh the page. If this continues, re-upload app.js and styles.css to GitHub.</p>
        </section>
      </div>
    </section>
  `;
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
