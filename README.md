# Meridian BPO CRM

A runnable Super Admin frontend prototype based on **BPO CRM.docx** and the expanded project brief. All 15 modules share the same locally persisted data. One preselected fictional Super Admin can perform manager, supervisor, agent, quality analyst and account manager actions.

## Run locally

For publishing, follow [DEPLOYMENT.md](DEPLOYMENT.md). The included `.github/workflows/deploy.yml` automatically builds and deploys the app to GitHub Pages when source changes are pushed to `main`.

Use Node.js 22 or newer and pnpm 11 (the repository includes a lockfile).

```sh
pnpm install
pnpm dev
```

Open **http://localhost:5173**. The dev server uses port 5173 and fails clearly if that port is already occupied.

Alternatively, with npm installed:

```sh
npm install
npm run dev
```

Production build and local preview:

```sh
pnpm build
pnpm preview
```

The preview opens at **http://localhost:4173**. Local builds use browser routing. The GitHub Pages workflow uses hash routing (`/#/customers/123`) and the repository asset prefix, so deep links and refreshes work on static hosting. Other hosts using browser routing must serve `index.html` for application routes.

## Client demonstration

1. Start on **Overview**. Apply client, campaign, team, language and date filters; use the KPI cards to open operational records.
2. Open **Customers & leads** and add a customer. Select a client, its campaign, a language and a suitable active employee. Search, filter or import a CSV with a validation preview.
3. Open the customer and choose **Call customer**. Start the simulated call, use mute/hold, end it, record notes and disposition, and save. You can create a ticket or schedule a follow-up during wrap-up. Incoming simulations support answering and declining.
4. Use **Create ticket** on the customer. Set the category, priority and SLA deadline. French tickets route to a French-speaking employee; high-priority tickets escalate through the seeded active automation rules.
5. Resolve, reassign or escalate the ticket; add internal notes. Closure requires a resolution. The ticket appears in the customer's unified activity history and shared statistics.
6. Schedule a follow-up, use calendar/list and today/upcoming/overdue/completed filters, reschedule it and record an outcome. Use the task board to move work through its stages by drag-and-drop or the accessible status selector.
7. Open **Quality assurance**, review a pending call or ticket, score four criteria and save feedback and improvement notes. Explore the evaluation history and quality trend.
8. Open **Reports & analytics**, choose any of six report families, filter the scope and export the displayed dataset to CSV.
9. Switch **EN / FR** in the top bar. The interface preference persists after refresh. The language hub includes bilingual templates, knowledge articles and language-based customer assignment.
10. Explore **Settings**: add a custom field and see it appear in an entity form, configure customer stages, categories, priorities, teams, departments, roles and permissions, or change the calendar's first weekday.

The sidebar's walkthrough guide links to each step. Global search (Ctrl/Cmd+K) searches the shared records. Use Settings → Demo data → Reset demo data for a fresh demonstration; this requires confirmation. A JSON backup download is also available.

## Module inventory

| Module | Demonstrated capabilities |
| --- | --- |
| Dashboard | Scoped KPIs, seven-day interaction chart, pending queue, employee performance, linked client and campaign counts |
| Clients | CRUD, activation, contact people, contract dates/reference, service requirements, teams, related campaigns and work |
| Campaigns | Client linkage, teams, two-way employee membership, targets, progress, workflow stages, related customers and interactions |
| Customers and leads | CRUD, stages, search/filter/pagination, validated CSV import, agent assignment, notes and unified history |
| Calls | Inbound/outbound simulation, timer, hold/mute, disposition, wrap-up, customer history, playable synthetic audio |
| Tasks | CRUD, assignments, priorities and deadlines, list/Kanban, comments, completion and overdue states |
| Follow-ups | Scheduling, outcomes, rescheduling, time views, month calendar, reminder notifications |
| Tickets | CRUD, customer/client/campaign links, priorities, categories, SLA, notes, sample attachment metadata, resolution/closure/escalation |
| Automation | Editable condition/action rules, activation, visual flow, manual simulation, automatic local routing and escalation on creation, approval state |
| Employees | CRUD/activation, departments, teams, supervisors, roles, proficiency, campaign memberships, workload and quality results |
| Quality | Pending calls/tickets, four-part scorecards, feedback, improvement notes, evaluation history and trend chart |
| Reports | Agent, team, campaign, customer, ticket/SLA and quality reports, interactive filters/charts and CSV exports |
| Notifications | Linked in-app events, read/unread/dismiss, reminders, email/SMS/WhatsApp template previews |
| Languages | English/French UI, persistent preference, proficiency-based allocation, bilingual templates and knowledge content |
| Settings | Custom fields, customer stages, categories/priorities, teams, role permissions, system preferences, templates and demo reset |

