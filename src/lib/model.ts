export type Entity =
  | "clients"
  | "campaigns"
  | "customers"
  | "calls"
  | "tasks"
  | "followups"
  | "tickets"
  | "automation"
  | "employees"
  | "evaluations"
  | "templates"
  | "articles";
export type Row = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  [key: string]: string;
};
export type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  entity?: Entity;
  min?: number;
  max?: number;
};
export type Schema = {
  title: string;
  singular: string;
  description: string;
  fields: Field[];
  columns: string[];
  statuses: string[];
};
const field = (
  key: string,
  label: string,
  type = "text",
  extra: Partial<Field> = {},
): Field => ({ key, label, type, ...extra });
const rel = (key: string, label: string, entity: Entity, required = false) =>
  field(key, label, "relation", { entity, required });
const opt = (key: string, label: string, options: string[], required = false) =>
  field(key, label, "select", { options, required });
const name = field("name", "Name", "text", { required: true });
const language = opt("language", "Language", ["English", "French"], true);
const priority = opt(
  "priority",
  "Priority",
  ["Low", "Medium", "High", "Urgent"],
  true,
);
const employee = rel("employeeId", "Assigned employee", "employees", true);
const client = rel("clientId", "Client", "clients", true);
const campaign = rel("campaignId", "Campaign", "campaigns", true);
const customer = rel("customerId", "Customer", "customers", true);
const due = field("due", "Due date", "datetime-local", { required: true });
export const schemas: Record<Entity, Schema> = {
  clients: {
    title: "Clients",
    singular: "Client",
    description: "Strong partnerships. Connected operations.",
    statuses: ["Active", "Inactive"],
    columns: ["name", "industry", "team", "status"],
    fields: [
      name,
      field("industry", "Industry"),
      field("email", "Email", "email", { required: true }),
      field("phone", "Phone"),
      field("contacts", "Contact persons", "textarea", { required: true }),
      field("contract", "Contract reference"),
      field("contractStart", "Contract start", "date"),
      field("contractEnd", "Contract end", "date"),
      field("requirements", "Service requirements", "textarea"),
      opt("team", "Team", ["Atlas", "Horizon", "Nova"], true),
      field("notes", "Notes", "textarea"),
    ],
  },
  campaigns: {
    title: "Campaigns",
    singular: "Campaign",
    description: "Turn client goals into everyday progress.",
    statuses: ["Active", "Planning", "Paused", "Completed"],
    columns: ["name", "clientId", "team", "progress", "status"],
    fields: [
      name,
      client,
      opt("team", "Team", ["Atlas", "Horizon", "Nova"], true),
      field("employeeIds", "Assigned employees", "multi", {
        entity: "employees",
      }),
      field("target", "Monthly interaction target", "number", {
        required: true,
        min: 1,
      }),
      field("progress", "Progress (%)", "number", { min: 0, max: 100 }),
      field("workflow", "Workflow stages", "textarea", { required: true }),
      field("start", "Start date", "date"),
      field("end", "End date", "date"),
      language,
      field("notes", "Notes", "textarea"),
    ],
  },
  customers: {
    title: "Customers & leads",
    singular: "Customer",
    description: "Every relationship, with the full story.",
    statuses: ["New", "Contacted", "Qualified", "Customer", "Closed"],
    columns: ["name", "campaignId", "employeeId", "language", "status"],
    fields: [
      name,
      field("email", "Email", "email", { required: true }),
      field("phone", "Phone", "text", { required: true }),
      client,
      campaign,
      employee,
      language,
      opt("type", "Record type", ["Customer", "Lead"]),
      field("company", "Company"),
      field("followup", "Follow-up requirements", "textarea"),
      field("notes", "Notes", "textarea"),
    ],
  },
  calls: {
    title: "Calls",
    singular: "Call",
    description: "A clearer view of every conversation.",
    statuses: ["Completed", "Missed", "Cancelled"],
    columns: [
      "name",
      "customerId",
      "employeeId",
      "direction",
      "duration",
      "status",
    ],
    fields: [
      name,
      customer,
      campaign,
      employee,
      opt("direction", "Direction", ["Incoming", "Outgoing"], true),
      opt("disposition", "Disposition", [
        "Resolved",
        "Follow-up needed",
        "Escalated",
        "No answer",
      ]),
      field("duration", "Duration (seconds)", "number", { min: 0 }),
      field("notes", "Notes", "textarea"),
    ],
  },
  tasks: {
    title: "Tasks",
    singular: "Task",
    description: "Keep the right work moving forward.",
    statuses: ["To do", "In progress", "Review", "Completed"],
    columns: ["name", "employeeId", "campaignId", "priority", "due", "status"],
    fields: [
      name,
      client,
      campaign,
      rel("customerId", "Customer", "customers"),
      employee,
      priority,
      due,
      field("notes", "Description", "textarea"),
    ],
  },
  followups: {
    title: "Follow-ups",
    singular: "Follow-up",
    description: "Make every next conversation count.",
    statuses: ["Scheduled", "Completed", "Cancelled"],
    columns: ["name", "customerId", "employeeId", "due", "status"],
    fields: [
      name,
      customer,
      campaign,
      employee,
      due,
      opt("channel", "Channel", ["Call", "Email", "SMS", "WhatsApp"]),
      field("outcome", "Outcome", "textarea"),
      field("notes", "Notes", "textarea"),
    ],
  },
  tickets: {
    title: "Tickets",
    singular: "Ticket",
    description: "From first response to a confident resolution.",
    statuses: ["Open", "In progress", "Escalated", "Resolved", "Closed"],
    columns: ["name", "customerId", "employeeId", "priority", "sla", "status"],
    fields: [
      name,
      customer,
      client,
      campaign,
      employee,
      priority,
      opt(
        "category",
        "Category",
        ["Billing", "Technical", "General", "Complaint"],
        true,
      ),
      due,
      field("notes", "Description", "textarea", { required: true }),
      field("resolution", "Resolution", "textarea"),
      field("attachments", "Sample attachments", "file"),
    ],
  },
  automation: {
    title: "Automation",
    singular: "Automation rule",
    description: "Thoughtful rules. More time for people.",
    statuses: ["Active", "Inactive"],
    columns: ["name", "trigger", "condition", "action", "status"],
    fields: [
      name,
      opt(
        "trigger",
        "Trigger",
        ["Ticket created", "Task created", "Follow-up due"],
        true,
      ),
      opt(
        "condition",
        "Condition",
        ["Any record", "French language", "High priority", "Overdue"],
        true,
      ),
      opt(
        "action",
        "Action",
        [
          "Assign employee",
          "Create task",
          "Notify supervisor",
          "Escalate ticket",
          "Request approval",
        ],
        true,
      ),
      rel("employeeId", "Target employee", "employees"),
      field("notes", "Description", "textarea"),
    ],
  },
  employees: {
    title: "Employees",
    singular: "Employee",
    description: "Great service starts with a supported team.",
    statuses: ["Active", "Inactive"],
    columns: ["name", "role", "team", "language", "status"],
    fields: [
      name,
      field("email", "Email", "email", { required: true }),
      opt(
        "role",
        "Role",
        [
          "Operations Manager",
          "Supervisor",
          "Agent",
          "Quality Analyst",
          "Account Manager",
        ],
        true,
      ),
      opt(
        "department",
        "Department",
        ["Operations", "Quality", "Client Services"],
        true,
      ),
      opt("team", "Team", ["Atlas", "Horizon", "Nova"], true),
      rel("supervisorId", "Supervisor", "employees"),
      opt(
        "language",
        "Language proficiency",
        ["English", "French", "English & French"],
        true,
      ),
      field("campaignIds", "Campaign assignments", "multi", {
        entity: "campaigns",
      }),
      field("permissions", "Additional permissions", "textarea"),
      field("notes", "Notes", "textarea"),
    ],
  },
  evaluations: {
    title: "Evaluations",
    singular: "Evaluation",
    description: "Coaching that makes a difference.",
    statuses: ["Completed"],
    columns: ["name", "employeeId", "score", "createdAt"],
    fields: [
      name,
      employee,
      field("score", "Score", "number", { min: 0, max: 100 }),
      field("notes", "Feedback", "textarea"),
    ],
  },
  templates: {
    title: "Communication templates",
    singular: "Template",
    description: "The right message, in the right language.",
    statuses: ["Active", "Inactive"],
    columns: ["name", "channel", "status"],
    fields: [
      name,
      opt("channel", "Channel", ["Email", "SMS", "WhatsApp"], true),
      field("bodyEn", "English content", "textarea", { required: true }),
      field("bodyFr", "French content", "textarea", { required: true }),
    ],
  },
  articles: {
    title: "Knowledge base",
    singular: "Article",
    description: "Shared knowledge for consistent support.",
    statuses: ["Active", "Inactive"],
    columns: ["name", "category", "status"],
    fields: [
      name,
      field("category", "Category"),
      field("bodyEn", "English content", "textarea", { required: true }),
      field("bodyFr", "French content", "textarea", { required: true }),
    ],
  },
};
export const modules = [
  "dashboard",
  "clients",
  "campaigns",
  "customers",
  "calls",
  "tasks",
  "followups",
  "tickets",
  "automation",
  "employees",
  "quality",
  "reports",
  "notifications",
  "languages",
  "settings",
];
export const moduleTitles: Record<string, string> = {
  dashboard: "Overview",
  clients: "Clients",
  campaigns: "Campaigns",
  customers: "Customers & leads",
  calls: "Calls",
  tasks: "Tasks",
  followups: "Follow-ups",
  tickets: "Tickets",
  automation: "Automation",
  employees: "Employees",
  quality: "Quality assurance",
  reports: "Reports & analytics",
  notifications: "Notifications",
  languages: "Language hub",
  settings: "Settings",
};
export const dateInput = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(14, 0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
export const isDone = (r: Row) =>
  ["Completed", "Resolved", "Closed", "Cancelled", "Inactive"].includes(
    r.status,
  );
export const isOverdue = (r: Row) =>
  !!r.due && !isDone(r) && new Date(r.due) < new Date();
export const uid = () => crypto.randomUUID();
export const relationshipKeys: Record<string, Entity> = {
  clientId: "clients",
  campaignId: "campaigns",
  customerId: "customers",
  employeeId: "employees",
  supervisorId: "employees",
};
export function exportCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const esc = (x: string | number) => {
    let v = String(x ?? "");
    if (/^[=+@\-\t\r]/.test(v)) v = "'" + v;
    return '"' + v.replaceAll('"', '""') + '"';
  };
  const blob = new Blob(
    [
      "\uFEFF" +
        [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8" },
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function parseCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("Invalid CSV");
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
