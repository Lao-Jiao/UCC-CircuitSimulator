// connection.js - 已停用，连接功能已移至主脚本
console.log('connection.js - 此模块已停用，连接功能已移至主脚本');

// 保留一个最小版本的API，避免出错
window.connectionAPI = {
    createConnection: function() { return null; },
    updateConnections: function() { },
    deleteConnection: function() { },
    deleteNodeConnections: function() { },
    getBranches: function() { return []; },
    getBranchCount: function() { return 0; },
    debug: function() { console.log('连接模块已停用'); }
}; 