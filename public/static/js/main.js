// 获取容器元素
var grid = document.getElementById('grid');
var gridContainer = document.getElementById('grid-container');
var rowsInput = document.getElementById('rows');
var columnsInput = document.getElementById('columns');
var zoomLevel = 1;
var isDragging = false;
var initialMouseX = 0;
var initialMouseY = 0;
var initialGridX = 0;
var initialGridY = 0;

// 添加 CSS 样式以设置容器为相对定位
gridContainer.style.position = 'relative';

function generateGrid() {
    var rows = parseInt(rowsInput.value, 10);
    var columns = parseInt(columnsInput.value, 10);

    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    // 清空原有格子
    grid.innerHTML = '';

    // 动态生成指定数量的格子
    for (var i = 0; i < rows * columns; i++) {
        var cell = document.createElement('div');
        cell.className = 'cell';

        // 为每个格子添加点击事件监听器
        cell.addEventListener('click', function () {
            this.classList.toggle('purple');
        });

        grid.appendChild(cell);
    }
}

// 使用这个函数来处理滚动事件，并阻止事件传播
function handleScroll(event) {
    zoom(event);
    event.preventDefault();
}

// 初始化
generateGrid();
