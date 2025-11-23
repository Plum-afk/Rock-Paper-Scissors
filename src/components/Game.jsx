import React, { useState, useEffect } from 'react';

const CHOICES = [
    { id: 'rock', label: 'Rock', icon: '🪨' },
    { id: 'paper', label: 'Paper', icon: '📄' },
    { id: 'scissors', label: 'Scissors', icon: '✂️' }
];

function Game({ socket, roomId, players, myId }) {
    const [myChoice, setMyChoice] = useState(null);
    const [opponentLocked, setOpponentLocked] = useState(false);
    const [result, setResult] = useState(null);
    const [scores, setScores] = useState(
        players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
    );
    const [roundState, setRoundState] = useState('choosing'); // choosing, locked, result

    const opponent = players.find(p => p.id !== myId);
    const me = players.find(p => p.id === myId);

    useEffect(() => {
        socket.on('player_locked', ({ playerId }) => {
            if (playerId !== myId) {
                setOpponentLocked(true);
            }
        });

        socket.on('round_result', ({ choices, winnerId, scores }) => {
            setResult({ choices, winnerId });
            setScores(scores);
            setRoundState('result');
        });

        socket.on('next_round', () => {
            setMyChoice(null);
            setOpponentLocked(false);
            setResult(null);
            setRoundState('choosing');
        });

        return () => {
            socket.off('player_locked');
            socket.off('round_result');
            socket.off('next_round');
        };
    }, [socket, myId]);

    const makeChoice = (choiceId) => {
        if (roundState !== 'choosing') return;
        setMyChoice(choiceId);
        setRoundState('locked');
        socket.emit('make_choice', { roomId, choice: choiceId });
    };

    return (
        <div className="game-container">
            <div className="score-board glass-panel">
                <div className="player-score">
                    <div className="player-name">{me.name} (You)</div>
                    <div className="score-value">{scores[myId] || 0}</div>
                </div>
                <div className="vs-badge">VS</div>
                <div className="player-score">
                    <div className="player-name">{opponent.name}</div>
                    <div className="score-value">{scores[opponent.id] || 0}</div>
                </div>
            </div>

            <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {roundState === 'choosing' && (
                    <>
                        <h2 style={{ marginBottom: '1rem' }}>Make your move!</h2>
                        {opponentLocked && <p style={{ color: 'var(--primary)', animation: 'pulse 1s infinite' }}>Opponent has chosen!</p>}
                        <div className="choice-container">
                            {CHOICES.map(choice => (
                                <div
                                    key={choice.id}
                                    className="choice-card"
                                    onClick={() => makeChoice(choice.id)}
                                >
                                    <div className="choice-icon">{choice.icon}</div>
                                    <div className="choice-label">{choice.label}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {roundState === 'locked' && (
                    <div style={{ textAlign: 'center' }}>
                        <h2>Locked in!</h2>
                        <div className="choice-card selected" style={{ margin: '2rem auto', pointerEvents: 'none' }}>
                            <div className="choice-icon">{CHOICES.find(c => c.id === myChoice)?.icon}</div>
                            <div className="choice-label">{CHOICES.find(c => c.id === myChoice)?.label}</div>
                        </div>
                        <p>{opponentLocked ? "Opponent is ready..." : "Waiting for opponent..."}</p>
                    </div>
                )}

                {roundState === 'result' && result && (
                    <div className="result-overlay">
                        <div className="result-content glass-panel">
                            <h1 style={{
                                fontSize: '4rem',
                                color: result.winnerId === myId ? 'var(--primary)' : result.winnerId ? 'var(--secondary)' : '#fff',
                                marginBottom: '2rem'
                            }}>
                                {result.winnerId === myId ? 'YOU WIN!' : result.winnerId ? 'YOU LOSE' : 'DRAW'}
                            </h1>

                            <div style={{ display: 'flex', gap: '4rem', justifyContent: 'center', marginBottom: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p>You</p>
                                    <div className="choice-card selected" style={{ pointerEvents: 'none' }}>
                                        <div className="choice-icon">{CHOICES.find(c => c.id === result.choices[myId])?.icon}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p>Opponent</p>
                                    <div className="choice-card selected" style={{ pointerEvents: 'none', borderColor: 'var(--secondary)' }}>
                                        <div className="choice-icon">{CHOICES.find(c => c.id === result.choices[opponent.id])?.icon}</div>
                                    </div>
                                </div>
                            </div>

                            <p>Next round starting soon...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Game;
