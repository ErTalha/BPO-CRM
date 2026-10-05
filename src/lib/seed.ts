import { dateInput } from "./model";
import type { Entity, Row } from "./model";
export type Event = {
  id: string;
  entity: Entity;
  recordId: string;
  label: string;
  detail: string;
  at: string;
};
export type Notice = {
  id: string;
  title: string;
  body: string;
  path: string;
  read: boolean;
  at: string;
};
export type Configuration = {
  categories: string[];
  priorities: string[];
  stages: string[];
  teams: string[];
  departments: string[];
  customFields: {
    id: string;
    name: string;
    entity: Entity;
    required: boolean;
  }[];
  roles: Record<string, string[]>;
  preferences: {
    weekStart: string;
    defaultLanguage: string;
    reminders: boolean;
    timezone: string;
  };
};
export type Data = {
  version: number;
  records: Record<Entity, Row[]>;
  events: Event[];
  notifications: Notice[];
  dismissedNotificationIds: string[];
  config: Configuration;
};
export function seed(): Data {
  const records = Object.fromEntries(
    [
      "clients",
      "campaigns",
      "customers",
      "calls",
      "tasks",
      "followups",
      "tickets",
      "automation",
      "employees",
      "evaluations",
      "templates",
      "articles",
    ].map((k) => [k, []]),
  ) as unknown as Record<Entity, Row[]>;
  const add = (
    entity: Entity,
    id: string,
    name: string,
    extra: Record<string, string>,
    days = 0,
  ) =>
    records[entity].push({
      id,
      name,
      status: "Active",
      createdAt: new Date(Date.now() - days * 86400000).toISOString(),
      ...extra,
    });
  const clients = [
    "Solstice Telecom",
    "Maison & Co.",
    "Evergreen Health",
    "Aster Financial",
    "Northstar Travel",
    "Bloom Commerce",
  ];
  const industries = [
    "Telecommunications",
    "Retail",
    "Healthcare",
    "Financial services",
    "Travel",
    "E-commerce",
  ];
  const teams = ["Atlas", "Horizon", "Nova"];
  const names = [
    "Amara Diallo",
    "Lucas Moreau",
    "Maya Bennett",
    "Noah Laurent",
    "Elena Costa",
    "Theo Martin",
    "Zara Quinn",
    "Leo Dubois",
    "Iris Chen",
    "Milo Reyes",
    "Ava Sinclair",
    "Hugo Petit",
  ];
  const projects = [
    "Customer care · EN",
    "Concierge support · FR",
    "Patient assistance",
    "Account onboarding",
    "Travel helpdesk",
    "Order experience",
  ];
  clients.forEach((n, i) => {
    add(
      "clients",
      "cli" + i,
      n,
      {
        industry: industries[i],
        team: teams[i % 3],
        email: `hello@client${i + 1}.example`,
        phone: `+1 202 555 01${10 + i}`,
        contacts: `${["Morgan Ellis", "Camille Roche", "Robin Wells", "Alex Rowan", "Jamie Lake", "Sasha Reed"][i]} · Account lead · contact@client${i + 1}.example`,
        contract: "MSA-2026-00" + (i + 1),
        contractStart: "2026-01-01",
        contractEnd: "2026-12-31",
        requirements:
          i === 1
            ? "French concierge support; 4-hour response SLA."
            : "English and French customer support; 8-hour response SLA.",
        notes: "Quarterly service review and monthly performance reporting.",
      },
      32,
    );
    add(
      "campaigns",
      "cam" + i,
      projects[i],
      {
        clientId: "cli" + i,
        team: teams[i % 3],
        employeeIds: `emp${i}|emp${i + 6}`,
        target: String(1200 + i * 350),
        progress: String([78, 64, 91, 46, 82, 58][i]),
        workflow: "New → Assigned → In progress → Quality review → Closed",
        language: i % 2 ? "French" : "English",
        start: dateInput(-30).slice(0, 10),
        end: dateInput(45).slice(0, 10),
      },
      26,
    );
  });
  names.forEach((n, i) =>
    add(
      "employees",
      "emp" + i,
      n,
      {
        email: `agent${i + 1}@meridian.example`,
        role:
          i === 0
            ? "Operations Manager"
            : i < 3
              ? "Supervisor"
              : i === 10
                ? "Quality Analyst"
                : i === 11
                  ? "Account Manager"
                  : "Agent",
        department: i === 10 ? "Quality" : "Operations",
        team: teams[i % 3],
        supervisorId: i > 2 ? "emp" + (i % 3) : "",
        language:
          i % 3 === 0 ? "English" : i % 3 === 1 ? "French" : "English & French",
        campaignIds: `cam${i % 6}`,
        permissions: "",
        notes: "",
        status: i === 9 ? "Inactive" : "Active",
      },
      60,
    ),
  );
  const people = [
    "Lina Avery",
    "Oliver Marsh",
    "Chloé Valois",
    "Ethan Brooks",
    "Sofia Lane",
    "Gabriel Roy",
    "Nora Blake",
    "Louis Perrin",
    "Aria Ford",
    "Oscar Finch",
    "Alice Durant",
    "Finn Ellis",
    "Eva Stone",
    "Jules Leroy",
    "Mia River",
    "Arthur Noel",
    "Isla Reed",
    "Adam Wells",
    "Léa Garnier",
    "Felix Dale",
    "Rose Briar",
    "Eli Woods",
    "Emma Faure",
    "Owen Park",
    "Ana West",
    "Paul Dumas",
    "Grace Hill",
    "Sami Cole",
    "Clara Paris",
    "Ben Arden",
    "Zoé Millet",
    "Nico James",
  ];
  people.forEach((n, i) =>
    add(
      "customers",
      "cus" + i,
      n,
      {
        email: `customer${i + 1}@example.com`,
        phone: `+1 202 555 01${String(i).padStart(2, "0")}`,
        clientId: "cli" + (i % 6),
        campaignId: "cam" + (i % 6),
        employeeId: "emp" + (i % 2 ? 4 : 3),
        language: i % 2 ? "French" : "English",
        type: i % 4 === 0 ? "Lead" : "Customer",
        status: ["Customer", "Qualified", "New", "Contacted"][i % 4],
        company: "",
        followup:
          i % 3 === 0
            ? "Confirm the next steps after the support conversation."
            : "",
        notes: "Fictional demonstration profile.",
      },
      i % 14,
    ),
  );
  const taskNames = [
    "Review onboarding documents",
    "Prepare weekly service review",
    "Confirm address update",
    "Investigate duplicate invoice",
    "Validate account information",
    "Review campaign handover",
    "Update customer preferences",
    "Prepare retention offer",
    "Reconcile open requests",
    "Review support knowledge article",
  ];
  for (let i = 0; i < 20; i++)
    add(
      "tasks",
      "tsk" + i,
      taskNames[i % 10],
      {
        clientId: "cli" + (i % 6),
        campaignId: "cam" + (i % 6),
        customerId: "cus" + i,
        employeeId:
          "emp" +
          (i % 2
            ? [1, 4, 5, 7][Math.floor(i / 2) % 4]
            : [0, 2, 3, 6][Math.floor(i / 2) % 4]),
        priority: ["Medium", "High", "Low", "Urgent"][i % 4],
        due: dateInput((i % 8) - 2),
        status: ["To do", "In progress", "Review", "Completed"][i % 4],
        notes: "Review the customer context and document the next action.",
      },
      i % 9,
    );
  const ticketNames = [
    "Unable to access account",
    "Invoice amount clarification",
    "Delivery status enquiry",
    "Update contact information",
    "Refund request review",
    "Service activation delay",
    "Subscription plan change",
    "Payment confirmation missing",
  ];
  for (let i = 0; i < 16; i++)
    add(
      "tickets",
      "tic" + i,
      ticketNames[i % 8],
      {
        customerId: "cus" + i,
        clientId: "cli" + (i % 6),
        campaignId: "cam" + (i % 6),
        employeeId:
          "emp" +
          (i % 2
            ? [1, 4, 5, 7][Math.floor(i / 2) % 4]
            : [0, 2, 3, 6][Math.floor(i / 2) % 4]),
        priority: ["High", "Medium", "Urgent", "Low"][i % 4],
        category: ["Technical", "Billing", "General", "Complaint"][i % 4],
        due: dateInput((i % 5) - 1),
        status: ["Open", "In progress", "Escalated", "Resolved"][i % 4],
        notes:
          "Customer requested assistance. Verify the account details and provide a clear update.",
        resolution:
          i % 4 === 3 ? "Issue verified and resolved with the customer." : "",
        attachments: i % 3 === 0 ? "sample-request.pdf (demo reference)" : "",
      },
      i % 7,
    );
  for (let i = 0; i < 18; i++)
    add(
      "calls",
      "cal" + i,
      [
        "Account assistance",
        "Billing enquiry",
        "Welcome conversation",
        "Service follow-up",
      ][i % 4],
      {
        customerId: "cus" + i,
        campaignId: "cam" + (i % 6),
        employeeId:
          "emp" +
          (i % 2
            ? [1, 4, 5, 7][Math.floor(i / 2) % 4]
            : [0, 2, 3, 6][Math.floor(i / 2) % 4]),
        direction: i % 3 ? "Incoming" : "Outgoing",
        duration: String(125 + i * 23),
        disposition: i % 3 ? "Resolved" : "Follow-up needed",
        status: i === 8 ? "Missed" : "Completed",
        notes:
          "Demonstration interaction. Customer identity confirmed; next steps explained.",
      },
      i % 10,
    );
  for (let i = 0; i < 10; i++)
    add(
      "followups",
      "fol" + i,
      [
        "Confirm resolution",
        "Review requested documents",
        "Share account update",
        "Discuss service options",
      ][i % 4],
      {
        customerId: "cus" + i,
        campaignId: "cam" + (i % 6),
        employeeId:
          "emp" +
          (i % 2
            ? [1, 4, 5, 7][Math.floor(i / 2) % 4]
            : [0, 2, 3, 6][Math.floor(i / 2) % 4]),
        due: dateInput(i - 2),
        channel: ["Call", "Email", "SMS", "WhatsApp"][i % 4],
        status: i === 5 ? "Completed" : "Scheduled",
        outcome: i === 5 ? "Customer confirmed the issue is resolved." : "",
        notes: "Follow up in the customer’s preferred language.",
      },
      3,
    );
  add("automation", "aut0", "French support routing", {
    trigger: "Ticket created",
    condition: "French language",
    action: "Assign employee",
    employeeId: "emp4",
    notes: "Route French enquiries to a French-speaking agent.",
  });
  add("automation", "aut1", "Priority escalation", {
    trigger: "Ticket created",
    condition: "High priority",
    action: "Escalate ticket",
    employeeId: "emp1",
    notes: "Notify the supervisor when a high-priority ticket arrives.",
  });
  add("automation", "aut2", "Follow-up reminder", {
    trigger: "Follow-up due",
    condition: "Overdue",
    action: "Notify supervisor",
    employeeId: "emp0",
    notes: "Create a local reminder for overdue follow-ups.",
  });
  add("automation", "aut3", "Approval before closure", {
    trigger: "Task created",
    condition: "Any record",
    action: "Request approval",
    employeeId: "emp2",
    status: "Inactive",
    notes: "Request a supervisor review.",
  });
  for (let i = 0; i < 5; i++)
    add(
      "evaluations",
      "eva" + i,
      "Service quality review",
      {
        employeeId: records.calls[i].employeeId,
        campaignId: records.calls[i].campaignId,
        customerId: records.calls[i].customerId,
        interactionId: "cal" + i,
        interactionType: "calls",
        score: String(84 + i * 3),
        greeting: "4",
        accuracy: "5",
        empathy: "4",
        resolution: "4",
        notes: "Clear explanation and thoughtful next steps.",
        improvement: "Confirm understanding before closing.",
        status: "Completed",
      },
      i * 2,
    );
  [
    [
      "Welcome email",
      "Email",
      "Hello {{customer}}, welcome! Your request is with our team.",
      "Bonjour {{customer}}, bienvenue ! Notre équipe traite votre demande.",
    ],
    [
      "Follow-up reminder",
      "SMS",
      "Hello {{customer}}, your follow-up is scheduled for today.",
      "Bonjour {{customer}}, votre suivi est prévu aujourd’hui.",
    ],
    [
      "Resolution update",
      "WhatsApp",
      "Hello {{customer}}, your request is resolved. We are here if you need anything else.",
      "Bonjour {{customer}}, votre demande est résolue. Nous restons à votre disposition.",
    ],
  ].forEach((a, i) =>
    add("templates", "tpl" + i, a[0], {
      channel: a[1],
      bodyEn: a[2],
      bodyFr: a[3],
    }),
  );
  [
    [
      "Account verification",
      "Verify the customer’s reference and preferred language. Never request passwords. Record only the information needed to resolve the enquiry.",
      "Vérifiez la référence du client et sa langue préférée. Ne demandez jamais de mot de passe. Consignez uniquement les informations nécessaires.",
    ],
    [
      "Escalation guide",
      "Confirm the issue, capture the impact and assign the ticket to a supervisor. Schedule a follow-up and explain the next steps.",
      "Confirmez le problème, consignez son impact et attribuez le ticket au superviseur. Planifiez un suivi et expliquez les prochaines étapes.",
    ],
  ].forEach((a, i) =>
    add("articles", "art" + i, a[0], {
      bodyEn: a[1],
      bodyFr: a[2],
      category: "General",
    }),
  );
  return {
    version: 1,
    dismissedNotificationIds: [],
    records,
    events: [
      {
        id: "ev0",
        entity: "tickets",
        recordId: "tic0",
        label: "Created",
        detail: "",
        at: new Date().toISOString(),
      },
    ],
    notifications: [
      {
        id: "not0",
        title: "Follow-up reminder",
        body: "Confirm resolution",
        path: "/followups/fol0",
        read: false,
        at: new Date().toISOString(),
      },
      {
        id: "not1",
        title: "Ticket escalated",
        body: ticketNames[2],
        path: "/tickets/tic2",
        read: false,
        at: new Date().toISOString(),
      },
      {
        id: "not2",
        title: "Task assigned",
        body: taskNames[0],
        path: "/tasks/tsk0",
        read: true,
        at: new Date().toISOString(),
      },
    ],
    config: {
      departments: ["Operations", "Quality", "Client Services"],
      categories: ["Billing", "Technical", "General", "Complaint"],
      priorities: ["Low", "Medium", "High", "Urgent"],
      stages: ["New", "Contacted", "Qualified", "Customer", "Closed"],
      teams,
      customFields: [],
      roles: {
        "Super Admin": [
          "View",
          "Create",
          "Edit",
          "Delete",
          "Assign",
          "Configure",
        ],
        "Operations Manager": ["View", "Create", "Edit", "Assign"],
        Supervisor: ["View", "Edit", "Assign"],
        Agent: ["View", "Edit"],
        "Quality Analyst": ["View", "Edit"],
        "Account Manager": ["View"],
      },
      preferences: {
        weekStart: "Monday",
        defaultLanguage: "English",
        reminders: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
  };
}
