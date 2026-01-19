# Feature Documentation

## Overview

This document summarizes the approach taken to solve the awork challenge and explains the technical decisions made throughout the implementation.

## Problem Approach

The main challenge was to display **5,000 users** with good performance while providing features like grouping, searching, and expandable details. The key insight was that rendering 5,000 DOM elements would cause severe performance issues, so the solution needed to minimize DOM operations while keeping the UI responsive.

**Strategy:**

1. Render only what's visible (Virtual Scrolling)
2. Offload heavy computation to background threads (Web Workers)
3. Cache data to avoid redundant API calls (IndexedDB)
4. Use efficient state management (Angular Signals)

## Technical Decisions

### 1. Virtual Scrolling (Angular CDK)

**Problem:** Rendering 5,000 user rows creates 5,000+ DOM elements, causing slow initial render and laggy scrolling.

**Solution:** Angular CDK's `cdk-virtual-scroll-viewport` renders only the items currently visible in the viewport (~20 items at a time).

**Why this approach:**

- Native Angular solution, well-maintained
- Handles variable-height items
- Built-in scroll event handling
- No external dependencies beyond CDK

### 2. Web Worker for Data Processing

**Problem:** Filtering and grouping 5,000 users on the main thread blocks the UI, causing frozen interactions.

**Solution:** All data processing (filtering, grouping, mapping) happens in a dedicated Web Worker (`app.worker.ts`).

**Why this approach:**

- Main thread stays free for user interactions
- Users can scroll/click while data is being processed
- Native browser API, no library needed
- Angular CLI has built-in Web Worker support

### 3. IndexedDB for Caching

**Problem:** Each page loads 5,000 users (~2-3MB of JSON). Refetching on every page navigation or refresh wastes bandwidth and time.

**Solution:** Data is cached in IndexedDB with a 10-minute expiration. Each page is cached independently.

**Why IndexedDB over localStorage:**

- localStorage has a ~5MB limit (easily exceeded with 5,000 users)
- IndexedDB can store hundreds of MB
- IndexedDB is async (doesn't block the main thread)
- Supports structured data without JSON.stringify overhead

### 4. Flattened List Structure

**Problem:** Virtual scrolling works with flat arrays, but our data is grouped (nested structure).

**Solution:** Groups and users are flattened into a single array with type discriminators:

```typescript
type ListItem = { type: "header"; title: string } | { type: "user"; user: User };
```

**Why this approach:**

- Virtual scroll can iterate through a single array
- Group headers and user rows are rendered in sequence
- Easy to calculate total item count for scroll height

### 5. Cross-Page Search

**Problem:** When a user searches, should they only see results from the current page?

**Solution:** Search queries all cached pages combined. If you've loaded pages 1, 2, and 3, searching will look through all 15,000 users.

**Why this approach:**

- Better UX - users don't need to remember which page someone was on
- Data is already cached, so there's no performance penalty
- The natCount (nationality count) still shows the total from original data, not filtered results

### 6. Signal-based State

**Problem:** Need reactive UI updates without excessive change detection cycles.

**Solution:** Used Angular Signals for component state (`isExpanded`, `showScrollTop`).

**Why this approach:**

- Fine-grained reactivity (only affected parts update)
- Built into Angular 20
- Simpler than RxJS for local component state
- Works well with OnPush change detection

## Performance Considerations

| Optimization       | Impact                                      |
| ------------------ | ------------------------------------------- |
| Virtual Scrolling  | ~20 DOM elements instead of 5,000           |
| Web Worker         | UI never freezes during data processing     |
| IndexedDB Cache    | Page navigation is instant after first load |
| Signal-based State | Minimal re-renders                          |
| CSS Animations     | GPU-accelerated, 60fps                      |

## Bonus Features Implemented

| Bonus                    | Implementation                                             |
| ------------------------ | ---------------------------------------------------------- |
| Grouping toggle button   | Two buttons to switch between Nationality and A-Z grouping |
| Search without API       | Local filtering by first name, last name, and email        |
| Pagination (5,000 items) | 10 pages with prev/next navigation                         |

## What I Would Add With More Time

- **More grouping options** - Add grouping by age range, gender, or country
- **More comprehensive tests** - Integration tests, E2E tests with Cypress
- **Keyboard navigation** - Arrow keys to navigate, Enter to expand
- **Export functionality** - Download filtered results as CSV
