import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { seed } from "./seed";
import type { Data } from "./seed";
import { uid, isOverdue, relationshipKeys, dateInput } from "./model";
import type { Entity, Row } from "./model";
const KEY = "meridian.crm.v1";
function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const d = JSON.parse(saved);
      if (
        d.version === 1 &&
        d.records &&
        d.config &&
        d.events &&
        d.notifications
      )
        return {
          ...d,
          dismissedNotificationIds: d.dismissedNotificationIds || [],
          config: {
            ...d.config,
            departments: d.config.departments || [
              "Operations",
              "Quality",
              "Client Services",
            ],
          },
        } as Data;
    }
  } catch {}
  return seed();
}
type Store = {
  data: Data;
  toast: string;
  setToast: (s: string) => void;
  save: (e: Entity, r: Row) => void;
  remove: (e: Entity, id: string) => boolean;
  comment: (e: Entity, id: string, detail: string) => void;
  update: (fn: (d: Data) => void) => void;
  reset: () => void;
  simulate: (rule: Row, target: Row) => string;
  importRows: (rows: Row[]) => void;
};
const Context = createContext<Store>(null!);
function recordEvent(d: Data, e: Entity, r: Row, label: string, detail = "") {
  d.events.unshift({
    id: uid(),
    entity: e,
    recordId: r.id,
    label,
    detail,
    at: new Date().toISOString(),
  });
}
function notify(d: Data, title: string, body: string, path: string) {
  d.notifications.unshift({
    id: uid(),
    title,
    body,
    path,
    read: false,
    at: new Date().toISOString(),
  });
}
export function ruleMatches(d: Data, rule: Row, target: Row) {
  const lang = d.records.customers.find(
    (c) => c.id === target.customerId,
  )?.language;
  return (
    rule.condition === "Any record" ||
    (rule.condition === "French language" && lang === "French") ||
    (rule.condition === "High priority" &&
      ["High", "Urgent"].includes(target.priority)) ||
    (rule.condition === "Overdue" && isOverdue(target))
  );
}
function applyRule(d: Data, rule: Row, target: Row, entity: Entity) {
  if (rule.status !== "Active") return "Activate this rule before simulating.";
  if (!ruleMatches(d, rule, target))
    return "Condition not met. No records changed.";
  if (rule.action === "Assign employee") {
    const agent = d.records.employees.find(
      (a) => a.id === rule.employeeId && a.status === "Active",
    );
    if (!agent) return "Select an active employee for this rule.";
    const lang = d.records.customers.find(
      (c) => c.id === target.customerId,
    )?.language;
    if (lang && !agent.language.includes(lang))
      return "The employee does not speak the customer language.";
    target.employeeId = agent.id;
  } else if (rule.action === "Escalate ticket") {
    if (entity !== "tickets") return "Escalation requires a ticket trigger.";
    target.status = "Escalated";
    if (rule.employeeId) target.employeeId = rule.employeeId;
  } else if (rule.action === "Create task") {
    const customer = d.records.customers.find(
      (c) => c.id === target.customerId,
    );
    const r: Row = {
      id: uid(),
      name: "Automation follow-up",
      status: "To do",
      createdAt: new Date().toISOString(),
      customerId: target.customerId || "",
      campaignId: target.campaignId || "",
      clientId: target.clientId || customer?.clientId || "",
      employeeId: rule.employeeId || target.employeeId,
      priority: "Medium",
      due: dateInput(1),
      notes: rule.name,
    };
    d.records.tasks.unshift(r);
    recordEvent(d, "tasks", r, "Created", rule.name);
  } else if (rule.action === "Request approval") {
    target.approval = "Pending approval";
  }
  recordEvent(d, entity, target, "Automation applied", rule.name);
  notify(
    d,
    rule.action === "Request approval"
      ? "Approval requested"
      : "Automation applied",
    rule.name,
    `/${entity}/${target.id}`,
  );
  return "Simulation complete. Local records updated.";
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(initial);
  const [toast, setToast] = useState("");
  const update = (fn: (d: Data) => void) =>
    setData((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      setToast("Local storage is full. Export your data before refreshing.");
    }
  }, [data]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    if (!data.config.preferences.reminders) return;
    const due = data.records.followups.filter(
      (r) =>
        isOverdue(r) &&
        !data.dismissedNotificationIds.includes("reminder-" + r.id),
    );
    if (
      due.some(
        (r) => !data.notifications.some((n) => n.id === "reminder-" + r.id),
      )
    )
      update((d) => {
        due.forEach((r) => {
          if (!d.notifications.some((n) => n.id === "reminder-" + r.id))
            d.notifications.unshift({
              id: "reminder-" + r.id,
              title: "Follow-up reminder",
              body: r.name,
              path: "/followups/" + r.id,
              read: false,
              at: new Date().toISOString(),
            });
        });
      });
  }, [data.config.preferences.reminders, data.records.followups]);
  const save = (e: Entity, row: Row) => {
    update((d) => {
      const idx = d.records[e].findIndex((r) => r.id === row.id);
      const r = structuredClone(row);
      if (idx < 0) d.records[e].unshift(r);
      else d.records[e][idx] = r;
      // Maintain the two editable sides of employee/campaign membership.
      if (e === "employees") {
        d.records.campaigns.forEach((campaign) => {
          const ids = new Set(
            (campaign.employeeIds || "").split("|").filter(Boolean),
          );
          if ((r.campaignIds || "").split("|").includes(campaign.id))
            ids.add(r.id);
          else ids.delete(r.id);
          campaign.employeeIds = [...ids].join("|");
        });
      }
      if (e === "campaigns") {
        d.records.employees.forEach((employee) => {
          const ids = new Set(
            (employee.campaignIds || "").split("|").filter(Boolean),
          );
          if ((r.employeeIds || "").split("|").includes(employee.id))
            ids.add(r.id);
          else ids.delete(r.id);
          employee.campaignIds = [...ids].join("|");
        });
        Object.values(d.records)
          .flat()
          .forEach((related) => {
            if (related.campaignId === r.id) related.clientId = r.clientId;
          });
      }
      if (e === "customers") {
        Object.values(d.records)
          .flat()
          .forEach((related) => {
            if (related.customerId === r.id) {
              related.clientId = r.clientId;
              related.campaignId = r.campaignId;
            }
          });
      }
      recordEvent(d, e, r, idx < 0 ? "Created" : "Updated");
      if (["tasks", "tickets", "followups"].includes(e))
        notify(
          d,
          idx < 0 ? "Work assigned" : "Status updated",
          r.name,
          `/${e}/${r.id}`,
        );
      if (idx < 0 && ["tickets", "tasks"].includes(e)) {
        const trigger = e === "tickets" ? "Ticket created" : "Task created";
        d.records.automation
          .filter((a) => a.trigger === trigger && a.status === "Active")
          .forEach((a) => applyRule(d, a, r, e));
      }
    });
    setToast("Changes saved");
  };
  const remove = (e: Entity, id: string) => {
    const referenced = Object.entries(data.records).some(([kind, rows]) =>
      rows.some(
        (r) =>
          !(kind === e && r.id === id) &&
          (Object.entries(relationshipKeys).some(
            ([key, entity]) => entity === e && r[key] === id,
          ) ||
            (e === "employees" && r.employeeIds?.split("|").includes(id)) ||
            (e === "campaigns" && r.campaignIds?.split("|").includes(id)) ||
            (["calls", "tickets"].includes(e) && r.interactionId === id)),
      ),
    );
    if (referenced) {
      setToast(
        "This record has related activity. Reassign related records or deactivate it.",
      );
      return false;
    }
    update((d) => {
      d.records[e] = d.records[e].filter((r) => r.id !== id);
      d.events = d.events.filter((v) => v.entity !== e || v.recordId !== id);
      d.notifications = d.notifications.filter((n) => n.path !== `/${e}/${id}`);
    });
    setToast("Record deleted");
    return true;
  };
  const comment = (e: Entity, id: string, detail: string) => {
    update((d) => {
      const row = d.records[e].find((r) => r.id === id);
      if (row) recordEvent(d, e, row, "Note added", detail);
    });
    setToast("Note added");
  };
  const simulate = (rule: Row, target: Row) => {
    const e: Entity =
      rule.trigger === "Ticket created"
        ? "tickets"
        : rule.trigger === "Task created"
          ? "tasks"
          : "followups";
    const clone = structuredClone(data);
    const row = clone.records[e].find((r) => r.id === target.id);
    if (!row) return "Record not found";
    const result = applyRule(clone, rule, row, e);
    setData(clone);
    setToast(result);
    return result;
  };
  return (
    <Context.Provider
      value={{
        data,
        toast,
        setToast,
        update,
        save,
        remove,
        comment,
        simulate,
        reset: () => {
          setData(seed());
          setToast("Demo data restored");
        },
        importRows: (rows) => {
          update((d) => {
            rows.forEach((r) => {
              d.records.customers.unshift(r);
              recordEvent(d, "customers", r, "Imported");
            });
          });
          setToast("Import complete");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
