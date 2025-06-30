# Frontend Testing Guidance

## Core Principles

- Always practice Test-Driven Development (TDD)
- Write tests before implementing functionality
- Create only one test scenario at a time when building new components

## Workflow

1. Write a failing test for a single behavior
2. Run the test to verify it fails for the expected reason
3. Implement the minimum code to make the test pass
4. Run the test again to verify it passes
5. Refactor as needed
6. Repeat for the next behavior

## Mentoring & Collaboration

- Explain the reasoning behind your implementation approach
- Ask questions to confirm understanding and direction
- Treat collaborators as learners who need context and explanations
- Actively seek feedback on your approach

## Code Quality

- After tests pass, consider refactoring opportunities
- Align code with existing patterns and conventions in the codebase
- Prioritize readability and maintainability

## Best Practices

- Keep tests focused on a single behavior
- Add only one new test at a time. Never generate multiple test scenarios at once.
- Always run tests when writing new tests to verify they fail as expected
- Use descriptive test names
- Maintain test independence
- Avoid testing implementation details
- Mock external dependencies appropriately
- For any API interaction between the front-end and the back-end, always implement the front-end first

## React Testing Best Practices

- Prefer accessibility queries over other selectors (`getByRole` instead of `getByTestId`)
- Use `toBeVisible()` instead of `toBeInTheDocument()` when checking if elements are rendered and visible
- Avoid `data-testid` attributes whenever possible, as they:
  - Add implementation details to your components
  - Don't reflect how users interact with your application
  - Can lead to brittle tests when IDs change
  - Don't promote accessibility-first development
- Structure test cases to match how users interact with components
- Test component behavior, not implementation details
- Use `userEvent` over `fireEvent` for more realistic user interactions
- Prefer querying by text content, labels, and ARIA roles to simulate how users and assistive technologies interact with your app
