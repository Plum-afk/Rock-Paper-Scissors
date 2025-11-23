import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Home from './components/Home';
import Game from './components/Game';
import './index.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('home'); // home, lobby, game
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('game_created', ({ roomId }) => {
      setRoomId(roomId);
      setGameState('lobby');
      setError('');
    });

    newSocket.on('game_joined', () => {
      setGameState('lobby'); // Or directly to game if we wait for start
      setError('');
    });

    newSocket.on('game_start', ({ players }) => {
      setPlayers(players);
      setGameState('game');
    });

    newSocket.on('error', ({ message }) => {
      setError(message);
    });

    newSocket.on('player_left', () => {
      alert('Opponent disconnected. Returning to home.');
      setGameState('home');
      setRoomId('');
      setPlayers([]);
    });

    return () => newSocket.close();
  }, []);

  const createGame = (name) => {
    if (!name) return setError('Please enter your name');
    setPlayerName(name);
    socket.emit('create_game', { name });
  };

  const joinGame = (name, code) => {
    if (!name || !code) return setError('Please enter name and game code');
    setPlayerName(name);
    setRoomId(code);
    socket.emit('join_game', { roomId: code, name });
  };

  return (
    <div className="app-container">
      <h1 className="title">RPS <span style={{ color: 'var(--text-main)', fontSize: '0.5em' }}>Online</span></h1>

      {gameState === 'home' && (
        <Home
          createGame={createGame}
          joinGame={joinGame}
          error={error}
        />
      )}

      {gameState === 'lobby' && (
        <div className="glass-panel">
          <h2>Waiting for opponent...</h2>
          <p>Share this code with your friend:</p>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            letterSpacing: '5px',
            margin: '1rem 0',
            color: 'var(--primary)',
            background: 'rgba(0,0,0,0.3)',
            padding: '1rem',
            borderRadius: '8px',
            userSelect: 'all'
          }}>
            {roomId}
          </div>
          <div className="loader"></div>
        </div>
      )}

      {gameState === 'game' && (
        <Game
          socket={socket}
          roomId={roomId}
          players={players}
          myId={socket.id}
        />
      )}
    </div>
  );
}

export default App;
