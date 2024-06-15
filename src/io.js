const fs = require('fs').promises;

// Read the secret key from a file
let readJson = async (filename) => {
    try {
        const data = await fs.readFile(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading or parsing the file:', error);
        throw error; // Re-throwing the error after logging it
    }
}

module.exports = { readJson };