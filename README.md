# Dustbound website

Marketing site for **Dustbound** — static Astro SSG on GitHub Pages at [https://dustbound.app](https://dustbound.app).

## Develop

```bash
npm ci
npm run dev
```

## Build & verify

```bash
npm test
```

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml` (Astro + GitHub Pages). Node 22 (see `.nvmrc`).

Spec / tickets live in the private Dustbound repo (implementation spec #62). Help landing `/help/` (native Share fallback): [docs/help-landing.md](docs/help-landing.md) — paste that file into a GitHub issue on this repo when implementing.
