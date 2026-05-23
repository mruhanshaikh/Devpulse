# ⚡[ DevPulse — Your Developer Brain, Organised](https://devpulsee.netlify.app/)

A production-grade React productivity Web App that connects to your real GitHub account and surfaces your actual contribution data alongside local-first tools — Kanban board, code snippet vault, and Pomodoro focus timer — all in one dark-themed workspace.

> Authenticated via GitHub Classic Personal Access Token. Live data fetched through the GitHub GraphQL API. Everything else is Zustand + localStorage — fully offline, instant, zero network dependency.

---

## 📸 Screenshots

### Login — GitHub Token Auth
![Login screen](./screenshots/Screenshot%202026-05-23%20202512.png)
> Paste your GitHub Classic Personal Access Token to connect. Token is stored in localStorage only — never sent anywhere except directly to the GitHub API.

### Overview Dashboard
![Overview dashboard](./screenshots/Screenshot%202026-05-23%20203019.png)
> Your real GitHub contribution heatmap, live stats (commits, Kanban tasks, snippets, focus time), workspace quick-nav, and recent repositories — all in one view.

### Kanban Board
![Kanban board](./screenshots/Screenshot%202026-05-23%20203218.png)
> Drag tasks across Backlog → In Progress → In Review → Done. Add tasks with priority and tag labels. State persists in localStorage via Zustand.

### Snippet Vault
![Snippet vault](./screenshots/Screenshot%202026-05-23%20203241.png)
> Search, filter by language, pin, copy, and syntax-highlight your saved code snippets. Cards expand inline to show the full code.

### New Snippet Modal
![New snippet modal](./screenshots/Screenshot%202026-05-23%20203256.png)
> Clean modal form to save a new snippet — title, language, tag, and a full-height code editor area.

### Focus Timer (Pomodoro)
![Focus timer](./screenshots/Screenshot%202026-05-23%20203310.png)
> SVG circle progress ring, mode switching (Focus / Short Break / Long Break), session label input, and a sidebar showing focus time, streak, and session history.

### Analytics
![Analytics page](./screenshots/Screenshot%202026-05-23%20203339.png)
> Live GitHub data: contribution stats, weekly commit bar chart, language breakdown, focus session area chart, and an activity score derived from both GitHub and Pomodoro data.

---

## 🗂️ Project Structure

```
devpulse/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # App entry — QueryClient + Router setup
    ├── App.jsx               # Route definitions + lazy loading
    ├── index.css             # Design tokens (CSS custom properties)
    │
    ├── store/
    │   └── index.js          # Zustand stores (Kanban, Snippets, Pomodoro)
    │
    ├── hooks/
    │   └── index.js          # useDebounce, useLocalStorage, useInterval, useClipboard, useKeyPress
    │
    ├── data/
    │   └── queries.js        # TanStack Query hooks (useGithubStats, useAnalytics, useActivityHeatmap)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx          # Root layout shell
    │   │   ├── Layout.module.css
    │   │   ├── Sidebar.jsx         # Collapsible sidebar with animated nav
    │   │   └── Sidebar.module.css
    │   │
    │   ├── ui/
    │   │   ├── index.jsx           # Badge, Button, Card, Skeleton, Tag, StatCard, EmptyState
    │   │   └── ui.module.css
    │   │
    │   ├── heatmap/
    │   │   ├── Heatmap.jsx         # GitHub-style contribution heatmap (SVG)
    │   │   └── Heatmap.module.css
    │   │
    │   ├── kanban/
    │   │   ├── KanbanBoard.jsx     # Full drag-and-drop board (dnd-kit)
    │   │   └── Kanban.module.css
    │   │
    │   ├── snippets/
    │   │   ├── SnippetsVault.jsx   # Code snippet manager with search + syntax highlight
    │   │   └── Snippets.module.css
    │   │
    │   ├── pomodoro/
    │   │   ├── Pomodoro.jsx        # SVG circle timer + session tracking
    │   │   └── Pomodoro.module.css
    │   │
    │   └── analytics/
    │       ├── Analytics.jsx       # Recharts: area, bar, pie charts + repo list
    │       └── Analytics.module.css
    │
    └── pages/
        ├── Overview.jsx          # Dashboard home
        ├── Overview.module.css
        ├── KanbanPage.jsx
        ├── SnippetsPage.jsx
        ├── FocusPage.jsx
        ├── AnalyticsPage.jsx
        └── Page.module.css       # Shared page header styles
```

