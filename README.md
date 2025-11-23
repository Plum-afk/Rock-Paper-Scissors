# Rock Paper Scissors Online

A real-time multiplayer Rock-Paper-Scissors game built with Vite, React, and Socket.io.

## Features
- Real-time gameplay with instant sync.
- Create and Join rooms with unique codes.
- Live score tracking.
- Premium glassmorphism UI.
- Automatic handling of disconnects.

## How to Run

1. **Install Dependencies** (if not already done):
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Start the Server**:
   ```bash
   node server/index.js
   ```
   The server runs on `http://localhost:3001`.

3. **Start the Frontend** (in a new terminal):
   ```bash
   npm run dev
   ```
   The game will be available at `http://localhost:5173`.

4. **Play**:
   - Open the game in two different browser tabs or windows.
   - In one tab, enter your name and click **Create Match**.
   - Copy the generated Game Code.
   - In the second tab, enter your name, click **Join Match**, and paste the code.
   - The game will start automatically!
