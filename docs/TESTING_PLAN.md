# Functional Testing Plan

This document outlines a plan for creating a suite of functional tests for the Tic-Tac-Toe game. The goal is to ensure that key user flows, game rules, and edge cases work as expected.

## 1. Testing Strategy & Framework

-   **Strategy:** We will use End-to-End (E2E) testing to simulate real user interactions with the game in a browser environment. This allows us to test the full application flow, from the setup screen to the final game state.
-   **Framework:** We will use [**Cypress**](https://www.cypress.io/) for our tests. It's a modern, developer-friendly E2E testing framework that provides excellent tools for interacting with and asserting on web applications.

## 2. Test Suite Setup

-   **Install Cypress:** Add `cypress` as a dev dependency to the project.
-   **Configure Cypress:** Initialize Cypress to create the necessary configuration files (`cypress.config.ts`) and folder structure (`cypress/e2e`).
-   **Add `test` script:** Add a new script to `package.json` (e.g., `"test": "cypress open"`) to easily run the tests.

## 3. Test Scenarios

### 3.1 Setup Screen (React Components)

-   **Default State:**
    -   [X] Test that the setup form is visible and the game canvas is hidden on page load.
    -   [X] Test that player names default to "Player 1" and "Player 2".
-   **Player Configuration:**
    -   [X] Test that entering new names in the input fields updates the player configuration.
    -   [X] Test that selecting an emoji symbol updates the player configuration.
    -   [X] Test that selecting a line color updates the player configuration.
-   **Symbol Uniqueness:**
    -   [X] Test that when Player 1 selects a symbol, that same symbol becomes disabled in Player 2's dropdown.
    -   [X] Test that when Player 2 selects a symbol, it becomes disabled for Player 1.
    -   [X] Test that if the form is submitted with identical symbols, an alert is shown and the game does not start.
-   **Game Start:**
    -   [X] Test that clicking the "Start Game" button hides the setup form and shows the canvas.

### 3.2 Game Play (`GameScene`)

-   **Event-Driven Tests**: The following tests will not check the UI directly, but will instead listen for custom DOM events (`moveMade`, `gameWin`, `gameDraw`) dispatched from `GameScene.ts`.
-   **Initial State:**
    -   [X] Test that the canvas is visible after starting the game.
-   **Core Gameplay:**
    -   [X] **Move Event**: Test that clicking an empty cell fires a `moveMade` event containing the player and position.
-   **Win Conditions:**
    -   [X] **Win Event**: Test that a winning sequence of moves fires a `gameWin` event with the winner's data.
-   **Draw Condition:**
    -   [X] **Draw Event**: Test that a full board with no winner fires a `gameDraw` event.

### 3.3 Additional Tests

-   **New Round Logic:**
    -   [X] Test that clicking the "New Round" button clears the board, preserves scores, and makes the loser of the previous round the new active player.
-   **New Game Logic:**
    -   [X] Test that clicking the "New Game" button returns the user to the setup screen.
    -   [X] Test that starting a new game resets all scores to 0. 