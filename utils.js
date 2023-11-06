const fs = require('fs');

/**
 * 将数据写入JSON文件。
 *
 * @param {string} filename - 文件名
 * @param {Array} data - 要写入的数据
 */
function writeDataToFile(filename, data) {
    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFile(filename, jsonData, (err) => {
        if (err) {
            console.error(`Error writing to ${filename}:`, err);
        } else {
            console.log(`Data written to ${filename}`);
        }
    });
}

/**
 * 获取当前日期和时间的字符串表示。
 * 格式为：'YYYY-MM-DD-HHMM'，例如 '2023-11-06-1542'
 * @returns {string} 当前日期和时间的字符串
 */
function getCurrentDateTimeString() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hour = String(currentDate.getHours()).padStart(2, '0');
    const minute = String(currentDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}-${hour}${minute}`;
}

/**
 * 从源文件中读取 JSON 数据，格式化后备份到目标文件。
 * @param {string} sourceFile - 源文件路径
 * @param {string} backupFile - 备份文件路径
 */
function formatAndBackupJson(sourceFile, backupFile) {
    fs.readFile(sourceFile, (err, data) => {
        if (err) {
            console.error(`Error reading ${sourceFile}: `, err);
            return;
        }

        try {
            const jsonData = JSON.parse(data);
            const formattedData = JSON.stringify(jsonData, null, 2); // 2为缩进空格数

            fs.writeFile(backupFile, formattedData, (err) => {
                if (err) {
                    console.error(`Error writing backup file ${backupFile}: `, err);
                } else {
                    console.log(`Backup ${sourceFile} to ${backupFile} successful.`);
                }
            });
        } catch (error) {
            console.error(`Error parsing JSON from ${sourceFile}: `, error);
        }
    });
}


/**
 * 查找JSON数据中具有相同位置的记录。
 *
 * @param {Array} jsonData - 包含记录的JSON数据数组
 * @returns {Array} - 包含具有相同位置的记录的数组
 */
function findDuplicatePositionRecords(jsonData) {
    // 创建一个 Map 以跟踪位置和记录的关系
    const positionRecords = new Map();

    // 遍历JSON数据中的记录
    for (const record of jsonData) {
        const {row, column} = record;
        const positionKey = `${row}-${column}`;

        // 如果位置已存在于 positionRecords 中
        if (positionRecords.has(positionKey)) {
            // 添加当前记录到具有相同位置的记录数组中
            const recordsWithSamePosition = positionRecords.get(positionKey);
            recordsWithSamePosition.push(record);
        } else {
            // 否则，创建一个包含当前记录的数组
            positionRecords.set(positionKey, [record]);
        }
    }

    // 查找具有相同位置的记录并将它们存储在 duplicateRecords 数组中
    const duplicateRecords = Array.from(positionRecords.values())
        .filter((recordsWithSamePosition) => recordsWithSamePosition.length > 1);

    return duplicateRecords;
}


/**
 * 清除JSON中重复位置数据
 *
 * @param {Array} rowData - 包含记录的JSON数据数组
 * @returns {Array} - 清理过后的JSON数据数组
 */
function cleanSamePositionData(rowData) {

    const cleanedData = rawData.reduce((acc, currentValue) => {
        const existingIndex = acc.findIndex(item => item.row === currentValue.row && item.column === currentValue.column);
        if (existingIndex === -1) {
            acc.push(currentValue);
        } else {
            // 如果已存在相同行和列的记录，选择最后的修改
            acc[existingIndex] = currentValue;
        }
        return acc;
    }, []);

    // const cleanedDataJSON = JSON.stringify(cleanedData);
    return cleanedData


}


/**
 * 将包含 "row" 和 "column" 的记录转换为历史数据。
 *
 * @param {Array} records - 包含记录的数组
 * @returns {Array} - 包含历史数据的数组
 */
function convertToHistoryData(records) {
    const historyData = [];
    let timestamp = Date.now(); // 起始时间戳

    for (const record of records) {
        const {row, column, color} = record;
        const historyRecord = {
            column,
            color,
            timestamp,
            ip: "::1"
        };
        historyData.push(historyRecord);

        // 增加时间戳以确保有序
        timestamp += 10; // 假设每个记录之间相差1秒
    }

    return historyData;
}


module.exports = {
    getCurrentDateTimeString,
    formatAndBackupJson,
    findDuplicatePositionRecords,
    cleanSamePositionData,
    convertToHistoryData,
    writeDataToFile,
};
