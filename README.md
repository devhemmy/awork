# Awork Challenge - User Directory

A high-performance Angular application that displays 5,000+ users with advanced filtering, grouping, and caching capabilities.

## Features

### Core

- **Virtual Scrolling** - Renders only visible items for smooth performance with large datasets
- **Web Worker Processing** - Filtering and grouping run in a background thread to keep UI responsive
- **Dynamic Grouping** - Switch between grouping by Nationality or Alphabetically (A-Z)
- **Expandable User Details** - Click any user to reveal detailed information with smooth animations
- **Local Search** - Filter users by name or email without additional API calls
- **Pagination** - Navigate through pages of 5,000 users each

### Performance

- **IndexedDB Caching** - Data persists across page refreshes with automatic 10-minute expiration
- **Per-Page Cache** - Each page is cached independently; navigating between pages is instant
- **Cross-Page Search** - When searching, queries run across all loaded pages combined

### UI/UX

- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Loading & Empty States** - Visual feedback during data fetches and when no results found
- **Scroll-to-Top Button** - Quick navigation back to top of the list

## Tech Stack

| Technology  | Purpose               |
| ----------- | --------------------- |
| Angular 20  | Framework             |
| Angular CDK | Virtual Scrolling     |
| Web Workers | Background Processing |
| IndexedDB   | Persistent Caching    |
| SCSS        | Styling               |
| TypeScript  | Type Safety           |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Open http://localhost:4200 in your browser.

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## Project Structure

```
src/app/
├── components/
│   ├── user-list/        # Virtual scrolling list with group headers
│   └── user-item/        # Individual user row with expandable details
├── services/
│   └── users.service.ts  # API calls, caching, worker communication
├── models/               # TypeScript interfaces
├── app.worker.ts         # Web Worker for data processing
└── app.component.ts      # Root component
```

## API

This app uses the [Random User API](https://randomuser.me/documentation):

```
GET https://randomuser.me/api?results=5000&seed=awork&page={page}
```

## License

This project was created as part of the awork technical challenge.
