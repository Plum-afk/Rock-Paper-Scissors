import React, { useState } from 'react';

function Home({ createGame, joinGame, error }) {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [mode, setMode] = useState('menu'); // menu, create, join

    if (mode === 'menu') {
        return (
            <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ textAlign: 'center', fontSize: '1.2rem' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => name ? setMode('create') : alert('Please enter a name')}>
                        Create Match
                    </button>
                    <button className="btn-secondary" onClick={() => name ? setMode('join') : alert('Please enter a name')}>
                        Join Match
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'create') {
        createGame(name); // Immediately trigger create
        return <div className="glass-panel">Creating game...</div>;
    }

    if (mode === 'join') {
        return (
            <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2>Join Game</h2>
                {error && <p style={{ color: 'var(--secondary)' }}>{error}</p>}
                <input
                    type="text"
                    placeholder="Enter Game Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-secondary" onClick={() => setMode('menu')}>Back</button>
                    <button className="btn-primary" onClick={() => joinGame(name, code)}>Join</button>
                </div>
            </div>
        );
    }

    return null;
}

export default Home;
