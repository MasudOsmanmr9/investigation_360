export const userRolesConst = ['investigator', 'requester', 'both'];
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investigator';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
export const OLLAMA_BASE_URL = "http://localhost:11434";
export const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'investigator';