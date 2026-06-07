# GitHub Pages Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish the built app to `https://buinguyenphuongthao.github.io/project-demo/` via a new public GitHub repo and the `gh-pages` npm package.

**Architecture:** Add a Vite `base` path matching the repo name, add the `gh-pages` package with `predeploy`/`deploy` npm scripts that build and push `dist/` to a `gh-pages` branch, create the GitHub repo, push `main`, run the first deploy, and enable Pages to serve from the `gh-pages` branch.

**Tech Stack:** Vite, npm, `gh-pages` package, GitHub CLI (`gh`)

**Design reference:** `docs/plans/2026-06-07-github-pages-deploy-design.md`

---

### Task 1: Set the Vite `base` path

**Files:**
- Modify: `vite.config.ts`

**Step 1: Edit the config**

Change:
```ts
export default defineConfig({ plugins: [react(), tailwindcss()] });
```
to:
```ts
export default defineConfig({
  base: "/project-demo/",
  plugins: [react(), tailwindcss()],
});
```

**Step 2: Build and verify the base path is applied**

Run: `npm run build`
Expected: Build succeeds; inspect `dist/index.html` — script/link `src`/`href` attributes should be prefixed with `/project-demo/` (e.g. `/project-demo/assets/index-XXXX.js`).

Run: `grep -o 'project-demo/assets/[^"]*' dist/index.html | head -3`
Expected: prints at least one matching asset path.

**Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "build: set Vite base path for GitHub Pages deployment"
```

---

### Task 2: Add `gh-pages` package and deploy scripts

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

Run: `npm install -D gh-pages`
Expected: `gh-pages` appears under `devDependencies` in `package.json`, and `package-lock.json` is updated.

**Step 2: Add deploy scripts**

In `package.json`, add to the `"scripts"` object (alongside the existing `build`, `lint`, etc.):
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

**Step 3: Verify scripts are wired correctly**

Run: `npm run predeploy`
Expected: runs `npm run build` successfully (this is the same build verified in Task 1, just confirming the script alias works).

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add gh-pages package and deploy scripts"
```

---

### Task 3: Create the GitHub repo and push `main`

**Files:** none (repo/ops task)

**Step 1: Create the public repo and add it as `origin`**

Run: `gh repo create project-demo --public --source=. --remote=origin --description "tos-gate demo"`
Expected: Output confirms repo creation at `https://github.com/buinguyenphuongthao/project-demo` and adds `origin` remote.

**Step 2: Confirm the remote**

Run: `git remote -v`
Expected: `origin` points to `https://github.com/buinguyenphuongthao/project-demo.git` (fetch and push).

**Step 3: Push `main`**

Run: `git push -u origin main`
Expected: Push succeeds; `main` is now tracked against `origin/main`.

*(No commit step — this task only touches remote/repo state.)*

---

### Task 4: First deploy to `gh-pages` branch

**Files:** none (ops task — produces a `gh-pages` branch on the remote, not tracked in `main`)

**Step 1: Run the deploy**

Run: `npm run deploy`
Expected: `predeploy` builds the app, then `gh-pages -d dist` pushes the `dist/` contents to a new `gh-pages` branch on `origin`. Output ends with something like `Published`.

**Step 2: Confirm the branch exists on the remote**

Run: `git ls-remote --heads origin gh-pages`
Expected: prints a line showing the `gh-pages` ref exists on `origin`.

*(No commit step — `gh-pages` is a generated artifact branch, not part of `main`'s history.)*

---

### Task 5: Enable GitHub Pages from the `gh-pages` branch

**Files:** none (repo settings)

**Step 1: Enable Pages via the API**

Run:
```bash
gh api -X POST repos/buinguyenphuongthao/project-demo/pages \
  -f source[branch]=gh-pages -f source[path]=/
```
Expected: JSON response describing the new Pages site, including a `"status"` field (commonly `"building"` or `null` initially) and `"html_url"` like `https://buinguyenphuongthao.github.io/project-demo/`.

If the API call fails because Pages is already configured differently, instead go to the repo's Settings → Pages in the browser and set Source to "Deploy from a branch", branch `gh-pages`, folder `/ (root)`.

**Step 2: Wait for the build and verify the site is live**

Run (after ~1 minute):
```bash
curl -s -o /dev/null -w "%{http_code}" https://buinguyenphuongthao.github.io/project-demo/
```
Expected: `200`

**Step 3: Visually confirm the app loads**

Open `https://buinguyenphuongthao.github.io/project-demo/` in a browser (or use the `run` skill / a screenshot tool) and confirm the eKYC step flow renders without console errors about missing assets (which would indicate a `base` path mismatch).

*(No commit step — this is a one-time repo configuration change.)*

---

### Task 6: Document the deploy workflow for future updates

**Files:**
- Modify: `README.md`

**Step 1: Add a "Deployment" section**

Append to `README.md`:
```markdown
## Deployment

This app is published to GitHub Pages at https://buinguyenphuongthao.github.io/project-demo/.

To deploy the latest `main` build:

\`\`\`bash
npm run deploy
\`\`\`

This builds the app and pushes the `dist/` output to the `gh-pages` branch, which GitHub Pages serves from.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document GitHub Pages deploy workflow"
```
