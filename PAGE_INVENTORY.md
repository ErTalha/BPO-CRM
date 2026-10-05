# Meridian implementation map

Primary source: BPO CRM.docx, read in full. The user's expanded requirements govern implementation. The document's proposed telephony integration becomes an explicitly simulated interface; optional AI and external portals are not required.

## Routes and reusable structure

1. Dashboard `/dashboard`: linked KPIs, scope/date filters, activity chart, agent performance, pending queue.
2. Clients `/clients`, `/:id`: contacts, contracts, requirements, teams, campaigns and activity.
3. Campaigns `/campaigns`, `/:id`: client, targets, team/employees, stages, progress and related work.
4. Customers `/customers`, `/:id`: profile, lead stages, bilingual assignment, CSV import and unified history.
5. Calls `/calls`, `/:id`: inbound/outbound simulator, timer, disposition, notes and generated demo audio player.
6. Tasks `/tasks`, `/:id`: searchable list, draggable Kanban, assignments, due dates, comments.
7. Follow-ups `/followups`, `/:id`: time views, month calendar, outcome, completion and rescheduling.
8. Tickets `/tickets`, `/:id`: SLA, categories, priority, assignment, escalation, notes, attachment metadata and resolution.
9. Automation `/automation`, `/:id`: condition/action editor, activation, visual rule flow, explicit simulation with real local effects.
10. Employees `/employees`, `/:id`: teams, supervisors, roles, campaign assignments, proficiency and computed workload.
11. Quality `/quality`: pending interactions, scorecards, feedback, evaluation history and trends.
12. Reports `/reports`: six report families, scope filters, charts and exact displayed-data CSV export.
13. Notifications `/notifications`: read/unread, linked reminders, bilingual channel templates and simulated previews.
14. Languages `/languages`: interface selection, language allocation, bilingual templates and knowledge articles.
15. Settings `/settings`: custom fields, stages, roles/permissions, categories/priorities, preferences and local demo reset.

## Shared components and state

- Shell: collapsible sidebar, breadcrumbs, language selector, global search, notifications and Super Admin menu.
- shadcn-style Button and Radix Dialog, FormField, Badge, DataTable, ScopeFilters, Stats, ActivityTimeline and EmptyState.
- Schema-driven list/detail/edit pages share validation, foreign-key selectors and a persistent Store provider.
- Domain components implement call simulation, quality scoring, calendar, Kanban, automation simulation, template preview and reports.
- i18next English/French resources cover interface text and enum values. Fictional names and entered data remain in their original language.
- Versioned localStorage stores all records, audit events, notifications, configuration and language. No network services or identity provider.

## Verification plan

Production TypeScript/Vite build; browser tests for 15 routes, bilingual navigation, customer → ticket linkage, persistence, call completion, task completion, follow-up rescheduling, rule simulation, quality review, CSV export and responsive shell. Review dashboard and mobile rendering.
