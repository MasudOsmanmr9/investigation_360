import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    investigatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
});

function escapeBraces(str) {
  return str.replace(/[{]/g, '{{').replace(/[}]/g, '}}');
}
function getTypeName(type) {
  if (typeof type === 'function') return type.name;
  if (type && type.constructor) return type.constructor.name;
  return typeof type;
}

let collectionName = 'Review';
let convertedCOllecctionName = collectionName.toLowerCase() + 's';
let modelPromptFormat = {collectionName:convertedCOllecctionName, schema: {}};
for (const [key, val] of Object.entries(reviewSchema.tree)) {
  modelPromptFormat['schema'][key] = { ...val, type: getTypeName(val.type) };
}

export const reviewModelPrompt = escapeBraces(JSON.stringify(modelPromptFormat, null, 2));

export default mongoose.model(collectionName, reviewSchema);