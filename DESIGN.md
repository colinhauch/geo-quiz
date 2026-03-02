# Geography Knowledge App — Design Document

## Overview

A web-based geography and culture trivia app with a quiz engine, stats dashboard, and a modular pack system. Built mobile-first with responsive desktop layout. Initial implementation uses static JSON data with no backend required.

---

## Core Concepts

### Packs

The primary unit of content is a **pack** — a self-contained set of questions around a topic (e.g., Capital Cities, Flags, Rivers). Packs are intentionally heterogeneous: each pack can have its own internal data structure and question generation logic. The only requirement is that each pack's **resolver** produces a normalized question object that the core app can consume.

A user can select one or more packs before starting a quiz. Questions from all selected packs are resloved, merged, and then shuffled into a single session queue before the quiz begins.

### Pack Registry (`index.json`)

A lightweight manifest loaded on app start. Describes all available packs without loading question data.

```json
[
  {
    "id": "capital-cities",
    "name": "Capital Cities",
    "description": "Match countries to their capitals and vice versa.",
    "questionCount": 150,
    "tags": ["cities", "countries"],
    "tagGroup": "political",
    "difficulty": "easy",
    "imageRequired": false
  },
  {
    "id": "flags",
    "name": "Flags of the World",
    "description": "Identify countries by their flags.",
    "questionCount": 195,
    "tags": ["flags", "countries"],
    "tagGroup": "political",
    "difficulty": "easy",
    "imageRequired": true
  }
]
```

---

## File Structure

```
/public/data/
  index.json               ← pack registry
  packs/
    capital-cities.json
    flags.json
    rivers-waterways.json
    mountain-ranges.json
    currencies.json

/src/
  resolvers/
    capitalCitiesResolver.js
    flagsResolver.js
    explicitResolver.js    ← pass-through for fully explicit packs
  components/
    PackSelector/
    Quiz/
    StatsDrawboard/
  hooks/
    useSession.js
    useStats.js
```

---

## Normalized Question Object

Every resolver must output questions conforming to this shape. This is the contract between packs and the core app.

```typescript
{
  id: string;                  // UUID, unique per question
  packId: string;              // which pack this came from
  questionType: QuestionType;  // controls which UI component renders this
  questionText: string;        // fully resolved, ready to display
  correctAnswer: string;       // canonical correct answer string
  distractors: string[];       // 3 wrong answers for multiple choice
  image: string | null;        // resolved URL or null
  tags: string[];              // e.g. ["europe", "western-europe"]
  tagGroup: string;            // e.g. "political", "physical"
  difficulty: "easy" | "medium" | "hard";
  wikipedia: string | null;    // optional reference URL
  source: string;              // third party source of correct answer
}
```

### Question Types

A small finite set of render types, covering the majority of use cases:

| `questionType`     | Description                                          |
|--------------------|------------------------------------------------------|
| `text-only`        | Text question, no image                              |
| `image-identify`   | Image is the subject of the question (e.g. flags)    |
| `image-context`    | Image is supplementary context, not the main subject |

---

## Pack Approaches

Packs are not required to have identical internal schemas. Each declares its own structure and ships a resolver that transforms it into normalized question objects.

### 1. Template-Based Packs

Best for symmetric, two-field relationships. The pack defines question templates; data records are pure facts.

**Example: Capital Cities**

Pack definition includes question types:
```json
"questionTypes": [
  {
    "id": "country-to-capital",
    "template": "What is the capital of {country}?",
    "answer": "{capital}",
    "distractorPool": "capital"
  },
  {
    "id": "capital-to-country",
    "template": "{capital} is the capital of which country?",
    "answer": "{country}",
    "distractorPool": "country"
  }
]
```

Data records are lean:
```json
{ "id": "uuid", "country": "France", "capital": "Paris", "tags": ["europe"], "difficulty": "easy" }
```

The resolver applies templates, selects distractors from other records in the same pool, and outputs normalized objects. One data record produces two questions automatically.

