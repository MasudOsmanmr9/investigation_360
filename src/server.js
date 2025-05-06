import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import connectDB from './config/db.js';
import { app } from './app.js';
import setupSocketServer from './socketServer.js';


const PORT = process.env.PORT || 3000;

async function init(){
    console.log('Initializing server...');
    await connectDB()
    const server = app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
    
    setupSocketServer(server);

}

init();