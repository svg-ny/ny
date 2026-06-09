const CONFIG = {
  logoUrl: "assets/vanity-logo.png",
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
  data: structuredClone(initialData),
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
