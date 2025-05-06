// filepath: investigation/src/socket.js
import { Server } from 'socket.io';
const setupSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
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

    return io;
};

export default setupSocketServer;