const express = require("express");
const { fetchWorkflows } = require("../controllers/workflowController");

const router = express.Router();

router.get("/:owner/:repo", fetchWorkflows);

module.exports = router;
