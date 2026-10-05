import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Inbox,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { useStore } from "../lib/store";
import { relationshipKeys, isOverdue } from "../lib/model";
import type { Entity, Row } from "../lib/model";
export function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: string;
}) {
  const s = String(children);
  return (
    <span
      className={
        "badge " +
        (tone ||
          (/Active|Completed|Resolved|Customer|Terminé|Résolu|Actif/.test(s)
            ? "green"
            : /Urgent|Escalated|Overdue|En retard|Escaladé/.test(s)
              ? "red"
              : /High|Review|Pending|Élevée|Revue/.test(s)
                ? "amber"
                : /In progress|Qualified|En cours|Qualifié/.test(s)
                  ? "blue"
                  : "gray"))
      }
    >
      {children}
    </span>
  );
}
export function PageHead({
  eyebrow = "WORKSPACE",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{t(eyebrow)}</div>
        <h1>{t(title)}</h1>
        <p>{t(description)}</p>
      </div>
      <div className="page-actions">{actions}</div>
    </div>
  );
}
export function Empty({
  title = "No records found",
  text = "Try changing your filters or add a new record.",
  action,
}: {
  title?: string;
  text?: string;
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="empty">
      <Inbox size={32} />
      <h3>{t(title)}</h3>
      <p>{t(text)}</p>
      {action}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search records...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="search-box">
      <Search size={17} />
      <input
        aria-label={t(placeholder)}
        placeholder={t(placeholder)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  options: { value: string; label: string }[];
}) {
  const { t } = useTranslation();
  return (
    <label className="select-wrap">
      <span className="sr-only">{t(label)}</span>
      <select
        aria-label={t(label)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t(label)}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.label)}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Pagination({
  page,
  setPage,
  total,
  size = 8,
}: {
  page: number;
  setPage: (n: number) => void;
  total: number;
  size?: number;
}) {
  const { t } = useTranslation();
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pagination">
      <span>
        {total
          ? `${(page - 1) * size + 1}–${Math.min(total, page * size)}`
          : "0"}{" "}
        {t("of")} {total} {t("records")}
      </span>
      <div>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("Previous page")}
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft size={16} />
        </Button>
        <span>
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("Next page")}
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
export function Stat({
  label,
  value,
  detail,
  icon,
  href,
  trend,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  href?: string;
  trend?: string;
}) {
  const { t } = useTranslation();
  const content = (
    <>
      <div className="stat-top">
        <span>{t(label)}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">
        {value}
        {href && <ArrowUpRight size={20} />}
      </div>
      <div className="stat-foot">
        {trend && <span>{trend}</span>}
        {t(detail)}
      </div>
    </>
  );
  return href ? (
    <Link to={href} className="stat card">
      {content}
    </Link>
  ) : (
    <div className="stat card">{content}</div>
  );
}
export function Value({
  row,
  field,
  links = true,
}: {
  row: Row;
  field: string;
  links?: boolean;
}) {
  const { data } = useStore();
  const { t, i18n } = useTranslation();
  const entity = relationshipKeys[field];
  if (entity) {
    const r = data.records[entity].find((r) => r.id === row[field]);
    return r ? (
      links ? (
        <Link className="text-link" to={`/${entity}/${r.id}`}>
          {r.name}
        </Link>
      ) : (
        <>{r.name}</>
      )
    ) : (
      <span className="muted">—</span>
    );
  }
  if (field === "status" || field === "priority")
    return <Badge>{t(row[field])}</Badge>;
  if (field === "sla")
    return (
      <Badge
        tone={
          isOverdue(row)
            ? "red"
            : row.status === "Resolved" || row.status === "Closed"
              ? "green"
              : "amber"
        }
      >
        {t(
          isOverdue(row)
            ? "Breached"
            : row.status === "Resolved" || row.status === "Closed"
              ? "Met"
              : "Within SLA",
        )}
      </Badge>
    );
  if (field === "progress")
    return (
      <div className="progress-cell">
        <span>{row.progress || 0}%</span>
        <div className="progress">
          <i style={{ width: (row.progress || 0) + "%" }} />
        </div>
      </div>
    );
  if (
    [
      "due",
      "createdAt",
      "start",
      "end",
      "contractStart",
      "contractEnd",
    ].includes(field)
  ) {
    return row[field] ? (
      <span className={isOverdue(row) && field === "due" ? "overdue" : ""}>
        {new Date(row[field]).toLocaleDateString(
          i18n.language === "fr" ? "fr-FR" : "en-GB",
          {
            month: "short",
            day: "numeric",
            ...(field === "due" ? { hour: "2-digit", minute: "2-digit" } : {}),
          },
        )}
      </span>
    ) : (
      <>—</>
    );
  }
  if (field === "duration")
    return (
      <>
        {Math.floor(Number(row.duration || 0) / 60)}:
        {String(Number(row.duration || 0) % 60).padStart(2, "0")}
      </>
    );
  return <>{t(row[field] || "—")}</>;
}
export type Scope = {
  client: string;
  campaign: string;
  team: string;
  language: string;
  period: string;
};
export const blankScope: Scope = {
  client: "",
  campaign: "",
  team: "",
  language: "",
  period: "",
};
export function ScopeFilters({
  scope,
  setScope,
  dates = true,
}: {
  scope: Scope;
  setScope: (s: Scope) => void;
  dates?: boolean;
}) {
  const { data } = useStore();
  const { t } = useTranslation();
  const set = (k: keyof Scope, v: string) =>
    setScope({ ...scope, [k]: v, ...(k === "client" ? { campaign: "" } : {}) });
  return (
    <div className="scope-filters">
      <Select
        label="All clients"
        value={scope.client}
        onChange={(v) => set("client", v)}
        options={data.records.clients.map((r) => ({
          value: r.id,
          label: r.name,
        }))}
      />
      <Select
        label="All campaigns"
        value={scope.campaign}
        onChange={(v) => set("campaign", v)}
        options={data.records.campaigns
          .filter((r) => !scope.client || r.clientId === scope.client)
          .map((r) => ({ value: r.id, label: r.name }))}
      />
      <Select
        label="All teams"
        value={scope.team}
        onChange={(v) => set("team", v)}
        options={data.config.teams.map((r) => ({ value: r, label: r }))}
      />
      <Select
        label="All languages"
        value={scope.language}
        onChange={(v) => set("language", v)}
        options={["English", "French"].map((r) => ({ value: r, label: r }))}
      />
      {dates && (
        <Select
          label="All dates"
          value={scope.period}
          onChange={(v) => set("period", v)}
          options={["Today", "Last 7 days", "Last 30 days"].map((r) => ({
            value: r,
            label: r,
          }))}
        />
      )}
      <Button variant="ghost" size="sm" onClick={() => setScope(blankScope)}>
        {t("Reset filters")}
      </Button>
    </div>
  );
}
export function useScopeFilter() {
  const { data } = useStore();
  return (r: Row, s: Scope) => {
    const interaction = r.interactionType
      ? data.records[r.interactionType as Entity]?.find(
          (c) => c.id === r.interactionId,
        )
      : undefined;
    const campaign = data.records.campaigns.find(
      (c) => c.id === (r.campaignId || interaction?.campaignId || r.id),
    );
    const customer = data.records.customers.find((c) => c.id === r.customerId);
    const employee = data.records.employees.find((c) => c.id === r.employeeId);
    const memberships = data.records.campaigns.filter(
      (c) =>
        (r.campaignIds || "").split("|").includes(c.id) || c.clientId === r.id,
    );
    const language =
      r.language ||
      customer?.language ||
      campaign?.language ||
      employee?.language;
    const age = (Date.now() - new Date(r.createdAt).getTime()) / 86400000;
    return (
      (!s.client ||
        r.clientId === s.client ||
        campaign?.clientId === s.client ||
        memberships.some((c) => c.clientId === s.client) ||
        r.id === s.client) &&
      (!s.campaign ||
        campaign?.id === s.campaign ||
        r.id === s.campaign ||
        memberships.some((c) => c.id === s.campaign)) &&
      (!s.team || (r.team || employee?.team || campaign?.team) === s.team) &&
      (!s.language ||
        language?.includes(s.language) ||
        memberships.some((c) => c.language === s.language)) &&
      (!s.period ||
        (s.period === "Today"
          ? new Date(r.createdAt).toDateString() === new Date().toDateString()
          : age <= (s.period === "Last 7 days" ? 7 : 30)))
    );
  };
}
export function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  return (
    <span className={"avatar avatar-" + (index % 4)}>
      {name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
