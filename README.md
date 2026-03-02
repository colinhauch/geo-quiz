# Geography Knowledge App

A web-based geography and culture trivia app built with React, Vite, and Tailwind CSS.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Architecture

The app is structured around a modular **pack system** where each quiz topic (flags, capital cities, etc.) is a self-contained pack with its own data and resolver logic.

### Key Concepts

- **Packs**: Self-contained quiz content with their own data schema and resolver
- **Resolvers**: Transform pack-specific data into normalized question objects
- **Questions**: Normalized question format consumed by the quiz engine
- **Stats**: Attempt history and performance metrics persisted to localStorage

### Project Structure

```
/public/data/
  index.json           ← pack registry
  packs/
    flags.json         ← flag pack data

/src/
  components/
    PackSelector/      ← select quiz packs
    Quiz/              ← take quiz
    StatsDashboard/    ← view stats
  hooks/
    useSession.js      ← manage quiz session
    useStats.js        ← manage stats persistence
  resolvers/
    flagsResolver.js   ← transform flag records to questions
```

## Features (Current)

- **Flags Pack**: Identify countries by their flags (22 countries)
- **Progress Tracking**: Question counter and completion progress bar
- **Stats Dashboard**: Overall success rate, performance by difficulty and tags
- **Persistent Stats**: All quiz attempts stored in localStorage
- **Responsive Design**: Mobile-first Tailwind CSS styling

## Data Storage

All stats are persisted to localStorage:
- `geo-quiz:attempts` — Array of individual attempt records
- `geo-quiz:sessions` — Array of session summaries

## Future Enhancements

- Additional packs (capital cities, currencies, mountains, etc.)
- User accounts and cloud-synced stats
- Spaced repetition algorithm
- Timed quiz mode
- Community-contributed packs