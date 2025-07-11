# 🎮 Pong Classic 🎮

A modern implementation of the classic Pong game, built with p5.js, TypeScript, and Parcel. Challenge a friend or test your skills against an AI opponent!

## ✨ Features

*   **Classic Pong Gameplay:** Relive the timeless arcade experience.
*   **Player vs Player Mode:** Compete against a friend on the same keyboard.
*   **Player vs AI Mode:** Play against a computer-controlled opponent.
*   **Configurable Experience:**
    *   Set custom player names or let the game generate random ones.
    *   Configure which player is AI-controlled.
    *   Adjust AI update interval via `public/config.json`.
*   **Score Export:** Automatically exports the final score to a JSON file when the game ends.
*   **Custom Retro Font:** Uses "Press Start 2P" for an authentic arcade feel.
*   **Built with Modern Tools:** TypeScript for type safety and Parcel for efficient bundling.

## 🛠️ Tech Stack

*   **Core Logic & Rendering:** [p5.js](https://p5js.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool / Bundler:** [Parcel 2](https://parceljs.org/)
*   **Package Manager:** [npm](https://www.npmjs.com/)
*   **Styling:** SCSS (though minimally used in this project for core structure)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended, which includes npm)
*   A modern web browser (e.g., Chrome, Firefox, Edge, Safari)

## 🚀 Getting Started

Follow these steps to get the game up and running on your local machine.

### 1. Clone the Repository

If you haven't already, clone the project to your local machine.
```bash
git clone https://github.com/brmoretti/my_pong_try.git
cd my_pong_try
```

### 2. Install Dependencies

Open your terminal in the project root directory (`your-pong-repository`) and run:

```bash
npm install
```

This command will download and install all the necessary packages defined in `package.json`, including p5.js, Parcel, TypeScript, and Sass.

### 3. Running the Project (Development Mode)

To start the game in development mode with live reloading:

1.  Open your terminal in the project root directory.
2.  Run the following command:
    ```bash
    npm start
    ```
    This will start the Parcel development server, typically at `http://localhost:1234`. Parcel will automatically open the game in your default web browser. If it doesn't, navigate to the URL shown in your terminal.

    Any changes you make to the source code (e.g., in the `src` directory) will trigger an automatic rebuild and refresh the page in your browser.

### 4. Building for Production

To create an optimized build of the game for deployment:

1.  Open your terminal in the project root directory.
2.  Run the following command:
    ```bash
    npm run build
    ```
    This command will compile and bundle all assets into the `dist` directory. You can then deploy the contents of the `dist` folder to any static web hosting service.

## Technologies Used

*   **[p5.js](https://p5js.org/):** A JavaScript library for creative coding, used here for rendering the game and handling user input.
*   **[TypeScript](https://www.typescriptlang.org/):** A superset of JavaScript that adds static typing, improving code quality and maintainability.
*   **[Parcel](https://parceljs.org/):** A blazing fast, zero-configuration web application bundler.
*   **[Sass](https://sass-lang.com/):** A CSS preprocessor, adding features like variables and nesting to CSS.
*   **HTML5**
*   **CSS3**

## Project Structure

```
my_pong_try/
├── public/                  # Static assets (config, CSV, fonts)
│   ├── config.json
│   ├── player_names.csv
│   └── PressStart2P-Regular.ttf
├── src/                     # Source code
│   ├── config/              # Configuration and name generation logic
│   │   ├── Config.ts
│   │   ├── ConfigLoader.ts
│   │   └── nameGenerator.ts
│   ├── AI.ts                # AI logic
│   ├── Ball.ts              # Ball object and physics
│   ├── Board.ts             # Game board setup
│   ├── Paddle.ts            # Paddle object and movement
│   ├── pong.ts              # Main game logic and p5.js sketch
│   ├── styles.scss          # Main stylesheet
│   └── types.d.ts           # Custom type definitions
├── .gitignore
├── index.html               # Main HTML entry point
├── package.json             # Project metadata and dependencies
├── package-lock.json
├── README.md                # This file
└── tsconfig.json            # TypeScript compiler configuration
```

## How to Play

*   The game will load with default settings (Player 1 vs AI).
*   **Player 1 (Left Paddle):**
    *   Move Up: `A` key
    *   Move Down: `Z` key
*   **Player 2 (Right Paddle, if not AI):**
    *   Move Up: `ArrowUp` key
    *   Move Down: `ArrowDown` key

### Configuration

You can modify game settings by editing the `public/config.json` file:

```json
{
  "player1": "",          // Leave empty for random name, or set a specific name
  "player2": "",          // Leave empty for random name, or set a specific name
  "player1IsAI": false,   // Set to true for Player 1 to be AI
  "player2IsAI": true,    // Set to true for Player 2 to be AI
  "aiUpdateInterval": 1000 // Interval in milliseconds for AI paddle updates
}
```
Changes to `config.json` will be applied when the game is reloaded or restarted.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is open source and available under the [MIT License](LICENSE).
