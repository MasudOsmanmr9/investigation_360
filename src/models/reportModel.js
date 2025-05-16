import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    investigatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    reportData: { type: String, required: true },
    file: { type: String },
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

let collectionName = 'Report';
let convertedCOllecctionName = collectionName.toLowerCase() + 's';
let modelPromptFormat = {collectionName:convertedCOllecctionName, schema: {}};
for (const [key, val] of Object.entries(reportSchema.tree)) {
  modelPromptFormat['schema'][key] = { ...val, type: getTypeName(val.type) };
}

export const reportModelPrompt = escapeBraces(JSON.stringify(modelPromptFormat, null, 2));
export default mongoose.model(collectionName, reportSchema);