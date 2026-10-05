import { useEffect, useState } from "react";
import {
  BrowserRouter,
  HashRouter,
  NavLink,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Building2,
  Layers3,
  UsersRound,
  Phone,
  CheckSquare,
  CalendarClock,
  Ticket,
  Zap,
  Users,
  ShieldCheck,
  ChartNoAxesCombined,
  Bell,
  Languages,
  Settings as SettingsIcon,
  Search,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ArrowUpRight,
  Command,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StoreProvider, useStore } from "./lib/store";
import { schemas, moduleTitles } from "./lib/model";
import type { Entity } from "./lib/model";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import { Avatar, Empty, Badge } from "./components/common";
import { EntityList, EntityDetail } from "./components/entities";
import { Dashboard, Reports, Quality } from "./pages-analytics";
import { Notifications, LanguagesPage, Settings } from "./pages-admin";
const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  clients: Building2,
  campaigns: Layers3,
  customers: UsersRound,
  calls: Phone,
  tasks: CheckSquare,
  followups: CalendarClock,
  tickets: Ticket,
  automation: Zap,
  employees: Users,
  quality: ShieldCheck,
  reports: ChartNoAxesCombined,
  notifications: Bell,
  languages: Languages,
  settings: SettingsIcon,
};
function Shell() {
  const { t, i18n } = useTranslation();
  const { data, toast, setToast } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("meridian.sidebar") === "collapsed",
  );
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState(false);
  const [guide, setGuide] = useState(false);
  const section = location.pathname.split("/")[1];
  const recordId = location.pathname.split("/")[2];
  const record = (data.records[section as Entity] || []).find(
    (r) => r.id === recordId,
  );
  const unread = data.notifications.filter((n) => !n.read).length;
  useEffect(() => {
    setMobile(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    localStorage.setItem(
      "meridian.sidebar",
      collapsed ? "collapsed" : "expanded",
    );
  }, [collapsed]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const results = Object.entries(data.records)
    .flatMap(([entity, rows]) =>
      rows
        .filter((r) =>
          [r.name, t(r.name), r.email, r.phone]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .map((r) => ({ entity, row: r })),
    )
    .slice(0, 25);
  const groups = [
    { label: "WORKSPACE", keys: ["dashboard", "clients", "campaigns"] },
    {
      label: "OPERATIONS",
      keys: [
        "customers",
        "calls",
        "tasks",
        "followups",
        "tickets",
        "automation",
      ],
    },
    { label: "PEOPLE & INSIGHTS", keys: ["employees", "quality", "reports"] },
    {
      label: "ADMINISTRATION",
      keys: ["notifications", "languages", "settings"],
    },
  ];
  return (
    <div
      className={
        "app-shell " +
        (collapsed ? "sidebar-collapsed " : "") +
        (mobile ? "mobile-open" : "")
      }
    >
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        {t("Skip to content")}
      </a>
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label={t("Close menu")}
          onClick={() => setMobile(false)}
        />
      )}
      <aside className="sidebar">
        <Link className="brand" to="/dashboard" aria-label="Meridian">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>
            meridian<span className="brand-period">.</span>
            <small>BPO WORKSPACE</small>
          </span>
        </Link>
        <div className="workspace-switch">
          <div className="workspace-avatar">M</div>
          <div>
            <b>{t("Main workspace")}</b>
            <small>{t("Enterprise demo")}</small>
          </div>
          <Badge tone="sidebar-badge">PRO</Badge>
        </div>
        <nav aria-label={t("Main navigation")}>
          {groups.map((g) => (
            <div className="nav-group" key={g.label}>
              <div className="nav-label">{t(g.label)}</div>
              {g.keys.map((k) => {
                const Icon = icons[k];
                return (
                  <NavLink
                    key={k}
                    to={"/" + k}
                    title={t(moduleTitles[k])}
                    className={({ isActive }) =>
                      "nav-item " + (isActive ? "active" : "")
                    }
                  >
                    <Icon size={18} />
                    <span>{t(moduleTitles[k])}</span>
                    {k === "tickets" && (
                      <small>
                        {
                          data.records.tickets.filter((r) =>
                            ["Open", "Escalated"].includes(r.status),
                          ).length
                        }
                      </small>
                    )}
                    {k === "notifications" && unread > 0 && (
                      <i className="notification-dot" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="demo-guide" onClick={() => setGuide(true)}>
            <HelpCircle size={18} />
            <div>
              <b>{t("Ready for a walkthrough?")}</b>
              <small>{t("Explore the demo workflow")} ↗</small>
            </div>
          </button>
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={t(collapsed ? "Expand sidebar" : "Collapse sidebar")}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            <span>{t("Collapse sidebar")}</span>
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-toggle"
            onClick={() => setMobile(!mobile)}
            aria-label={t("Open menu")}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumbs">
            <Link to="/dashboard">{t("Workspace")}</Link>
            <span>/</span>
            <Link to={"/" + section}>
              {t(
                moduleTitles[section] ||
                  schemas[section as Entity]?.title ||
                  "Overview",
              )}
            </Link>
            {record && (
              <>
                <span>/</span>
                <b>{t(record.name)}</b>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <button className="global-search" onClick={() => setSearch(true)}>
              <Search size={17} />
              <span>{t("Search anything...")}</span>
              <kbd>⌘ K</kbd>
            </button>
            <label className="language-select">
              <Languages size={16} />
              <select
                aria-label={t("Interface language")}
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </select>
            </label>
            <Link
              to="/notifications"
              className="notification-button icon-button"
              aria-label={t("Notifications")}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </Link>
            <span className="topbar-divider" />
            <button className="profile-button" onClick={() => setProfile(true)}>
              <Avatar name="Alex Morgan" />
              <span>
                <b>Alex Morgan</b>
                <small>{t("Super Admin")}</small>
              </span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {(Object.keys(schemas) as Entity[]).map((e) => (
              <Route
                key={e}
                path={"/" + e}
                element={<EntityList key={e} entity={e} />}
              />
            ))}
            {(Object.keys(schemas) as Entity[]).map((e) => (
              <Route
                key={e + "detail"}
                path={"/" + e + "/:id"}
                element={<EntityDetail key={location.pathname} entity={e} />}
              />
            ))}
            <Route path="/quality" element={<Quality />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <Empty
                  title="Page not found"
                  action={
                    <Button asChild>
                      <Link to="/dashboard">{t("Back to overview")}</Link>
                    </Button>
                  }
                />
              }
            />
          </Routes>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{t(toast)}</span>
          <button onClick={() => setToast("")} aria-label={t("Dismiss")}>
            <X size={16} />
          </button>
        </div>
      )}
      {search && (
        <Dialog
          open
          onClose={() => setSearch(false)}
          title={t("Search your workspace")}
        >
          <div className="dialog-body">
            <div className="search-box">
              <Search size={19} />
              <input
                autoFocus
                aria-label={t("Global search")}
                placeholder={t("Search customers, tickets, campaigns...")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="global-results">
              {query ? (
                results.map(({ entity, row }) => (
                  <button
                    key={row.id}
                    onClick={() => {
                      navigate(`/${entity}/${row.id}`);
                      setSearch(false);
                      setQuery("");
                    }}
                  >
                    <Avatar name={row.name} />
                    <span>
                      <b>{t(row.name)}</b>
                      <small>{t(schemas[entity as Entity].singular)}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))
              ) : (
                <p className="muted py-5">
                  {t("Type to search across all modules.")}
                </p>
              )}
              {query && !results.length && <Empty />}
            </div>
          </div>
        </Dialog>
      )}
      {profile && (
        <Dialog
          open
          onClose={() => setProfile(false)}
          title={t("Super Admin profile")}
        >
          <div className="dialog-body stack">
            <div className="flex items-center gap-3">
              <Avatar name="Alex Morgan" />
              <div>
                <h3>Alex Morgan</h3>
                <p>admin@meridian.example</p>
              </div>
              <Badge tone="green">{t("Full access")}</Badge>
            </div>
            <p className="muted">
              {t(
                "One preselected demonstration account with access to every module and action.",
              )}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                navigate("/settings");
                setProfile(false);
              }}
            >
              <SettingsIcon size={17} />
              {t("Workspace settings")}
            </Button>
          </div>
        </Dialog>
      )}
      {guide && (
        <Dialog
          open
          onClose={() => setGuide(false)}
          title={t("Your demo walkthrough")}
          description={t(
            "A complete customer support journey in one workspace.",
          )}
        >
          <div className="dialog-body">
            <ol className="walkthrough">
              {[
                ["customers", "Identify or create a customer"],
                ["languages", "Assign by preferred language"],
                ["calls", "Simulate a customer call"],
                ["tickets", "Create, resolve or escalate a ticket"],
                ["followups", "Schedule the next conversation"],
                ["quality", "Evaluate and coach"],
                ["reports", "Review the operational results"],
              ].map(([path, label], i) => (
                <li key={path}>
                  <span>{i + 1}</span>
                  <Link to={"/" + path} onClick={() => setGuide(false)}>
                    {t(label)}
                    <ArrowUpRight size={16} />
                  </Link>
                </li>
              ))}
            </ol>
            <div className="info">
              {t("All integrations are simulated. Changes persist locally.")}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
export default function App() {
  const Router =
    import.meta.env.VITE_ROUTER_MODE === "hash" ? HashRouter : BrowserRouter;
  return (
    <Router>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </Router>
  );
}
