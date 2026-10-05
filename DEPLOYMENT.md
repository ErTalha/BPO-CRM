# Upload and publish the CRM on GitHub Pages

The included GitHub Actions workflow installs dependencies, builds the React app and publishes it to GitHub Pages. It automatically uses your repository name for asset paths and enables hash routing so page refreshes and shared detail links work on GitHub Pages. No API keys or additional services are needed.

Prepared and locally verified on 5 October 2026: the production build passed, and a static-server check passed for repository asset paths, navigation, page refresh, direct ticket links, French language persistence and keyboard skip navigation. Publishing occurs after you upload the source and enable Pages in your GitHub repository.

## Upload through the GitHub website

1. Download and extract **meridian-bpo-crm-github-ready.zip**. Upload the extracted source files, not the ZIP itself.
2. Sign in to GitHub. Create a new repository, for example **bpo-crm**, with **main** as its default branch. A public repository is the simplest option for GitHub Pages. You can initialize it with a README to make the upload controls available.
3. Open the repository's **Code** tab. Select **Add file → Upload files**.
4. Drag all files and folders from the extracted project into the upload area. Upload the **contents** directly into the repository root, not inside an extra `bpo-crm` folder.
5. Include **`.github/workflows/deploy.yml`**. Dot-prefixed files/folders may be hidden by your file manager. If `.github` was skipped, use **Add file → Create new file**, enter `.github/workflows/deploy.yml`, and paste the content from the extracted file.
6. Commit the files to **main**. The root should contain `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `index.html`, `src/` and `.github/`.
7. Open **Settings → Pages**. Under **Build and deployment → Source**, select **GitHub Actions**.
8. Open **Actions → Deploy CRM to GitHub Pages → Run workflow**. Select **main** and run it. This manual run handles the case where the first upload occurred before Pages was enabled.
9. Wait for the workflow to finish successfully. Open the website link in the deployment summary or under **Settings → Pages**.

For a repository named `bpo-crm`, your site will normally be:

```text
https://YOUR-USERNAME.github.io/bpo-crm/
```

Its customer page will look like:

```text
https://YOUR-USERNAME.github.io/bpo-crm/#/customers
```

The workflow also supports a root-site repository named `YOUR-USERNAME.github.io`. It uses `/` as the asset prefix for that repository. Custom domains would need their own GitHub Pages configuration and a `/` asset prefix in the build step.

## Files to upload

The prepared ZIP contains only the source and project configuration. Include every extracted file, especially the `.github` folder and the lockfile. Do not upload `node_modules`, `dist`, local `.env` files, build caches, test reports or the original BPO requirements document. GitHub builds `dist` automatically.

## Upload with Git instead

Create an **empty** GitHub repository with no initial README for this method. In the extracted project directory, run the following commands, replacing the URL with your actual repository URL:

```sh
git init
git add .
git commit -m "Add Meridian BPO CRM prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bpo-crm.git
git push -u origin main
```

Then select **Settings → Pages → Source → GitHub Actions** and manually run the deployment workflow. These commands assume a fresh extracted folder, not an existing Git checkout.

## Publish later changes

Update the source files and commit to **main**. The workflow redeploys automatically. GitHub Pages runs the built frontend; the demo's local changes stay in each visitor's browser. Records are not shared between visitors. Moving from localhost to the published site starts a separate local dataset.

## Troubleshooting

- **Workflow missing:** confirm `.github/workflows/deploy.yml` exists at the repository root on `main`.
- **Pages configuration/deployment error:** select GitHub Actions as the Pages source, ensure Actions are enabled for the repository, and rerun the workflow. If the repository has Pages environment approval rules, complete the approval in GitHub.
- **Workflow does not run on upload:** check the default branch is `main`, or change the `branches: [main]` entry to match it. You can also use Run workflow.
- **Blank website or missing assets:** ensure the source is at the root and open the URL shown in the deployment summary, including the repository path. Do not upload only the unbuilt source as a branch-based Pages website.
- **Refresh/detail link:** use the deployed `/#/...` URLs. The workflow enables hash routing to avoid a server-side route fallback requirement.
- **Build fails:** open the failed step in Actions and review the error. The workflow uses Node.js 22 and pnpm 11.19.0 with the committed lockfile.

## Official references

- [GitHub: uploading files](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [GitHub: Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Vite: GitHub Pages deployment](https://vite.dev/guide/static-deploy.html#github-pages)
