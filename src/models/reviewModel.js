import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    investigatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Review', reviewSchema);