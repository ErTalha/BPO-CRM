import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Upload, Info } from "lucide-react";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { useStore } from "../lib/store";
import { schemas, uid, dateInput, parseCSV, exportCSV } from "../lib/model";
import type { Entity, Row, Field } from "../lib/model";
export function RecordEditor({
  entity,
  row,
  onClose,
  preset = {},
}: {
  entity: Entity;
  row?: Row;
  onClose: () => void;
  preset?: Partial<Row>;
}) {
  const { data, save } = useStore();
  const { t } = useTranslation();
  const schema = schemas[entity];
  const [form, setForm] = useState<Row>(() => ({
    id: uid(),
    name: "",
    createdAt: new Date().toISOString(),
    status: schema.statuses[0],
    priority: "Medium",
    language: "English",
    type: "Customer",
    due: dateInput(1),
    progress: "0",
    target: "1000",
    ...preset,
    ...row,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fields: Field[] = [
    ...schema.fields,
    {
      key: "status",
      label: "Status",
      type: "select",
      options: entity === "customers" ? data.config.stages : schema.statuses,
      required: true,
    },
    ...data.config.customFields
      .filter((f) => f.entity === entity)
      .map((f) => ({
        key: "custom_" + f.id,
        label: f.name,
        required: f.required,
        type: "text",
      })),
  ];
  const change = (key: string, value: string) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "clientId") {
        next.campaignId = "";
        next.customerId = "";
      }
      if (key === "campaignId") {
        const c = data.records.campaigns.find((c) => c.id === value);
        if (c) next.clientId = c.clientId;
        if (
          f.customerId &&
          data.records.customers.find((c) => c.id === f.customerId)
            ?.campaignId !== value
        )
          next.customerId = "";
      }
      if (key === "customerId") {
        const c = data.records.customers.find((c) => c.id === value);
        if (c) {
          next.clientId = c.clientId;
          next.campaignId = c.campaignId;
          next.employeeId = c.employeeId;
          next.language = c.language;
        }
      }
      if (key === "language") next.employeeId = "";
      return next;
    });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    fields.forEach((f) => {
      const value = (form[f.key] || "").trim();
      if (f.required && !value) next[f.key] = "This field is required";
      if (
        f.type === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      )
        next[f.key] = "Enter a valid email address";
      if (
        f.type === "number" &&
        value &&
        (Number.isNaN(Number(value)) ||
          (f.min !== undefined && Number(value) < f.min) ||
          (f.max !== undefined && Number(value) > f.max))
      )
        next[f.key] = "Enter a number within the allowed range";
    });
    if (
      form.contractStart &&
      form.contractEnd &&
      form.contractEnd < form.contractStart
    )
      next.contractEnd = "End date must follow start date";
    if (form.start && form.end && form.end < form.start)
      next.end = "End date must follow start date";
    if (
      entity === "tickets" &&
      ["Resolved", "Closed"].includes(form.status) &&
      !form.resolution?.trim()
    )
      next.resolution = "A resolution is required to close this ticket";
    if (
      entity === "followups" &&
      form.status === "Completed" &&
      !form.outcome?.trim()
    )
      next.outcome = "Record an outcome before completing";
    if (
      entity === "automation" &&
      [
        "Assign employee",
        "Create task",
        "Notify supervisor",
        "Request approval",
      ].includes(form.action) &&
      !form.employeeId
    )
      next.employeeId = "This field is required";
    if (
      entity === "automation" &&
      form.action === "Escalate ticket" &&
      form.trigger !== "Ticket created"
    )
      next.action = "Escalation requires a ticket trigger.";
    if (entity === "employees" && form.supervisorId === form.id)
      next.supervisorId = "Choose another employee";
    if (form.customerId && !["customers", "automation"].includes(entity)) {
      const customer = data.records.customers.find(
        (c) => c.id === form.customerId,
      );
      if (
        customer &&
        (customer.campaignId !== form.campaignId ||
          (form.clientId && customer.clientId !== form.clientId))
      )
        next.customerId =
          "Customer and campaign must belong to the same client";
    }
    if (form.employeeId && entity !== "automation") {
      const agent = data.records.employees.find(
        (e) => e.id === form.employeeId,
      );
      const language =
        entity === "customers"
          ? form.language
          : data.records.customers.find((c) => c.id === form.customerId)
              ?.language;
      if (language && agent && !agent.language.includes(language))
        next.employeeId = "The employee does not speak the customer language.";
    }
    if (
      form.email &&
      ["customers", "employees", "clients"].includes(entity) &&
      data.records[entity].some(
        (r) =>
          r.id !== form.id &&
          r.email?.toLowerCase() === form.email.trim().toLowerCase(),
      )
    )
      next.email = "Duplicate email found";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    save(entity, { ...form, name: form.name.trim() });
    onClose();
  };
  return (
    <Dialog
      open
      onClose={onClose}
      title={
        t(row ? "Edit record" : "Create record") + " · " + t(schema.singular)
      }
      description={t("Changes are saved locally in this demo.")}
      wide
    >
      <form noValidate onSubmit={submit}>
        <div className="form-grid">
          {fields.map((field) => {
            let options = field.options || [];
            if (field.key === "category") options = data.config.categories;
            if (field.key === "priority") options = data.config.priorities;
            if (field.key === "team") options = data.config.teams;
            if (field.key === "department") options = data.config.departments;
            if (field.key === "role")
              options = Object.keys(data.config.roles).filter(
                (r) => r !== "Super Admin",
              );
            let records = field.entity ? data.records[field.entity] : [];
            if (field.key === "campaignId")
              records = records.filter(
                (r) => !form.clientId || r.clientId === form.clientId,
              );
            if (field.key === "employeeId") {
              const lang =
                entity === "customers"
                  ? form.language
                  : data.records.customers.find((c) => c.id === form.customerId)
                      ?.language;
              records = records.filter(
                (r) =>
                  (r.status === "Active" || r.id === form.employeeId) &&
                  (!lang ||
                    r.language?.includes(lang) ||
                    r.id === form.employeeId),
              );
            }
            const id = "field-" + field.key;
            return (
              <label
                key={field.key}
                className={
                  "field " +
                  (["textarea", "multi", "file"].includes(field.type || "")
                    ? "field-full"
                    : "")
                }
                htmlFor={id}
              >
                <span>
                  {t(field.label)}
                  {field.required && <b> *</b>}
                </span>
                {field.type === "textarea" ? (
                  <textarea
                    aria-label={t(field.label)}
                    id={id}
                    rows={3}
                    value={form[field.key] || ""}
                    onChange={(e) => change(field.key, e.target.value)}
                  />
                ) : field.type === "select" || field.type === "relation" ? (
                  <select
                    aria-label={t(field.label)}
                    id={id}
                    value={form[field.key] || ""}
                    onChange={(e) => change(field.key, e.target.value)}
                  >
                    <option value="">{t("Select an option")}</option>
                    {field.type === "relation"
                      ? records.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))
                      : options.map((o) => (
                          <option key={o} value={o}>
                            {t(o)}
                          </option>
                        ))}
                  </select>
                ) : field.type === "multi" ? (
                  <div className="checkbox-grid">
                    {records.map((r) => (
                      <label key={r.id} className="check-label">
                        <input
                          type="checkbox"
                          checked={(form[field.key] || "")
                            .split("|")
                            .includes(r.id)}
                          onChange={(e) =>
                            change(
                              field.key,
                              e.target.checked
                                ? [
                                    ...(form[field.key] || "")
                                      .split("|")
                                      .filter(Boolean),
                                    r.id,
                                  ].join("|")
                                : (form[field.key] || "")
                                    .split("|")
                                    .filter((id) => id !== r.id)
                                    .join("|"),
                            )
                          }
                        />
                        {r.name}
                      </label>
                    ))}
                  </div>
                ) : field.type === "file" ? (
                  <>
                    <input
                      aria-label={t(field.label)}
                      id={id}
                      type="file"
                      multiple
                      onChange={(e) =>
                        change(
                          field.key,
                          Array.from(e.target.files || [])
                            .map(
                              (f) =>
                                `${f.name} (${Math.ceil(f.size / 1024)} KB)`,
                            )
                            .join("\n"),
                        )
                      }
                    />
                    <small>
                      {t("Only file names are stored. No files are uploaded.")}
                    </small>
                    <small>{form[field.key]}</small>
                  </>
                ) : (
                  <input
                    aria-label={t(field.label)}
                    id={id}
                    type={field.type || "text"}
                    min={field.min}
                    max={field.max}
                    value={form[field.key] || ""}
                    onChange={(e) => change(field.key, e.target.value)}
                  />
                )}{" "}
                {errors[field.key] && (
                  <small role="alert" className="error">
                    {t(errors[field.key])}
                  </small>
                )}
              </label>
            );
          })}
        </div>
        <div className="dialog-actions">
          <Button variant="outline" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit">{t("Save changes")}</Button>
        </div>
      </form>
    </Dialog>
  );
}
export function ImportCustomers({ onClose }: { onClose: () => void }) {
  const { data, importRows } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [campaign, setCampaign] = useState("");
  const read = async (file?: File) => {
    if (!file) return;
    setRows([]);
    setError("");
    if (!campaign) {
      setError("Choose a campaign before importing");
      return;
    }
    try {
      const parsed = parseCSV(await file.text());
      const [headers, ...body] = parsed;
      const required = ["name", "email", "phone", "language"];
      if (
        !headers ||
        required.some((k) => !headers.includes(k)) ||
        !body.length
      )
        throw Error("CSV must include name, email, phone and language columns");
      const c = data.records.campaigns.find((c) => c.id === campaign)!;
      const next = body.map((cells, i) => {
        const v = Object.fromEntries(
          headers.map((h, j) => [h.trim(), cells[j]?.trim() || ""]),
        );
        if (
          !v.name ||
          !v.phone ||
          !/^\S+@\S+\.\S+$/.test(v.email) ||
          !["English", "French"].includes(v.language)
        )
          throw Error("Some rows contain invalid or missing values");
        if (
          data.records.customers.some(
            (r) => r.email.toLowerCase() === v.email.toLowerCase(),
          ) ||
          body
            .slice(0, i)
            .some(
              (c) =>
                c[headers.indexOf("email")]?.toLowerCase() ===
                v.email.toLowerCase(),
            )
        )
          throw Error("Duplicate email found");
        const employee = data.records.employees.find(
          (e) => e.status === "Active" && e.language.includes(v.language),
        );
        if (!employee) throw Error("No suitable agent found");
        return {
          id: uid(),
          name: v.name,
          email: v.email,
          phone: v.phone,
          language: v.language,
          createdAt: new Date().toISOString(),
          status: "New",
          type: "Lead",
          clientId: c.clientId,
          campaignId: c.id,
          employeeId: employee.id,
        } as Row;
      });
      setRows(next);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Dialog
      open
      onClose={onClose}
      title={t("Import customers")}
      description={t("Preview and validate a CSV before adding records.")}
    >
      <div className="dialog-body stack">
        <div className="info">
          <Info size={18} />
          {t(
            "Required columns: name, email, phone, language. Language must be English or French.",
          )}
        </div>
        <label className="field">
          <span>{t("Campaign")}</span>
          <select
            value={campaign}
            onChange={(e) => {
              setCampaign(e.target.value);
              setRows([]);
            }}
          >
            <option value="">{t("Select an option")}</option>
            {data.records.campaigns.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() =>
            exportCSV(
              "customer-import-example.csv",
              ["name", "email", "phone", "language"],
              [
                [
                  "Taylor Example",
                  "taylor@example.com",
                  "+1 202 555 0199",
                  "French",
                ],
              ],
            )
          }
        >
          {t("Download CSV example")}
        </Button>
        <label className="upload-zone">
          <Upload />
          {t("Choose CSV file")}
          <input
            aria-label={t("Choose CSV file")}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => read(e.target.files?.[0])}
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {t(error)}
          </p>
        )}
        {rows.length > 0 && (
          <div>
            <b>
              {rows.length} {t("valid records ready")}
            </b>
            {rows.slice(0, 5).map((r) => (
              <p key={r.id}>
                {r.name} · {r.email} · {t(r.language)}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="dialog-actions">
        <Button variant="outline" onClick={onClose}>
          {t("Cancel")}
        </Button>
        <Button
          disabled={!rows.length}
          onClick={() => {
            importRows(rows);
            onClose();
            navigate("/customers");
          }}
        >
          {t("Import records")}
        </Button>
      </div>
    </Dialog>
  );
}
