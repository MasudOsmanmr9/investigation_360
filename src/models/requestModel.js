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

function escapeBraces(str) {
  return str.replace(/[{]/g, '{{').replace(/[}]/g, '}}');
}
function getTypeName(type) {
  if (typeof type === 'function') return type.name;
  if (type && type.constructor) return type.constructor.name;
  return typeof type;
}

let collectionName = 'Request';
let convertedCOllecctionName = collectionName.toLowerCase() + 's';
let modelPromptFormat = {collectionName:convertedCOllecctionName, schema: {}};
for (const [key, val] of Object.entries(requestSchema.tree)) {
  modelPromptFormat['schema'][key] = { ...val, type: getTypeName(val.type) };
}

export const requestModelPrompt = escapeBraces(JSON.stringify(modelPromptFormat, null, 2));
export default mongoose.model(collectionName, requestSchema);