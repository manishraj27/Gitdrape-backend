const { getRepoStructure } = require("../models/repoModel");

const fetchRepoStructure = async (req, res) => {
    const { owner, repo } = req.params;
    try {
        const repoData = await getRepoStructure(owner, repo);
        res.json(repoData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { fetchRepoStructure };
