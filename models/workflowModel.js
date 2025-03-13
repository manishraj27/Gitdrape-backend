const axios = require("axios");
const yaml = require("js-yaml");

const getWorkflows = async (owner, repo) => {
    const GITHUB_API = `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`;
    try {
        const response = await axios.get(GITHUB_API);
        const workflows = await Promise.all(
            response.data.map(async (file) => {
                const fileContent = await axios.get(file.download_url);
                return yaml.load(fileContent.data);
            })
        );
        return workflows;
    } catch (error) {
        throw new Error("No workflows found or error fetching workflows.");
    }
};

module.exports = { getWorkflows };
