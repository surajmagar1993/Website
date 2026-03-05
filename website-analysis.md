# Website Analysis Plan

## Overview
A comprehensive, multi-agent evaluation of the entire Genesoft website project to identify areas for improvement in frontend UI/UX, backend logic, security, performance, and testing.

## Project Type
WEB (Next.js 15, React 19, Supabase, Tailwind V4)

## Success Criteria
- Produce a unified orchestration report detailing actionable findings.
- Discover and document security, performance, and code quality issues.
- Verification of site health via automated scripts.

## Tech Stack
- Frontend: Next.js, React, Tailwind CSS V4, GSAP, Framer Motion
- Backend/DB: Supabase (Auth, DB), Postgres
- Services: Resend (Email)

## File Structure
- `src/app/`: Next.js App Router pages
- `src/components/`: Custom UI Components
- `src/lib/`: Libs and config
- `src/actions/`: Server actions
- `supabase/`: Local Supabase configurations

## Task Breakdown

### Task 1: Security and Auth Audit
**Agent**: `security-auditor`
**Skill**: `vulnerability-scanner`, `api-patterns`
- **INPUT**: Codebase access, Supabase files (`src/lib`, `src/actions`).
- **OUTPUT**: Report of identified vulnerabilities, exposed secrets, and RLS bypasses.
- **VERIFY**: Run `security_scan.py` and confirm no critical vulnerabilities exist.

### Task 2: Backend and Data Flow Review
**Agent**: `backend-specialist`
**Skill**: `nodejs-best-practices`, `api-patterns`
- **INPUT**: Server actions (`src/actions`), database queries, and routing logic.
- **OUTPUT**: Evaluation of data fetching patterns, correct API architecture.
- **VERIFY**: Review findings against Node.js/Next.js backend patterns.

### Task 3: Frontend UX and Component Audit
**Agent**: `frontend-specialist`
**Skill**: `frontend-design`, `react-best-practices`
- **INPUT**: Components (`src/components/`) and UI pages.
- **OUTPUT**: Assessment of React principles, state management, UI/accessibility.
- **VERIFY**: Run `ux_audit.py` and `lint_runner.py` to identify issues.

### Task 4: Performance and SEO Analysis
**Agent**: `performance-optimizer` & `seo-specialist`
**Skill**: `performance-profiling`, `seo-fundamentals`
- **INPUT**: Entire repository.
- **OUTPUT**: Performance bottlenecks report, Core Web Vitals checks.
- **VERIFY**: Execute `lighthouse_audit.py`.

### Task 5: Testing Evaluation
**Agent**: `test-engineer`
**Skill**: `webapp-testing`
- **INPUT**: The repository.
- **OUTPUT**: Evaluation of current testing tools and code coverage.
- **VERIFY**: Check coverage metrics or run Playwright tests if configured.

### Task 6: Synthesis and Orchestration Report
**Agent**: `orchestrator`
**Skill**: `parallel-agents`
- **INPUT**: Actionable findings from Agents 1-5.
- **OUTPUT**: A unified `Multi-Agent Orchestration Report`.
- **VERIFY**: Check all tasks and Phase X checks have been completed.

## Phase X: Verification
- [ ] Execute `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] Execute `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`
- [ ] Complete Orchestration Report.
