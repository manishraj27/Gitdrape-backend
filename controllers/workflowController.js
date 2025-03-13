const { getWorkflows } = require("../models/workflowModel");

const fetchWorkflows = async (req, res) => {
    const { owner, repo } = req.params;
    try {
        const workflowData = await getWorkflows(owner, repo);
        res.json(workflowData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { fetchWorkflows };
