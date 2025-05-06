import mongoose from 'mongoose';

const connectDB = () => {
    console.log('Connecting to MongoDB...');
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGODB_URI, {})
            .then(() => {
                console.log('MongoDB connection established');
                resolve();
            })
            .catch((err) => {
                console.error('Error connecting to MongoDB:', err);
                reject(err);
            });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            reject(err);
        });
    });
};

export default connectDB;