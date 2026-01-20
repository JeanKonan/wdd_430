<!-- 
  SYNC IMPACT REPORT: Constitution Amendment v1.0.0
  
  Generated: 2026-01-15
  
  ✅ VERSION CHANGE: Template → v1.0.0 (INITIAL CREATION)
  Bump Type: MINOR (New constitution with 4 core principles established)
  Rationale: First version establishes governance framework for code quality, testing, UX, and performance
  
  ✅ PRINCIPLES ADDED:
  - I. Code Quality Excellence (explicit clarity, consistency, maintainability standards)
  - II. Testing Standards - NON-NEGOTIABLE (test-first, TDD, 80% coverage minimum)
  - III. User Experience Consistency (predictable, accessible, validated UX)
  - IV. Performance Requirements (measurable targets: 200ms API, 3s load, 100ms feedback)
  
  ✅ GOVERNANCE SECTION ADDED:
  - Amendment procedure formalized
  - Compliance verification gates established
  - Team onboarding requirement clarified
  
  ✅ TEMPLATES UPDATED FOR ALIGNMENT:
  - [✅] plan-template.md: Constitution Check section added with 4 principle gates
  - [✅] spec-template.md: Constitution Requirements section added to Functional Requirements
  - [✅] tasks-template.md: Phase 1 & 2 updated with quality/testing/performance task types
  - [✅] checklist-template.md: 10-item Constitution Compliance section prepended
  
  📋 FOLLOW-UP ITEMS:
  - None deferred (all placeholders replaced)
  - Review agent-file-template.md for optional compliance checks if used for spec writing
-->

# SpecKit Copilot Constitution

## Core Principles

### I. Code Quality Excellence
Every code contribution MUST maintain high standards of clarity, consistency, and maintainability. Code must be self-documenting with meaningful variable names, appropriate abstractions, and logical organization. All code MUST pass linting checks and adhere to established style guidelines before review. Complex logic requires inline comments explaining the "why" behind non-obvious implementations. Duplication is prohibited—common patterns must be extracted into reusable utilities. Code complexity must remain justified and proportional to the problem domain.

### II. Testing Standards (NON-NEGOTIABLE)
Test-driven development is mandatory: tests are written and approved by users BEFORE implementation begins. The Red-Green-Refactor cycle is strictly enforced—write failing tests, implement code to pass, then refactor. Unit tests MUST cover all public APIs and critical paths. Integration tests validate contracts between components and external services. Tests MUST be independent, repeatable, and run in under 5 seconds for unit suites. Code coverage target: 80% minimum for critical paths. Flaky or manual tests are prohibited.

### III. User Experience Consistency
All user-facing interactions MUST provide predictable, intuitive, and cohesive experiences. UI/UX patterns, terminology, and feedback mechanisms MUST be consistent across all interfaces. Error messages must be clear, actionable, and free of technical jargon unless directed at developers. Loading states, navigation flows, and data formatting MUST follow established design guidelines. Accessibility standards (WCAG 2.1 AA minimum) are non-negotiable. User research or testing MUST validate any major UX changes before deployment.

### IV. Performance Requirements
All features MUST meet explicit performance targets before release. API endpoints must respond within 200ms (p95 latency) for standard queries. Frontend interactions must feel responsive: page loads in under 3 seconds, interactions feedback within 100ms. Memory usage MUST stay within 80% of allocated limits even under peak load. Batch operations must process at least 1000 items/second. Database queries MUST include execution time analysis and optimization before merge. Performance regression tests are required for any component affecting latency or throughput.

## Development Workflow & Quality Gates

- **Code Review**: Every PR MUST be reviewed for constitution compliance before merge. Reviewers verify: test coverage, performance benchmarks, UX consistency, and code quality standards.
- **Testing Gate**: All tests MUST pass in CI/CD pipeline. Coverage reports MUST be reviewed. Manual testing on target platform required for UX changes.
- **Performance Validation**: Performance tests MUST run and results MUST be documented in PR description. Regressions MUST be justified or addressed before approval.
- **Compliance Check**: Plan documents and spec templates MUST reference applicable principles. Features must declare which principles apply and how they are satisfied.

## Governance

The constitution supersedes all other development practices. Amendments require:
- Written proposal documenting rationale and impact
- Approval from project leads
- Clear migration path for existing code
- Updates to all dependent templates and guidance files

Constitution compliance is verified during code review, planning phase, and CI/CD gates. All team members MUST understand current constitution version before contributing.

**Version**: 1.0.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-15
