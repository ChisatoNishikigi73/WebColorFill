var grid = document.getElementById('grid');
var gridContainer = document.getElementById('grid-container');
var colorInput = document.getElementById('color-input');
var selectedColorBox = document.getElementById('selected-color');
var colorCount = 0;
var deleteButton = document.getElementById('delete-button');
var penButton = document.getElementById('pen-button');
var strawButton = document.getElementById('straw-button');
let currentMode = 'pen'; // 默认画笔模式
const rows = 150;
const columns = 300;

// 切换删除、画笔和吸管模式
// 模式按钮的点击事件处理
deleteButton.addEventListener('click', function () {
    currentMode = 'delete';
    updateModeButtons();
});

penButton.addEventListener('click', function () {
    currentMode = 'pen';
    updateModeButtons();
});

strawButton.addEventListener('click', function () {
    currentMode = 'straw';
    updateModeButtons();
});

// 更新模式按钮的样式
function updateModeButtons() {
    deleteButton.classList.remove('active');
    penButton.classList.remove('active');
    strawButton.classList.remove('active');

    if (currentMode === 'delete') {
        deleteButton.classList.add('active');
    } else if (currentMode === 'pen') {
        penButton.classList.add('active');
    } else if (currentMode === 'straw') {
        strawButton.classList.add('active');
    }
}

// 颜色栏的颜色选项
const colorOptions = [
    '#000000', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#99FF33', '#33FF77', '#00FFCC',
    '#0066FF', '#3300FF', '#9900FF', '#CC00FF', '#FF00CC', '#FF0066'
];

// 生成颜色栏
const colorBar = document.getElementById('color-bar');
colorOptions.forEach(color => {
    const colorOption = document.createElement('div');
    colorOption.className = 'color-option';
    colorOption.style.backgroundColor = color;
    colorOption.addEventListener('click', function () {
        colorInput.value = color;
        selectedColorBox.style.backgroundColor = color;
    });
    colorBar.appendChild(colorOption);
});

function generateGrid() {
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    grid.innerHTML = '';

    for (let i = 0; i < rows * columns; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('click', cellClickHandler);
        grid.appendChild(cell);
    }

    const gridItems = grid.querySelectorAll('.cell');
    // 计算网格的新宽度和高度
    const newWidth = gridItems[0].offsetWidth * columns;
    const newHeight = gridItems[0].offsetHeight * rows;

    // 设置 grid 的新宽度和高度
    grid.style.width = newWidth + 'px';
    grid.style.height = newHeight + 'px';
}

generateGrid();

// 网格单元格单击处理程序
function cellClickHandler() {
    const i = Array.from(grid.children).indexOf(this);
    const row = Math.floor(i / columns);
    const column = i % columns;
    const color = colorInput.value;

    if (currentMode === 'delete') {
        // 删除模式
        if (this.style.backgroundColor) {
            // 如果处于删除模式且单元格有颜色，向服务器提交删除请求
            fetch('/deleteColor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({row, column})
            })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    decrementColorCount();
                    this.style.backgroundColor = ''; // 清除背景色
                    this.style.borderColor = 'rgb(204, 204, 204)'; // 恢复默认边框颜色
                });
        }
    } else if (currentMode === 'straw') {
        // 吸管模式
        const cellColor = this.style.backgroundColor;
        if (cellColor) {
            // 如果单元格有颜色，将当前颜色更改为单元格颜色
            colorInput.value = normalizeColor(cellColor);
            selectedColorBox.style.backgroundColor = cellColor;
        }
    } else {
        // 默认画笔模式
        if (normalizeColor(this.style.backgroundColor) != colorInput.value) {
            fetch('/addColor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({row, column, color})
            })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    if (!this.style.backgroundColor) {
                        incrementColorCount(); // 增加计数
                    }
                    this.style.backgroundColor = colorInput.value;
                    this.style.borderColor = colorInput.value;
                });
        }
    }
}

function getColorData() {
    fetch('colorfill/getColorData')
        .then(response => response.json())
        .then(data => {
            data.forEach(colorInfo => {
                const {row, column, color} = colorInfo;
                const cellIndex = row * columns + column;

                if (cellIndex >= 0 && cellIndex < grid.children.length) {
                    const cell = grid.children[cellIndex];
                    cell.style.backgroundColor = color;
                    cell.style.borderColor = color;
                    incrementColorCount(); // 增加计数
                }
            });
        });
}

function incrementColorCount() {
    colorCount++;
    updateColorCount(colorCount);
}

// 颜色选择器的事件处理
colorInput.addEventListener('input', function () {
    selectedColorBox.style.backgroundColor = this.value;
});

// 页面加载时自动获取颜色信息
window.addEventListener('load', function () {
    getColorData();
});

// 更新已填充的色块数量
function updateColorCount(count) {
    document.getElementById('color-count').textContent = count;
}

// 减少颜色计数
function decrementColorCount() {
    colorCount--;
    updateColorCount(colorCount);
}

function normalizeColor(color) {
    if (color.startsWith("rgb")) {
        // 如果颜色以rgb开头，解析它
        const rgb = color.match(/\d+/g);
        if (rgb) {
            const r = parseInt(rgb[0]);
            const g = parseInt(rgb[1]);
            const b = parseInt(rgb[2]);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
    }
    return color;
}

var isDragging = false;
var startX, startY;

var panzoom = panzoom(grid, {
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: true,
    center: true,
    bounds: true,
    minZoom: 0.2,
    maxZoom: 100,
});

grid.addEventListener('mousemove', function (event) {
    isDragging = true;
    event.preventDefault();
});

grid.addEventListener('mouseup', function (event) {
    if (isDragging) {
        event.preventDefault();
    }
});
