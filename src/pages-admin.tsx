import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CheckCheck,
  Mail,
  MessageSquare,
  Languages,
  BookOpen,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Globe2,
  ShieldCheck,
  Settings2,
  Download,
  RotateCcw,
} from "lucide-react";
import { useStore } from "./lib/store";
import { schemas, uid } from "./lib/model";
import type { Entity, Row } from "./lib/model";
import { PageHead, Badge, Empty, Avatar } from "./components/common";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import { RecordEditor } from "./components/editor";
export function TemplateCards() {
  const { data } = useStore();
  const { t, i18n } = useTranslation();
  const [editing, setEditing] = useState<Row | undefined | null>(null);
  const [preview, setPreview] = useState<Row | null>(null);
  const [customer, setCustomer] = useState(data.records.customers[0]?.id || "");
  const [language, setLanguage] = useState(i18n.language);
  return (
    <>
      <div className="panel-heading">
        <div>
          <h2>{t("Communication templates")}</h2>
          <p>{t("Email, SMS and WhatsApp previews. Nothing is sent.")}</p>
        </div>
        <Button variant="outline" onClick={() => setEditing(undefined)}>
          <Plus size={16} />
          {t("Add template")}
        </Button>
      </div>
      <div className="template-grid">
        {data.records.templates.map((r) => (
          <div key={r.id} className="card template-card">
            <div className="flex justify-between">
              <span className="template-icon">
                {r.channel === "Email" ? (
                  <Mail size={20} />
                ) : (
                  <MessageSquare size={20} />
                )}
              </span>
              <Badge>{t(r.channel)}</Badge>
            </div>
            <h3>{t(r.name)}</h3>
            <p>{i18n.language === "fr" ? r.bodyFr : r.bodyEn}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreview(r)}>
                <Eye size={15} />
                {t("Preview")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                <Pencil size={14} />
                {t("Edit")}
              </Button>
              <Link
                className="row-link"
                to={"/templates/" + r.id}
                aria-label={t("View record") + " " + r.name}
              >
                ↗
              </Link>
            </div>
          </div>
        ))}
      </div>
      {editing !== null && (
        <RecordEditor
          entity="templates"
          row={editing}
          onClose={() => setEditing(null)}
        />
      )}{" "}
      {preview && (
        <Dialog
          open
          onClose={() => setPreview(null)}
          title={t("Notification preview")}
          description={t("Simulation only. No message is sent.")}
        >
          <div className="dialog-body stack">
            <label className="field">
              <span>{t("Customer")}</span>
              <select
                aria-label={t("Customer")}
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              >
                {data.records.customers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t("Language")}</span>
              <select
                aria-label={t("Language")}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </label>
            <div className="message-preview">
              <Badge>{t(preview.channel)}</Badge>
              <h3>{t(preview.name)}</h3>
              <p>
                {(language === "fr"
                  ? preview.bodyFr
                  : preview.bodyEn
                ).replaceAll(
                  "{{customer}}",
                  data.records.customers.find((c) => c.id === customer)?.name ||
                    t("Customer"),
                )}
              </p>
              <small>{t("Preview only")}</small>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
export function Notifications() {
  const { data, update } = useStore();
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("All notifications");
  const notices = data.notifications.filter((n) => tab !== "Unread" || !n.read);
  return (
    <>
      <PageHead
        eyebrow="STAY IN THE LOOP"
        title="Notifications"
        description="The right update, at the right moment."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              update((d) => {
                d.notifications.forEach((n) => (n.read = true));
              })
            }
          >
            <CheckCheck size={17} />
            {t("Mark all as read")}
          </Button>
        }
      />
      <div className="tabs">
        {["All notifications", "Unread", "Templates"].map((s) => (
          <button
            className={tab === s ? "active" : ""}
            key={s}
            onClick={() => setTab(s)}
          >
            {t(s)}
            {s === "Unread" && (
              <span className="count">
                {data.notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === "Templates" ? (
        <TemplateCards />
      ) : (
        <div className="card notification-list">
          {notices.map((n) => (
            <div
              key={n.id}
              className={"notification-row " + (!n.read ? "unread" : "")}
            >
              <div className="queue-icon">
                <Bell size={19} />
              </div>
              <Link
                to={n.path}
                onClick={() =>
                  update((d) => {
                    const item = d.notifications.find((i) => i.id === n.id);
                    if (item) item.read = true;
                  })
                }
              >
                <b>{t(n.title)}</b>
                <p>{t(n.body)}</p>
                <small>{new Date(n.at).toLocaleString(i18n.language)}</small>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  update((d) => {
                    const item = d.notifications.find((i) => i.id === n.id);
                    if (item) item.read = !item.read;
                  })
                }
              >
                {t(n.read ? "Mark unread" : "Mark read")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("Dismiss notification")}
                onClick={() =>
                  update((d) => {
                    d.dismissedNotificationIds.push(n.id);
                    d.notifications = d.notifications.filter(
                      (i) => i.id !== n.id,
                    );
                  })
                }
              >
                <Trash2 size={15} />
              </Button>
            </div>
          ))}
          {!notices.length && (
            <Empty
              title="All caught up"
              text="New notifications will appear here."
            />
          )}
        </div>
      )}
    </>
  );
}
export function LanguagesPage() {
  const { data, save, setToast } = useStore();
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("Language-based assignment");
  const [customer, setCustomer] = useState("");
  const [employee, setEmployee] = useState("");
  const [editing, setEditing] = useState<Row | undefined | null>(null);
  const [article, setArticle] = useState<Row | null>(null);
  const c = data.records.customers.find((c) => c.id === customer);
  const agents = data.records.employees.filter(
    (e) => e.status === "Active" && (!c || e.language.includes(c.language)),
  );
  return (
    <>
      <PageHead
        eyebrow="BUILT FOR EVERY CONVERSATION"
        title="Language hub"
        description="One workspace. Two languages. Consistent service."
      />
      <div className="language-banner card">
        <div className="language-art">
          <Languages size={34} />
        </div>
        <div>
          <h2>{t("Your workspace language")}</h2>
          <p>
            {t(
              "Navigation, forms, reports and notifications follow your preference.",
            )}
          </p>
        </div>
        <div className="segmented">
          <Button
            variant={i18n.language === "en" ? "default" : "ghost"}
            onClick={() => i18n.changeLanguage("en")}
          >
            English
          </Button>
          <Button
            variant={i18n.language === "fr" ? "default" : "ghost"}
            onClick={() => i18n.changeLanguage("fr")}
          >
            Français
          </Button>
        </div>
      </div>
      <div className="tabs">
        {[
          "Language-based assignment",
          "Communication templates",
          "Knowledge base",
        ].map((s) => (
          <button
            key={s}
            className={tab === s ? "active" : ""}
            onClick={() => setTab(s)}
          >
            {t(s)}
          </button>
        ))}
      </div>
      {tab === "Communication templates" ? (
        <TemplateCards />
      ) : tab === "Knowledge base" ? (
        <>
          <div className="panel-heading">
            <h2>{t("Knowledge base")}</h2>
            <Button variant="outline" onClick={() => setEditing(undefined)}>
              <Plus size={16} />
              {t("Add article")}
            </Button>
          </div>
          <div className="template-grid">
            {data.records.articles.map((r) => (
              <div className="card template-card" key={r.id}>
                <BookOpen className="text-primary" />
                <h3>{t(r.name)}</h3>
                <p>{i18n.language === "fr" ? r.bodyFr : r.bodyEn}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setArticle(r)}>
                    {t("Read article")}
                  </Button>
                  <Button variant="ghost" onClick={() => setEditing(r)}>
                    {t("Edit")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="detail-grid">
          <section className="card panel">
            <h2>{t("Match the language. Make the connection.")}</h2>
            <p className="muted mb-5">
              {t(
                "Only active employees proficient in the customer language are available.",
              )}
            </p>
            <div className="stack">
              <label className="field">
                <span>{t("Customer")}</span>
                <select
                  aria-label={t("Customer")}
                  value={customer}
                  onChange={(e) => {
                    setCustomer(e.target.value);
                    setEmployee("");
                  }}
                >
                  <option value="">{t("Select an option")}</option>
                  {data.records.customers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · {t(r.language)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t("Assigned employee")}</span>
                <select
                  aria-label={t("Assigned employee")}
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  disabled={!c}
                >
                  <option value="">{t("Select an option")}</option>
                  {agents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · {t(r.language)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                disabled={!c || !employee}
                onClick={() => {
                  if (c) {
                    save("customers", { ...c, employeeId: employee });
                    setToast("Language-based assignment saved");
                  }
                }}
              >
                {t("Assign customer")}
              </Button>
            </div>
          </section>
          <section className="card panel">
            <h2>{t("Bilingual coverage")}</h2>
            {["English", "French"].map((l) => (
              <div key={l} className="coverage-row">
                <Globe2 size={20} />
                <div>
                  <b>{t(l)}</b>
                  <small>
                    {
                      data.records.employees.filter(
                        (e) => e.status === "Active" && e.language.includes(l),
                      ).length
                    }{" "}
                    {t("available employees")}
                  </small>
                </div>
                <Badge tone="green">{t("Covered")}</Badge>
              </div>
            ))}
            <Link to="/reports" className="text-link">
              {t("Explore reports by language")} →
            </Link>
          </section>
        </div>
      )}
      {editing !== null && (
        <RecordEditor
          entity="articles"
          row={editing}
          onClose={() => setEditing(null)}
        />
      )}{" "}
      {article && (
        <Dialog open onClose={() => setArticle(null)} title={t(article.name)}>
          <div className="dialog-body">
            <p className="article-content">
              {i18n.language === "fr" ? article.bodyFr : article.bodyEn}
            </p>
          </div>
        </Dialog>
      )}
    </>
  );
}
export function Settings() {
  const { data, update, reset, setToast } = useStore();
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("General");
  const [resetting, setResetting] = useState(false);
  const [item, setItem] = useState("");
  const [collection, setCollection] = useState<
    "categories" | "priorities" | "stages" | "teams" | "departments"
  >("categories");
  const [fieldName, setFieldName] = useState("");
  const [fieldEntity, setFieldEntity] = useState<Entity>("customers");
  const [required, setRequired] = useState(false);
  const [role, setRole] = useState("Agent");
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");
  const [pendingRemove, setPendingRemove] = useState<{
    type: "custom" | "option";
    id: string;
  } | null>(null);
  const config = data.config;
  const backup = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    a.download = "meridian-demo-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return (
    <>
      <PageHead
        eyebrow="MAKE IT YOURS"
        title="Settings"
        description="A workspace that fits the way your team works."
      />
      <div className="settings-layout">
        <nav className="settings-nav">
          {[
            "General",
            "Custom fields",
            "Stages & categories",
            "Roles & permissions",
            "Templates",
            "Demo data",
          ].map((s) => (
            <button
              key={s}
              className={tab === s ? "active" : ""}
              onClick={() => {
                setTab(s);
                setError("");
              }}
            >
              {t(s)}
            </button>
          ))}
        </nav>
        <div>
          {tab === "General" && (
            <section className="card panel">
              <h2>{t("System preferences")}</h2>
              <p className="muted mb-5">
                {t("Preferences are saved automatically on this device.")}
              </p>
              <div className="stack">
                <label className="field">
                  <span>{t("Interface language")}</span>
                  <select
                    value={i18n.language}
                    onChange={(e) => {
                      i18n.changeLanguage(e.target.value);
                      update((d) => {
                        d.config.preferences.defaultLanguage =
                          e.target.value === "fr" ? "French" : "English";
                      });
                    }}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </label>
                <label className="field">
                  <span>{t("Week starts on")}</span>
                  <select
                    value={config.preferences.weekStart}
                    onChange={(e) =>
                      update((d) => {
                        d.config.preferences.weekStart = e.target.value;
                      })
                    }
                  >
                    {["Monday", "Sunday"].map((s) => (
                      <option key={s} value={s}>
                        {t(s)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>{t("Local timezone")}</span>
                  <input readOnly value={config.preferences.timezone} />
                  <small>{t("Dates use this browser’s local timezone.")}</small>
                </label>
                <label className="switch-row">
                  <span>
                    <b>{t("Follow-up reminders")}</b>
                    <small>
                      {t("Create local notifications for overdue follow-ups.")}
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.preferences.reminders}
                    onChange={(e) =>
                      update((d) => {
                        d.config.preferences.reminders = e.target.checked;
                      })
                    }
                  />
                </label>
                <div className="info">
                  <ShieldCheck size={20} />
                  {t(
                    "Super Admin has full access to all demonstration features.",
                  )}
                </div>
              </div>
            </section>
          )}
          {tab === "Custom fields" && (
            <section className="card panel">
              <h2>{t("Custom fields")}</h2>
              <p className="muted mb-5">
                {t("Added fields appear in record forms and detail pages.")}
              </p>
              <form
                className="stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!fieldName.trim()) {
                    setError("This field is required");
                    return;
                  }
                  if (
                    config.customFields.some(
                      (f) =>
                        f.name.toLowerCase() ===
                          fieldName.trim().toLowerCase() &&
                        f.entity === fieldEntity,
                    )
                  ) {
                    setError("This value already exists");
                    return;
                  }
                  update((d) =>
                    d.config.customFields.push({
                      id: uid(),
                      name: fieldName.trim(),
                      entity: fieldEntity,
                      required,
                    }),
                  );
                  setFieldName("");
                  setError("");
                  setToast("Changes saved");
                }}
              >
                <div className="form-inline">
                  <label className="field">
                    <span>{t("Field name")}</span>
                    <input
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>{t("Module")}</span>
                    <select
                      value={fieldEntity}
                      onChange={(e) => setFieldEntity(e.target.value as Entity)}
                    >
                      {(
                        [
                          "clients",
                          "campaigns",
                          "customers",
                          "tasks",
                          "tickets",
                          "employees",
                        ] as Entity[]
                      ).map((k) => (
                        <option key={k} value={k}>
                          {t(schemas[k].title)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                  />
                  {t("Required field")}
                </label>
                <Button type="submit">
                  <Plus size={16} />
                  {t("Add field")}
                </Button>
                {error && (
                  <p role="alert" className="error">
                    {t(error)}
                  </p>
                )}
              </form>
              <div className="config-list">
                {config.customFields.map((f) => (
                  <div key={f.id}>
                    <div>
                      <b>{f.name}</b>
                      <small>
                        {t(schemas[f.entity].title)} ·{" "}
                        {t(f.required ? "Required" : "Optional")}
                      </small>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("Delete") + " " + f.name}
                      onClick={() =>
                        setPendingRemove({ type: "custom", id: f.id })
                      }
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                {!config.customFields.length && (
                  <Empty
                    title="No custom fields yet"
                    text="Add a field to capture information your team needs."
                  />
                )}
              </div>
            </section>
          )}
          {tab === "Stages & categories" && (
            <section className="card panel">
              <h2>{t("Stages & categories")}</h2>
              <div className="tabs">
                {(
                  [
                    "categories",
                    "priorities",
                    "stages",
                    "teams",
                    "departments",
                  ] as const
                ).map((k) => (
                  <button
                    key={k}
                    className={collection === k ? "active" : ""}
                    onClick={() => {
                      setCollection(k);
                      setError("");
                    }}
                  >
                    {t(
                      {
                        categories: "Service categories",
                        priorities: "Priorities",
                        stages: "Customer stages",
                        departments: "Departments",
                        teams: "Teams",
                      }[k],
                    )}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!item.trim()) {
                    setError("This field is required");
                    return;
                  }
                  if (
                    config[collection].some(
                      (s) => s.toLowerCase() === item.trim().toLowerCase(),
                    )
                  ) {
                    setError("This value already exists");
                    return;
                  }
                  update((d) => {
                    d.config[collection].push(item.trim());
                  });
                  setItem("");
                  setError("");
                  setToast("Changes saved");
                }}
              >
                <input
                  aria-label={t("New value")}
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder={t("New value")}
                />
                <Button type="submit">{t("Add")}</Button>
              </form>
              {error && (
                <p className="error" role="alert">
                  {t(error)}
                </p>
              )}
              <div className="config-list">
                {config[collection].map((v) => (
                  <div key={v}>
                    <span>{t(v)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("Delete") + " " + v}
                      onClick={() => {
                        const key = {
                          categories: "category",
                          priorities: "priority",
                          stages: "status",
                          teams: "team",
                          departments: "department",
                        }[collection];
                        const rows =
                          collection === "stages"
                            ? data.records.customers
                            : Object.values(data.records).flat();
                        if (
                          rows.some((r) => r[key] === v) ||
                          config[collection].length <= 1
                        ) {
                          setError("This value is used by existing records");
                          return;
                        }
                        setPendingRemove({ type: "option", id: v });
                      }}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
          {tab === "Roles & permissions" && (
            <section className="card panel">
              <h2>{t("Roles & permissions")}</h2>
              <p className="muted mb-5">
                {t(
                  "Configure sample role permissions. This session always has Super Admin access.",
                )}
              </p>
              <label className="field">
                <span>{t("Role")}</span>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {Object.keys(config.roles).map((r) => (
                    <option key={r} value={r}>
                      {t(r)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="permissions-grid">
                {[
                  "View",
                  "Create",
                  "Edit",
                  "Delete",
                  "Assign",
                  "Configure",
                ].map((p) => (
                  <label className="check-label" key={p}>
                    <input
                      type="checkbox"
                      disabled={role === "Super Admin"}
                      checked={config.roles[role]?.includes(p) || false}
                      onChange={(e) => {
                        update((d) => {
                          d.config.roles[role] = e.target.checked
                            ? [...d.config.roles[role], p]
                            : d.config.roles[role].filter((v) => v !== p);
                        });
                        setToast("Changes saved");
                      }}
                    />
                    {t(p)}
                  </label>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newRole.trim() || config.roles[newRole.trim()]) {
                    setError("Enter a unique role name");
                    return;
                  }
                  update((d) => {
                    d.config.roles[newRole.trim()] = ["View"];
                  });
                  setRole(newRole.trim());
                  setNewRole("");
                  setError("");
                }}
              >
                <input
                  aria-label={t("New role name")}
                  placeholder={t("New role name")}
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                />
                <Button type="submit">{t("Add role")}</Button>
              </form>
              {error && <p className="error">{t(error)}</p>}
            </section>
          )}
          {tab === "Templates" && <TemplateCards />}
          {tab === "Demo data" && (
            <section className="card panel">
              <h2>{t("Demo data")}</h2>
              <p className="muted mb-5">
                {t(
                  "All records are fictional and saved only in this browser. Export a backup or restore the original sample dataset.",
                )}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={backup}>
                  <Download size={16} />
                  {t("Export local backup")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setResetting(true)}
                >
                  <RotateCcw size={16} />
                  {t("Reset demo data")}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
      {resetting && (
        <Dialog
          open
          onClose={() => setResetting(false)}
          title={t("Reset demo data?")}
          description={t(
            "All local changes will be replaced by the original sample data.",
          )}
        >
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setResetting(false)}>
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                reset();
                setResetting(false);
              }}
            >
              {t("Reset demo data")}
            </Button>
          </div>
        </Dialog>
      )}
      {pendingRemove && (
        <Dialog
          open
          onClose={() => setPendingRemove(null)}
          title={t("Delete configuration?")}
          description={t(
            "This removes the selected configuration from the local demo.",
          )}
        >
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setPendingRemove(null)}>
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                update((d) => {
                  if (pendingRemove.type === "custom")
                    d.config.customFields = d.config.customFields.filter(
                      (f) => f.id !== pendingRemove.id,
                    );
                  else
                    d.config[collection] = d.config[collection].filter(
                      (v) => v !== pendingRemove.id,
                    );
                });
                setPendingRemove(null);
                setToast("Changes saved");
              }}
            >
              {t("Delete")}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
