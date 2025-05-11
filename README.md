# Investigation Project

## Overview
The Investigation project is a web application designed to facilitate the management of investigation requests. It allows users to submit requests, and investigators to browse, accept, decline, and submit reports on these requests. The application uses JWT for authentication and authorization, ensuring secure access to resources based on user roles.

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

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the OWN License.