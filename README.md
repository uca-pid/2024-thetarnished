# Link & Learn Backend

This repository contains the source code for the backend of the **Link & Learn** application. The backend is built using **Node.js** and **Express**, with **PostgreSQL** as the database. It handles user authentication, class scheduling, reservation management, and email notifications.

## Features

- **User Authentication**: Provides secure login and registration for students and teachers.
- **Class Scheduling**: Manages teacher availability and student bookings.
- **Reservation Management**: Handles the creation, updating, and cancellation of reservations.
- **Testing**: Comprehensive unit and integration tests to ensure the reliability and correctness of the backend.
- **Email Notifications**: Sends email notifications for actions such as password resets and booking confirmations.
- **API Endpoints**: Provides RESTful APIs for frontend communication.
- **Error Handling**: Includes comprehensive error handling to ensure robustness.

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express**: Web framework for Node.js to handle HTTP requests and middleware.
- **PostgreSQL**: Relational database for storing user and reservation data.
- **Sequelize**: ORM for interacting with the PostgreSQL database.
- **Bcrypt**: Library for hashing passwords.
- **JWT**: JSON Web Tokens for user authentication.
- **Nodemailer**: For sending emails.
- **Jest**: Testing framework for unit and integration tests.
- **Supertest**: For HTTP assertions in tests.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/link-and-learn-backend.git

2. Navigate to the project directory:
   ```bash
   cd link-and-learn-backend

3. Install dependencies:
   ```bash
   npm install

4. Set up your environment variables by creating a .env file in the root directory. Example:
   ```bash
    DATABASE_URL=your-database-url
    JWT_SECRET=your-jwt-secret
    EMAIL_HOST=your-email-host
    EMAIL_PORT=your-email-port
    EMAIL_USER=your-email-user
    EMAIL_PASS=your-email-password

5. Clone this repository:
   ```bash
   npx sequelize-cli db:migrate

6. Start the server:
   ```bash
   npm start

