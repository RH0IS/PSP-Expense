# Expense Management Dashboard

This is a full-stack application for managing user expenses. It includes features for user registration, transaction tracking, and data visualization.

Dashboard:
<img width="1136" alt="image" src="https://github.com/user-attachments/assets/1b3c2e17-4e8f-40db-9823-c498d26dda85" />

Transaction:
<img width="1136" alt="image" src="https://github.com/user-attachments/assets/e756ad98-2395-436a-89ac-c12f72bd65c0" />


## Tech Stack

-   **Frontend**: ReactJS
-   **Backend**: Node.js with Express
-   **Database**: MongoDB
-   **Containerization**: Docker

## How to Run with Docker

1.  Make sure you have Docker and Docker Compose installed.
2.  Clone the repository.
3.  Open a terminal in the project's root directory.
4.  Run the following command:

    ```bash
    docker-compose up --build
    ```

5.  - The frontend will be available at `http://localhost:3000`.
    - The backend server will run on `http://localhost:5001`.

## API Endpoints

-   `GET /users`: Get all users with their total income and expenses.
-   `POST /users`: Create a new user.
-   `PUT /users/:id`: Update a user.
-   `DELETE /users/:id`: Delete a user.
-   `GET /users/:userId/transactions`: Get all transactions for a specific user.
-   `POST /transactions`: Add a new transaction.
-   `DELETE /transactions/:id`: Delete a transaction.
-   `GET /chart-data`: Get data for the expense/income pie chart.
