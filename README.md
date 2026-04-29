# HRMS Platform

A React-based Human Resource Management System with responsive design.

## Features

- **Dashboard** — Overview stats with recent hires and department headcount
- **Employee Management** — Full CRUD with search, filter by department/status
- **Department Management** — Hierarchical department tree with inline editing
- **Position Management** — Create/edit positions with level classification (Entry through C-Level)
- **Organization Chart** — Interactive tree view of the entire org structure
- **HR Analytics** — Key metrics dashboard including:
  - Headcount, turnover rate, average tenure
  - Department headcount distribution
  - Position level distribution
  - Tenure distribution
  - Annual and quarterly hiring trends
  - Span of control metrics
  - Vacant position tracking

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router v7
- LocalStorage persistence
- Pure CSS (no framework) — fully responsive

## Getting Started

```bash
npm install
npm run dev
```

The app starts at `http://localhost:5173` with 39 seed employees across 12 departments and 30 positions.

## Project Structure

```
src/
  context/       — React context for global state management
  components/    — Shared components (Layout, StatusBadge, ConfirmDialog)
  pages/         — Route-level page components
  types/         — TypeScript type definitions
  utils/         — Seed data
```

## Responsive Design

- Desktop: sidebar navigation + full data tables
- Tablet: collapsible sidebar + adapted grid layouts
- Mobile: hamburger menu + card-based views for employee data
