# Testing skill

## Purpose

Add focused tests for high-risk product logic.

## Use this skill when

- Adding business logic
- Changing scoring, locking, authorization, ingestion, AI, or simulator code

## Inputs

- Code under test
- Acceptance criteria from docs and tasks

## Process

1. Identify the high-risk rule.
2. Write a small unit test for pure logic.
3. Add integration coverage for API authorization where needed.
4. Test edge cases, not only happy paths.
5. Document manual test steps if automation is not yet available.

## Output

- Unit tests
- Integration tests or manual test notes
- Edge-case coverage

## Acceptance checklist

- [ ] Lock-time edge tested
- [ ] Non-member access tested
- [ ] Provider missing data tested
- [ ] AI schema rejection tested
- [ ] Simulator probability validity tested
- [ ] Scoring edge case tested
