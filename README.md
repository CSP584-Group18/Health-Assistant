
# EliteCare - Health Assistant

**Technologies Used**

- **Server Side**: Express.js
- **Frontend**: React.js, Axios
- **Database**: MongoDB
- **AI Platform**: Rasa (Python)
- **Other Libraries**: Axios (for HTTP requests)

---

## Project Structure

```
/backend   # Node.js Express server code
/database  # MongoDB setup and configuration
/frontend  # React.js client-side application
/rasa      # Rasa AI Agent (NLP and machine learning models)
```

---

## Getting Started

To get started with the project, follow the steps below:

### 1. Clone the Repository

```bash
git clone https://github.com/CSP584-Group18/Health-Assistant.git
cd Health-Assistant
```

### 2. Backend Setup

1. Install **Visual Studio Code**: Download and install from [here](https://code.visualstudio.com/).
2. Install **Node.js** and **npm**: Download and install from [Node.js Official Site](https://nodejs.org/en).

#### Start the Node Backend:

- Navigate to the `/backend` directory:
  ```bash
  cd backend
  ```

- Install backend dependencies:
  ```bash
  npm install
  ```

- Start the backend server:
  ```bash
  node server.js
  ```

---

### 3. Frontend Setup

1. Ensure **npm** is installed (as in the backend setup).

#### Start the React Frontend:

- Navigate to the `/frontend` directory:
  ```bash
  cd ../frontend
  ```

- Install frontend dependencies:
  ```bash
  npm install
  ```
  or if fails
  ```bash
  npm install --legacy-peer-deps
  ```

- Start the client-side React application:
  ```bash
  npm start
  ```

- The app should now be running at `http://localhost:3000`.

---

### 4. AI (Rasa) Setup

1. Ensure you have Rasa installed (requires Python environment).

#### Start the Rasa AI Agent:

- Navigate to the `/rasa` directory:
  ```bash
  cd ../rasa
  ```

- Train the Rasa model:
  ```bash
  rasa train
  ```

- Run Rasa actions:
  ```bash
  rasa run actions
  ```

- Start the Rasa server:
  ```bash
  rasa run --cors "*"   
  ```

---

## Additional Notes

- Ensure that **MongoDB** is properly set up and running before starting the backend.
- The project relies on several third-party APIs; make sure to configure any required API keys in `.env` files as per the needs of your application.
  
---

Feel free to adjust any paths or commands according to your development environment.
