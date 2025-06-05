# Phaser 3 Tic-Tac-Toe Game

This project is a modern, web-based Tic-Tac-Toe game built with Phaser 3, TypeScript, and Webpack. It features a dynamic setup screen, customizable player options, scoring, sound effects, and a clean, interactive gameplay experience.

The intended audience for this document is a developer new to the project who needs to understand the architecture, setup the development environment, and begin contributing.

## Features

-   **Interactive Game Board:** A classic 3x3 grid where players can place their symbols.
-   **Customizable Player Setup:**
    -   Players can enter their own names.
    -   Players can choose their game symbol from a list of emojis (e.g., 🐱, 🍕, 🚀).
    -   The system prevents both players from choosing the same symbol.
    -   Players can choose the color of the line that appears when they win.
-   **Turn-Based Gameplay:** The game manages player turns, clearly indicating whose turn it is.
-   **Win/Draw Detection:** The game automatically detects and announces if a player has won or if the game is a draw.
-   **Winning Line:** A colored line is drawn through the three winning symbols.
-   **Scoring System:** Persistent scores for each player's wins and the number of draws are tracked across rounds.
-   **Sound Effects:**
    -   Unique sound effects for different emoji symbols.
    -   Specific sounds for winning a round or a draw.
-   **New Round / New Game:**
    -   Players can start a "New Round" which resets the board but keeps the scores and players. The loser of the previous round starts the next one.
    -   Players can start a "New Game" which takes them back to the setup screen to re-configure players and resets the scores.

## Tech Stack

-   **Game Framework:** [Phaser 3](https://phaser.io/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Bundler:** [Webpack](https://webpack.js.org/)
-   **Development Server:** [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)

## Project Structure

```
.
├── /assets/sounds/         # Sound effect files (.ogg, .mp3)
├── /dist/                  # Compiled output bundle (not in git)
├── /node_modules/          # Project dependencies (not in git)
├── /src/
│   ├── SetupScene.ts       # Manages the HTML setup form and passes data to the game.
│   └── game.ts             # Contains the core game logic (GameScene) and Phaser setup.
├── .gitignore              # Specifies files for git to ignore.
├── DESIGN_PLAN.md          # Outlines the plan for UI/UX improvements.
├── index.html              # The main HTML entry point, contains the setup form.
├── package.json            # Project dependencies and scripts.
├── package-lock.json       # Exact dependency versions.
├── tsconfig.json           # TypeScript compiler configuration.
└── webpack.config.js       # Webpack bundler configuration.
```

## Getting Started

To get the project running locally, follow these steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Run the following command in the project root to install all necessary packages from `package.json`.
    ```bash
    npm install
    ```

### Running the Development Server

This project uses `webpack-dev-server` for a live-reloading development experience.

-   **Start the server:**
    ```bash
    npm start
    ```
-   This will automatically open the game in your default web browser at `http://localhost:8080`.
-   The server watches for changes in the source files (`.ts`, `.html`) and will automatically re-bundle and reload the page.

### Building for Production

To create a static bundle in the `/dist` directory, you can run the build script.
```bash
npm run build
```

## How to Contribute

1.  Pick an unassigned task from the `DESIGN_PLAN.md` or an open issue.
2.  Create a new branch for your feature or bug fix: `git checkout -b feature/my-new-feature`
3.  Make your changes.
4.  Test your changes thoroughly.
5.  Commit your changes with a clear and descriptive message.
6.  Push your branch and open a pull request. 