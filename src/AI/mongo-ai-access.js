
    // config.js
    // Basic configuration for the MongoDB connection and Ollama.
    // In a real application, consider using environment variables.

    // export const MONGODB_URI = "mongodb://localhost:27017"; // Your MongoDB connection string
    // export const OLLAMA_BASE_URL = "http://localhost:11434"; // Your Ollama server URL
    // export const OLLAMA_MODEL = "llama3"; // Make sure llama3 or llama3.2 is available in Ollama

    // --- mongoQueryAgent.js ---
    import { Ollama } from "@langchain/ollama";
    import { PromptTemplate } from "@langchain/core/prompts";
    import { JsonOutputParser } from "@langchain/core/output_parsers";
    import { MongoClient } from "mongodb";
    import { MONGODB_URI, OLLAMA_BASE_URL, OLLAMA_MODEL } from "../config/config.js";

    // Initialize Ollama LLM
    const llm = new Ollama({
        baseUrl: OLLAMA_BASE_URL,
        model: OLLAMA_MODEL,
        // temperature: 0.2, // Adjust for more deterministic query generation
    });

    // Initialize MongoDB Client
    // It's good practice to create the client once and reuse it.
    // Connections will be managed per operation or you can maintain a persistent connection.
    const mongoClient = new MongoClient(MONGODB_URI);
    let isConnected = false;

    async function connectToMongo() {
        if (!isConnected) {
            try {
                await mongoClient.connect();
                isConnected = true;
                console.log("Successfully connected to MongoDB.");
            } catch (error) {
                console.error("Failed to connect to MongoDB:", error);
                throw error; // Re-throw to handle in the calling function
            }
        }
    }

    /**
     * Generates a MongoDB query filter object from a natural language prompt.
     * @param {string} userPrompt - The natural language prompt from the user.
     * @param {object|string} collectionSchemaHint - A hint about the collection's schema.
     * Can be an example document or a descriptive string.
     * @returns {Promise<object>} - A promise that resolves to the MongoDB query filter object.
     */
    async function generateMongoQueryFromPrompt(userPrompt, collectionSchemaHint) {
        console.log("\n--- Generating MongoDB Query ---");
        console.log("User Prompt:", userPrompt);
        console.log("Schema Hint:", collectionSchemaHint);

        const parser = new JsonOutputParser();

        const promptTemplate = PromptTemplate.fromTemplate(
`You are an AI assistant specialized in translating natural language queries into MongoDB query filter objects.
Your goal is to generate a JSON object that can be directly used as a filter in a MongoDB 'find' operation.

User's natural language prompt: "{userPrompt}"

Information about the MongoDB collection structure (schema hint or example document):
{collectionSchemaHint}

Based on the user's prompt and the schema hint, generate a concise MongoDB query filter object as a JSON string.
- Only output the JSON filter object itself. Do NOT include any explanations or "db.collection.find(...)".
- If the prompt asks for all documents or is too vague for a specific filter, output an empty JSON object: {{}}.
- For field matching, use exact matches unless range queries (like $gt, $lt), regular expressions (for partial text search if appropriate, e.g., {{ "fieldName": {{ "$regex": "partialText", "$options": "i" }} }}), or other MongoDB operators are implied by the prompt.
- Ensure the output is a valid JSON string.

Example 1:
User Prompt: "Find all users named Alice who are older than 25."
Schema Hint: {{ "name": "string", "age": "number", "city": "string" }}
JSON Output:
{{
  "name": "Alice",
  "age": {{ "$gt": 25 }}
}}

Example 2:
User Prompt: "Show me all products in the 'electronics' category."
Schema Hint: {{ "productName": "string", "category": "string", "price": "number" }}
JSON Output:
{{
  "category": "electronics"
}}

Example 3:
User Prompt: "List all documents."
Schema Hint: {{ "anyField": "anyType" }}
JSON Output:
{{}}

Now, generate the MongoDB query filter JSON string for the given user prompt and schema hint.

User Prompt: {userPrompt}
Schema Hint: {collectionSchemaHint}
MongoDB Query Filter JSON String:
`
        );

        const chain = promptTemplate.pipe(llm).pipe(parser);

        try {
            const generatedQuery = await chain.invoke({
                userPrompt: userPrompt,
                collectionSchemaHint: typeof collectionSchemaHint === 'string' ? collectionSchemaHint : JSON.stringify(collectionSchemaHint, null, 2),
            });
            console.log("LLM Generated Query Object:", generatedQuery);
            if (typeof generatedQuery !== 'object' || generatedQuery === null) {
                console.warn("LLM did not return a valid object. Defaulting to empty query.");
                return {};
            }
            return generatedQuery;
        } catch (error) {
            console.error("Error generating MongoDB query from LLM:", error);
            console.warn("Falling back to an empty query due to error.");
            return {}; // Fallback to an empty query in case of error
        }
    }

    /**
     * Fetches data from a MongoDB collection based on the provided query.
     * @param {string} dbName - The name of the database.
     * @param {string} collectionName - The name of the collection.
     * @param {object} query - The MongoDB query filter object.
     * @returns {Promise<Array<object>>} - A promise that resolves to an array of documents.
     */
    async function fetchDataFromMongo(dbName, collectionName, query) {
        console.log(`\n--- Fetching Data from MongoDB ---`);
        console.log(`Database: ${dbName}, Collection: ${collectionName}`);
        console.log("Executing Query:", JSON.stringify(query, null, 2));

        if (typeof query !== 'object' || query === null) {
            console.error("Invalid query object provided to fetchDataFromMongo. Aborting fetch.");
            return [];
        }

        try {
            await connectToMongo(); // Ensure connection
            const db = mongoClient.db(dbName);
            const collection = db.collection(collectionName);
            const documents = await collection.find(query).toArray();
            console.log(`Found ${documents.length} documents.`);
            return documents;
        } catch (error) {
            console.error("Error fetching data from MongoDB:", error);
            return []; // Return empty array in case of error
        }
    }

    /**
     * Main agent function to process a user prompt and fetch data.
     * @param {string} userPrompt - The natural language prompt.
     * @param {string} dbName - The database name.
     * @param {string} collectionName - The collection name.
     * @param {object|string} collectionSchemaHint - Schema hint for the LLM.
     * @returns {Promise<Array<object>>} - The fetched documents.
     */
    export async function runMongoQueryAgent(userPrompt, dbName, collectionName, collectionSchemaHint) {
        try {
            const mongoQuery = await generateMongoQueryFromPrompt(userPrompt, collectionSchemaHint);
            if (Object.keys(mongoQuery).length === 0 && !userPrompt.toLowerCase().includes("all") && userPrompt.trim() !== "") {
                 // Basic check: if prompt wasn't explicitly for "all" but query is empty, LLM might have failed.
                 // You might want more sophisticated checks or allow empty queries if that's a valid outcome.
                console.warn("LLM generated an empty query for a non-trivial prompt. This might indicate an issue or a very broad request.");
            }
            const results = await fetchDataFromMongo(dbName, collectionName, mongoQuery);
            return results;
        } catch (error) {
            console.error("Error in agent execution:", error);
            return []; // Return empty array on failure
        }
    }

    // Graceful shutdown
    export async function closeMongoConnection() {
        if (isConnected) {
            try {
                await mongoClient.close();
                isConnected = false;
                console.log("MongoDB connection closed.");
            } catch (error) {
                console.error("Error closing MongoDB connection:", error);
            }
        }
    }


    // --- example.js ---
    // Make sure to run `npm install @langchain/community @langchain/core mongodb`
    // And ensure Ollama is running with the specified model (e.g., `ollama run llama3`)
    // Also, ensure your MongoDB server is running.

    import { runMongoQueryAgent, closeMongoConnection } _from_ "./mongoQueryAgent.js";
    import { MongoClient } _from_ "mongodb";
    import { MONGODB_URI } _from_ "./config.js";

    const EXAMPLE_DB_NAME = "langchainDemoDB";
    const EXAMPLE_COLLECTION_NAME = "users";

    // Define a schema hint for the 'users' collection.
    // This helps the LLM understand the structure of the documents.
    const usersCollectionSchemaHint = {
        _id: "ObjectId",
        name: "string",
        age: "number",
        city: "string",
        occupation: "string",
        hobbies: ["string"], // Array of strings
        isActive: "boolean",
        registeredDate: "ISODate"
    };

    // Function to set up some sample data in MongoDB
    async function setupSampleData() {
        const client = new MongoClient(MONGODB_URI);
        try {
            await client.connect();
            const db = client.db(EXAMPLE_DB_NAME);
            const collection = db.collection(EXAMPLE_COLLECTION_NAME);

            // Clear existing data
            await collection.deleteMany({});
            console.log("Cleared existing data from users collection.");

            const sampleUsers = [
                { name: "Alice", age: 30, city: "New York", occupation: "Engineer", hobbies: ["reading", "hiking"], isActive: true, registeredDate: new Date("2023-01-15T00:00:00.000Z") },
                { name: "Bob", age: 24, city: "San Francisco", occupation: "Designer", hobbies: ["gaming", "music"], isActive: true, registeredDate: new Date("2023-03-22T00:00:00.000Z") },
                { name: "Charlie", age: 35, city: "New York", occupation: "Doctor", hobbies: ["chess", "running"], isActive: false, registeredDate: new Date("2022-11-10T00:00:00.000Z") },
                { name: "Diana", age: 28, city: "London", occupation: "Engineer", hobbies: ["photography", "travel"], isActive: true, registeredDate: new Date("2023-05-01T00:00:00.000Z") },
                { name: "Edward", age: 40, city: "San Francisco", occupation: "Manager", hobbies: ["golf", "reading"], isActive: true, registeredDate: new Date("2022-07-19T00:00:00.000Z") },
                { name: "Alice Smith", age: 29, city: "New York", occupation: "Artist", hobbies: ["painting", "yoga"], isActive: true, registeredDate: new Date("2024-01-10T00:00:00.000Z") }
            ];

            await collection.insertMany(sampleUsers);
            console.log(`Inserted ${sampleUsers.length} sample documents into '${EXAMPLE_DB_NAME}.${EXAMPLE_COLLECTION_NAME}'.`);

        } catch (error) {
            console.error("Error setting up sample data:", error);
        } finally {
            await client.close();
        }
    }

    async function main() {
        console.log("Starting MongoDB Query Agent Example...");

        // 1. (Optional but recommended) Setup sample data
        await setupSampleData();

        // 2. Define some test prompts
        const prompts = [
            "Find all users who live in New York and are engineers.",
            "Show me users older than 30.",
            "List all users whose name is Alice.",
            "Get users who are active and have 'reading' as a hobby.",
            "Find users registered before 2023.",
            "Who are the inactive users?",
            "Are there any users from London?",
            "List all users." // Test for fetching all documents
        ];

        for (const prompt of prompts) {
            console.log(`\n--------------------------------------`);
            console.log(`Processing Prompt: "${prompt}"`);
            const results = await runMongoQueryAgent(
                prompt,
                EXAMPLE_DB_NAME,
                EXAMPLE_COLLECTION_NAME,
                usersCollectionSchemaHint
            );

            if (results && results.length > 0) {
                console.log("Fetched Results:");
                results.forEach(doc => console.log(JSON.stringify(doc, null, 2)));
            } else {
                console.log("No results found or an error occurred.");
            }
            console.log(`--------------------------------------\n`);
        }

        // 3. Close the MongoDB connection when done with all operations.
        await closeMongoConnection();
        console.log("MongoDB Query Agent Example finished.");
    }

    main().catch(console.error);

