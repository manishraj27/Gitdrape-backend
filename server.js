// Entry point of the backend server
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");


app.use(cors());
app.use(express.json());

// Enable All CORS Requests
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:5175",
      "http://localhost:5176",
      "*",
    ],
    credentials: true,
  })
);

// Route to display the initial message on browser
app.get('/', (req, res) => {
  res.send('BACKEND BACKEND API');
});


// Importing the routes
const repoRoutes = require("./routes/repoRoutes");
const workflowRoutes = require("./routes/workflowRoutes");


// Using the routes
app.use("/api/repo-structure", repoRoutes);
app.use("/api/workflows", workflowRoutes);

app.listen(PORT, () => {
  console.log(`Server is up and running at http://localhost:${PORT} 🚀`);
});