### 2. Bespoke Packs

Some packs require custom resolver logic that doesn't generalize.

**Example: Flags**

Data records store only a country name and ISO code. The resolver constructs the image URL and question text programmatically:

```json
{ "id": "uuid", "country": "Lebanon", "isoCode": "lb", "tags": ["middle-east"], "difficulty": "medium" }
```

Resolver logic:
```javascript
// flagsResolver.js
export function resolve(records) {
  return records.map(record => ({
    id: record.id,
    packId: "flags",
    questionType: "image-identify",
    questionText: "Which country does this flag belong to?",
    correctAnswer: record.country,
    distractors: pickDistractors(records, record, "country"),
    image: `https://flagcdn.com/w320/${record.isoCode}.png`,
    tags: record.tags,
    tagGroup: "political",
    difficulty: record.difficulty,
    wikipedia: null
  }));
}
```

### 3. Explicit Packs

For questions that don't fit a template — nuanced, irregular, or narrative questions. Each record is a complete question.

```json
{
  "id": "uuid",
  "questionText": "How many countries share a border with Brazil?",
  "correctAnswer": "10",
  "distractors": ["8", "9", "12"],
  "image": null,
  "tags": ["south-america", "borders"],
  "tagGroup": "political",
  "difficulty": "hard",
  "wikipedia": "https://en.wikipedia.org/wiki/Brazil"
}
```

The explicit resolver is a near-passthrough — it just validates and adds `packId`.

---

## Quiz Session Flow

1. User selects one or more packs from the Pack Selector
2. App fetches only the selected pack JSON files
3. Each pack is passed through its resolver → normalized question objects
4. All questions are merged into a flat array and shuffled
5. Session state is initialized: queue, current index, attempt log
6. Quiz renders questions from the queue one at a time
7. Each attempt (question ID, correct/incorrect, timestamp) is recorded
8. On session end, results are written to persistent stats store

The quiz engine never inspects pack internals — it only consumes normalized question objects.

---

## Stats System

### What to Track (per attempt)

```typescript
{
  questionId: string;
  packId: string;
  tags: string[];
  tagGroup: string;
  difficulty: string;
  correct: boolean;
  timestamp: number;
}
```

### Dashboard Metrics

- Total questions attempted
- Overall success rate
- Success rate by pack
- Best and worst tag groups
- Best and worst individual tags
- Performance by difficulty
- Streak tracking (current and best)
- Recent session history

### Storage

For the initial prototype, use **localStorage** with a structured key:

```
geo-quiz:attempts   ← array of attempt records
geo-quiz:sessions   ← array of session summaries
```

Migration path: when a backend is added, the same attempt schema maps cleanly to a database table.

---

## Planned Packs

| Pack | Type | Image Required | Notes |
|------|------|---------------|-------|
| Capital Cities | Template | No | Bidirectional by default |
| Flags | Bespoke | Yes | flagcdn.com for images |
| Currencies | Template | No | |
| Mountain Ranges & Peaks | Explicit/Template | No | Image pack possible later |
| Rivers & Waterways | Explicit | No | |
| Oceans, Seas & Straits | Explicit | No | |
| Deserts | Explicit | No | |
| Islands & Archipelagos | Explicit | No | |
| Borders & Neighbors | Explicit | No | Harder category |
| Country Shapes | Bespoke | Yes | SVG outlines from GeoJSON |
| Historical Geography | Explicit | No | Stretch goal |

---

## Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **State:** React state + context (no external state library to start)
- **Storage:** localStorage for stats persistence
- **Data:** Static JSON files in `/public/data/`
- **Images:** flagcdn.com (flags), local SVGs (country shapes), Cloudflare R2 (future photo packs)

---

## Future Considerations

- User accounts and cloud-synced stats
- Community-contributed packs
- Spaced repetition — surface struggled questions more frequently
- Admin interface for authoring packs
- Image-based packs for mountains, landmarks, rivers
- Timed quiz mode
