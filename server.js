const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 10002;
const version = '0.1'

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let colorData = [];

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

// 加载颜色数据
fs.readFile('colorData.json', (err, data) => {
  if (!err) {
    colorData = JSON.parse(data);
    console.log('Color data loaded from file.');
  }
});

// 定时保存颜色数据，每分钟保存一次
setInterval(() => {
  saveColorData();
}, 60000);

app.post('/addColor', (req, res) => {
  const {row, column, color} = req.body;
  colorData.push({row, column, color});
  saveColorData();
  res.status(200).send('Color added successfully.');
});

app.get('/getColorData', (req, res) => {
  fs.readFile('colorData.json', (err, data) => {
    if (err) {
      console.error('Error reading color data file: ', err);
      res.status(500).json([]);
    } else {
      const loadedData = JSON.parse(data);
      res.status(200).json(loadedData);
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log(`Server version: ${version}`);
});
