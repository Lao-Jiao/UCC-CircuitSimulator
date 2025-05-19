// mobile.js - 专用于移动端交互的处理代码

// 为DOM节点添加移动端触摸事件处理
function setupMobileTouchEvents() {
    const gridContainer = document.getElementById('grid-container');
    if (!gridContainer) return;
    
    console.log('设置移动设备触摸事件...');
    
    // 禁用页面缩放和弹性滚动
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) { e.preventDefault(); }
    }, { passive: false });
    
    // 平移处理
    gridContainer.addEventListener('touchstart', function(e) {
        if ((e.target === gridContainer || e.target.classList.contains('grid-bg')) && 
            window.currentMobileMode === 'pan') {
            window.isPanning = true;
            if (e.touches && e.touches[0]) {
                window.panStart = { 
                    x: e.touches[0].clientX, 
                    y: e.touches[0].clientY 
                };
            }
            e.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) {
        // 平移模式
        if (window.isPanning && window.currentMobileMode === 'pan') {
            if (e.touches && e.touches[0]) {
                const dx = e.touches[0].clientX - window.panStart.x;
                const dy = e.touches[0].clientY - window.panStart.y;
                
                window.panOffset.x = window.lastPan.x + dx;
                window.panOffset.y = window.lastPan.y + dy;
                
                updatePan();
                updateNodesAndBranches();
                e.preventDefault();
            }
        }
        
        // 拖动节点
        if (window.isDragging && window.currentNode) {
            if (e.touches && e.touches[0]) {
                const touchX = e.touches[0].clientX - window.panOffset.x;
                const touchY = e.touches[0].clientY - window.panOffset.y;
                
                // 获取元素的矩形边界
                const rect = window.currentNode.getBoundingClientRect();
                const halfWidth = rect.width / 2;
                const halfHeight = rect.height / 2;
                
                // 计算元素在网格坐标系中的位置，并使其贴附到最近的网格点上
                const gridX = snapToGridCellCenter(touchX);
                const gridY = snapToGridCellCenter(touchY);
                
                // 设置新的位置
                window.currentNode.style.left = `${gridX - halfWidth}px`;
                window.currentNode.style.top = `${gridY - halfHeight}px`;
                
                // 更新连接线位置
                updateNodesAndBranches();
                e.preventDefault();
            }
        }
    }, { passive: false });
    
    document.addEventListener('touchend', function() {
        if (window.isPanning) {
            window.isPanning = false;
            window.lastPan.x = window.panOffset.x;
            window.lastPan.y = window.panOffset.y;
        }
        
        if (window.isDragging && window.currentNode) {
            window.isDragging = false;
            window.currentNode = null;
        }
    });
    
    // 处理节点拖动
    document.addEventListener('touchstart', function(e) {
        if (window.currentMobileMode !== 'pan') return;
        
        let target = e.target;
        // 向上查找最近的节点元素
        while (target && !target.classList.contains('node') && target !== document.body) {
            target = target.parentElement;
        }
        
        if (target && target.classList.contains('node')) {
            window.isDragging = true;
            window.currentNode = target;
            e.preventDefault(); // 防止触发其他事件
            
            // 视觉反馈
            target.classList.add('dragging');
        }
    }, { passive: false });
    
    // 处理侧边栏组件拖放到网格
    const sidebarIcons = document.querySelectorAll('.sidebar-icon');
    sidebarIcons.forEach(icon => {
        icon.addEventListener('touchstart', function(e) {
            // 存储当前拖动的图标类型和源
            window.dragIconType = icon.dataset.icon;
            window.dragIconSrc = icon.src;
            
            // 创建一个拖动预览
            const preview = document.createElement('div');
            preview.className = 'drag-preview';
            preview.style.position = 'absolute';
            preview.style.width = '40px';
            preview.style.height = '40px';
            preview.style.borderRadius = '50%';
            preview.style.background = 'rgba(127, 140, 255, 0.5)';
            preview.style.zIndex = '1000';
            preview.style.pointerEvents = 'none';
            preview.style.transform = 'translate(-50%, -50%)';
            
            const img = document.createElement('img');
            img.src = icon.src;
            img.style.width = '70%';
            img.style.height = '70%';
            img.style.objectFit = 'contain';
            img.style.margin = '15%';
            
            preview.appendChild(img);
            document.body.appendChild(preview);
            
            // 记录初始位置
            if (e.touches && e.touches[0]) {
                window.dragStart = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
                
                // 设置预览位置
                preview.style.left = `${window.dragStart.x}px`;
                preview.style.top = `${window.dragStart.y}px`;
            }
            
            window.dragPreview = preview;
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchmove', function(e) {
            // 移动预览
            if (window.dragPreview && e.touches && e.touches[0]) {
                window.dragPreview.style.left = `${e.touches[0].clientX}px`;
                window.dragPreview.style.top = `${e.touches[0].clientY}px`;
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchend', function(e) {
            // 处理放置
            if (window.dragPreview) {
                // 获取放置位置
                const gridContainer = document.getElementById('grid-container');
                const rect = gridContainer.getBoundingClientRect();
                
                // 获取最后一次触摸位置
                let dropX, dropY;
                if (e.changedTouches && e.changedTouches[0]) {
                    dropX = e.changedTouches[0].clientX;
                    dropY = e.changedTouches[0].clientY;
                }
                
                // 检查是否在网格内
                if (dropX >= rect.left && dropX <= rect.right && 
                    dropY >= rect.top && dropY <= rect.bottom) {
                    
                    // 计算相对于网格的位置
                    const gridX = snapToGridCellCenter(dropX - rect.left - window.panOffset.x);
                    const gridY = snapToGridCellCenter(dropY - rect.top - window.panOffset.y);
                    
                    // 创建新节点
                    createNode(gridX, gridY, window.dragIconSrc, window.dragIconType);
                }
                
                // 清理
                document.body.removeChild(window.dragPreview);
                window.dragPreview = null;
                window.dragIconType = null;
                window.dragIconSrc = null;
            }
        });
    });
    
    console.log('移动设备触摸事件设置完成');
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否是移动设备
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768) {
        setupMobileTouchEvents();
    }
}); 