# Investigation Project

## Overview
The Investigation project is a web application designed to facilitate the management of investigation requests. It allows users to submit requests, and investigators to browse, accept, decline, and submit reports on these requests. The application uses 

### Technologies Used

The **Investigation Project** leverages the following technologies:

- **Node.js**: Backend runtime environment for building scalable server-side applications.
- **Express.js**: Web framework for creating RESTful APIs and handling HTTP requests.
- **MongoDB**: NoSQL database for storing investigation requests, user data, and reports.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB to manage database schemas and queries.
- **JWT (JSON Web Tokens)**: Used for secure authentication and authorization.
- **Multer**: Middleware for handling file uploads (e.g., investigator reports).
- **dotenv**: For managing environment variables securely.
- **Cors**: Middleware for enabling Cross-Origin Resource Sharing.
- **Bcrypt.js**: Library for hashing passwords securely.
- **Socket.IO**: Library for enabling real-time, bidirectional communication between clients and servers (used for real-time chat).

These technologies work together to create a secure, scalable, and user-friendly application for managing investigation requests.

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd investigation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the MongoDB database:**
   Ensure you have MongoDB installed and running. Update the connection string in .env file or debug in `server.js` if necessary. 

4. **Run the application:**
   ```bash
   npm run start
   ```
   or for devlopment
   ```bash
   npm run dev
   ```
5. **Access the API:**
   The application will be running on `http://localhost:3000`. You can use tools like Postman to interact with the API endpoints.

## Usage Guidelines
- **User Registration and Login:**
  Use the `/api/auth/register` and `/api/auth/login` endpoints to create a new user and log in.

- **Submitting Requests:**
  Users can submit investigation requests via the `/api/requests` endpoint.

- **Investigator Actions:**
  Investigators can browse available requests, accept or decline them, and submit reports through the `/api/investigators` endpoints.


## Postman Collection

A Postman collection `investigation.postman_collection.json ` has been included to help you quickly test and interact with the API endpoints.

### How to Use the Postman Collection:

- **Import the Collection:**
  1. Open Postman.
  2. Click on the **"Import"** button in the top-left corner.
  3. Select the exported Postman collection file (in **Collection v2.1** format) from the project directory.

- **Set Up Environment Variables:**
  1. The collection may include variables (e.g., `{{base_url}}`, `{{token}}`) for easier testing.
  2. Create a new environment in Postman and set the required variables:
     - `base_url`: Set this to `http://localhost:3000` (or your deployed API URL).
     - `token`: Add the JWT token after logging in.

- **Test the API Endpoints:**
  - Use the imported collection to test endpoints such as:
    - **User Registration and Login:** `/api/auth/register`, `/api/auth/login`
    - **Submitting Requests:** `/api/requests`
    - **Investigator Actions:** `/api/investigators`
    - **Reports and Reviews:** `/api/reports`, `/api/reviews`

- **Modify Requests as Needed:**
  - Update request bodies, headers, or parameters in Postman to match your testing requirements.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the OWN License.