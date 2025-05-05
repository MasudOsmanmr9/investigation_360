import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedInvestigatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    area: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
});

export default mongoose.model('Request', requestSchema);