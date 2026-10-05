import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowUpRight,
  Users,
  Headphones,
  Ticket,
  CheckCircle2,
  Plus,
  Download,
  ArrowRight,
  CalendarDays,
  Target,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useStore } from "./lib/store";
import { dateInput, exportCSV, isDone, isOverdue, uid } from "./lib/model";
import type { Entity, Row } from "./lib/model";
import {
  PageHead,
  Stat,
  ScopeFilters,
  blankScope,
  useScopeFilter,
  Avatar,
  Badge,
  Empty,
  Value,
  Pagination,
} from "./components/common";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import { RecordEditor } from "./components/editor";
import { RecordingPlayer } from "./components/calls";
export function Dashboard() {
  const { data } = useStore();
  const { t, i18n } = useTranslation();
  const [scope, setScope] = useState(blankScope);
  const [create, setCreate] = useState(false);
  const matches = useScopeFilter();
  const r = (e: Entity) => data.records[e].filter((r) => matches(r, scope));
  const tickets = r("tickets");
  const calls = r("calls");
  const customers = r("customers");
  const tasks = r("tasks");
  const evaluations = r("evaluations");
  const quality = evaluations.length
    ? Math.round(
        evaluations.reduce((a, r) => a + Number(r.score), 0) /
          evaluations.length,
      )
    : 0;
  const trend = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - 6 + i);
    return {
      day: day.toLocaleDateString(i18n.language, { weekday: "short" }),
      calls: calls.filter(
        (r) => new Date(r.createdAt).toDateString() === day.toDateString(),
      ).length,
      tickets: tickets.filter(
        (r) => new Date(r.createdAt).toDateString() === day.toDateString(),
      ).length,
    };
  });
  const pending = [
    ...tasks.map(
      (r) => ({ ...r, entity: "tasks" }) as Row & { entity: string },
    ),
    ...r("followups").map(
      (r) => ({ ...r, entity: "followups" }) as Row & { entity: string },
    ),
    ...tickets.map(
      (r) => ({ ...r, entity: "tickets" }) as Row & { entity: string },
    ),
  ]
    .filter((r) => !isDone(r))
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  const performance = data.records.employees
    .filter((e) => e.status === "Active")
    .map((e) => {
      const work = [...tasks, ...tickets, ...calls].filter(
        (r) => r.employeeId === e.id,
      );
      return {
        ...e,
        team: e.team,
        role: e.role,
        total: work.length,
        completed: work.filter(isDone).length,
      };
    })
    .filter((e) => e.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
  return (
    <>
      <PageHead
        eyebrow="YOUR OPERATIONS, CONNECTED"
        title="A good day starts with clarity."
        description="Here’s what’s happening across your workspace."
        actions={
          <>
            <div className="date-chip">
              <CalendarDays size={16} />
              {new Date().toLocaleDateString(i18n.language, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <Button onClick={() => setCreate(true)}>
              <Plus size={17} />
              {t("Create task")}
            </Button>
          </>
        }
      />
      <div className="dashboard-filter card">
        <span className="filter-label">
          <span className="live-dot" />
          {t("Operational overview")}
        </span>
        <ScopeFilters scope={scope} setScope={setScope} />
      </div>
      <div className="stats-grid">
        <Stat
          label="Total customers"
          value={customers.length}
          detail="Across your campaigns"
          icon={<Users size={19} />}
          href="/customers"
        />
        <Stat
          label="Conversations"
          value={calls.length}
          detail="Customer calls recorded"
          icon={<Headphones size={19} />}
          href="/calls"
        />
        <Stat
          label="Open tickets"
          value={tickets.filter((r) => !isDone(r)).length}
          detail="Ready for your attention"
          icon={<Ticket size={19} />}
          href="/tickets?status=Unresolved"
        />
        <Stat
          label="Quality score"
          value={quality ? quality + "%" : "—"}
          detail="Average evaluated score"
          icon={<ShieldCheck size={19} />}
          href="/quality"
        />
      </div>
      <div className="dashboard-primary">
        <section className="card chart-card">
          <div className="panel-heading">
            <div>
              <h2>{t("Conversation activity")}</h2>
              <p>{t("Customer touchpoints over the last 7 days")}</p>
            </div>
            <div className="chart-legend">
              <span>
                <i />
                {t("Calls")}
              </span>
              <span>
                <i />
                {t("Tickets")}
              </span>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend}
                margin={{ top: 15, right: 16, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="callsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#239883" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#239883" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#edf0f2"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8b959d", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8b959d", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: "#e6e9ed" }}
                />
                <Area
                  isAnimationActive={false}
                  name={t("Calls")}
                  type="monotone"
                  dataKey="calls"
                  stroke="#198573"
                  fill="url(#callsGradient)"
                  strokeWidth={3}
                />
                <Area
                  isAnimationActive={false}
                  name={t("Tickets")}
                  type="monotone"
                  dataKey="tickets"
                  stroke="#9aacca"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-summary">
            <span>
              <b>{calls.filter((r) => r.direction === "Incoming").length}</b>
              {t("Inbound conversations")}
            </span>
            <span>
              <b>{tickets.filter(isDone).length}</b>
              {t("Resolved tickets")}
            </span>
            <span>
              <b>
                {tasks.filter(isDone).length}/{tasks.length}
              </b>
              {t("Tasks completed")}
            </span>
          </div>
        </section>
        <section className="focus-card">
          <div className="focus-icon">
            <Target size={25} />
          </div>
          <Badge tone="light">{t("TODAY’S FOCUS")}</Badge>
          <h2>{t("Small actions. Better experiences.")}</h2>
          <p>
            {t(
              "Keep your team moving by clearing the work that needs you most.",
            )}
          </p>
          <div className="focus-metrics">
            <Link to="/followups">
              <b>{r("followups").filter(isOverdue).length}</b>
              <span>
                {t("Overdue follow-ups")}
                <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link to="/tickets?status=Escalated">
              <b>{tickets.filter((r) => r.status === "Escalated").length}</b>
              <span>
                {t("Escalated tickets")}
                <ArrowUpRight size={16} />
              </span>
            </Link>
          </div>
          <Link className="focus-link" to="/tasks">
            {t("Review pending work")}
            <ArrowRight size={17} />
          </Link>
          <div className="focus-orbit" />
        </section>
      </div>
      <div className="dashboard-secondary">
        <section className="card">
          <div className="panel-heading">
            <div>
              <h2>
                {t("Your priority queue")}
                <span className="count">{pending.length}</span>
              </h2>
              <p>{t("The next steps that make a difference")}</p>
            </div>
            <Link to="/tasks" className="text-link">
              {t("View all")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="priority-list">
            {pending.slice(0, 5).map((r) => (
              <Link
                to={`/${r.entity}/${r.id}`}
                key={r.id}
                className="priority-row"
              >
                <div className={"queue-icon " + (isOverdue(r) ? "amber" : "")}>
                  {r.entity === "tickets" ? (
                    <Ticket size={18} />
                  ) : r.entity === "followups" ? (
                    <Clock size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                </div>
                <div>
                  <b>{t(r.name)}</b>
                  <small>
                    {data.records.customers.find((c) => c.id === r.customerId)
                      ?.name ||
                      data.records.campaigns.find((c) => c.id === r.campaignId)
                        ?.name}{" "}
                    ·{" "}
                    {t(
                      r.entity === "tickets"
                        ? "Ticket"
                        : r.entity === "followups"
                          ? "Follow-up"
                          : "Task",
                    )}
                  </small>
                </div>
                <Badge tone={isOverdue(r) ? "red" : "gray"}>
                  {t(isOverdue(r) ? "Overdue" : r.priority || "Scheduled")}
                </Badge>
                <ArrowUpRight size={16} />
              </Link>
            ))}
            {!pending.length && (
              <Empty
                title="All caught up"
                text="There is no pending work for these filters."
              />
            )}
          </div>
        </section>
        <section className="card">
          <div className="panel-heading">
            <div>
              <h2>{t("People behind the progress")}</h2>
              <p>{t("Team activity in your selected scope")}</p>
            </div>
            <Link
              to="/reports"
              className="row-link"
              aria-label={t("View reports")}
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="performance-list">
            {performance.map((e, i) => (
              <Link
                to={"/employees/" + e.id}
                className="performance-row"
                key={e.id}
              >
                <Avatar name={e.name} index={i} />
                <div>
                  <b>{e.name}</b>
                  <small>
                    {e.team} · {t(e.role)}
                  </small>
                </div>
                <div className="performance-score">
                  <b>{e.total}</b>
                  <small>{t("interactions")}</small>
                </div>
                <div className="tiny-bars">
                  {[40, 70, 50, 90, 65, 100].map((h, j) => (
                    <i
                      key={j}
                      style={{ height: Math.max(10, h - e.total) + "%" }}
                    />
                  ))}
                </div>
              </Link>
            ))}
          </div>
          <div className="team-footer">
            <span>
              {r("clients").length} {t("clients")} · {r("campaigns").length}{" "}
              {t("campaigns")}
            </span>
            <Link to="/employees">{t("Meet your team")} →</Link>
          </div>
        </section>
      </div>
      <div className="workspace-foot">
        <span>
          <span className="live-dot" />
          {t("All systems simulated")} · {t("Data saved on this device")}
        </span>
        <span>MERIDIAN / {t("SUPER ADMIN WORKSPACE")}</span>
      </div>
      {create && (
        <RecordEditor entity="tasks" onClose={() => setCreate(false)} />
      )}
    </>
  );
}
const reportTypes = [
  "Agent productivity",
  "Team performance",
  "Campaign performance",
  "Customer interactions",
  "Ticket & SLA",
  "Quality assurance",
];
export function Reports() {
  const { data } = useStore();
  const { t } = useTranslation();
  const [type, setType] = useState(reportTypes[0]);
  const [scope, setScope] = useState(blankScope);
  const matches = useScopeFilter();
  const calls = data.records.calls.filter((r) => matches(r, scope));
  const tickets = data.records.tickets.filter((r) => matches(r, scope));
  const tasks = data.records.tasks.filter((r) => matches(r, scope));
  const evals = data.records.evaluations.filter((r) => matches(r, scope));
  const groups =
    type === "Team performance"
      ? data.config.teams.map((team) => ({ id: team, name: team }))
      : type === "Campaign performance"
        ? data.records.campaigns
        : type === "Customer interactions"
          ? data.records.customers
          : type === "Ticket & SLA"
            ? data.config.categories.map((c) => ({ id: c, name: c }))
            : data.records.employees;
  const match = (r: Row, id: string) =>
    type === "Team performance"
      ? data.records.employees.find((e) => e.id === r.employeeId)?.team === id
      : type === "Campaign performance"
        ? r.campaignId === id
        : type === "Customer interactions"
          ? r.customerId === id
          : type === "Ticket & SLA"
            ? r.category === id
            : r.employeeId === id;
  const rows = groups
    .map((g) => {
      const c = calls.filter((r) => match(r, g.id));
      const tk = tickets.filter((r) => match(r, g.id));
      const ts = tasks.filter((r) => match(r, g.id));
      const ev = evals.filter((r) => match(r, g.id));
      return {
        name: g.name,
        interactions: c.length,
        tickets: tk.length,
        completed: ts.filter(isDone).length,
        resolved: tk.filter(isDone).length,
        breached: tk.filter(isOverdue).length,
        score: ev.length
          ? Math.round(ev.reduce((a, r) => a + Number(r.score), 0) / ev.length)
          : 0,
      };
    })
    .filter((r) => r.interactions + r.tickets + r.completed + r.score > 0);
  const columns =
    type === "Quality assurance"
      ? ["name", "score"]
      : type === "Ticket & SLA"
        ? ["name", "tickets", "resolved", "breached"]
        : ["name", "interactions", "tickets", "completed"];
  const labels: Record<string, string> = {
    name: "Name",
    interactions: "Calls",
    tickets: "Tickets",
    completed: "Tasks completed",
    resolved: "Resolved",
    breached: "SLA breaches",
    score: "Quality score",
  };
  const metric =
    type === "Quality assurance"
      ? "score"
      : type === "Ticket & SLA"
        ? "tickets"
        : "interactions";
  return (
    <>
      <PageHead
        eyebrow="INSIGHTS"
        title="Reports & analytics"
        description="A shared understanding of your performance."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              exportCSV(
                "meridian-report.csv",
                columns.map((c) => t(labels[c])),
                rows.map((r) => columns.map((c) => r[c as keyof typeof r])),
              )
            }
          >
            <Download size={16} />
            {t("Export CSV")}
          </Button>
        }
      />
      <div className="tabs report-tabs">
        {reportTypes.map((v) => (
          <button
            key={v}
            className={type === v ? "active" : ""}
            onClick={() => setType(v)}
          >
            {t(v)}
          </button>
        ))}
      </div>
      <div className="card mb-5">
        <ScopeFilters scope={scope} setScope={setScope} />
      </div>
      <div className="stats-grid">
        <Stat
          label="Conversations"
          value={calls.length}
          detail="In selected scope"
          icon={<Headphones size={18} />}
        />
        <Stat
          label="Resolved tickets"
          value={tickets.filter(isDone).length}
          detail="In selected scope"
          icon={<CheckCircle2 size={18} />}
        />
        <Stat
          label="SLA breaches"
          value={tickets.filter(isOverdue).length}
          detail="Open and past due"
          icon={<Clock size={18} />}
        />
        <Stat
          label="Evaluations"
          value={evals.length}
          detail="In selected scope"
          icon={<ShieldCheck size={18} />}
        />
      </div>
      <section className="card panel">
        <h2>{t(type)}</h2>
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{ left: -20, right: 15, top: 20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickFormatter={(s) => s.split(" ")[0]}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                isAnimationActive={false}
                dataKey={metric}
                name={t(labels[metric])}
                fill="#238773"
                radius={[5, 5, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="card mt-5 table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{t(labels[c])}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                {columns.map((c) => (
                  <td key={c}>
                    {c === "name" ? t(r.name) : r[c as keyof typeof r]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty />}
      </div>
    </>
  );
}
export function Quality() {
  const { data, save } = useStore();
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("Awaiting review");
  const [review, setReview] = useState<{ row: Row; entity: Entity } | null>(
    null,
  );
  const [scores, setScores] = useState<Record<string, string>>({
    greeting: "4",
    accuracy: "4",
    empathy: "4",
    resolution: "4",
  });
  const [feedback, setFeedback] = useState("");
  const [improvement, setImprovement] = useState("");
  const [error, setError] = useState("");
  const [scope, setScope] = useState(blankScope);
  const [page, setPage] = useState(1);
  const matches = useScopeFilter();
  const evals = data.records.evaluations.filter((r) => matches(r, scope));
  const pending = [
    ...data.records.calls
      .filter((r) => r.status === "Completed")
      .map((row) => ({ row, entity: "calls" as Entity })),
    ...data.records.tickets.map((row) => ({
      row,
      entity: "tickets" as Entity,
    })),
  ].filter(
    ({ row }) =>
      matches(row, scope) &&
      !data.records.evaluations.some((e) => e.interactionId === row.id),
  );
  const avg = evals.length
    ? Math.round(evals.reduce((a, r) => a + Number(r.score), 0) / evals.length)
    : 0;
  const submit = () => {
    if (!review || !feedback.trim() || !improvement.trim()) {
      setError("Feedback and improvement notes are required");
      return;
    }
    save("evaluations", {
      id: uid(),
      name: "Service quality review",
      status: "Completed",
      createdAt: new Date().toISOString(),
      employeeId: review.row.employeeId,
      campaignId: review.row.campaignId,
      customerId: review.row.customerId,
      interactionId: review.row.id,
      interactionType: review.entity,
      score: String(
        Math.round(
          (Object.values(scores).reduce((a, s) => a + Number(s), 0) / 20) * 100,
        ),
      ),
      ...scores,
      notes: feedback,
      improvement,
    });
    setReview(null);
    setFeedback("");
    setImprovement("");
    setError("");
  };
  return (
    <>
      <PageHead
        eyebrow="SERVICE EXCELLENCE"
        title="Quality assurance"
        description="Turn every interaction into an opportunity to improve."
      />
      <div className="card mb-5">
        <ScopeFilters
          scope={scope}
          setScope={(s) => {
            setScope(s);
            setPage(1);
          }}
        />
      </div>
      <div className="stats-grid three">
        <Stat
          label="Quality score"
          value={avg ? avg + "%" : "—"}
          detail="Average evaluated score"
          icon={<ShieldCheck size={19} />}
        />
        <Stat
          label="Awaiting review"
          value={pending.length}
          detail="Calls and tickets"
          icon={<Headphones size={19} />}
        />
        <Stat
          label="Evaluations"
          value={evals.length}
          detail="Completed scorecards"
          icon={<CheckCircle2 size={19} />}
        />
      </div>
      <section className="card panel">
        <h2>{t("Quality trends")}</h2>
        <div className="chart small">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...evals].reverse().map((r) => ({
                date: new Date(r.createdAt).toLocaleDateString(i18n.language, {
                  month: "short",
                  day: "numeric",
                }),
                score: Number(r.score),
              }))}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                isAnimationActive={false}
                dataKey="score"
                name={t("Score")}
                stroke="#198573"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="card mt-5">
        <div className="tabs">
          {["Awaiting review", "Evaluation history"].map((v) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={tab === v ? "active" : ""}
            >
              {t(v)}
            </button>
          ))}
        </div>
        {tab === "Awaiting review" ? (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {[
                      "Interaction",
                      "Customer",
                      "Assigned employee",
                      "Status",
                      "Review",
                    ].map((s) => (
                      <th key={s}>{t(s)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending
                    .slice((page - 1) * 8, page * 8)
                    .map(({ row, entity }) => (
                      <tr key={row.id}>
                        <td>
                          <Link
                            className="text-link"
                            to={`/${entity}/${row.id}`}
                          >
                            {t(row.name)}
                          </Link>
                          <small className="block muted">
                            {t(entity === "calls" ? "Call" : "Ticket")}
                          </small>
                        </td>
                        <td>
                          <Value row={row} field="customerId" />
                        </td>
                        <td>
                          <Value row={row} field="employeeId" />
                        </td>
                        <td>
                          <Value row={row} field="status" />
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReview({ row, entity });
                              setError("");
                            }}
                          >
                            {t("Evaluate")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!pending.length && <Empty title="All caught up" />}
            </div>
            <Pagination page={page} setPage={setPage} total={pending.length} />
          </>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "Assigned employee",
                    "Score",
                    "Feedback",
                    "Improvement notes",
                    "Created",
                    "Interaction",
                  ].map((s) => (
                    <th key={s}>{t(s)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evals.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Value row={r} field="employeeId" />
                    </td>
                    <td>
                      <Badge tone="green">{r.score}%</Badge>
                    </td>
                    <td>{r.notes}</td>
                    <td>{r.improvement}</td>
                    <td>
                      <Value row={r} field="createdAt" />
                    </td>
                    <td>
                      <Link
                        className="text-link"
                        to={`/${r.interactionType}/${r.interactionId}`}
                      >
                        {t("View record")} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!evals.length && <Empty />}
          </div>
        )}
      </div>
      {review && (
        <Dialog
          open
          onClose={() => setReview(null)}
          title={t("Evaluate interaction")}
          description={review.row.name}
          wide
        >
          <div className="dialog-body stack">
            {review.entity === "calls" ? (
              <RecordingPlayer />
            ) : (
              <p>{review.row.notes}</p>
            )}
            <div className="score-grid">
              {Object.keys(scores).map((k) => (
                <label className="field" key={k}>
                  <span>
                    {t(
                      {
                        greeting: "Greeting & verification",
                        accuracy: "Accuracy",
                        empathy: "Empathy",
                        resolution: "Resolution",
                      }[k] || k,
                    )}
                  </span>
                  <select
                    value={scores[k]}
                    onChange={(e) =>
                      setScores({ ...scores, [k]: e.target.value })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} / 5
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label className="field">
              <span>{t("Feedback")} *</span>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </label>
            <label className="field">
              <span>{t("Improvement notes")} *</span>
              <textarea
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="error">
                {t(error)}
              </p>
            )}
          </div>
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setReview(null)}>
              {t("Cancel")}
            </Button>
            <Button onClick={submit}>{t("Save evaluation")}</Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
