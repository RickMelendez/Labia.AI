---
name: atlas-team
description: >
  Parallel development team orchestrator for Labia.AI. Spins up a full team of specialized agents
  working simultaneously: debug-tester, feature-dev, ui-enhancer, runner, scrum-master, and
  skill-learner — each with a clear role and skills assigned. Use this skill when you want to run
  a full sprint, attack multiple problems at once, set up the whole team, or when the user says
  "start the team", "run all agents", "let's sprint", "set up the dev team", or wants parallel
  progress on bugs + features + UI at the same time. This is the main entry point for team mode.
---

# Atlas Team — Parallel Agent Orchestrator

This skill sets up the full Labia.AI development team and launches all agents in parallel.
Each agent has a specific role, the right skill loaded, and a clear mandate. The scrum master
coordinates them and produces a unified status report.

## Team Architecture

```
                    ┌─────────────────────┐
                    │   atlas-scrum        │
                    │  (coordinator)       │
                    │  Tracks all tasks,   │
                    │  resolves blockers,  │
                    │  collects reports    │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │atlas-debug   │    │atlas-feature │    │atlas-ui      │
  │-tester       │    │-dev          │    │-enhancer     │
  │              │    │              │    │              │
  │Tests, fixes, │    │New features  │    │UI/UX, anims, │
  │coverage,     │    │backend+front │    │dark luxury   │
  │regressions   │    │end-to-end    │    │aesthetic     │
  └──────────────┘    └──────────────┘    └──────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
          ┌────────────────────┴────────────────────┐
          │                                          │
          ▼                                          ▼
  ┌──────────────┐                        ┌──────────────┐
  │atlas-runner  │                        │atlas-skill   │
  │              │                        │-learner      │
  │Starts stack, │                        │              │
  │health checks,│                        │Captures team │
  │smoke tests   │                        │knowledge as  │
  │              │                        │new skills    │
  └──────────────┘                        └──────────────┘
```

## How to Launch the Team

### Full Sprint Mode (Everything in Parallel)

Spawn these agents simultaneously:

**Agent 1 — Runner** (start first — others depend on services being up)
```
Agent: atlas-runner
Skill: Skills/atlas-runner/Skills.md
Task: Start the Labia.AI project (docker-compose up or local dev), run health checks
      on all services (Postgres, Redis, FastAPI), execute smoke tests on core API endpoints,
      and produce a Runner Status Report. Report GREEN/YELLOW/RED overall status.
```

**Agent 2 — Debug + Tester** (parallel with runner)
```
Agent: atlas-debug-tester
Skill: Skills/atlas-debug-tester/Skills.md
Task: Run the full backend test suite (cd backend && pytest -v --cov=src tests/).
      Fix all failing tests. Check TypeScript compilation on frontend.
      Write new tests for any coverage gaps below 80%.
      Produce a Debug+Test Report with: tests run, failures fixed, new tests added, final coverage.
```

**Agent 3 — Feature Dev** (parallel)
```
Agent: atlas-feature-dev
Skill: Skills/atlas-feature-dev/Skills.md
Task: Review the codebase for incomplete features (search for TODO/FIXME in backend/src and
      frontend/src). Pick the highest-priority incomplete feature and implement it end-to-end
      following Clean Architecture patterns. Write tests for the new code.
      Produce a Feature Dev Report with: feature built, files changed, tests written.
```

**Agent 4 — UI Enhancer** (parallel)
```
Agent: atlas-ui-enhancer
Skill: Skills/atlas-ui-enhancer/Skills.md
Task: Audit all screens in frontend/src/screens/ and components in frontend/src/components/.
      Apply the dark luxury dating app aesthetic (deep dark background, rose/crimson accents,
      glassmorphic cards, Playfair Display + DM Sans fonts). Add spring animations to all
      interactive elements. Make profile cards, navigation, and buttons feel alive.
      Produce a UI Enhancer Report with: screens updated, animations added, theme changes.
```

**Agent 5 — Scrum Master** (launches last, collects all reports)
```
Agent: atlas-scrum
Skill: Skills/atlas-scrum/Skills.md
Task: Wait for reports from atlas-runner, atlas-debug-tester, atlas-feature-dev, and
      atlas-ui-enhancer. Collect all their reports. Update STATUS.md with the completed tasks
      board. Identify any blockers between agents. Route any discovered cross-agent dependencies.
      Surface patterns to atlas-skill-learner.
      Produce the master Sprint Summary with all completed tasks listed.
```

**Agent 6 — Skill Learner** (runs alongside, feeds from scrum)
```
Agent: atlas-skill-learner
Skill: Skills/atlas-skill-learner/Skills.md
Task: Monitor the reports coming from all other agents during the sprint.
      Identify any repeated patterns, non-obvious fixes, or project-specific knowledge
      that was discovered. Create new skill files for any patterns worth capturing.
      Update Skills/SKILLS_INVENTORY.md with new skills.
      Report new skills created and patterns identified.
```

## Standalone Agent Mode

Sometimes you only need one agent. Launch just that one:

### Only fix bugs and tests
```
atlas-debug-tester: [your specific task]
```

### Only build a feature
```
atlas-feature-dev: Build [feature name] — [description of what it should do]
```

### Only improve the UI
```
atlas-ui-enhancer: [what to fix/improve — e.g., "make the profile card feel more premium"]
```

### Only check if the project runs
```
atlas-runner: Start the project and give me a health report
```

### Only coordinate and see status
```
atlas-scrum: Show me the current project status and list all completed tasks
```

## Agent Handoff Protocol

When one agent's output becomes another agent's input:

| From | To | Trigger |
|------|----|---------|
| atlas-runner: RED status | atlas-debug-tester | "Backend won't start — debug this" |
| atlas-debug-tester: test failures | atlas-feature-dev | "These tests fail because feature X is missing — implement it" |
| atlas-feature-dev: new screen | atlas-ui-enhancer | "New screen added at screens/X.tsx — apply dark luxury theme" |
| atlas-ui-enhancer: accessibility issue | atlas-debug-tester | "Found touch targets too small in component Y — fix it" |
| Any agent: repeated pattern | atlas-skill-learner | "We keep doing X — turn it into a skill" |
| All agents: done | atlas-scrum | "Collect all reports, update STATUS.md" |

## Sprint Output

After a full sprint, the scrum master produces `STATUS.md` at the project root with:

1. Sprint goal and outcome
2. All completed tasks by agent
3. Current blockers
4. Next sprint priorities
5. Running log of all completed features (all-time)

## Customizing the Sprint

Adjust agent tasks based on the current sprint goal:

**Bug-fix sprint**: Weight toward atlas-debug-tester + atlas-runner
**Feature sprint**: Weight toward atlas-feature-dev + atlas-debug-tester (tests)
**Polish sprint**: Weight toward atlas-ui-enhancer + atlas-runner (visual regression)
**Knowledge sprint**: Weight toward atlas-skill-learner (capture what team learned)

## Project Quick Context

For agents that need it:
- **Repo root**: `c:/Users/Rickm/Personal-Projects/Labia.AI/`
- **Backend**: FastAPI, Clean Architecture, Python, `backend/`
- **Frontend**: Expo/React Native, TypeScript, `frontend/`
- **App type**: Dating/social app — premium dark luxury aesthetic
- **Backend start**: `docker-compose up --build` or `cd backend && uvicorn src.main:app --reload`
- **Frontend start**: `cd frontend && npm run start`
- **Tests**: `cd backend && pytest --cov=src tests/`
- **Skills dir**: `Skills/` (all agent skills are here)
