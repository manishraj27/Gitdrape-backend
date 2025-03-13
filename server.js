// Entry point of the backend server
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

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