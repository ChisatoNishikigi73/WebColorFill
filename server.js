const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const {getCurrentDateTimeString, formatAndBackupJson} = require('./utils');

const app = express();
const port = 10002;
const version = '0.2.0';
const backupFolder = 'backups';

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let colorData = []; // 用于存储客户端所需的数据
let colorDataHistory = []; // 用于存储服务器的历史数据
let lastColorHistoryId = 0; // 最后的颜色历史记录ID

// 保存颜色数据到本地文件
function saveColorData() {
    const data = JSON.stringify(colorData);

    fs.writeFile('colorData.json', data, (err) => {
        if (err) {
            console.error('Error saving color data: ', err);
        } else {
            console.log('Color data saved successfully.');
        }
    });
}

// 保存颜色历史数据到本地文件
function saveColorDataHistory() {
    const data = JSON.stringify(colorDataHistory);

    fs.writeFile('colorDataHistory.json', data, (err) => {
        if (err) {
            console.error('Error saving color data history: ', err);
        } else {
            console.log('Color data history saved successfully.');
        }
    });
}


// 加载颜色数据
fs.readFile('colorData.json', (err, data) => {
    if (!err) {
        colorData = JSON.parse(data);
    }
});


// 加载颜色历史数据
fs.readFile('colorDataHistory.json', (err, data) => {
    if (!err) {
        colorDataHistory = JSON.parse(data);
        // 获取最后的历史记录ID
        if (colorDataHistory.length > 0) {
            lastColorHistoryId = colorDataHistory[colorDataHistory.length - 1].id + 1;
        }
        console.log('Color data history loaded from file.');
    }
});

function saveHistoryData() {
    const formattedDate = getCurrentDateTimeString();
    formatAndBackupJson('colorData.json', path.join(backupFolder, `colorData-${formattedDate}.json`));
    formatAndBackupJson('colorDataHistory.json', path.join(backupFolder, `colorDataHistory-${formattedDate}.json`));
}

///////////////////////////  任务
if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder);
}

saveHistoryData();

// 定义定时任务，每天凌晨执行一次
cron.schedule('0 0 * * *', () => {
    saveHistoryData();
});

// 定时保存颜色数据，每分钟保存一次
setInterval(() => {
    saveColorData();
    saveColorDataHistory();
}, 60000);


///////////////////////////  Api

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// 添加颜色
app.post('/colorfill/addColor', (req, res) => {
    const {row, column, color} = req.body;

    // 检查是否在同一个位置有相同颜色的色块
    const existingColorIndex = colorData.findIndex(item => item.row === row && item.column === column);

    if (existingColorIndex !== -1) {
        // 如果有相同位置的色块，替换颜色
        colorData[existingColorIndex].color = color;
    } else {
        // 否则，添加新的颜色数据
        colorData.push({row, column, color});
    }

    // 同时将历史数据保存到colorDataHistory
    colorDataHistory.push({id: lastColorHistoryId, row, column, color, timestamp: Date.now(), ip: req.ip});
    lastColorHistoryId++;

    saveColorData();
    saveColorDataHistory();
    res.status(200).send('Color added successfully.');
});

// 删除颜色
app.post('/deleteColor', (req, res) => {
    const {row, column} = req.body;
    const indexToRemove = colorData.findIndex(item => item.row === row && item.column === column);

    if (indexToRemove !== -1) {
        // 找到色块并从 colorData 数组中删除
        colorData.splice(indexToRemove, 1);

        // 将删除操作添加到 colorDataHistory
        colorDataHistory.push({
            id: lastColorHistoryId,
            row,
            column,
            action: 'delete',
            timestamp: Date.now(),
            ip: req.ip
        });
        lastColorHistoryId++;

        saveColorData();
        saveColorDataHistory();

        res.status(200).send('Color deleted successfully.');
    } else {
        // 如果找不到指定的色块，返回错误消息
        res.status(400).send('Color not found for deletion.');
    }
});

// 获取颜色
app.get('/getColorData', (req, res) => {
    fs.readFile('colorData.json', (err, data) => {
        if (err) {
            console.error('Error reading color data file: ', err);
            res.status(500).json([]);
        } else {
            const loadedData = JSON.parse(data);

            // 检查客户端请求是否包含要删除的色块
            if (req.query.deleteRow && req.query.deleteColumn) {
                const deleteRow = parseInt(req.query.deleteRow);
                const deleteColumn = parseInt(req.query.deleteColumn);

                const indexToDelete = loadedData.findIndex(item => item.row === deleteRow && item.column === deleteColumn);
                if (indexToDelete !== -1) {
                    loadedData.splice(indexToDelete, 1);
                }
            }

            res.status(200).json(loadedData);
        }
    });
});

// 获取历史颜色数据
app.get('/getColorDataHistory', (req, res) => {
    fs.readFile('colorDataHistory.json', (err, data) => {
        if (err) {
            console.error('Error reading color data history file: ', err);
            res.status(500).json([]);
        } else {
            const loadedData = JSON.parse(data);
            res.status(200).json(loadedData);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    console.log(`Server version: ${version}`);
});
