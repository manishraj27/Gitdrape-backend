const express = require("express");
const { fetchRepoStructure, fetchFileContent } = require("../controllers/repoController");

const router = express.Router();

router.get("/:owner/:repo", fetchRepoStructure);
router.get("/:owner/:repo/content", fetchFileContent);

module.exports = router;