const fs = require('fs');
const path = require('path');
function getLogFilePath() {
    const date = new Date();
    if (!fs.existsSync("logs")) {
        fs.mkdirSync("logs");
    }
    const filename = `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.txt`;
    const logFilePath = path.join('./logs', filename)
    const fileExists = fs.existsSync(logFilePath);
    if (!fileExists) {
        fs.writeFileSync(logFilePath, '');
    }
    return logFilePath;
}

module.exports = {getLogFilePath}