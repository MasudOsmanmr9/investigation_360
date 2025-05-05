import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import requestRoutes from './src/routes/requestRoutes.js';
import investigatorRoutes from './src/routes/investigatorRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/investigator', {})
.then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

export const JWT_SECRET = 'your-secret-key';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/investigators', investigatorRoutes);

app.get('/', (req, res) => {
    res.send('Neighbor Investigator Platform API');
});

app.use((err, req, res, next) => {
    console.error(err);
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Unauthorized' });
    } else {
        res.status(500).json({ message: 'Internal server error' });
    }
});

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