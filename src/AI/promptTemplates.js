import { PromptTemplate } from "@langchain/core/prompts";
import { reportModelPrompt, userModelPrompt, requestModelPrompt, reviewModelPrompt } from "../models/ai-models-prompt.js";  

let promtBuild= `
so we are ulding a investigation platform 

User Story for the Investigation Platform
1. Requester
  Purpose:
  A requester is a user who needs an investigation to be conducted. They use the platform to submit investigation requests and track their progress.

  Actions:

  Registers and logs in to the platform.
  Submits a new investigation request, providing details about the case.
  Views the list of their submitted requests and their statuses (pending, in-progress, completed).
  Receives updates when an investigator accepts, declines, or completes a request.
  Downloads investigation reports once completed.
  Leaves reviews and ratings for investigators after a case is closed.
2. Investigator
  Purpose:
  An investigator is a user who handles investigation requests submitted by requesters.

  Actions:

  Registers and logs in to the platform.
  Browses available (unassigned) investigation requests.
  Accepts or declines requests based on their expertise or availability.
  Views a list of requests assigned to them, with their statuses.
  Submits investigation reports and uploads related files for completed cases.
  Receives reviews and ratings from requesters after completing investigations.
3. User with Both Roles (Requester & Investigator)
  Purpose:
  Some users can act as both requester and investigator, switching roles as needed.

  Actions:

  Registers and logs in, selecting the "both" role.
  Switches between requester and investigator roles as needed.
  As a requester, can submit and track investigation requests.
  As an investigator, can browse, accept, and complete requests from other users.
  Can view dashboards and activities relevant to the currently active role.
  Can receive and give reviews in both capacities.

General Platform Features
  Authentication:
  All users must register and log in to access platform features.
  Role Switching:
  Users with the "both" role can switch their active role at any time.
  Dashboard:
  Users see a dashboard with relevant statistics and activities based on their current role.
  Real-Time Updates:
  Users receive real-time notifications (via Socket.IO) for important events, such as request status changes or new messages.
  API Access:
  All actions are available via RESTful API endpoints, which can be tested using the provided Postman collection.

You are an AI assistant specialized in translating natural language queries into MongoDB query filter objects.
Your goal is to generate a JSON object that can be directly used as a filter in a MongoDB 'find' operation.

User's natural language prompt: "{userPrompt}"


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
  "collectionName": "User",
  "query": {{
    "name": "Alice",
    "age": {{ "$gt": 25 }}
  }}
}}

Example 2:
User Prompt: "Show me all products in the 'electronics' category."
Schema Hint: {{ "productName": "string", "category": "string", "price": "number" }}
JSON Output:
{{
  "collectionName": "Product",
  "query": {{
    "category": "electronics"
  }}
}}

Example 3:
User Prompt: "List all documents."
Schema Hint: {{ "anyField": "anyType" }}
JSON Output:
{{}}

Now, generate the MongoDB query filter JSON string for the given user prompt and schema hint.
And ofcourse you have to use the schema hint provided in the prompt. dont use any field which is not in the schema hint.
read every fields scheam and its type ,ref and enum's value if exists which are important and use them in the query.

here are the actual schemas of the models: \n
${reportModelPrompt} \n\n
${userModelPrompt} \n\n
${requestModelPrompt} \n\n
${reviewModelPrompt} \n\n

Based on the user info and query, generate a MongoDB filter object that uses the correct field values , use the User ID directly for filtering assignedInvestigatorId, requesterId and investigatorId.
understand the schema and according to that users activerole which filed is appropriate for filtering on that specific schema, and with query also provide collection name as we showed you the example
Only output the filter object as valid JSON.

When generating the MongoDB filter, always use the actual value provided for the user (such as userId, role, or activeRole) directly in the query. 
Do not use reference objects like "$eqToRef". Only use the literal value.

Example 4:
User Info:
- User ID: 6819fa1b024e94e4ef3ecadf
- User Role: both
- Active Role: investigator

User Prompt: "Show my in-progress requests."
Schema Hint: {{ "assignedInvestigatorId": "ObjectId", "status": "string" }}
JSON Output:
{{
  "collectionName": "requests",
  "query": {{
    "status": "in-progress",
    "assignedInvestigatorId": "6819fa1b024e94e4ef3ecadf"
  }}
}}

and choose the field name precisely according to the schema hint provided in the prompt.
if u think its a investigatorid then use see that schema have that field name or not, if not then use the field name which is similar in the schema hint.
dont use if that field name is not in the schema hint.
MongoDB Query Filter JSON String:
`

// console.log(promtBuild);

export const mongoQueryPrompt = PromptTemplate.fromTemplate(promtBuild);
