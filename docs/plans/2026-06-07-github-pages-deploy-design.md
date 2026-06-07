# Deploy to GitHub Pages

## Goal

Publish the built app at `https://buinguyenphuongthao.github.io/project-demo/`.

## Decisions

- New repo: `project-demo`, **public** (GitHub Pages from private repos requires a paid
  plan; the account is on Free, and the published site would be public either way).
- Deploy mechanism: `gh-pages` npm package pushing `dist/` to a `gh-pages` branch
  (chosen over a GitHub Actions workflow — simpler, no CI config, manual `npm run deploy`
  is acceptable for this project's cadence).
- No router is present in the app, so the only routing concern is the Vite `base` path —
  no SPA 404.html redirect hack needed.

## Steps

1. **`vite.config.ts`**: add `base: '/project-demo/'` so built asset URLs resolve under
   the GitHub Pages subpath.
2. **`package.json`**: add `gh-pages` as a devDependency and add scripts:
   - `"predeploy": "npm run build"`
   - `"deploy": "gh-pages -d dist"`
3. **Create repo**: `gh repo create project-demo --public --source=. --remote=origin`,
   then push `main`.
4. **First deploy**: `npm run deploy` — builds and pushes `dist/` to `gh-pages` branch.
5. **Enable Pages**: repo Settings → Pages → Source: "Deploy from a branch",
   branch `gh-pages` / root.
6. **Verify**: fetch the published URL and confirm the page loads with correctly
   resolved assets.
