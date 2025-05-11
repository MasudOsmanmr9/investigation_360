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
import reportRoutes from './routes/reportRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandeler } from './middleware/errorHandeler.js';
import dotenv from 'dotenv';
import cors from 'cors'


const result = dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors())
app.use(bodyParser.json());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/investigators', investigatorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api', (req, res) => {
    res.send('Investigator Platform API');
});

app.use(errorHandeler);

export { app };