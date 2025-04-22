const { getRepoStructure, getFileContent } = require("../models/repoModel");

const fetchRepoStructure = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const data = await getRepoStructure(owner, repo);
        
        // Format the tree structure for copying
        const treeStructure = `Directory structure:\n└── ${repo}/\n${data.treeString}`;
        
        res.json({
            ...data,
            copyableTree: treeStructure
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const fetchFileContent = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { path } = req.query;
        
        if (!path) {
            return res.status(400).json({ error: "File path is required" });
        }

        const content = await getFileContent(owner, repo, path);
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { fetchRepoStructure, fetchFileContent };
