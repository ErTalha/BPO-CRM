import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
});
test("all fifteen modules render in English and French without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const routes = [
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
  ];
  for (const lang of ["en", "fr"]) {
    await page
      .locator(".topbar")
      .getByRole("combobox", { name: "Interface language", exact: true })
      .selectOption(lang);
    for (const route of routes) {
      await page.locator(`.sidebar nav a[href="/${route}"]`).click();
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.locator("main")).not.toContainText("Coming Soon");
    }
    if (lang === "en")
      await page.locator('.sidebar nav a[href="/dashboard"]').click();
  }
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("main h1")).toHaveText("Paramètres");
  expect(errors).toEqual([]);
});
test("customer creation, ticket linkage, resolution and persistence", async ({
  page,
}) => {
  await page.goto("/customers");
  await page.getByRole("button", { name: "Add Customer", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("This field is required").first()).toBeVisible();
  await page.getByLabel("Name", { exact: false }).fill("Taylor Demo");
  await page.getByLabel("Email", { exact: false }).fill("taylor@example.com");
  await page.getByLabel("Phone", { exact: false }).fill("+1 202 555 0199");
  await page
    .getByRole("dialog")
    .locator("#field-clientId")
    .selectOption("cli0");
  await page
    .getByRole("dialog")
    .locator("#field-campaignId")
    .selectOption("cam0");
  await page
    .getByRole("dialog")
    .locator("#field-employeeId")
    .selectOption("emp3");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("link", { name: "Taylor Demo", exact: false })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Create ticket", exact: true })
    .click();
  await page.getByLabel("Name", { exact: false }).fill("Demo account issue");
  await page.getByLabel("Category", { exact: false }).selectOption("Technical");
  await page
    .getByLabel("Description", { exact: false })
    .fill("The fictional customer needs account assistance.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page
    .getByRole("button", { name: "Activity history", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Ticket · Demo account issue" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ticket · Demo account issue" }).click();
  await page
    .getByRole("button", { name: "Resolve ticket", exact: true })
    .click();
  await page
    .getByLabel("Resolution", { exact: true })
    .fill("Account issue resolved in the demo.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".page-actions")).toContainText("Resolved");
  await page.reload();
  await expect(page.locator(".page-actions")).toContainText("Resolved");
  await expect(page.locator(".notes-block")).toContainText(
    "fictional customer",
  );
});
test("task Kanban, internal comments and follow-up outcome", async ({
  page,
}) => {
  await page.goto("/tasks");
  await page.getByRole("button", { name: "Kanban view" }).click();
  const task = page
    .getByRole("combobox", { name: "Move task Review onboarding documents" })
    .first();
  await task.selectOption("Completed");
  await page.goto("/tasks/tsk0");
  await expect(page.locator(".page-actions")).toContainText("Completed");
  await page
    .getByRole("textbox", { name: "Internal note" })
    .fill("Reviewed in client walkthrough");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await page.getByRole("button", { name: "Activity history" }).click();
  await expect(page.getByText("Reviewed in client walkthrough")).toBeVisible();
  await page.goto("/followups/fol0");
  await page.getByRole("button", { name: "Reschedule", exact: true }).click();
  await page.getByLabel("Due date").fill("2027-01-10T14:00");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("button", { name: "Record outcome" }).click();
  await page
    .getByLabel("Outcome", { exact: true })
    .fill("Customer confirmed successful resolution.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".page-actions")).toContainText("Completed");
});
test("simulated calls save into customer history and recording plays", async ({
  page,
}) => {
  await page.goto("/customers/cus0");
  await page.getByRole("button", { name: "Call customer" }).click();
  await page.getByRole("button", { name: "Start simulated call" }).click();
  await expect(page.getByText("Connected", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  await expect(page.getByRole("button", { name: "Unmute" })).toBeVisible();
  await page
    .getByRole("textbox", { name: "Conversation notes" })
    .fill("Simulated account support conversation.");
  await page.getByRole("button", { name: "End call" }).click();
  await page.getByLabel("Disposition").selectOption("Resolved");
  await page.getByRole("button", { name: "Save call & finish" }).click();
  await page.getByRole("button", { name: "Activity history" }).click();
  await expect(
    page.getByRole("link", { name: "Call · Outgoing call" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Call · Outgoing call" }).click();
  await expect(page.locator("audio")).toBeVisible();
  const playable = await page
    .locator("audio")
    .evaluate(async (el: HTMLAudioElement) => {
      await el.play();
      return !el.paused;
    });
  expect(playable).toBe(true);
});
test("language assignment and automation change actual records", async ({
  page,
}) => {
  await page.goto("/languages");
  await page.getByLabel("Customer", { exact: true }).selectOption("cus1");
  await page
    .getByLabel("Assigned employee", { exact: true })
    .selectOption("emp5");
  await page.getByRole("button", { name: "Assign customer" }).click();
  await page.goto("/customers/cus1");
  await expect(page.locator(".detail-fields")).toContainText("Theo Martin");
  await page.goto("/automation/aut0");
  await page.getByLabel("Simulation record").selectOption("tic1");
  await page.getByRole("button", { name: "Simulate", exact: true }).click();
  await expect(page.locator("main").getByRole("status")).toContainText(
    "Simulation complete",
  );
  await page.goto("/tickets/tic1");
  await expect(page.locator(".detail-fields")).toContainText("Elena Costa");
});
test("QA scorecard saves and report export downloads", async ({ page }) => {
  await page.goto("/quality");
  await page
    .getByRole("button", { name: "Evaluate", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Feedback", { exact: false })
    .fill("Accurate and professional support.");
  await page
    .getByLabel("Improvement notes", { exact: false })
    .fill("Confirm the next step clearly.");
  await page.getByRole("button", { name: "Save evaluation" }).click();
  await page.getByRole("button", { name: "Evaluation history" }).click();
  await expect(
    page.getByText("Accurate and professional support."),
  ).toBeVisible();
  await page.goto("/reports");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await download).suggestedFilename()).toBe("meridian-report.csv");
});
test("configuration fields affect forms and global search finds records", async ({
  page,
}) => {
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Custom fields", exact: true })
    .click();
  await page.getByLabel("Field name").fill("Service reference");
  await page.getByRole("button", { name: "Add field" }).click();
  await page.goto("/customers");
  await page.getByRole("button", { name: "Add Customer", exact: true }).click();
  await expect(page.getByLabel("Service reference")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.locator(".global-search").click();
  await page.getByRole("textbox", { name: "Global search" }).fill("Lina Avery");
  await page.getByRole("button", { name: "LA Lina Avery Customer" }).click();
  await expect(page.locator("main h1")).toHaveText("Lina Avery");
});
test("notification templates and mobile navigation", async ({ page }) => {
  await page.goto("/notifications");
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await page
    .getByRole("button", { name: "Unread", exact: false })
    .first()
    .click();
  await expect(page.getByText("All caught up")).toBeVisible();
  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview", exact: true })
    .first()
    .click();
  await page.getByLabel("Language", { exact: true }).selectOption("fr");
  await expect(page.locator(".message-preview")).toContainText("Bonjour");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.locator('.sidebar nav a[href="/customers"]').click();
  await expect(page.locator("main h1")).toHaveText("Customers & leads");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("capture desktop and mobile visual references", async ({ page }) => {
  await page.goto("/dashboard");
  await page.screenshot({
    path: "../../work/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "../../work/dashboard-mobile.png",
    fullPage: true,
  });
});