---

## 🛠️ Tech Stack & Patterns

| Concern | Solution |
|---|---|
| Build | Vite 5 |
| State | Zustand (persist middleware) |
| Async | TanStack Query v5 |
| Routing | React Router v6 (lazy + Suspense) |
| Animations | Framer Motion |
| Drag & Drop | dnd-kit |
| Charts | Recharts |
| Syntax Highlight | react-syntax-highlighter |
| Performance | React.memo, useMemo, useCallback, useDebounce |
| Styles | CSS Modules + design tokens |
| Icons | lucide-react |

---

## ✨ Features

- **Overview Dashboard** — heatmap, stats, quick-nav, recent snippets
- **Kanban Board** — drag & drop tasks across 4 columns, add/delete with priorities & tags
- **Snippet Vault** — save, pin, search, copy, and syntax-highlight code snippets
- **Focus Timer** — Pomodoro with SVG circle progress, auto-break switching, session history
- **Analytics** — area charts, bar charts, language breakdown, productivity score, repo list
- **Persistent state** — all data lives in localStorage via Zustand persist
- **Collapsible sidebar** — animated with Framer Motion spring physics

---

## 🔐 Authentication & Authorization

DevPulse uses a **GitHub Classic Personal Access Token** — no OAuth server, no backend, no callback URLs. The token lives in your `.env` file and is sent as a `Bearer` header on every GitHub API request directly from the browser.

**Setup:**

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic)
2. Select scopes: `read:user`, `repo`, `read:org`
3. Copy the token and add it to your `.env`:

```env
VITE_GITHUB_TOKEN=ghp_your_token_here
VITE_GITHUB_USERNAME=your_username
```

4. Run the app — your real GitHub data populates immediately.

**Why a classic token and not OAuth?**
OAuth requires a backend server to handle the callback and exchange the code for a token securely. A classic PAT lets this stay a pure frontend app with no server dependency, which is the right trade-off for a personal productivity tool. In a multi-user production app you'd swap this for a proper OAuth flow with a backend.

**Scope of access:**
The token only reads data — contributions, repos, events. It never writes to GitHub. The `repo` scope is needed to include private repository contributions in the heatmap and stats (otherwise private commits are invisible to the API).

---

## 🔄 Data Flow

DevPulse has two completely separate data pipelines. They never talk to each other.

```
GitHub API ──────────────────────────────────┐
                                              ▼
                              TanStack Query cache
                              (staleTime: 5 min)
                                              │
              ┌───────────────────────────────┤
              ▼                               ▼
      GraphQL (primary)               REST (secondary)
  api.github.com/graphql          api.github.com (v3)
              │                               │
    Single query fetches:            useGithubRepos only:
    • contributions                  • repo list
    • pull requests                  • stars per repo
    • stars                          • language per repo
    • followers                      • descriptions
    • contributionCalendar
      (per-day counts, 52 weeks)
              │                               │
              └──────────────┬────────────────┘
                             ▼
                    Powers these UI sections:
                    • Contributions stat
                    • PRs stat / Stars stat
                    • Weekly Commits chart (GraphQL)
                    • Activity Heatmap (GraphQL)
                    • Activity Score (GraphQL)
                    • Repositories list (REST)
                    • Language breakdown (REST)

Local Data ──────────────────────────────────┐
                                              ▼
                              Zustand + localStorage
                              (persist middleware)
                                              │
              ┌───────────────────────────────┤
              ▼               ▼               ▼
       Pomodoro store   Kanban store   Snippets store
              │
    Session complete →
    addSession() called →
    Zustand updates →
    persisted instantly
              │
    Powers these UI sections:
    • Focus Time stat
    • Focus Sessions chart
    • Streak counter
    • Activity Score (+5 pts per session)
```

**In one sentence:** everything meaningful on the Analytics and Overview pages comes from a single GraphQL query + Zustand. REST is only used for repo metadata. Kanban and Snippets never touch a network at all.

### Why GraphQL over REST for GitHub stats?

