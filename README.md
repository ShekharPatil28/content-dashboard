# Content Dashboard

A modern, animated content dashboard built with **Next.js 16, React, and TypeScript**. The application brings news, movies, and posts together in one place, with API-driven content, search functionality, trending content, favourites, dark mode, and customizable settings.

## Live Demo

**Live Application:** [https://content-dashboard-11.vercel.app/](https://content-dashboard-11.vercel.app/)

**Deployment Platform:** Vercel

## Features

- **News Feed:** Browse news articles fetched from external APIs.
- **Movies:** Explore movie-related content.
- **Posts:** Access posts from configured API sources.
- **Search:** Search for relevant content using the integrated search bar.
- **Trending:** Discover trending content.
- **Favourites:** Save and revisit favourite content.
- **Settings:** Access application preferences.
- **Dark Mode:** Switch between light and dark themes.
- **Animations and Transitions:** Smooth UI animations powered by Framer Motion.
- **State Management:** Centralized state management using Redux Toolkit and React Redux.
- **Persistent State:** Redux Persist supports retaining configured application state across sessions.
- **Reusable Components:** Modular components designed for maintainability and code reuse.
- **Responsive UI:** A modern interface built for content discovery.

## Tech Stack

| Technology            | Purpose                              |
| --------------------- | ------------------------------------ |
| Next.js 16            | React framework                      |
| React 19              | UI development                       |
| TypeScript            | Type safety                          |
| Redux Toolkit         | State management                     |
| React Redux           | Connecting React components to Redux |
| Redux Persist         | Persisting configured Redux state    |
| Framer Motion         | UI animations and transitions        |
| Lucide React          | Icons                                |
| Jest                  | Unit and component testing           |
| React Testing Library | Component testing                    |
| Playwright            | End-to-end browser testing           |
| Tailwind CSS 4        | Styling                              |
| Vercel                | Deployment and hosting               |

## Project Structure

```text
content-dashboard/
├── public/                 # Static assets
├── e2e/                    # End-to-end tests
├── coverage/               # Test coverage reports
├── test-results/           # Test execution results
├── src/
│   ├── __tests__/          # Test files
│   ├── app/                # Next.js application routes
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Shared utilities and helpers
│   ├── store/              # Redux store and state logic
│   ├── test-utils/         # Testing utilities
│   └── types/              # TypeScript definitions
├── .env.local              # Local environment variables
├── eslint.config.mjs       # ESLint configuration
├── jest.config.ts          # Jest configuration
├── jest.setup.ts           # Jest setup
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json           # TypeScript configuration
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/ShekharPatil28/content-dashboard.git
cd content-dashboard
```

Install dependencies:

```bash
npm install
```

### Environment Variables

If your API integrations require environment variables, create a `.env.local` file in the project root.

```env
News_api: ***
TMDB_api: ***
```

Use the actual variable names defined in your application. Do not commit API keys or other secrets to GitHub.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

### Unit and Component Tests

Run the Jest test suite:

```bash
npm run test
```

Run Jest in watch mode during development:

```bash
npm run test:watch
```

### End-to-End Testing

This project uses Playwright for browser-based end-to-end testing.

Run the E2E suite:

```bash
npm run e2e
```

If the required Playwright browsers are not installed, install them with:

```bash
npx playwright install
```

Playwright tests are located in the `e2e/` directory, according to the current project structure.

### Test Coverage

The repository includes a `coverage/` directory for test coverage reports. Generate a coverage report using the appropriate Jest coverage command if coverage reporting is configured.

## Available Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the development server         |
| `npm run build`      | Build the application for production |
| `npm run start`      | Start the production server          |
| `npm run lint`       | Run ESLint                           |
| `npm run test`       | Run Jest tests                       |
| `npm run test:watch` | Run Jest in watch mode               |
| `npm run e2e`        | Execute Playwright E2E tests         |

## Production Build

Build the application:

```bash
npm run build
```

Start the production server locally:

```bash
npm run start
```

The production server runs after a successful build.

## Deployment

The application is deployed on Vercel.

**Production URL:** [https://content-dashboard-11.vercel.app/](https://content-dashboard-11.vercel.app/)

### Deployment Workflow

1. Push the latest changes to the connected GitHub repository.
2. Ensure the required environment variables are configured in Vercel.
3. Allow Vercel to build and deploy the application.
4. Open the deployed URL and verify the application.
5. Test API integrations, navigation, search, favourites, animations, dark mode, and other core functionality.

### Pre-Deployment Checklist

- [ ] Run `npm run build`.
- [ ] Run `npm run test`.
- [ ] Run `npm run e2e`.
- [ ] Verify environment variables.
- [ ] Check the production application after deployment.

## Architecture

The application uses a component-based architecture with Next.js and TypeScript.

- **Presentation Layer:** Reusable React components and animated UI elements.
- **State Management Layer:** Redux Toolkit, React Redux, and Redux Persist.
- **Data Layer:** External APIs providing dynamic content.
- **Testing Layer:** Jest, React Testing Library, and Playwright.

## Future Improvements

Potential enhancements include expanded language support, additional content sources, accessibility improvements, and further refinements to content discovery.

## License

No license has been specified yet.
