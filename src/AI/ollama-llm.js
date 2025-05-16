import { Ollama } from "@langchain/ollama";
import { OLLAMA_BASE_URL, OLLAMA_MODEL } from "../config/const.js";

export const llm = new Ollama({
    // baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL,
    // temperature: 0.2,
});