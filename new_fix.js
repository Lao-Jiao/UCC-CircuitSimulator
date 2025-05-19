// 修复后的getPortType函数
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