import { runMongoQueryAgent, closeMongoConnection } from "../AI/mongo-ai-agent.js";

const EXAMPLE_DB_NAME = "langchainDemoDB";
const EXAMPLE_COLLECTION_NAME = "users";
const usersCollectionSchemaHint = {
    _id: "ObjectId",
    name: "string",
    age: "number",
    city: "string",
    occupation: "string",
    hobbies: ["string"],
    isActive: "boolean",
    registeredDate: "ISODate"
};


export async function runMongoQueryController(req, res, next) {
    try{
        const prompt = req.body.prompt;
        const {userId, userRole, activeRole} = req;
        let pormptWithUserInfo = ` hy here is my
                                    User Info:
                                    - User ID: ${userId}
                                    - User Role: ${userRole}
                                    - Active Role: ${activeRole}

                                    User Query:
                                    ${prompt}
                                    `;
        const results = await runMongoQueryAgent(
            pormptWithUserInfo,
            'investigator',
        );
        res.json(results);
    } catch (error) {
        next(error);            
    }
}
// async function main() {
//     const prompt = "Find all users who live in New York and are engineers.";
//     const results = await runMongoQueryAgent(
//         prompt,
//         EXAMPLE_DB_NAME,
//         EXAMPLE_COLLECTION_NAME,
//         usersCollectionSchemaHint
//     );
//     console.log(results);
//     await closeMongoConnection();
// }

// main();