The GitHub REST API would need 4–5 separate requests to get contributions, PRs, stars, followers, and the full calendar — each with its own rate limit cost. The GraphQL API gets all of it in **one round trip**, including the full `contributionCalendar` with exact per-day commit counts that the REST API doesn't expose at all. Private repo contributions are included because the PAT has `repo` scope. The REST API without auth only sees public activity.

### TanStack Query caching strategy

All GitHub queries use a `staleTime` of 5 minutes. This means:
- First load: fetches from GitHub, caches the result
- Revisiting any page within 5 minutes: served instantly from cache, no network request
- After 5 minutes: returns stale data immediately (no loading spinner) then refetches in the background and updates silently

This is the `stale-while-revalidate` pattern — the UI is never blocked waiting for a network response after the first load.

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-username/devpulse
cd devpulse

# 2. Install dependencies
npm install

# 3. Add your GitHub credentials
cp .env.example .env
# Edit .env and add VITE_GITHUB_TOKEN and VITE_GITHUB_USERNAME

# 4. Start the dev server
npm run dev
```

Open `http://localhost:5173` — your real GitHub stats load within seconds.

> **No token?** The app still works — Kanban, Snippets, and Pomodoro are fully offline. Only the Overview stats and Analytics charts will show empty/mock states.

---

## 🧠 Key Learnings

### GitHub GraphQL vs REST — knowing when to use which
The GraphQL API was the right call here because the data requirements are deeply nested and multi-resource. A single query with fragments fetches everything the dashboard needs in one request. REST would have required waterfall requests — fetch user, then fetch contributions, then fetch calendar — each adding latency and rate-limit cost. The rule of thumb: use GraphQL when you need data from multiple resources in one shot, REST when you need a simple flat resource.

### State management without Redux
Zustand proves you don't need Redux for complex apps. Each feature (Kanban, Snippets, Pomodoro) has its own isolated store slice, and the `persist` middleware syncs everything to localStorage automatically — no boilerplate, no providers wrapping the tree.

### TanStack Query for async UI
Rather than managing `loading`, `error`, and `data` states manually with `useEffect`, TanStack Query v5 handles all of it declaratively. Background refetching, stale-while-revalidate, and automatic caching come for free — making the analytics and GitHub stats sections feel instant on revisit.

### Performance patterns that actually matter
Every list-rendering component is wrapped in `React.memo` to prevent unnecessary re-renders. `useMemo` caches filtered/sorted arrays (Kanban columns, snippet search results). `useCallback` stabilises event handler references passed as props. `useDebounce` ensures the snippet search only fires after the user pauses typing — not on every keystroke.

### Accessible drag and drop with dnd-kit
dnd-kit was chosen over react-beautiful-dnd (now unmaintained) for its modular architecture and first-class keyboard and screen-reader support. Each draggable card announces its position and destination to assistive technologies, making the Kanban board usable without a mouse.

### Framer Motion's AnimatePresence
React removes unmounted components instantly — there's no opportunity for an exit animation. `AnimatePresence` keeps the element alive just long enough to play its exit transition. `mode="popLayout"` removes the exiting item from layout flow immediately so remaining items shift into place without waiting.

### CSS Modules + design tokens
All colours, radii, spacing, and font stacks live as CSS custom properties in `index.css`. Components reference these tokens (`var(--accent)`, `var(--radius-lg)`) rather than hard-coded values. CSS Modules scope class names per file, eliminating collision risk across the 10+ component stylesheets. Theming the whole app is a single-file change.

### Code splitting with lazy + Suspense
Every page component is loaded with `React.lazy()` and wrapped in `Suspense`. The initial bundle only ships the Overview page — all other pages are fetched on demand. On a slow connection, the user sees a skeleton immediately rather than a blank screen.

### Custom hooks as logic boundaries
`useDebounce`, `useInterval`, `useClipboard`, and `useKeyPress` each encapsulate one responsibility. The Pomodoro timer's `useInterval` cleanly handles the `setInterval` / `clearInterval` lifecycle so the component just calls `tick` every second without managing side-effect cleanup itself.

### SVG-based data visualisation
The activity heatmap and the Pomodoro progress ring are hand-rolled SVG rather than a charting library. This avoids a heavy dependency for simple visuals and gives full control over animation — the ring uses a `strokeDashoffset` transition driven by Framer Motion.
