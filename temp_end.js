function getPortType(node) {
    if (!node || !node.dataset || !node.dataset.componentType) return 'unknown';
    
    const componentType = node.dataset.componentType;
    
    // 只有输出的组件
    if (componentType === '非门（NOT）' || 
        componentType === '分支（BR）' || 
        componentType === '与门（&）' || 
        componentType === 'XOR信号器' || 
        componentType === '或门（OR）' ||
        componentType === '开关触发器') return 'output';
    
    // 只有输入的组件
    if (componentType === '灯') return 'input';
    
    // 既有输入又有输出的组件
    if (componentType === '延时触发器' || 
        componentType === '标记储存装置') {
        return 'both';
    }
    
    return 'unknown';
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有组件
    const components = document.querySelectorAll('.component');
    
    components.forEach(component => {
        // 获取组件的类型
        const type = getPortType(component);
        
        // 根据类型设置组件的样式
        if (type === 'output') {
            component.classList.add('output');
        } else if (type === 'input') {
            component.classList.add('input');
        } else if (type === 'both') {
            component.classList.add('both');
        } else {
            component.classList.add('unknown');
        }
    });
}); 