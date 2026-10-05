import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Download,
  Upload,
  ArrowUpRight,
  List,
  Columns3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Phone,
  PhoneIncoming,
  Pencil,
  Trash2,
  Check,
  MessageSquare,
  ArrowLeft,
  Paperclip,
  Workflow,
  UserRound,
  Target,
  Clock,
} from "lucide-react";
import {
  schemas,
  isDone,
  isOverdue,
  exportCSV,
  relationshipKeys,
} from "../lib/model";
import type { Entity, Row } from "../lib/model";
import { useStore } from "../lib/store";
import {
  Badge,
  PageHead,
  SearchBox,
  Select,
  Pagination,
  Empty,
  Value,
  Avatar,
  ScopeFilters,
  blankScope,
  useScopeFilter,
  Stat,
} from "./common";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { RecordEditor, ImportCustomers } from "./editor";
import { CallSimulator, RecordingPlayer } from "./calls";
const labels: Record<string, string> = {
  name: "Name",
  clientId: "Client",
  campaignId: "Campaign",
  employeeId: "Assigned employee",
  customerId: "Customer",
  progress: "Progress",
  status: "Status",
  priority: "Priority",
  due: "Due date",
  sla: "SLA",
  industry: "Industry",
  team: "Team",
  role: "Role",
  language: "Language",
  direction: "Direction",
  duration: "Duration",
  trigger: "Trigger",
  condition: "Condition",
  action: "Action",
  score: "Score",
  createdAt: "Created",
  channel: "Channel",
  category: "Category",
};
export function DataTable({
  entity,
  rows,
  compact = false,
}: {
  entity: Entity;
  rows: Row[];
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const cols = compact ? ["name", "status"] : schemas[entity].columns;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{t(labels[c] || c)}</th>
            ))}
            <th>
              <span className="sr-only">{t("View record")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              {cols.map((c) => (
                <td key={c}>
                  {c === "name" ? (
                    <Link className="record-name" to={`/${entity}/${r.id}`}>
                      {["clients", "employees", "customers"].includes(
                        entity,
                      ) && <Avatar name={r.name} index={i} />}
                      <span>
                        {t(r.name)}
                        <small>
                          {entity === "customers" || entity === "employees"
                            ? r.email
                            : entity === "tickets"
                              ? "#" + r.id.slice(0, 8).toUpperCase()
                              : ""}
                        </small>
                      </span>
                    </Link>
                  ) : (
                    <Value row={r} field={c} />
                  )}
                </td>
              ))}
              <td>
                <Link
                  className="row-link"
                  to={`/${entity}/${r.id}`}
                  aria-label={t("View record") + " " + r.name}
                >
                  <ArrowUpRight size={17} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <Empty />}
    </div>
  );
}
export function EntityList({ entity }: { entity: Entity }) {
  const { data, save } = useStore();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const schema = schemas[entity];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(params.get("status") || "");
  const [employee, setEmployee] = useState("");
  const [scope, setScope] = useState(blankScope);
  const [page, setPage] = useState(1);
  const [view, setView] = useState("list");
  const [time, setTime] = useState("All");
  const [edit, setEdit] = useState(false);
  const [importing, setImporting] = useState(false);
  const [call, setCall] = useState<null | boolean>(null);
  const [month, setMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const filter = useScopeFilter();
  useEffect(() => {
    setPage(1);
  }, [query, status, scope, employee, time]);
  const rows = data.records[entity].filter(
    (r) =>
      (!query ||
        [
          r.name,
          t(r.name),
          r.email,
          r.phone,
          ...Object.entries(relationshipKeys).map(
            ([k, e]) => data.records[e].find((v) => v.id === r[k])?.name,
          ),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!status ||
        (status === "Overdue"
          ? isOverdue(r)
          : status === "Unresolved"
            ? !isDone(r)
            : r.status === status)) &&
      (!employee || r.employeeId === employee) &&
      filter(r, scope) &&
      (entity !== "followups" ||
        time === "All" ||
        (time === "Completed" && r.status === "Completed") ||
        (time === "Overdue" && isOverdue(r)) ||
        (time === "Today" &&
          r.due?.slice(0, 10) === new Date().toLocaleDateString("en-CA")) ||
        (time === "Upcoming" && !isDone(r) && new Date(r.due) > new Date())),
  );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 8)));
  const exportRows = () =>
    exportCSV(
      `${entity}.csv`,
      schema.columns.map((c) => t(labels[c] || c)),
      rows.map((r) =>
        schema.columns.map((c) =>
          relationshipKeys[c]
            ? data.records[relationshipKeys[c]].find((v) => v.id === r[c])
                ?.name || ""
            : c === "sla"
              ? t(isOverdue(r) ? "Breached" : "Within SLA")
              : t(r[c] || ""),
        ),
      ),
    );
  const sunday = data.config.preferences.weekStart === "Sunday";
  const firstDay = sunday ? month.getDay() : (month.getDay() + 6) % 7;
  const cells = Array.from(
    { length: 42 },
    (_, i) => new Date(month.getFullYear(), month.getMonth(), i - firstDay + 1),
  );
  return (
    <>
      <PageHead
        title={schema.title}
        description={schema.description}
        eyebrow={
          ["clients", "campaigns"].includes(entity)
            ? "BUSINESS"
            : entity === "employees"
              ? "PEOPLE"
              : "OPERATIONS"
        }
        actions={
          <>
            <Button variant="outline" onClick={exportRows}>
              <Download size={16} />
              {t("Export")}
            </Button>
            {entity === "customers" && (
              <Button variant="outline" onClick={() => setImporting(true)}>
                <Upload size={16} />
                {t("Import")}
              </Button>
            )}
            {entity === "calls" ? (
              <>
                <Button variant="outline" onClick={() => setCall(true)}>
                  <PhoneIncoming size={16} />
                  {t("Incoming simulation")}
                </Button>
                <Button onClick={() => setCall(false)}>
                  <Phone size={16} />
                  {t("New call")}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEdit(true)}>
                <Plus size={17} />
                {t("Add")} {t(schema.singular)}
              </Button>
            )}
          </>
        }
      />
      <div className="mini-stats">
        <div>
          <span>{t("Total records")}</span>
          <b>{data.records[entity].length}</b>
        </div>
        <div>
          <span>{t("Active work")}</span>
          <b>{data.records[entity].filter((r) => !isDone(r)).length}</b>
        </div>
        <div>
          <span>
            {t(entity === "employees" ? "French proficient" : "Completed")}
          </span>
          <b>
            {
              data.records[entity].filter((r) =>
                entity === "employees"
                  ? r.language?.includes("French")
                  : isDone(r),
              ).length
            }
          </b>
        </div>
        {["tasks", "tickets", "followups"].includes(entity) && (
          <div>
            <span>{t("Overdue")}</span>
            <b className="overdue">
              {data.records[entity].filter(isOverdue).length}
            </b>
          </div>
        )}
      </div>
      <div className="card records-card">
        <div className="table-toolbar">
          <SearchBox value={query} onChange={setQuery} />
          <Select
            label="All statuses"
            value={status}
            onChange={setStatus}
            options={[
              ...(entity === "customers"
                ? data.config.stages
                : schema.statuses),
              ...(entity === "tickets" ? ["Unresolved"] : []),
              ...(["tasks", "followups"].includes(entity) ? ["Overdue"] : []),
            ].map((s) => ({ value: s, label: s }))}
          />
          {["tasks", "tickets", "followups", "calls"].includes(entity) && (
            <Select
              label="All employees"
              value={employee}
              onChange={setEmployee}
              options={data.records.employees.map((r) => ({
                value: r.id,
                label: r.name,
              }))}
            />
          )}
          <span className="toolbar-spacer" />
          {(entity === "tasks" || entity === "followups") && (
            <div className="segmented">
              <Button
                variant={view === "list" ? "outline" : "ghost"}
                size="icon"
                aria-label={t("List view")}
                onClick={() => setView("list")}
              >
                <List size={17} />
              </Button>
              <Button
                variant={view !== "list" ? "outline" : "ghost"}
                size="icon"
                aria-label={t(
                  entity === "tasks" ? "Kanban view" : "Calendar view",
                )}
                onClick={() => setView("alternate")}
              >
                {entity === "tasks" ? (
                  <Columns3 size={17} />
                ) : (
                  <CalendarDays size={17} />
                )}
              </Button>
            </div>
          )}
        </div>
        {!["automation", "templates", "articles"].includes(entity) && (
          <ScopeFilters scope={scope} setScope={setScope} dates={false} />
        )}
        {entity === "followups" && (
          <div className="tabs">
            {["All", "Today", "Upcoming", "Overdue", "Completed"].map((v) => (
              <button
                key={v}
                className={time === v ? "active" : ""}
                onClick={() => setTime(v)}
              >
                {t(v)}
              </button>
            ))}
          </div>
        )}
        {view === "list" ? (
          <>
            <DataTable
              entity={entity}
              rows={rows.slice((currentPage - 1) * 8, currentPage * 8)}
            />
            <Pagination
              page={currentPage}
              setPage={setPage}
              total={rows.length}
            />
          </>
        ) : entity === "tasks" ? (
          <div className="kanban">
            {schema.statuses.map((s) => (
              <div
                key={s}
                className="kanban-column"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const row = data.records.tasks.find(
                    (r) => r.id === e.dataTransfer.getData("text/plain"),
                  );
                  if (row) save("tasks", { ...row, status: s });
                }}
              >
                <h3>
                  <span className="status-dot" />
                  {t(s)}
                  <span>{rows.filter((r) => r.status === s).length}</span>
                </h3>
                {rows
                  .filter((r) => r.status === s)
                  .map((r) => (
                    <article
                      className="kanban-card"
                      key={r.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", r.id)
                      }
                    >
                      <Badge>{t(r.priority)}</Badge>
                      <Link to={"/tasks/" + r.id}>{r.name}</Link>
                      <small>
                        <Value row={r} field="campaignId" />
                      </small>
                      <div className="kanban-bottom">
                        <Value row={r} field="due" />
                        <Avatar
                          name={
                            data.records.employees.find(
                              (a) => a.id === r.employeeId,
                            )?.name || ""
                          }
                        />
                      </div>
                      <select
                        aria-label={t("Move task") + " " + r.name}
                        value={r.status}
                        onChange={(e) =>
                          save("tasks", { ...r, status: e.target.value })
                        }
                      >
                        {schema.statuses.map((s) => (
                          <option key={s} value={s}>
                            {t(s)}
                          </option>
                        ))}
                      </select>
                    </article>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="calendar">
            <div className="calendar-heading">
              <Button
                variant="outline"
                size="icon"
                aria-label={t("Previous month")}
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft size={18} />
              </Button>
              <h3>
                {month.toLocaleDateString(t("locale"), {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <Button
                variant="outline"
                size="icon"
                aria-label={t("Next month")}
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight size={18} />
              </Button>
            </div>
            <div className="calendar-grid">
              {(sunday
                ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
              ).map((d) => (
                <b key={d}>{t(d)}</b>
              ))}
              {cells.map((day, i) => (
                <div
                  className={
                    "calendar-day " +
                    (day.getMonth() !== month.getMonth() ? "faded" : "")
                  }
                  key={i}
                >
                  <span>{day.getDate()}</span>
                  {rows
                    .filter(
                      (r) =>
                        new Date(r.due).toDateString() === day.toDateString(),
                    )
                    .map((r) => (
                      <Link
                        key={r.id}
                        className={isOverdue(r) ? "late" : ""}
                        to={"/followups/" + r.id}
                      >
                        {r.name}
                      </Link>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {edit && <RecordEditor entity={entity} onClose={() => setEdit(false)} />}{" "}
      {importing && <ImportCustomers onClose={() => setImporting(false)} />}{" "}
      {call !== null && (
        <CallSimulator incoming={call} onClose={() => setCall(null)} />
      )}
    </>
  );
}
export function EntityDetail({ entity }: { entity: Entity }) {
  const { id } = useParams();
  const { data, save, remove, comment } = useStore();
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const row = data.records[entity].find((r) => r.id === id);
  const [editor, setEditor] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [note, setNote] = useState("");
  const [tab, setTab] = useState("Overview");
  const [call, setCall] = useState(false);
  const [relatedEditor, setRelatedEditor] = useState<Entity | null>(null);
  const [attachment, setAttachment] = useState("");
  const schema = schemas[entity];
  if (!row)
    return (
      <Empty
        title="Record not found"
        text="This record may have been deleted."
        action={
          <Button asChild>
            <Link to={"/" + entity}>{t("Back to list")}</Link>
          </Button>
        }
      />
    );
  const relKey =
    entity === "customers"
      ? "customerId"
      : entity === "clients"
        ? "clientId"
        : entity === "campaigns"
          ? "campaignId"
          : entity === "employees"
            ? "employeeId"
            : "";
  const related = (e: Entity) =>
    data.records[e].filter(
      (r) =>
        r[relKey] === row.id ||
        (entity === "clients" &&
          data.records.campaigns.find((c) => c.id === r.campaignId)
            ?.clientId === row.id) ||
        (entity === "employees" &&
          e === "campaigns" &&
          r.employeeIds?.split("|").includes(row.id)),
    );
  const events = data.events.filter(
    (e) =>
      (e.entity === entity && e.recordId === id) ||
      (entity === "customers" &&
        data.records[e.entity].find((r) => r.id === e.recordId)?.customerId ===
          id),
  );
  const customer =
    entity === "customers"
      ? row
      : data.records.customers.find((c) => c.id === row.customerId);
  return (
    <>
      <Link to={"/" + entity} className="back-link">
        <ArrowLeft size={15} />
        {t(schema.title)}
      </Link>
      <PageHead
        eyebrow={schema.singular.toUpperCase()}
        title={row.name}
        description={schema.description}
        actions={
          <>
            <Badge>{t(row.status)}</Badge>
            <Button variant="outline" onClick={() => setEditor(row)}>
              <Pencil size={16} />
              {t("Edit")}
            </Button>
            <Button
              variant="ghost"
              aria-label={t("Delete record")}
              onClick={() => setDeleting(true)}
            >
              <Trash2 size={17} />
            </Button>
          </>
        }
      />
      <div className="detail-actions">
        {entity === "customers" && (
          <>
            <Button onClick={() => setCall(true)}>
              <Phone size={16} />
              {t("Call customer")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setRelatedEditor("tickets")}
            >
              {t("Create ticket")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setRelatedEditor("followups")}
            >
              {t("Schedule follow-up")}
            </Button>
            <Button variant="outline" onClick={() => setRelatedEditor("tasks")}>
              {t("Create task")}
            </Button>
          </>
        )}
        {entity === "tasks" && !isDone(row) && (
          <Button onClick={() => save(entity, { ...row, status: "Completed" })}>
            <Check size={16} />
            {t("Mark complete")}
          </Button>
        )}
        {entity === "followups" && (
          <>
            <Button onClick={() => setEditor({ ...row, status: "Completed" })}>
              {t("Record outcome")}
            </Button>
            <Button variant="outline" onClick={() => setEditor(row)}>
              {t("Reschedule")}
            </Button>
          </>
        )}
        {entity === "tickets" && (
          <>
            <Button onClick={() => setEditor({ ...row, status: "Resolved" })}>
              {t("Resolve ticket")}
            </Button>
            <Button
              variant="outline"
              onClick={() => save(entity, { ...row, status: "Escalated" })}
            >
              {t("Escalate")}
            </Button>
            <Button variant="outline" onClick={() => setEditor(row)}>
              {t("Reassign")}
            </Button>
            {row.status === "Resolved" && (
              <Button
                variant="outline"
                onClick={() => setEditor({ ...row, status: "Closed" })}
              >
                {t("Close ticket")}
              </Button>
            )}
          </>
        )}
        {[
          "clients",
          "employees",
          "campaigns",
          "automation",
          "templates",
          "articles",
        ].includes(entity) && (
          <Button
            variant="outline"
            onClick={() =>
              save(entity, {
                ...row,
                status:
                  row.status === "Active"
                    ? entity === "campaigns"
                      ? "Paused"
                      : "Inactive"
                    : "Active",
              })
            }
          >
            {t(row.status === "Active" ? "Deactivate" : "Activate")}
          </Button>
        )}
        {row.approval === "Pending approval" && (
          <Button
            onClick={() => save(entity, { ...row, approval: "Approved" })}
          >
            {t("Approve")}
          </Button>
        )}
      </div>
      <div className="tabs detail-tabs">
        {[
          "Overview",
          "Activity history",
          ...(relKey ? ["Related records"] : []),
        ].map((v) => (
          <button
            key={v}
            className={tab === v ? "active" : ""}
            onClick={() => setTab(v)}
          >
            {t(v)}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="detail-grid">
          <div className="stack">
            <section className="card panel">
              <h2>{t("Record details")}</h2>
              <dl className="detail-fields">
                {schema.fields
                  .filter(
                    (f) =>
                      ![
                        "name",
                        "notes",
                        "bodyEn",
                        "bodyFr",
                        "attachments",
                      ].includes(f.key),
                  )
                  .map((f) => (
                    <div
                      key={f.key}
                      className={f.type === "textarea" ? "full" : ""}
                    >
                      <dt>{t(f.label)}</dt>
                      <dd>
                        {f.type === "multi" ? (
                          (row[f.key] || "")
                            .split("|")
                            .filter(Boolean)
                            .map((id) => (
                              <Link
                                className="related-pill"
                                key={id}
                                to={`/${f.entity}/${id}`}
                              >
                                {data.records[f.entity!].find(
                                  (r) => r.id === id,
                                )?.name || id}
                              </Link>
                            ))
                        ) : (
                          <Value row={row} field={f.key} />
                        )}
                      </dd>
                    </div>
                  ))}
                {data.config.customFields
                  .filter((f) => f.entity === entity)
                  .map((f) => (
                    <div key={f.id}>
                      <dt>{f.name}</dt>
                      <dd>{row["custom_" + f.id] || "—"}</dd>
                    </div>
                  ))}
              </dl>
              {row.notes && (
                <div className="notes-block">
                  <h3>{t("Notes")}</h3>
                  <p>{row.notes}</p>
                </div>
              )}
              {row.attachments && (
                <div className="attachments">
                  <h3>{t("Sample attachments")}</h3>
                  {row.attachments.split("\n").map((a) => (
                    <Button
                      variant="outline"
                      key={a}
                      onClick={() => setAttachment(a)}
                    >
                      <Paperclip size={16} />
                      {a}
                    </Button>
                  ))}
                </div>
              )}
              {row.bodyEn && (
                <div className="notes-block">
                  <Badge>
                    {t(i18n.language === "fr" ? "French" : "English")}
                  </Badge>
                  <p>{i18n.language === "fr" ? row.bodyFr : row.bodyEn}</p>
                </div>
              )}
            </section>
            {entity === "calls" && (
              <div className="card panel">
                <RecordingPlayer />
              </div>
            )}
            {entity === "automation" && <RuleSimulator rule={row} />}
          </div>
          <aside className="stack">
            <section className="card panel">
              <h2>{t("At a glance")}</h2>
              <div className="glance">
                <Clock size={18} />
                <div>
                  <small>{t("Created")}</small>
                  <Value row={row} field="createdAt" />
                </div>
              </div>
              {row.due && (
                <div className="glance">
                  <CalendarDays size={18} />
                  <div>
                    <small>{t("Due date")}</small>
                    <Value row={row} field="due" />
                  </div>
                </div>
              )}
              {entity === "tickets" && (
                <div className="glance">
                  <Target size={18} />
                  <div>
                    <small>{t("Service level")}</small>
                    <Value row={row} field="sla" />
                  </div>
                </div>
              )}
              {row.employeeId && (
                <div className="glance">
                  <UserRound size={18} />
                  <div>
                    <small>{t("Assigned employee")}</small>
                    <Value row={row} field="employeeId" />
                  </div>
                </div>
              )}
              {row.approval && <Badge>{t(row.approval)}</Badge>}
              {entity === "employees" && (
                <>
                  <div className="glance">
                    <b>{related("tasks").filter((r) => !isDone(r)).length}</b>
                    {t("Open tasks")}
                  </div>
                  <div className="glance">
                    <b>{related("tickets").filter((r) => !isDone(r)).length}</b>
                    {t("Open tickets")}
                  </div>
                  <div className="glance">
                    <b>
                      {related("evaluations").length
                        ? Math.round(
                            related("evaluations").reduce(
                              (a, r) => a + Number(r.score),
                              0,
                            ) / related("evaluations").length,
                          ) + "%"
                        : "—"}
                    </b>
                    {t("Quality score")}
                  </div>
                </>
              )}
            </section>
            <section className="card panel">
              <h2>{t("Add internal note")}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (note.trim()) {
                    comment(entity, row.id, note.trim());
                    setNote("");
                  }
                }}
              >
                <textarea
                  aria-label={t("Internal note")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("Share context with your team...")}
                  rows={4}
                />
                <Button type="submit" disabled={!note.trim()} className="mt-3">
                  <MessageSquare size={15} />
                  {t("Add note")}
                </Button>
              </form>
            </section>
          </aside>
        </div>
      )}
      {tab === "Activity history" && (
        <div className="card panel">
          <h2>{t("Activity history")}</h2>
          <div className="timeline">
            <div>
              <i />
              <b>{t("Created")}</b>
              <small>
                {new Date(row.createdAt).toLocaleString(i18n.language)}
              </small>
            </div>
            {events.map((e) => (
              <div key={e.id}>
                <i />
                <b>{t(e.label)}</b>
                <small>
                  {new Date(e.at).toLocaleString(i18n.language)} · Super Admin
                </small>
                {e.detail && <p>{e.detail}</p>}
                {(e.entity !== entity || e.recordId !== id) && (
                  <Link className="text-link" to={`/${e.entity}/${e.recordId}`}>
                    {t("View record")} →
                  </Link>
                )}
              </div>
            ))}
            {entity === "customers" &&
              (["calls", "tickets", "followups", "tasks"] as Entity[]).flatMap(
                (e) =>
                  related(e).map((r) => (
                    <div key={r.id}>
                      <i />
                      <Link className="text-link" to={`/${e}/${r.id}`}>
                        {t(schemas[e].singular)} · {t(r.name)}
                      </Link>
                      <small>
                        {new Date(r.createdAt).toLocaleString(i18n.language)} ·{" "}
                        {t(r.status)}
                      </small>
                    </div>
                  )),
              )}
          </div>
        </div>
      )}
      {tab === "Related records" && (
        <div className="related-grid">
          {(
            [
              "campaigns",
              "customers",
              "tasks",
              "tickets",
              "calls",
              "followups",
              "evaluations",
            ] as Entity[]
          )
            .filter((e) => e !== entity)
            .map((e) => (
              <section className="card" key={e}>
                <div className="panel-heading">
                  <h2>
                    {t(schemas[e].title)}{" "}
                    <span className="count">{related(e).length}</span>
                  </h2>
                </div>
                <DataTable entity={e} rows={related(e)} compact />
              </section>
            ))}
        </div>
      )}
      {editor && (
        <RecordEditor
          entity={entity}
          row={editor}
          onClose={() => setEditor(null)}
        />
      )}{" "}
      {deleting && (
        <Dialog
          open
          onClose={() => setDeleting(false)}
          title={t("Delete record?")}
          description={t(
            "This removes the local demonstration record. Related records must be reassigned first.",
          )}
        >
          <div className="dialog-body">
            <p>{row.name}</p>
          </div>
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setDeleting(false)}>
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (remove(entity, row.id)) nav("/" + entity);
                else setDeleting(false);
              }}
            >
              {t("Delete")}
            </Button>
          </div>
        </Dialog>
      )}
      {call && (
        <CallSimulator customerId={row.id} onClose={() => setCall(false)} />
      )}{" "}
      {relatedEditor && customer && (
        <RecordEditor
          entity={relatedEditor}
          onClose={() => setRelatedEditor(null)}
          preset={{
            customerId: customer.id,
            campaignId: customer.campaignId,
            clientId: customer.clientId,
            employeeId: customer.employeeId,
          }}
        />
      )}
      {attachment && (
        <Dialog
          open
          onClose={() => setAttachment("")}
          title={t("Attachment preview")}
          description={t(
            "Demonstration metadata only. File contents are not stored.",
          )}
        >
          <div className="dialog-body empty">
            <Paperclip size={32} />
            <h3>{attachment}</h3>
            <p>{t("Sample customer request document")}</p>
          </div>
        </Dialog>
      )}
    </>
  );
}
export function RuleSimulator({ rule }: { rule: Row }) {
  const { data, simulate } = useStore();
  const { t } = useTranslation();
  const [target, setTarget] = useState("");
  const [result, setResult] = useState("");
  const entity: Entity =
    rule.trigger === "Ticket created"
      ? "tickets"
      : rule.trigger === "Task created"
        ? "tasks"
        : "followups";
  return (
    <section className="card panel">
      <h2>{t("Rule simulation")}</h2>
      <div className="rule-flow">
        {[rule.trigger, rule.condition, rule.action].map((v, i) => (
          <div key={i}>
            <Workflow size={18} />
            <small>{t(["WHEN", "IF", "THEN"][i])}</small>
            <b>{t(v)}</b>
          </div>
        ))}
      </div>
      <p className="muted">
        {t(
          "Run this rule against one local record. Matching actions update the demo data.",
        )}
      </p>
      <div className="flex gap-2">
        <select
          aria-label={t("Simulation record")}
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            setResult("");
          }}
        >
          <option value="">{t("Select an option")}</option>
          {data.records[entity].map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <Button
          disabled={!target}
          onClick={() => {
            const r = data.records[entity].find((r) => r.id === target);
            if (r) setResult(simulate(rule, r));
          }}
        >
          {t("Simulate")}
        </Button>
      </div>
      {result && (
        <p role="status" className="info mt-4">
          {t(result)}
        </p>
      )}
    </section>
  );
}
