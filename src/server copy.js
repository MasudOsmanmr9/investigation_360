import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import { app } from './app';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (requestId) => {
        socket.join(requestId);
        console.log(`User joined room: ${requestId}`);
    });

    socket.on('sendMessage', ({ requestId, senderId, message }) => {
        io.to(requestId).emit('message', { senderId, message, timestamp: new Date() });
        console.log(`Message sent to room ${requestId}: ${message} from ${senderId}`);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});