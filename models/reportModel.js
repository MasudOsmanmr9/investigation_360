import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    investigatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    reportData: { type: String, required: true },
    file: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Report', reportSchema);