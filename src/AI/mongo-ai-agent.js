import { llm } from "./ollama-llm.js";
import { mongoQueryPrompt } from "./promptTemplates.js";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { MongoClient } from "mongodb";
import {ObjectId} from "mongodb";
import { MONGODB_URI,MONGODB_DB_NAME } from "../config/const.js";

const mongoClient = new MongoClient(MONGODB_URI);
let isConnected = false;

async function connectToMongo() {
    if (!isConnected) {
        await mongoClient.connect();
        isConnected = true;
    }
}

export async function generateMongoQueryFromPrompt(userPrompt) {
    console.log("Generating MongoDB query from user prompt:", userPrompt);
    const parser = new JsonOutputParser();
    const chain = mongoQueryPrompt.pipe(llm).pipe(parser);

    try {
        // const generatedQuery = await chain.invoke({
        //     userPrompt,
        //     collectionSchemaHint: typeof collectionSchemaHint === 'string'
        //         ? collectionSchemaHint
        //         : JSON.stringify(collectionSchemaHint, null, 2),
        // });
                const generatedQuery = await chain.invoke({userPrompt});
        return (typeof generatedQuery === 'object' && generatedQuery !== null) ? generatedQuery : {};
    } catch (error) {
        console.error("Error generating MongoDB query from LLM:", error);
        return {};
    }
}

async function convertObjectIds(query) {
    if (Array.isArray(query)) {
        return query.map(convertObjectIds);
    } else if (query && typeof query === "object") {
        const result = {};
        for (const [key, value] of Object.entries(query)) {
            // Heuristic: field name ends with 'id' (case-insensitive) or value is a 24-char hex string
            if (
                (typeof value === "string" && /^[a-f\d]{24}$/i.test(value) && /id$/i.test(key)) ||
                (typeof value === "string" && /^[a-f\d]{24}$/i.test(value) && key === "_id")
            ) {
                result[key] = new ObjectId(value);
            } else if (typeof value === "object" && value !== null) {
                result[key] = convertObjectIds(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    return query;
}

export async function fetchDataFromMongo(dbName, collectionName, query) {
    if (typeof query !== 'object' || query === null) return [];
    try {
        let processedQuery = await convertObjectIds(query);
        console.log("Processed MongoDB query:", processedQuery);
        await connectToMongo();
        const db = mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        return await collection.find(processedQuery).toArray();
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        return [];
    }
}

export async function runMongoQueryAgent(userPrompt, dbName) {
    const mongoQuery = await generateMongoQueryFromPrompt(userPrompt);
    const {query, collectionName } = mongoQuery;
    console.log("MongoDB query:", query);
    console.log("MongoDB collection name:", collectionName);
  // return mongoQuery
    return await fetchDataFromMongo(MONGODB_DB_NAME, collectionName, query);
}

export async function closeMongoConnection() {
    if (isConnected) {
        await mongoClient.close();
        isConnected = false;
    }
}