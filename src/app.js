import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import investigatorRoutes from './routes/investigatorRoutes.js';
import { errorHandeler } from './middleware/errorHandeler.js';

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

app.use(errorHandeler);
