const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"]
    }
});

// Store game state
// rooms[roomId] = {
//   players: [ { id, name, score, choice } ],
//   status: 'waiting' | 'playing' | 'result',
//   rounds: 0
// }
const rooms = {};

const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create_game', ({ name }) => {
        const roomId = generateRoomId();
        rooms[roomId] = {
            players: [{ id: socket.id, name, score: 0, choice: null }],
            status: 'waiting'
        };
        socket.join(roomId);
        socket.emit('game_created', { roomId });
        console.log(`Game created: ${roomId} by ${name}`);
    });

    socket.on('join_game', ({ roomId, name }) => {
        const room = rooms[roomId];
        if (room && room.players.length < 2) {
            room.players.push({ id: socket.id, name, score: 0, choice: null });
            room.status = 'playing';
            socket.join(roomId);

            // Notify everyone in room
            io.to(roomId).emit('game_start', {
                players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
            });
            console.log(`User ${name} joined room ${roomId}`);
        } else {
            socket.emit('error', { message: 'Room not found or full' });
        }
    });

    socket.on('make_choice', ({ roomId, choice }) => {
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.choice = choice;

            // Check if both players made a choice
            const allChosen = room.players.every(p => p.choice);
            if (allChosen) {
                room.status = 'result';
                const [p1, p2] = room.players;

                let winnerId = null;
                if (p1.choice !== p2.choice) {
                    if (
                        (p1.choice === 'rock' && p2.choice === 'scissors') ||
                        (p1.choice === 'paper' && p2.choice === 'rock') ||
                        (p1.choice === 'scissors' && p2.choice === 'paper')
                    ) {
                        winnerId = p1.id;
                        p1.score += 1;
                    } else {
                        winnerId = p2.id;
                        p2.score += 1;
                    }
                }

                io.to(roomId).emit('round_result', {
                    choices: { [p1.id]: p1.choice, [p2.id]: p2.choice },
                    winnerId,
                    scores: { [p1.id]: p1.score, [p2.id]: p2.score }
                });

                // Reset choices for next round after a delay
                setTimeout(() => {
                    if (rooms[roomId]) { // Check if room still exists
                        rooms[roomId].players.forEach(p => p.choice = null);
                        rooms[roomId].status = 'playing';
                        io.to(roomId).emit('next_round');
                    }
                }, 5000); // 5 seconds to see results
            } else {
                // Notify that this player has locked in (optional, to show "Ready" status)
                io.to(roomId).emit('player_locked', { playerId: socket.id });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Find room user was in
        for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.players.find(p => p.id === socket.id)) {
                io.to(roomId).emit('player_left');
                delete rooms[roomId]; // Clean up room
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
