# 📅 Growth Tracker

<div align="center">

**A daily star-rating app to track personal growth — one star per day.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-pink?style=for-the-badge&logo=github)](https://nghia4mt.github.io/thuhien-react/)

</div>

## About

A couple's app where you rate each day with 0–5 stars to record personal growth and progress.
Only today's entry can be edited — past and future dates are locked.

## Tech Stack

- **React 19** + **Vite 8**
- Plain CSS (no framework)
- `localStorage` — no backend required

## Getting Started

```bash
# 1. Clone the repo
git clone git@github.com:nghia4mt/thuhien-react.git
cd thuhien-react

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

## Build & Deploy (GitHub Pages)

### One-command deploy

```bash
npm run deploy
```

This will:
1. Build the project into `dist/`
2. Push `dist/` to the `gh-pages` branch automatically

### GitHub Pages setup (first time only)

1. Go to your repo → **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` / `root`
4. Click **Save**

Live at: `https://nghia4mt.github.io/thuhien-react/`

### Vite base path (`vite.config.js`)

```js
export default defineConfig({
  plugins: [react()],
  base: '/thuhien-react/',
})
```

## Features

- 📅 Monthly calendar view — click today to rate it
- ⭐ Choose 0–5 stars (0 = no rating)
- 🔒 Edit-lock: only today's date is editable
- 💾 Data persisted in `localStorage`
- 📊 Monthly stats: days rated & average score
- 🎨 Soft pastel UI (pink & sky-blue theme)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build + deploy to GitHub Pages |
| `npm run lint` | Lint with oxlint |

---

*Built with React + Vite*
