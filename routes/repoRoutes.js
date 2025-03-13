const express = require("express");
const { fetchRepoStructure } = require("../controllers/repoController");

const router = express.Router();

router.get("/:owner/:repo", fetchRepoStructure);

module.exports = router;
