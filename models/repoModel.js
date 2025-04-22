const axios = require("axios");
require('dotenv').config();

const githubConfig = {
    headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
    }
};

const organizeFileStructure = (tree) => {
    const fileStructure = {
        name: 'root',
        type: 'directory',
        children: [],
        path: ''
    };

    tree.forEach(item => {
        const pathParts = item.path.split('/');
        let currentLevel = fileStructure;

        pathParts.forEach((part, index) => {
            const isLastPart = index === pathParts.length - 1;
            const existingNode = currentLevel.children.find(child => child.name === part);

            if (existingNode) {
                currentLevel = existingNode;
            } else {
                const newNode = {
                    name: part,
                    path: pathParts.slice(0, index + 1).join('/'),
                    type: isLastPart ? (item.type === 'tree' ? 'directory' : 'file') : 'directory',
                    size: item.size || 0,
                    children: [],
                    sha: item.sha
                };
                currentLevel.children.push(newNode);
                currentLevel = newNode;
            }
        });
    });

    return fileStructure;
};

const generateTreeString = (node, prefix = '', isLast = true) => {
    const line = prefix + (isLast ? '└── ' : '├── ') + node.name;
    let result = line + '\n';

    if (node.children && node.children.length > 0) {
        node.children.forEach((child, index) => {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            const isLastChild = index === node.children.length - 1;
            result += generateTreeString(child, newPrefix, isLastChild);
        });
    }
    return result;
}

const getRepoStructure = async (owner, repo) => {
    try {
        // First get repo info to determine default branch
        const repoInfoResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}`,
            githubConfig
        );

        const defaultBranch = repoInfoResponse.data.default_branch;
        
        // Use default branch instead of hardcoded 'main'
        const GITHUB_API = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
        const PACKAGE_JSON_API = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;

        const [structureResponse, packageJsonResponse] = await Promise.all([
            axios.get(GITHUB_API, githubConfig),
            axios.get(PACKAGE_JSON_API, githubConfig).catch(() => null)
        ]);

        if (!structureResponse.data.tree) {
            throw new Error('Repository structure not found. The repository might be empty or private.');
        }

        const packageJson = packageJsonResponse 
            ? JSON.parse(Buffer.from(packageJsonResponse.data.content, 'base64').toString())
            : null;

        // Generate LLM-friendly file structure summary
        const fileStructure = organizeFileStructure(structureResponse.data.tree);
        const llmSummary = {
            totalFiles: structureResponse.data.tree.length,
            fileTypes: {},
            directoryCount: 0,
            fileCount: 0,
            totalSize: 0
        };

        // Calculate statistics
        structureResponse.data.tree.forEach(item => {
            if (item.type === 'tree') {
                llmSummary.directoryCount++;
            } else {
                llmSummary.fileCount++;
                const ext = item.path.split('.').pop() || 'no_extension';
                llmSummary.fileTypes[ext] = (llmSummary.fileTypes[ext] || 0) + 1;
                llmSummary.totalSize += item.size || 0;
            }
        });

        // Generate tree string before returning
        const treeString = `Directory structure:\n${generateTreeString(fileStructure)}`;

        return {
            structure: structureResponse.data,
            organizedStructure: fileStructure,
            repoInfo: repoInfoResponse.data,
            packageJson,
            llmSummary,
            treeString
        };
    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 404:
                    throw new Error('Repository not found. Please check the URL.');
                case 403:
                    throw new Error('API rate limit exceeded. Please try again later.');
                case 401:
                    throw new Error('Authentication failed. Please check GitHub token.');
                default:
                    throw new Error(`GitHub API Error: ${error.response.data.message}`);
            }
        }
        throw new Error('Failed to fetch repository structure: ' + error.message);
    }
};

const getFileContent = async (owner, repo, path) => {
    const CONTENT_API = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    try {
        const response = await axios.get(CONTENT_API, githubConfig);
        return Buffer.from(response.data.content, 'base64').toString();
    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 404:
                    throw new Error('File not found');
                case 403:
                    throw new Error('API rate limit exceeded');
                default:
                    throw new Error('Failed to fetch file content');
            }
        }
        throw new Error('Failed to fetch file content');
    }
};

module.exports = { getRepoStructure, getFileContent };
