const axios = require("axios");

const getRepoStructure = async (owner, repo) => {
    const GITHUB_API = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    try {
        const response = await axios.get(GITHUB_API);
        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch repository structure.");
    }
};

module.exports = { getRepoStructure };
