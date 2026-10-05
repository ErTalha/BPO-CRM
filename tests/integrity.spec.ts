import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
test("CSV import validates, adds records and protects duplicate emails", async ({
  page,
}) => {
  await page.goto("/customers");
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await page.getByRole("dialog").locator("select").selectOption("cam1");
  const file = {
    name: "demo.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      'name,email,phone,language\n"Alex, Example",alex@example.com,+1 202 555 0199,French',
    ),
  };
  await page
    .getByRole("dialog")
    .locator("input[type=file]")
    .setInputFiles(file);
  await expect(page.getByText("1 valid records ready")).toBeVisible();
  await page.getByRole("button", { name: "Import records" }).click();
  await expect(
    page.getByRole("link", { name: "Alex, Example", exact: false }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await page.getByRole("dialog").locator("select").selectOption("cam1");
  await page
    .getByRole("dialog")
    .locator("input[type=file]")
    .setInputFiles(file);
  await expect(page.getByRole("alert")).toHaveText("Duplicate email found");
  await expect(
    page.getByRole("button", { name: "Import records" }),
  ).toBeDisabled();
});
test("client CRUD, campaign membership and linked-record delete protection", async ({
  page,
}) => {
  await page.goto("/clients");
  await page.getByRole("button", { name: "Add Client", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name", { exact: true }).fill("Cedar Demo");
  await dialog.getByLabel("Email", { exact: true }).fill("cedar@example.com");
  await dialog
    .getByLabel("Contact persons", { exact: true })
    .fill("River Example · river@example.com");
  await dialog.getByLabel("Team", { exact: true }).selectOption("Atlas");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await page
    .getByRole("link", { name: "Cedar Demo", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Deactivate", exact: true }).click();
  await expect(page.locator(".page-actions")).toContainText("Inactive");
  await page.getByRole("button", { name: "Activate", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(
    page.getByRole("link", { name: "Cedar Demo", exact: false }),
  ).toHaveCount(0);
  await page.goto("/campaigns/cam0");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Elena Costa", { exact: true })
    .check();
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.goto("/employees/emp4");
  await expect(page.locator(".detail-fields")).toContainText(
    "Customer care · EN",
  );
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("related activity");
  await expect(page.locator("main h1")).toHaveText("Elena Costa");
});
test("automatic routing, escalation and approval simulation", async ({
  page,
}) => {
  await page.goto("/customers/cus1");
  await page
    .getByRole("button", { name: "Create ticket", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Name", { exact: true })
    .fill("French priority enquiry");
  await dialog.getByLabel("Priority", { exact: true }).selectOption("High");
  await dialog.getByLabel("Category", { exact: true }).selectOption("General");
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("A high priority French customer enquiry.");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await page
    .getByRole("button", { name: "Activity history", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Ticket · French priority enquiry" })
    .click();
  await expect(page.locator(".page-actions")).toContainText("Escalated");
  await expect(page.locator(".detail-fields")).toContainText("Lucas Moreau");
  await page.getByRole("button", { name: "Activity history" }).click();
  await expect(
    page.getByText("French support routing", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Priority escalation", { exact: true }),
  ).toBeVisible();
  await page.goto("/automation/aut3");
  await page.getByRole("button", { name: "Activate", exact: true }).click();
  await page.getByLabel("Simulation record").selectOption("tsk0");
  await page.getByRole("button", { name: "Simulate", exact: true }).click();
  await page.goto("/tasks/tsk0");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.getByText("Approved", { exact: true })).toBeVisible();
});
test("French validation, scoped reporting and functional week-start preference", async ({
  page,
}) => {
  await page.locator(".topbar select").selectOption("fr");
  await page.goto("/customers");
  await page
    .getByRole("button", { name: "Ajouter Client final", exact: true })
    .click();
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(
    page.getByText("Ce champ est obligatoire").first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await page.locator(".topbar select").selectOption("en");
  await page.goto("/reports");
  await page.getByLabel("All languages").selectOption("French");
  const french = await page.locator("tbody tr").count();
  expect(french).toBeGreaterThan(0);
  await page.getByLabel("All campaigns").selectOption("cam0");
  await expect(page.getByText("No records found")).toBeVisible();
  await page.goto("/settings");
  await page.getByLabel("Week starts on").selectOption("Sunday");
  await page.goto("/followups");
  await page.getByRole("button", { name: "Calendar view" }).click();
  await expect(page.locator(".calendar-grid > b").first()).toHaveText("Sun");
});
test("all module layouts fit a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "dashboard",
    "clients",
    "campaigns",
    "customers",
    "calls",
    "tasks",
    "followups",
    "tickets",
    "automation",
    "employees",
    "quality",
    "reports",
    "notifications",
    "languages",
    "settings",
  ]) {
    await page.goto("/" + route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
});
test("dismissed reminders stay dismissed and new departments reach employee forms", async ({
  page,
}) => {
  await page.goto("/notifications");
  const count = await page.locator(".notification-row").count();
  await page
    .getByRole("button", { name: "Dismiss notification" })
    .first()
    .click();
  await expect(page.locator(".notification-row")).toHaveCount(count - 1);
  await page.reload();
  await expect(page.locator(".notification-row")).toHaveCount(count - 1);
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Stages & categories", exact: true })
    .click();
  await page.getByRole("button", { name: "Departments", exact: true }).click();
  await page.getByLabel("New value", { exact: true }).fill("Customer Success");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.goto("/employees");
  await page.getByRole("button", { name: "Add Employee", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Department", { exact: true })
    .selectOption("Customer Success");
  await expect(
    page.getByRole("dialog").getByLabel("Department", { exact: true }),
  ).toHaveValue("Customer Success");
});
