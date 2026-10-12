# Dependency audit at the Q4 PR checkpoint

Observed 2026-10-13 (Australia/Sydney).

Executed `npm audit --audit-level=high` and bounded repeat
`npm audit --audit-level=high --fetch-retries=0 --fetch-timeout=20000`.
Both returned exit 1: **14 vulnerabilities — 1 moderate, 11 high, 2 critical**.
The lockfile has no differences from `origin/main`; this correction and previous
V0.4.3 commits do not update dependency versions.

Reported packages include `@vitest/mocker` / Vitest (path traversal),
`brace-expansion` / `braces` and their ESLint dependency chains (denial of service),
`source-map-js` (denial of service), and Tinypool (worker-option prototype-pollution
RCE advisories). npm's complete remediation includes a major Vitest change and
an out-of-range typescript-eslint update; no force install was executed.

This records the audit result, not an exploitability assessment or a claim that
production is unaffected. `.github/workflows/ci.yml` runs this audit, so its gate
is a known blocker to readiness/merge until dependency maintenance resolves it.
The requested balance/stat-inspection work and game regression checks are
reported separately. The checkpoint PR is draft; P2 can proceed independently
within its recorded ownership. See REC-113.