Detailed route and component planning is in [PAGE_INVENTORY.md](PAGE_INVENTORY.md).

## Frontend architecture

- **React + TypeScript + Vite**, React Router, Tailwind CSS, Lucide and Recharts.
- **shadcn/ui-style source components** in `src/components/ui`: CVA/Slot button and accessible Radix Dialog with focus management, keyboard dismissal and titles.
- **i18next/react-i18next** with English keys and French resources in `src/lib/i18n.ts`. UI, enums, validations, system events and seed interaction titles are translated. Names, identifiers and entered record content retain their original language. Communication and knowledge content have separate English/French fields.
- **StoreProvider** in `src/lib/store.tsx`: immutable shared state, versioned localStorage, CRUD, notifications, activity events, reference protection and sample rule execution.
- **Schema-driven records** in `src/lib/model.ts`, reusable forms/tables/detail screens in `src/components/`, and relative-date fixtures in `src/lib/seed.ts`.
- Separate analytics and administration pages with a responsive, collapsible application shell in `src/App.tsx`.
- Static fonts and locally bundled assets. No remote font, image or service dependency at runtime.

The localStorage keys are `meridian.crm.v1`, `meridian.language` and `meridian.sidebar`. Related-record deletion is blocked to avoid orphaned history; deactivate the record or reassign its dependencies. Employee/campaign membership stays synchronized from either editor. Customer and campaign ownership changes propagate through their related operational records.

## Simulation boundaries

There is **no backend, database, authentication provider, payment service or external API integration**. This is not a production CRM or a security boundary. Permissions are demonstration configuration; the current session always retains Super Admin access.

- Calls never contact a telephone network. The recording player plays an eight-second, locally generated synthetic audio sample, explicitly labeled as such.
- Email, SMS and WhatsApp are template previews. No messages are sent.
- Attachments store names and size metadata only; file contents are not persisted or uploaded. Their preview explains this.
- Automation operates only on local records. Ticket/task creation executes matching active rules; follow-up due rules can be simulated explicitly. Overdue reminders are generated locally while the app is open. No server scheduler runs when the app is closed.
- All seed people and contact details are fictional; addresses use reserved example domains and fictional phone ranges.
- Local data belongs to this browser and origin. Refresh preserves it; browser storage clearing resets it. JSON export is a backup artifact, not a synchronization service.
- SLA indicators compare the configured deadline to the current time for unresolved tickets; resolved/closed tickets are displayed as met in this demonstration model.

## Verification

```sh
pnpm build
pnpm test
```

The Playwright suite uses an installed **Google Chrome** (`channel: "chrome"`), runs headlessly and starts Vite automatically if it is not running. It covers both languages across all 15 routes, validation, shared records, persistence, customer/ticket workflows, call simulation and audio playback, Kanban, follow-up outcomes, routing/escalation/approval, quality scoring, filtered CSV reports, CSV imports, custom fields, deletion protection, campaign membership and mobile layouts. Screenshots and failure traces are written under `../../work` relative to this folder for this workspace.

`pnpm exec prettier --write src tests` formats the source. Build output goes to `dist/`; generated artifacts and dependencies should not be committed.

Verified on 28 September 2026: the TypeScript/Vite production build completed successfully, all 15 Playwright scenarios passed, desktop/mobile layouts were visually reviewed, and the production preview loaded a French dashboard and a direct ticket-detail route with no runtime errors.
