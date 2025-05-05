import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['requester', 'investigator', 'both'], required: true, default: 'requester' },
    name: { type: String },
    contactDetails: { type: String },
    activeRole: { type: String, enum: ['requester', 'investigator'], default: 'requester' },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);