// 更强力地禁用所有右键功能及右键拖动
window.onload = function() {
    // 禁用右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, { passive: false, capture: true });
    
    // 禁用右键按下
    document.addEventListener('mousedown', function(e) {
        if (e.button === 2) {
            e.preventDefault();
            return false;
        }
    }, { passive: false, capture: true });
    
    // 禁用右键拖动
    document.addEventListener('mousemove', function(e) {
        if (e.buttons === 2) {
            e.preventDefault();
            return false;
        }
    }, { passive: false, capture: true });
    
    // 禁用右键弹起
    document.addEventListener('mouseup', function(e) {
        if (e.button === 2) {
            e.preventDefault();
            return false;
        }
    }, { passive: false, capture: true });
    
    // 禁用右键相关的触摸事件
    document.addEventListener('touchstart', function(e) {
        e.preventDefault();
    }, { passive: false, capture: true });
    
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false, capture: true });
    
    console.log("右键拖动禁用已强制启用");
};

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const gridBg = document.querySelector('.grid-bg');
    const addNodeBtn = document.getElementById('add-node');
    const addBranchBtn = document.getElementById('add-branch');
    const clearBtn = document.getElementById('clear');
    const nodeColorInput = document.getElementById('node-color');
    const sidebarIcons = document.querySelectorAll('.sidebar-icon');
    
    // 添加组件计数器，用于生成唯一ID
    const componentCounters = {
        '开关触发器': 0,
        '灯': 0,
        '延时触发器': 0,
        '与门（&）': 0,
        'XOR信号器': 0,
        '或门（OR）': 0,
        '非门（NOT）': 0,
        '分支（BR）': 0,
        '标记储存装置': 0,
        '跟随器': 0
    };
    
    // 创建日志区域
    createLogPanel();
    
    // 检测设备类型并初始化移动端UI
    detectMobileDevice();
    
    // 创建日志面板函数
    function createLogPanel() {
        // 删除日志面板及相关按钮
        // 保留空函数但不创建任何日志相关元素
    }
    
    // 调试信息记录函数（已禁用）
    function logCircuitState() {
        // 已禁用电路日志记录功能
    }
    
    // 不再记录状态

    let nodes = [];
    let branches = [];
    let isDragging = false;
    let isPanning = false;
    let currentNode = null;
    let nodeMode = false;
    let branchMode = false;
    let branchStart = null;
    let branchStartPort = null;  // 连线起始端口
    let currentColor = nodeColorInput.value;
    let panStart = { x: 0, y: 0 };
    let panOffset = { x: 0, y: 0 };
    // 将panOffset暴露为全局变量，供connection.js访问
    window.panOffset = panOffset;
    let lastPan = { x: 0, y: 0 };
    const gridSize = 48; // 与CSS变量保持一致
    let dragIconType = null;
    let dragIconSrc = null;
    let circuitRunning = false;  // 电路运行状态
    
    // 添加节点选择和删除功能
    let hoveredNode = null;  // 跟踪当前鼠标悬停的节点
    let selectedNode = null; // 跟踪当前选中的节点
    
    // 添加全局变量用于跟踪连接状态
    let connectingStart = null; // 连接起始节点
    let connections = []; // 存储连接线
    
    // 组件逻辑定义
    const componentLogic = {
        '开关触发器': {
            inputs: 1,  // 只允许1个输入
            outputs: 1, // 只允许1个输出
            process: function(inputs, node) {
                // 组件ID用于日志
                const nodeId = node ? node.dataset.componentId || '' : '';
                
                // 只判断有实际输入的端口（即非undefined）
                const validInputs = inputs.filter(v => v !== undefined);
                
                // 检查是否有输入信号且为0，如果是，则强制开关为关闭状态
                if (validInputs.length > 0 && validInputs[0] === 0) {
                    // 如果开关当前是打开状态，需要强制关闭它
                    if (node && node.classList.contains('active')) {
                        console.log(`开关触发器${nodeId}接收到输入信号0，强制关闭状态`);
                        // 异步更新UI状态，避免在处理过程中修改DOM
                        requestAnimationFrame(() => {
                            node.classList.remove('active');
                            node.state.outputValues[0] = 0;
                        });
                    }
                    return 0; // 输出0
                }
                
                // 正常处理逻辑
                // 如果开关处于关闭状态（非active），则始终输出0
                if (!node || !node.classList.contains('active')) {
                    console.log(`开关触发器${nodeId}处于关闭状态，输出: 0`);
                    return 0;
                }
                
                // 如果开关处于打开状态，且有有效输入，则传递输入信号
                if (validInputs.length > 0) {
                    const result = validInputs[0] ? 1 : 0;
                    console.log(`开关触发器${nodeId}处于打开状态，处理输入: [${validInputs.join(', ')}], 输出: ${result}`);
                    return result;
                }
                
                // 如果开关处于打开状态，但没有有效输入，则输出1
                console.log(`开关触发器${nodeId}处于打开状态，无输入，输出: 1`);
                return 1;
            }
        },
        '灯': {
            inputs: 1,
            outputs: 0, // 没有输出
            process: function(inputs, node) {
                // 组件ID用于日志
                const nodeId = node ? node.dataset.componentId || '' : '';
                
                // 只判断有实际输入的端口（即非undefined）
                const validInputs = inputs.filter(v => v !== undefined);
                
                // 如果没有有效输入，默认为熄灭状态
                const isOn = validInputs.length > 0 ? validInputs[0] : false;
                
                console.log(`灯${nodeId}处理输入: [${validInputs.join(', ')}], 状态: ${isOn ? '亮' : '灭'}`);
                
                // 更换图片
                if (node && node.querySelector('.node-icon-img')) {
                    const imgEl = node.querySelector('.node-icon-img');
                    
                    if (isOn) {
                        // 切换为亮灯图片
                        imgEl.src = 'PNG/灯亮起.png';
                        node.classList.add('active');
                    } else {
                        // 切换为普通灯图片
                        imgEl.src = 'PNG/灯.png';
                        node.classList.remove('active');
                    }
                }
                
                return 0; // 灯没有输出
            }
        },
        '延时触发器': {
            inputs: 1,
            outputs: 1,
            process: function(inputs, node) {
                // 如果已经在处理延时中，则不重复处理
                if(node.processingDelay) return node.state.outputValues[0];
                
                // 获取延时时间，默认1秒
                const delayTime = node.delayTime || 1;
                
                // 获取当前输入值
                const inputValue = inputs[0];
                
                // 如果输入为空或未定义，保持当前输出状态
                if(inputValue === undefined) return node.state.outputValues[0];
                
                // 获取当前输出值，默认为0
                const currentOutput = node.state.outputValues[0] || 0;
                
                // 检查输入值是否改变
                if(inputValue === 1) {
                    // 如果输入为1，开始延时处理
                    console.log(`延时触发器收到信号1，将在${delayTime}秒后输出`);
                    
                    // 设置正在处理延时标志
                        node.processingDelay = true;
                    
                    // 延时后输出信号
                        setTimeout(() => {
                        // 更新输出值为1
                            node.state.outputValues[0] = 1;
                        
                        // 更新节点状态
                            node.classList.add('active');
                        
                        // 更新信号指示器
                        if(node.signalIndicator) {
                            node.signalIndicator.textContent = '1';
                            node.signalIndicator.style.backgroundColor = 'rgba(0, 255, 0, 0.6)';
                            node.signalIndicator.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
                        }
                        
                        // 移除处理延时标志
                        node.processingDelay = false;
                        
                        console.log(`延时触发器延时(${delayTime}秒)结束，输出信号1`);
                        
                        // 使用新的visited集合传播信号，允许振荡电路工作
                        propagateSignal(node, new Set());
                        
                    }, delayTime * 1000);
                    
                    // 保持当前输出状态直到延时结束
                    return currentOutput;
                } else {
                    // 如果输入为0，直接输出0，无需延时
                    console.log(`延时触发器收到信号0，输出0`);
                    
                    // 移除处理延时标志
                    node.processingDelay = false;
                    
                    // 使用小延时确保信号能在振荡电路中继续传播
                    setTimeout(() => {
                        // 使用新的visited集合传播信号，允许振荡电路重新启动
                        const freshVisited = new Set();
                        propagateSignal(node, freshVisited);
                    }, 100); // 小延时确保信号能继续传播
                    
                return 0;
                }
            }
        },
        '与门（&）': {
            inputs: Infinity, // 无限输入
            outputs: 1,
            process: function(inputs, node) {
                // 组件ID用于日志
                const nodeId = node ? node.dataset.componentId || '' : '';
                
                // 打印原始输入数组，便于调试
                console.log(`与门${nodeId}处理: 原始输入数组: [${inputs.join(', ')}]`);
                
                // 重要修改：只考虑实际连接的输入（即非undefined且建立了连接的）
                // 查找与这个与门相关的所有输入连接
                const connectedInputs = connections.filter(conn => conn.endNode === node);
                console.log(`与门${nodeId}处理: 实际连接数量: ${connectedInputs.length}`);
                
                // 如果没有连接，则输出0
                if(connectedInputs.length === 0) {
                    console.log(`与门${nodeId}处理: 没有连接的输入，输出0`);
                    return 0;
                }
                
                // 检查所有连接的输入信号
                let allConnectedInputsAreOne = true;
                let connectedValues = [];
                
                // 遍历每个连接，获取其输入值
                connectedInputs.forEach(conn => {
                    const inputIndex = conn.inputIndex;
                    const inputValue = inputs[inputIndex];
                    connectedValues.push(inputValue);
                    
                    if(inputValue !== 1) {
                        allConnectedInputsAreOne = false;
                    }
                });
                
                // 输出取决于所有连接的输入是否都为1
                const result = allConnectedInputsAreOne ? 1 : 0;
                
                // 详细记录连接的输入值及最终判断结果
                console.log(`与门${nodeId}处理: 连接的输入值: [${connectedValues.join(', ')}]`);
                console.log(`与门${nodeId}处理: 所有连接的输入都是1? ${allConnectedInputsAreOne}, 最终输出: ${result}`);
                
                return result;
            }
        },
        'XOR信号器': {
            inputs: 2,
            outputs: 1,
            process: function(inputs, node) {
                // 组件ID用于日志
                const nodeId = node ? node.dataset.componentId || '' : '';
                
                // 查找连接到此XOR信号器的输入连接
                const connectedInputs = connections.filter(conn => conn.endNode === node);
                
                // 记录详细日志，帮助调试
                console.log(`XOR信号器${nodeId}连接情况: 共${connectedInputs.length}个输入连接`);
                
                // 直接从节点状态获取当前输入值
                console.log(`XOR信号器${nodeId}原始输入数组: [${inputs.join(', ')}]`);
                
                // 整理输入值，确保我们有数组中的有效值
                let validInputs = [0, 0]; // 默认两个输入为0
                
                // 根据连接状态确定输入值
                if (connectedInputs.length > 0) {
                    // 只处理已连接的端口
                    connectedInputs.forEach(conn => {
                        const inputIndex = conn.inputIndex;
                        // 检查输入值是否有定义，如果没有则默认为0
                        validInputs[inputIndex] = inputs[inputIndex] !== undefined ? inputs[inputIndex] : 0;
                        console.log(`XOR信号器${nodeId}端口${inputIndex}的输入值: ${validInputs[inputIndex]} (原始值: ${inputs[inputIndex]})`);
                    });
                    
                    // 确保我们有两个有效的输入连接
                    if (connectedInputs.length < 2) {
                        console.log(`XOR信号器${nodeId}输入连接不足，输出: 0`);
                        return 0;
                    }
                    
                    // 检查是否形成循环连接
                    const isCircular = checkCircularConnection(node);
                    if (isCircular) {
                        console.log(`XOR信号器${nodeId}检测到循环连接，使用当前输入值计算`);
                    }
                    
                    // 正确实现XOR逻辑：当两个输入不同时输出1，相同时输出0
                    const result = validInputs[0] !== validInputs[1] ? 1 : 0;
                    console.log(`XOR信号器${nodeId}处理输入: [${validInputs[0]}, ${validInputs[1]}], 输出: ${result}`);
                    return result;
                } else {
                    // 没有连接的情况
                    console.log(`XOR信号器${nodeId}没有输入连接，输出: 0`);
                    return 0;
                }
            }
        },
        '或门（OR）': {
            inputs: Infinity,
            outputs: 1,
            process: function(inputs) {
                // 只判断有实际输入的端口（即非undefined）
                const validInputs = inputs.filter(v => v !== undefined);
                
                // 如果没有有效输入，输出0
                if(validInputs.length === 0) return 0;
                
                // 至少一个输入为1就输出1
                const result = validInputs.some(val => val === 1) ? 1 : 0;
                console.log(`或门处理输入: [${validInputs.join(', ')}], 输出: ${result}`);
                return result;
            }
        },
        '非门（NOT）': {
            inputs: 1,
            outputs: 1,
            process: function(inputs, node) {
                // 组件ID用于日志
                const nodeId = node ? node.dataset.componentId || '' : '';
                
                // 只判断有实际输入的端口（即非undefined）
                const validInputs = inputs.filter(v => v !== undefined);
                
                // 如果没有有效输入，输出1（非门在没有接收到上一个信号的输入时输出信号1）
                if(validInputs.length === 0) {
                    console.log(`非门${nodeId}没有有效输入，输出: 1`);
                    return 1;
                }
                
                // 输入为0输出1，输入为1输出0
                const result = validInputs[0] ? 0 : 1;
                console.log(`非门${nodeId}处理输入: [${validInputs.join(', ')}], 输出: ${result}`);
                return result;
            }
        },
        '分支（BR）': {
            inputs: 1,
            outputs: Infinity, // 可以有多个输出
            process: function(inputs) {
                // 只判断有实际输入的端口（即非undefined）
                const validInputs = inputs.filter(v => v !== undefined);
                
                // 如果没有有效输入，输出0
                if(validInputs.length === 0) return 0;
                
                // 分支节点只传递信号，不改变值
                const result = validInputs[0] ? 1 : 0;
                console.log(`分支处理输入: [${validInputs.join(', ')}], 输出: ${result}`);
                return result;
            }
        },
        '标记储存装置': {
            inputs: 2,  // 两个输入端
            outputs: 1,
            process: function(inputs, node) {
                // 如果没有节点状态，创建初始状态
                if (!node.state) {
                    node.state = {
                        inputValues: [0, 0],
                        outputValues: [0],
                        stored: false,
                        controlPort: undefined,
                        dataPort: undefined,
                        portIdentified: false,
                        connectionOrder: []
                    };
                }
                
                // 查找连接到此标记储存装置的所有输入连接
                const inputConnections = connections.filter(conn => conn.endNode === node);
                
                // 检查连接情况
                console.log(`标记储存装置${node.dataset.componentId}: 有${inputConnections.length}个输入连接`);
                
                // 准备输入信号映射
                const portValues = {};
                const inputSources = [];
                
                // 从连接中提取输入信号
                inputConnections.forEach(conn => {
                    if (conn.startNode && conn.startNode.state && conn.startNode.state.outputValues) {
                        const sourceType = conn.startNode.dataset.componentType;
                        const sourceId = conn.startNode.dataset.componentId;
                        const value = conn.startNode.state.outputValues[0];
                        const portIndex = conn.inputIndex || 0;
                        
                        // 检查端口索引，确保端口号存在
                        if (portIndex !== undefined) {
                            portValues[portIndex] = {
                                value: value,
                                source: `${sourceType}${sourceId}`
                            };
                            
                            inputSources.push(`${sourceType}${sourceId}(值:${value})`);
                        }
                    }
                });
                
                console.log(`标记储存装置${node.dataset.componentId}输入来源: ${inputSources.join(', ')}`);
                
                // 如果没有有效输入连接，直接返回0
                if (inputConnections.length === 0) {
                    return 0;
                }
                
                // 尝试从已有输入连接重建连接顺序和端口分配
                if (inputConnections.length > 0) {
                    // 对输入连接按创建时间排序
                    const sortedConnections = [...inputConnections].sort((a, b) => {
                        if (!a.creationTime) return 1;
                        if (!b.creationTime) return -1;
                        return a.creationTime - b.creationTime;
                    });
                    
                    // 重建连接顺序数组
                    const newConnectionOrder = sortedConnections.map(conn => conn.inputIndex);
                    
                    // 检查是否与现有的连接顺序不同
                    let needsUpdate = false;
                    if (newConnectionOrder.length !== node.state.connectionOrder.length) {
                        needsUpdate = true;
                    } else {
                        for (let i = 0; i < newConnectionOrder.length; i++) {
                            if (newConnectionOrder[i] !== node.state.connectionOrder[i]) {
                                needsUpdate = true;
                            break;
                        }
                    }
                }
                
                    // 如果需要更新，重建连接顺序和端口分配
                    if (needsUpdate) {
                        console.log(`标记储存装置${node.dataset.componentId}：检测到连接顺序不一致，重建端口分配`);
                        node.state.connectionOrder = newConnectionOrder;
                        
                        // 重置端口分配
                        node.state.controlPort = undefined;
                        node.state.dataPort = undefined;
                        node.state.portIdentified = false;
                    }
                }
                
                // 控制端识别处理 - 确保使用创建时间最早的连接作为控制端
                if (node.state.controlPort === undefined && node.state.connectionOrder.length > 0) {
                    // 使用第一个连接作为控制端
                    node.state.controlPort = node.state.connectionOrder[0];
                    console.log(`标记储存装置${node.dataset.componentId}：确定控制端为端口 ${node.state.controlPort}`);
                }
                
                // 数据端识别处理 - 确保使用创建时间第二早的连接作为数据端
                if (node.state.dataPort === undefined && node.state.connectionOrder.length > 1) {
                    // 使用第二个连接作为数据端
                    node.state.dataPort = node.state.connectionOrder[1];
                    console.log(`标记储存装置${node.dataset.componentId}：确定数据端为端口 ${node.state.dataPort}`);
                    node.state.portIdentified = true; // 两个端口都已确定
                }
                
                // 确保控制端和数据端不是同一个端口
                if (node.state.controlPort !== undefined && node.state.dataPort !== undefined && 
                    node.state.controlPort === node.state.dataPort) {
                    console.log(`标记储存装置${node.dataset.componentId}：检测到端口分配冲突，重置端口分配`);
                    
                    // 在所有连接中找出两个不同的端口
                    const availablePorts = [...new Set(inputConnections.map(conn => conn.inputIndex))];
                    
                    if (availablePorts.length >= 2) {
                        node.state.controlPort = availablePorts[0];
                        node.state.dataPort = availablePorts[1];
                        console.log(`标记储存装置${node.dataset.componentId}：冲突解决，控制端=${node.state.controlPort}，数据端=${node.state.dataPort}`);
                        node.state.portIdentified = true;
                    } else {
                        // 如果没有两个不同的端口，保留控制端，清除数据端
                        node.state.dataPort = undefined;
                        node.state.portIdentified = false;
                        console.log(`标记储存装置${node.dataset.componentId}：无法解决端口冲突，保留控制端`);
                    }
                }
                
                // 如果只有一个连接端口，可能只有控制端，我们也可以处理
                if (node.state.controlPort !== undefined) {
                    // 获取控制信号(CLK)
                    const controlPortValue = portValues[node.state.controlPort];
                    const controlValue = controlPortValue ? controlPortValue.value : 0;
                    const controlSource = controlPortValue ? controlPortValue.source : "未连接";
                    
                    // 存储控制端信息
                    node.state.controlSource = controlSource;
                    
                    // 获取数据信号(D)，如果存在的话
                    let dataValue = 0;
                    let dataSource = "未连接";
                    
                    if (node.state.dataPort !== undefined) {
                        const dataPortValue = portValues[node.state.dataPort];
                        if (dataPortValue) {
                            dataValue = dataPortValue.value;
                            dataSource = dataPortValue.source;
                            // 存储数据端信息
                            node.state.dataSource = dataSource;
                        }
                    }
                    
                    // D触发器逻辑：控制端为1时，输出等于数据端；控制端为0时，输出保持不变
                    if (controlValue === 1) {
                        // 控制端开启时
                        if (node.state.dataPort !== undefined && portValues[node.state.dataPort]) {
                            // 有数据端的情况，输出等于数据端的值
                            console.log(`标记储存装置${node.dataset.componentId}控制端(${controlSource})为1，数据端(${dataSource})为${dataValue}，输出: ${dataValue}`);
                            node.state.stored = true;
                            node.state.outputValues[0] = dataValue;
                            return dataValue;
                        } else {
                            // 没有数据端时，输出固定为1
                            console.log(`标记储存装置${node.dataset.componentId}控制端(${controlSource})为1，无数据端，输出控制端的值: 1`);
                            node.state.stored = true;
                            node.state.outputValues[0] = 1;
                            return 1;
                        }
                    } else {
                        // 控制端为0时，输出保持上一个状态
                        const output = node.state.stored ? node.state.outputValues[0] : 0;
                        console.log(`标记储存装置${node.dataset.componentId}控制端(${controlSource})为0，保持输出: ${output}`);
                        return output;
                    }
                } else {
                    // 无法确定控制端时，默认输出0
                    console.log(`标记储存装置${node.dataset.componentId}：无法确定控制端和数据端，输出默认值0`);
                return 0;
                }
            },
            reset: function(node) {
                // 完全重置，包括清除端口识别状态
                node.state.stored = false;
                node.state.outputValues[0] = 0;
                node.state.portIdentified = false;
                node.state.controlPort = undefined;
                node.state.dataPort = undefined;
                node.state.connectionOrder = [];
                node.state.controlSource = "未连接";
                node.state.dataSource = "未连接";
                console.log(`标记储存装置${node.dataset.componentId}完全重置，端口识别状态已清除`);
                showToast(`标记储存装置${node.dataset.componentId}已重置`);
                return 0;
            }
        },
        '跟随器': {
            inputs: 1,  // 只有1个输入端
            outputs: 1,  // 只有1个输出端
            process: function(inputs, node) {
                // 组件ID用于日志
                const nodeId = node ? node.dataset.componentId || '' : '';
                
                // 只判断有实际输入的端口（即非undefined）
                const validInputs = inputs.filter(v => v !== undefined);
                
                // 如果没有有效输入，默认输出0
                if (validInputs.length === 0) {
                    console.log(`跟随器${nodeId}无输入，输出默认值: 0`);
                    return 0;
                }
                
                // 获取输入信号值（第一个有效输入）
                const inputValue = validInputs[0];
                
                // 输出与输入相同的信号
                console.log(`跟随器${nodeId}接收到信号 ${inputValue}，输出: ${inputValue}`);
                return inputValue ? 1 : 0;
            }
        }
    };
    
    // 检查是否存在循环连接
    function checkCircularConnection(node, visited = new Set(), depth = 0) {
        if (depth > 10) return true; // 深度超过限制，认为存在循环
        if (visited.has(node)) return true; // 节点已访问过，存在循环
        
        // 将当前节点加入已访问集合
        visited.add(node);
        
        // 获取从此节点出发的所有连接
        const outgoingConnections = connections.filter(conn => conn.startNode === node);
        
        // 递归检查每个下游节点
        for (const conn of outgoingConnections) {
            const nextNode = conn.endNode;
            if (checkCircularConnection(nextNode, new Set([...visited]), depth + 1)) {
                return true;
            }
        }
        
        return false;
    }
    
    // 吸附点可视化辅助
    let snapPointEl = null;
    function showSnapPoint(x, y) {
        if (!snapPointEl) {
            snapPointEl = document.createElement('div');
            snapPointEl.style.position = 'absolute';
            snapPointEl.style.width = '8px';
            snapPointEl.style.height = '8px';
            snapPointEl.style.background = 'red';
            snapPointEl.style.borderRadius = '50%';
            snapPointEl.style.zIndex = 1000;
            snapPointEl.style.pointerEvents = 'none';
            gridContainer.appendChild(snapPointEl);
        }
        snapPointEl.style.left = `${x - 4 + panOffset.x}px`;
        snapPointEl.style.top = `${y - 4 + panOffset.y}px`;
        snapPointEl.style.display = 'block';
    }
    function hideSnapPoint() {
        if (snapPointEl) snapPointEl.style.display = 'none';
    }
    
    // 更新CSS变量
    function updateColorTheme(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        currentColor = color;
    }
    
    // 创建新节点（可选带图标）
    function createNode(x, y, iconSrc = null, iconType = null) {
        const node = document.createElement('div');
        if (iconSrc) {
            node.className = 'node node-icon-card';
            node.dataset.componentType = iconType;
            
            // 分配组件ID
            if (componentCounters.hasOwnProperty(iconType)) {
                componentCounters[iconType]++;
                node.dataset.componentId = componentCounters[iconType];
            }

            // 初始化多输入/多输出的状态
            node.state = {
                inputValues: [],
                outputValues: [],
                stored: false
            };
            // 根据组件类型初始化输入/输出数组长度
            if(componentLogic[iconType]) {
                const logic = componentLogic[iconType];
                
                // 为开关触发器特殊处理，初始化inputValues为undefined
                if (iconType === '开关触发器') {
                    node.state.inputValues = new Array(logic.inputs === Infinity ? 2 : logic.inputs).fill(undefined);
                    node.state.outputValues = new Array(logic.outputs === Infinity ? 2 : logic.outputs).fill(0);
                    node.state.outputValues[0] = 0;
                    node.classList.remove('active');
                    console.log(`创建开关触发器${node.dataset.componentId}，初始状态为关闭，输出: 0，输入未连接`);
                } else {
                    // 其他组件保持原有初始化方式
                node.state.inputValues = new Array(logic.inputs === Infinity ? 2 : logic.inputs).fill(0);
                node.state.outputValues = new Array(logic.outputs === Infinity ? 2 : logic.outputs).fill(0);
            }
                
                // 为标记储存装置初始化固定的控制端和数据端
                if (iconType === '标记储存装置') {
                    node.state.controlPort = undefined;    // 动态识别控制端
                    node.state.dataPort = undefined;       // 动态识别数据端
                    node.state.portIdentified = false;     // 是否已经识别出控制端和数据端
                    node.state.controlSource = "未连接";   // 初始无连接
                    node.state.dataSource = "未连接";      // 初始无连接
                    node.state.connectionOrder = [];       // 记录连接顺序
                    console.log(`创建标记储存装置${node.dataset.componentId}，控制端和数据端将根据连接顺序确定`);
                }
                
                // 为节点添加信号状态指示器（如果有输出）
                if (logic.outputs > 0) {
                    const signalIndicator = document.createElement('div');
                    signalIndicator.className = 'signal-indicator';
                    signalIndicator.textContent = '0'; // 默认显示0
                    
                    // 根据组件类型设置样式
                    signalIndicator.style.position = 'absolute';
                    signalIndicator.style.top = '-18px'; // 定位在组件上方
                    signalIndicator.style.left = '50%';
                    signalIndicator.style.transform = 'translateX(-50%)';
                    signalIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                    signalIndicator.style.color = 'white';
                    signalIndicator.style.padding = '2px 8px';
                    signalIndicator.style.borderRadius = '10px';
                    signalIndicator.style.fontSize = '12px';
                    signalIndicator.style.fontWeight = 'bold';
                    signalIndicator.style.zIndex = '5';
                    signalIndicator.style.userSelect = 'none';
                    signalIndicator.style.pointerEvents = 'none'; // 防止干扰点击事件
                    
                    node.appendChild(signalIndicator);
                    node.signalIndicator = signalIndicator; // 保存引用以便后续更新
                }
            }
            
            // 添加ID标签显示
            const idLabel = document.createElement('div');
            idLabel.className = 'component-id-label';
            idLabel.textContent = node.dataset.componentId || '';
            idLabel.style.position = 'absolute';
            idLabel.style.bottom = '-15px';
            idLabel.style.left = '50%';
            idLabel.style.transform = 'translateX(-50%)';
            idLabel.style.color = '#fff';
            idLabel.style.backgroundColor = 'rgba(60, 60, 60, 0.7)';
            idLabel.style.padding = '1px 6px';
            idLabel.style.borderRadius = '8px';
            idLabel.style.fontSize = '10px';
            idLabel.style.fontWeight = 'bold';
            idLabel.style.zIndex = '5';
            node.appendChild(idLabel);
        } else {
            node.className = 'node';
        }
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.background = getComputedStyle(document.documentElement).getPropertyValue('--node-gradient');
        node.dataset.x = x;
        node.dataset.y = y;
        if (iconSrc) {
            const img = document.createElement('img');
            img.src = iconSrc;
            img.alt = iconType || '';
            img.className = 'node-icon-img';
            node.appendChild(img);
            node.dataset.icon = iconType;
        }
        
        // 禁止端口拖动节点，但允许节点双击事件
        node.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('port')) {
                e.stopPropagation();
                return;
            }
            e.stopPropagation();
            if (branchMode) {
                // 检查是否点击了端口
                if(e.target.classList.contains('port')) {
                    branchStart = node;
                    branchStartPort = e.target;
                    return;
                }
                return;
            }
            isDragging = true;
            currentNode = node;
        });
        
        // 移除原始的双击事件，交给setupNodeEvents处理
        
        gridContainer.appendChild(node);
        nodes.push(node);
        return node;
    }
    
    // 优化updateNodesAndBranches性能
    function updateNodesAndBranches() {
        // 预先计算一次更新，批量更新DOM
        const updates = [];
        
        // 收集所有节点位置更新
        nodes.forEach(node => {
            updates.push(() => {
                node.style.left = `${parseInt(node.dataset.x) + panOffset.x}px`;
                node.style.top = `${parseInt(node.dataset.y) + panOffset.y}px`;
                node.style.zIndex = '1'; // 确保节点在连接线上层
            });
        });
        
        // 收集所有连接线更新
        connections.forEach(conn => {
            updates.push(() => updateConnectionPosition(conn));
        });
        
        // 确保连接线在节点下方的DOM位置更新
        connections.forEach(conn => {
            if (conn.element && conn.element.parentNode === gridContainer) {
                updates.push(() => {
                    // 将连接线移动到DOM树的最前面，确保它在组件下层
                    if (gridContainer.firstChild && gridContainer.firstChild !== conn.element) {
                        gridContainer.insertBefore(conn.element, gridContainer.firstChild);
                    }
                });
            }
        });
        
        // 使用requestAnimationFrame批量应用更新
        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
    }
    
    // 优化拖动性能
    gridContainer.addEventListener('mousemove', function(e) {
        if (branchMode && connectStartPort) {
            // TODO: 可以在这里添加动态显示连接线的功能
        }

        if (isDragging && currentNode) {
            // 拖动节点
            const rect = gridContainer.getBoundingClientRect();
            const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
            const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
            
            // 节流操作 - 只在位置真正改变时才更新
            if (parseInt(currentNode.dataset.x) !== x || parseInt(currentNode.dataset.y) !== y) {
                // 检查新位置是否有效（排除当前节点自己）
                const isValidPosition = !nodes.some(node => {
                    if (node === currentNode) return false; // 排除自己
                    
                    const nodeX = parseInt(node.dataset.x);
                    const nodeY = parseInt(node.dataset.y);
                    
                    const gridSizeValue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
                    const minDistance = gridSizeValue * 1.5; // 减小最小距离，使节点可以放置得更近
                    const distance = Math.sqrt(Math.pow(nodeX - x, 2) + Math.pow(nodeY - y, 2));
                    
                    return distance < minDistance;
                });
                
                // 获取或创建警告光标
                let warningCursor = document.querySelector('.warning-cursor');
                if (!warningCursor) {
                    warningCursor = document.createElement('div');
                    warningCursor.className = 'warning-cursor';
                    warningCursor.innerHTML = '❌';
                    warningCursor.style.display = 'none';
                    warningCursor.style.position = 'absolute';
                    warningCursor.style.color = 'red';
                    warningCursor.style.fontSize = '24px';
                    warningCursor.style.pointerEvents = 'none';
                    warningCursor.style.zIndex = '1000';
                    warningCursor.style.marginLeft = '10px';
                    warningCursor.style.marginTop = '-10px';
                    document.body.appendChild(warningCursor);
                }
                
                // 显示警告光标
                warningCursor.style.left = (e.clientX + 10) + 'px';
                warningCursor.style.top = (e.clientY - 10) + 'px';
                
                if (isValidPosition) {
                    // 新位置有效，允许移动
                    warningCursor.style.display = 'none';
                    gridContainer.style.cursor = 'grabbing';
                    showSnapPoint(x + 20, y + 20);
                    setTimeout(hideSnapPoint, 800);
                    currentNode.dataset.x = x;
                    currentNode.dataset.y = y;
                    
                    // 移除不允许放置的视觉提示（如果有的话）
                    currentNode.classList.remove('invalid-position');
                    
                    // 使用requestAnimationFrame提高渲染性能
                    requestAnimationFrame(() => {
                        updateNodesAndBranches();
                        
                        // 发送节点移动事件
                        document.dispatchEvent(new CustomEvent('node-move', {
                            detail: { node: currentNode }
                        }));
                    });
                } else {
                    // 新位置无效，添加视觉提示但不更新位置
                    warningCursor.style.display = 'block';
                    gridContainer.style.cursor = 'not-allowed';
                    currentNode.classList.add('invalid-position');
                }
            }
        } else if (isPanning) {
            // 画布平移
            const deltaX = e.clientX - panStart.x;
            const deltaY = e.clientY - panStart.y;
            
            // 节流操作 - 只在位置变化超过一定阈值时更新
            if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                panOffset.x = lastPan.x + deltaX;
                panOffset.y = lastPan.y + deltaY;
                
                // 同步全局panOffset
                window.panOffset = panOffset;
                
                // 使用requestAnimationFrame优化渲染
                requestAnimationFrame(() => {
                    updatePan();
                    
                    // 发送画布更新事件
                    document.dispatchEvent(new CustomEvent('pan-update', {
                        detail: { panOffset: panOffset }
                    }));
                });
            }
        }
    });
    
    // 处理拖动结束时的清理工作
    gridContainer.addEventListener('mouseup', function() {
        if (isDragging) {
            // 隐藏警告光标
            const warningCursor = document.querySelector('.warning-cursor');
            if (warningCursor) {
                warningCursor.style.display = 'none';
            }
            
            // 恢复鼠标样式
            gridContainer.style.cursor = 'default';
            
            // 移除无效位置的视觉提示
            if (currentNode) {
                currentNode.classList.remove('invalid-position');
            }
            
            isDragging = false;
            currentNode = null;
        }
    });
    
    // 当鼠标离开容器时也要清理状态
    gridContainer.addEventListener('mouseleave', function() {
        if (isDragging) {
            // 隐藏警告光标
            const warningCursor = document.querySelector('.warning-cursor');
            if (warningCursor) {
                warningCursor.style.display = 'none';
            }
            
            // 恢复鼠标样式
            gridContainer.style.cursor = 'default';
            
            // 移除无效位置的视觉提示
            if (currentNode) {
                currentNode.classList.remove('invalid-position');
            }
        }
    });
    
    // 修改node双击事件监听，提高灵敏度
    function setupNodeEvents() {
        // 为所有节点添加双击事件，提高灵敏度
        const handleNodeDoubleClick = (node) => {
            if(node.dataset.componentType === '开关触发器') {
                // 不再处理开关触发器的双击事件，改为使用右键菜单
                console.log('请右键点击开关触发器以打开控制菜单');
                showToast('请右键点击开关切换状态');
                return true;
            } else if(node.dataset.componentType === '标记储存装置') {
                resetStorage(node);
                return true;
            }
            return false;
        };
        
        // 使用单击加时间戳模拟双击，提高响应速度
        document.addEventListener('click', function(e) {
            const node = e.target.closest('.node');
            if (!node) return;
            
            // 点击灯组件直接返回，不做处理
            if (node.dataset.componentType === '灯') return;
            
            const now = Date.now();
            if (!node.lastClickTime) {
                node.lastClickTime = now;
                return;
            }
            
            // 如果两次点击间隔小于300ms，认为是双击
            if (now - node.lastClickTime < 300) {
                handleNodeDoubleClick(node);
                e.stopPropagation(); // 阻止事件冒泡
                node.lastClickTime = 0; // 重置点击时间，避免连续触发
            } else {
                node.lastClickTime = now;
            }
        });
        
        // 添加右键菜单事件处理，用于设置延时触发器的延时时间
        document.addEventListener('contextmenu', function(e) {
            const node = e.target.closest('.node');
            if (!node) return;
            
            // 阻止默认右键菜单
            e.preventDefault();
            
            // 对延时触发器节点处理右键事件
            if (node.dataset.componentType === '延时触发器') {
                // 如果之前有其他输入框，先移除
                const existingDialog = document.getElementById('delay-time-dialog');
                if (existingDialog) {
                    existingDialog.remove();
                }
                
                // 显示延时设置输入框
                showDelayTimeInput(node, e.clientX, e.clientY);
            }
            // 对开关触发器节点处理右键事件
            else if (node.dataset.componentType === '开关触发器') {
                // 移除可能存在的开关菜单
                const existingMenu = document.getElementById('switch-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }
                
                // 显示开关菜单
                showSwitchMenu(node, e.clientX, e.clientY);
            }
            // 为所有信号图标添加右键删除功能
            else {
                // 移除可能存在的右键菜单
                const existingMenu = document.getElementById('node-context-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }
                
                // 显示节点右键菜单
                showNodeContextMenu(node, e.clientX, e.clientY);
            }
        });
    }
    
    // 触发开关组件 - 优化响应速度
    function toggleSwitch(node) {
        if(!node.state) return;
        
        // 检查是否有实际连接的输入信号为0
        // 首先检查该开关是否有任何连接到它的输入
        const hasInputConnections = connections.some(conn => conn.endNode === node);
        
        // 如果有输入连接，则检查输入值；如果没有连接，则允许自由切换状态
        const hasZeroInput = hasInputConnections ? 
            node.state.inputValues.some(v => v === 0) : false;
        
        // 获取当前开关状态
        const currentActive = node.classList.contains('active');
        
        console.log(`开关触发操作: 当前状态=${currentActive ? '开启' : '关闭'}, 有输入连接=${hasInputConnections}, 有0信号输入=${hasZeroInput}`);
        
        // 如果当前是关闭状态，尝试激活，需要检查输入条件
        if(!currentActive) {
            // 如果有输入信号为0，不允许激活开关
            if(hasZeroInput) {
                showToast('无法激活开关：输入信号为0');
                console.log(`开关激活失败：输入信号为0`);
                return; // 提前返回，不允许激活
            }
            
            // 允许激活开关
            node.classList.add('active');
            node.state.outputValues[0] = 1; // 打开状态输出1
            console.log(`开关从关闭状态切换为打开状态，输出: 1`);
            
            // 更新信号指示器
            updateSignalIndicator(node, 1);
            
            // 在开关打开时，先重置电路状态，确保开关信号能覆盖振荡电路
            // 首先重置所有非开关组件的状态
            nodes.forEach(otherNode => {
                if (otherNode !== node && otherNode.state && 
                    otherNode.dataset.componentType !== '开关触发器') {
                    // 重置输入值
                    if (otherNode.state.inputValues) {
                        for (let i = 0; i < otherNode.state.inputValues.length; i++) {
                            otherNode.state.inputValues[i] = 0;
                        }
                    }
                    
                    // 重置输出值
                    if (otherNode.state.outputValues) {
                        otherNode.state.outputValues.fill(0);
                    }
                    
                    // 重置UI状态
                    otherNode.classList.remove('active');
                    
                    // 更新信号指示器
                    updateSignalIndicator(otherNode, 0);
                    
                    // 如果是灯组件，确保更新图片
                    if (otherNode.dataset.componentType === '灯') {
                        const imgEl = otherNode.querySelector('.node-icon-img');
                        if (imgEl) {
                            imgEl.src = 'PNG/灯.png';
                        }
                    }
                    
                    // 清除延时触发器的处理状态
                    if (otherNode.dataset.componentType === '延时触发器') {
                        otherNode.processingDelay = false;
                    }
                }
            });
            
            // 重置所有连接线的状态
            connections.forEach(conn => {
                if (conn.element && conn.startNode !== node) {
                    conn.element.classList.remove('active');
                }
            });
        } else {
            // 关闭开关总是允许的
            node.classList.remove('active');
            node.state.outputValues[0] = 0; // 关闭状态输出0
            console.log(`开关从打开状态切换为关闭状态，输出: 0`);
            
            // 更新信号指示器
            updateSignalIndicator(node, 0);
        }
        
        // 记录整个电路的状态
        logCircuitState();
        
        // 使用新的信号传播方式，避免循环依赖问题
        // 创建一个新的Set用于追踪已访问节点，防止循环
        const visitedNodes = new Set();
        propagateSignal(node, visitedNodes);
    }
    
    // 重置储存器
    function resetStorage(node) {
        if(!node.state || !node.dataset.componentType) return;
        
        const logic = componentLogic[node.dataset.componentType];
        if(logic && logic.reset) {
            node.state.outputValues[0] = logic.reset(node);
            
            // 视觉反馈
            if(node.state.outputValues[0]) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
            
            // 传播信号变化
            const visitedNodes = new Set();
            propagateSignal(node, visitedNodes);
        }
    }
    
    // 信号传播函数 - 优化性能
    function propagateSignal(startNode, visited = new Set()) {
        if (visited.has(startNode)) return;
        visited.add(startNode);
        
        // 获取所有从该节点出发的连接（只考虑正向传播）
        const connectedLines = connections.filter(conn => conn.startNode === startNode);
        
        // 获取组件ID用于日志输出
        const nodeType = startNode.dataset.componentType || 'unknown';
        const nodeId = startNode.dataset.componentId || '';
        const nodeOutput = startNode.state ? startNode.state.outputValues[0] : 'unknown';
        console.log(`传播信号: ${nodeType}${nodeId}节点, ${connectedLines.length}个连接, 输出值:${nodeOutput}`);
        
        // 使用promise与setTimeout结合，避免长时间阻塞主线程
        const processConnections = async () => {
            for (let conn of connectedLines) {
            let outputNode, inputNode, inputIndex = 0;
                
                // 确定输出节点和输入节点
                if (startNode === conn.startNode) {
                    // 如果当前节点是连接的起点，则它是输出节点
                    outputNode = startNode;
                inputNode = conn.endNode;
                inputIndex = conn.inputIndex || 0;
                } else if (startNode === conn.endNode) {
                    // 如果当前节点是连接的终点，且它不是灯（灯只能接收信号）
                    if (startNode.dataset.componentType !== '灯') {
                        // 这种情况下，当前节点可能是输出节点（反向传播）
                        outputNode = startNode;
                inputNode = conn.startNode;
                        inputIndex = 0; // 反向连接通常使用默认索引
            } else {
                        // 灯只能接收信号，不能发送
                        return;
                    }
                }
                
                // 传递信号
                if (outputNode && outputNode.state && inputNode && inputNode.state) {
                const signalValue = outputNode.state.outputValues[0];
                    
                // 获取组件ID用于日志
                const outputType = outputNode.dataset.componentType || 'unknown';
                const outputId = outputNode.dataset.componentId || '';
                const inputType = inputNode.dataset.componentType || 'unknown';
                const inputId = inputNode.dataset.componentId || '';
                
                console.log(`信号传递: ${outputType}${outputId} -> ${inputType}${inputId}[端口${inputIndex}], 值=${signalValue}`);
                
                // 根据输入节点类型更新输入值
                if (inputNode.dataset.componentType === '与门（&）') {
                    // 对与门，写入对应inputIndex
                    inputNode.state.inputValues[inputIndex] = signalValue;
                    console.log(`与门${inputId}更新端口${inputIndex}输入值为${signalValue}, 输入数组现在是[${inputNode.state.inputValues}]`);
                } else if (inputNode.dataset.componentType === 'XOR信号器') {
                    // 对XOR信号器，确保根据连接的inputIndex更新正确的输入
                    inputNode.state.inputValues[inputIndex] = signalValue;
                    console.log(`XOR信号器${inputId}更新端口${inputIndex}输入值为${signalValue}, 输入数组现在是[${inputNode.state.inputValues}]`);
                } else {
                    // 其他组件默认使用第一个输入
                    inputNode.state.inputValues[0] = signalValue;
                }
                    
                    // 处理接收节点的逻辑
                processNodeLogic(inputNode, visited);
            }
                
                // 每处理几个连接就让出主线程，提高响应性
                if ((connectedLines.indexOf(conn) + 1) % 5 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
    }
            }
        };
    
        processConnections();
    }
    
    // 修改processNodeLogic函数，优化与门的信号传播并更新信号指示器
    function processNodeLogic(node, visited = new Set()) {
        if(!node.state || !node.dataset.componentType) return;
        
        const logic = componentLogic[node.dataset.componentType];
        if(!logic) return;
        
        // 获取组件ID用于日志
        const nodeType = node.dataset.componentType;
        const nodeId = node.dataset.componentId || '';
        
        console.log(`处理节点逻辑: ${nodeType}${nodeId}, 输入值=[${node.state.inputValues.join(',')}]`);
        
        // 特殊处理延时触发器
        if(node.dataset.componentType === '延时触发器') {
            const result = logic.process(node.state.inputValues, node);
            node.state.outputValues[0] = result;
            if(result) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
            
            // 更新信号指示器
            updateSignalIndicator(node, result);
            return;
        }
        
        // 灯节点：始终执行process，保证图片和active状态同步
        if(node.dataset.componentType === '灯') {
            logic.process(node.state.inputValues, node);
            // 更新信号指示器
            updateSignalIndicator(node, node.state.inputValues[0] || 0);
            return; // 灯不需要传播信号
        }
        
        // 保存之前的输出状态，用于检测变化
        const prevOutput = node.state.outputValues[0];
        
        // 执行节点的逻辑处理
        const result = logic.process(node.state.inputValues, node);
        node.state.outputValues[0] = result;
        
        console.log(`${nodeType}${nodeId}处理结果: 输出=${result}, 新状态=${result ? '激活' : '不激活'}`);
        
        // 更新节点的视觉状态
        if(result) {
            // 立即更新UI状态，而不是使用requestAnimationFrame
            node.classList.add('active');
        } else {
            node.classList.remove('active');
        }
        
        // 更新信号指示器
        updateSignalIndicator(node, result);
        
        // 如果输出发生变化，则传播信号
        if (prevOutput !== result) {
            console.log(`${nodeType}${nodeId}节点输出从${prevOutput}变为${result}，立即传播信号`);
            
            // 为振荡电路和有时序要求的组件进行特殊处理
            const isTimingComponent = ['非门（NOT）', '或门（OR）', '分支（BR）'].includes(node.dataset.componentType);
            
            // 对于时序敏感组件，允许重新开始传播循环
            if (isTimingComponent) {
                // 使用新的visited集合，允许振荡电路工作
                const freshVisited = new Set();
                
                // 使用requestAnimationFrame和setTimeout分离信号传播，避免阻塞UI
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        propagateSignal(node, freshVisited);
                    }, 0);
                });
            } else {
                // 普通组件使用传入的visited集合，防止一般电路中的循环
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        propagateSignal(node, visited);
                    }, 0);
                });
            }
        }
    }
    
    // 添加鼠标移动事件检测，在连接模式下实时显示连接线
    // 创建警告光标样式的元素（给网格内节点拖动使用）
    const nodeDragWarningCursor = document.createElement('div');
    nodeDragWarningCursor.className = 'warning-cursor';
    nodeDragWarningCursor.innerHTML = '❌';
    nodeDragWarningCursor.style.display = 'none';
    nodeDragWarningCursor.style.position = 'absolute';
    nodeDragWarningCursor.style.color = 'red';
    nodeDragWarningCursor.style.fontSize = '24px';
    nodeDragWarningCursor.style.pointerEvents = 'none';
    nodeDragWarningCursor.style.zIndex = '1000';
    nodeDragWarningCursor.style.marginLeft = '10px';
    nodeDragWarningCursor.style.marginTop = '-10px';
    document.body.appendChild(nodeDragWarningCursor);
    
    gridContainer.addEventListener('mousemove', function(e) {
        if (branchMode && connectStartPort) {
            // TODO: 可以在这里添加动态显示连接线的功能
        }

        if (isDragging && currentNode) {
            // 拖动节点
            const rect = gridContainer.getBoundingClientRect();
            const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
            const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
            
            // 节流操作 - 只在位置真正改变时才更新
            if (parseInt(currentNode.dataset.x) !== x || parseInt(currentNode.dataset.y) !== y) {
            // 检查新位置是否有效（排除当前节点自己）
            const isValidPosition = !nodes.some(node => {
                if (node === currentNode) return false; // 排除自己
                
                const nodeX = parseInt(node.dataset.x);
                const nodeY = parseInt(node.dataset.y);
                
                const gridSizeValue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
                const minDistance = gridSizeValue * 1.5; // 减小最小距离，使节点可以放置得更近
                const distance = Math.sqrt(Math.pow(nodeX - x, 2) + Math.pow(nodeY - y, 2));
                
                return distance < minDistance;
            });
                
                // 获取或创建警告光标
                let warningCursor = document.querySelector('.warning-cursor');
                if (!warningCursor) {
                    warningCursor = document.createElement('div');
                    warningCursor.className = 'warning-cursor';
                    warningCursor.innerHTML = '❌';
                    warningCursor.style.display = 'none';
                    warningCursor.style.position = 'absolute';
                    warningCursor.style.color = 'red';
                    warningCursor.style.fontSize = '24px';
                    warningCursor.style.pointerEvents = 'none';
                    warningCursor.style.zIndex = '1000';
                    warningCursor.style.marginLeft = '10px';
                    warningCursor.style.marginTop = '-10px';
                    document.body.appendChild(warningCursor);
                }
                
                // 显示警告光标
                warningCursor.style.left = (e.clientX + 10) + 'px';
                warningCursor.style.top = (e.clientY - 10) + 'px';
            
            if (isValidPosition) {
                // 新位置有效，允许移动
                    warningCursor.style.display = 'none';
                    gridContainer.style.cursor = 'grabbing';
                showSnapPoint(x + 20, y + 20);
                setTimeout(hideSnapPoint, 800);
                currentNode.dataset.x = x;
                currentNode.dataset.y = y;
                
                // 移除不允许放置的视觉提示（如果有的话）
                currentNode.classList.remove('invalid-position');
            
                    // 使用requestAnimationFrame提高渲染性能
                    requestAnimationFrame(() => {
            updateNodesAndBranches();
            
            // 发送节点移动事件
            document.dispatchEvent(new CustomEvent('node-move', {
                detail: { node: currentNode }
            }));
                    });
                } else {
                    // 新位置无效，添加视觉提示但不更新位置
                    warningCursor.style.display = 'block';
                    gridContainer.style.cursor = 'not-allowed';
                    currentNode.classList.add('invalid-position');
                }
            }
        } else if (isPanning) {
            // 画布平移
            const deltaX = e.clientX - panStart.x;
            const deltaY = e.clientY - panStart.y;
            
            // 节流操作 - 只在位置变化超过一定阈值时更新
            if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            panOffset.x = lastPan.x + deltaX;
            panOffset.y = lastPan.y + deltaY;
            
            // 同步全局panOffset
            window.panOffset = panOffset;
                
                // 使用requestAnimationFrame优化渲染
                requestAnimationFrame(() => {
                    updatePan();
            
            // 发送画布更新事件
            document.dispatchEvent(new CustomEvent('pan-update', {
                detail: { panOffset: panOffset }
            }));
                });
            }
        }
    });
    
    function updatePan() {
        // 网格背景平移
        if (gridBg) {
            gridBg.style.backgroundPosition = `${panOffset.x % gridSize}px ${panOffset.y % gridSize}px`;
        }
        // 同步全局panOffset变量
        window.panOffset = panOffset;
        
        // 发送pan-update事件，通知connection.js
        document.dispatchEvent(new CustomEvent('pan-update', {
            detail: { panOffset: panOffset }
        }));
        
        // 打印调试信息
        console.log(`画布偏移更新: x=${panOffset.x}, y=${panOffset.y}`);
        
        updateNodesAndBranches();
    }
    
    function updateNodesAndBranches() {
        // 更新节点位置
        nodes.forEach(node => {
            node.style.left = `${parseInt(node.dataset.x) + panOffset.x}px`;
            node.style.top = `${parseInt(node.dataset.y) + panOffset.y}px`;
            node.style.zIndex = '1'; // 确保节点在连接线上层
        });
        
        // 更新所有连接线
        connections.forEach(conn => {
            updateConnectionPosition(conn);
        });
        
        // 确保连接线在节点下方
        connections.forEach(conn => {
            if (conn.element && conn.element.parentNode === gridContainer) {
                // 将连接线移动到DOM树的最前面，确保它在组件下层
                if (gridContainer.firstChild && gridContainer.firstChild !== conn.element) {
                    gridContainer.insertBefore(conn.element, gridContainer.firstChild);
                }
            }
        });
    }
    
    // 修改鼠标抬起事件，处理连接取消和拖动结束
    document.addEventListener('mouseup', (e) => {
        isPanning = false;
        
        // 连线模式下点击空白处取消
        if(branchMode && branchStart && !e.target.closest('.node')) {
            branchStart.classList.remove('connecting-start');
            branchStart = null;
        }
        
        // 处理节点拖拽结束
        if (isDragging && currentNode) {
            // 无论位置是否有效，都恢复默认光标并移除警告
            document.body.style.cursor = 'default';
            nodeDragWarningCursor.style.display = 'none';
            
            // 如果节点有invalid-position类，判断是否要清除
            if (currentNode.classList.contains('invalid-position')) {
                // 检查最终位置是否有效
                const rect = gridContainer.getBoundingClientRect();
                const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
                const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
                
                // 再次检查位置有效性（排除当前节点）
                const isValidPosition = !nodes.some(node => {
                    if (node === currentNode) return false; // 排除自己
                    
                    const nodeX = parseInt(node.dataset.x);
                    const nodeY = parseInt(node.dataset.y);
                    
                    const gridSizeValue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
                    const minDistance = gridSizeValue * 1.5;
                    const distance = Math.sqrt(Math.pow(nodeX - x, 2) + Math.pow(nodeY - y, 2));
                    
                    return distance < minDistance;
                });
                
                if (isValidPosition) {
                    // 位置有效，清除警告样式
                    currentNode.classList.remove('invalid-position');
                }
            }
        }
        
        gridContainer.style.cursor = branchMode ? 'pointer' : (nodeMode ? 'crosshair' : 'default');
        isDragging = false;
        currentNode = null;
    });
    
    addNodeBtn.addEventListener('click', () => {
        nodeMode = !nodeMode;
        branchMode = false;
        addNodeBtn.classList.toggle('active', nodeMode);
        addBranchBtn.classList.remove('active');
        gridContainer.style.cursor = nodeMode ? 'crosshair' : 'default';
    });
    
    addBranchBtn.addEventListener('click', () => {
        branchMode = !branchMode;
        nodeMode = false;
        
        // 如果关闭连线模式，清除连接状态
        if (!branchMode && connectingStart) {
            connectingStart.classList.remove('connecting-start');
            connectingStart = null;
        }
        
        addBranchBtn.classList.toggle('active', branchMode);
        addNodeBtn.classList.remove('active');
        gridContainer.style.cursor = branchMode ? 'pointer' : 'default';
        
        console.log('连接模式: ' + (branchMode ? '开启' : '关闭'));
    });
    
    clearBtn.addEventListener('click', () => {
        // 清除节点
        nodes.forEach(node => node.remove());
        nodes = [];
        
        // 清除连接线
        connections.forEach(conn => conn.element.remove());
        connections = [];
        
        // 重置状态
        nodeMode = false;
        branchMode = false;
        
        if (connectingStart) {
            connectingStart.classList.remove('connecting-start');
            connectingStart = null;
        }
        
        addNodeBtn.classList.remove('active');
        addBranchBtn.classList.remove('active');
        
        // 重置组件ID计数器
        Object.keys(componentCounters).forEach(key => {
            componentCounters[key] = 0;
        });
        
        console.log('清空所有元素');
    });
    
    nodeColorInput.addEventListener('input', () => {
        updateColorTheme(nodeColorInput.value);
        updateNodesAndBranches();
    });
    
    // 只能吸附到网格格子的正中心
    function snapToGridCellCenter(value) {
        return Math.floor(value / gridSize) * gridSize + gridSize / 2 - 20; // 40px节点
    }

    // 重新实现拖放功能 - 作为独立功能放在前面，确保优先级最高
    function setupDragAndDrop() {
        console.log('Setting up drag and drop...');
        
        // 创建警告光标样式的元素
        const warningCursor = document.createElement('div');
        warningCursor.className = 'warning-cursor';
        warningCursor.innerHTML = '❌';
        warningCursor.style.display = 'none';
        warningCursor.style.position = 'absolute';
        warningCursor.style.color = 'red';
        warningCursor.style.fontSize = '24px';
        warningCursor.style.pointerEvents = 'none';
        warningCursor.style.zIndex = '1000';
        warningCursor.style.marginLeft = '10px';
        warningCursor.style.marginTop = '-10px';
        document.body.appendChild(warningCursor);
        
        // 设置图标为可拖动
        const sidebarIcons = document.querySelectorAll('.sidebar-icon');
        sidebarIcons.forEach(icon => {
            icon.draggable = true;
            
            icon.addEventListener('dragstart', function(e) {
                console.log('DRAG START:', icon.dataset.icon);
                // 存储被拖动的图标信息
                e.dataTransfer.setData('icon-type', icon.dataset.icon);
                e.dataTransfer.setData('icon-src', icon.src);
                e.dataTransfer.effectAllowed = 'copy';
            });
            
            // 为左侧图标添加右键菜单
            icon.addEventListener('contextmenu', function(e) {
                e.preventDefault(); // 阻止默认右键菜单
                
                // 显示组件信息菜单
                showIconInfoMenu(icon.dataset.icon, e.clientX, e.clientY);
            });
        });
        
        // 设置网格为拖放区域
        const gridContainer = document.getElementById('grid-container');
        
        // 处理拖动悬停
        gridContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            
            // 计算网格坐标
            const rect = gridContainer.getBoundingClientRect();
            const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
            const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
            
            // 检查位置是否有效（不与现有节点太近）
            const isValidPosition = checkValidPosition(x, y);
            
            // 显示警告光标
            warningCursor.style.display = 'block';
            warningCursor.style.left = (e.clientX + 10) + 'px';
            warningCursor.style.top = (e.clientY - 10) + 'px';
            
            // 根据位置有效性改变光标和警告标志
            if (isValidPosition) {
                e.dataTransfer.dropEffect = 'copy';
                warningCursor.style.display = 'none';
            } else {
                e.dataTransfer.dropEffect = 'none';
                warningCursor.style.display = 'block';
            }
        });

        // 拖动进入区域
        gridContainer.addEventListener('dragenter', function(e) {
            e.preventDefault();
        });
        
        // 拖动离开区域时隐藏警告光标
        gridContainer.addEventListener('dragleave', function() {
            warningCursor.style.display = 'none';
        });
        
        // 处理拖放
        gridContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 隐藏警告光标
            warningCursor.style.display = 'none';
            
            console.log('DROP EVENT TRIGGERED');
            
            // 获取拖动的图标信息
            const iconType = e.dataTransfer.getData('icon-type');
            const iconSrc = e.dataTransfer.getData('icon-src');
            
            console.log('Dropped icon:', iconType, iconSrc);
            
            if (iconType && iconSrc) {
                // 计算要放置的位置
                const rect = gridContainer.getBoundingClientRect();
                const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
                const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
                
                // 检查是否是有效位置
                if (checkValidPosition(x, y)) {
                    console.log('Creating node at:', x, y);
                    // 创建新节点
                    const newNode = createNode(x, y, iconSrc, iconType);
                    console.log('Node created:', newNode);
                } else {
                    console.log('Invalid position - too close to another node');
                }
            }
        });
        
        // 检查位置是否有效
        function checkValidPosition(x, y) {
            const gridSizeValue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
            const minDistance = gridSizeValue * 1.5; // 减小最小距离，使节点可以放置得更近
            
            // 检查是否与现有节点太近
            return !nodes.some(node => {
                const nodeX = parseInt(node.dataset.x);
                const nodeY = parseInt(node.dataset.y);
                const distance = Math.sqrt(Math.pow(nodeX - x, 2) + Math.pow(nodeY - y, 2));
                return distance < minDistance;
            });
        }
        
        // 添加触摸事件支持
        if (isMobileDevice) {
            console.log('设置移动设备触摸事件处理');
            
            // 平移功能 - 在平移模式下
            gridContainer.addEventListener('touchstart', function(e) {
                if (e.target === gridContainer || e.target.classList.contains('grid-bg')) {
                    if (currentMobileMode === 'pan') {
                        isPanning = true;
                        if (e.touches && e.touches[0]) {
                            panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                        }
                    }
                }
            }, { passive: false });
            
            document.addEventListener('touchmove', function(e) {
                // 平移处理
                if (isPanning && currentMobileMode === 'pan') {
                    if (e.touches && e.touches[0]) {
                        const dx = e.touches[0].clientX - panStart.x;
                        const dy = e.touches[0].clientY - panStart.y;
                        
                        panOffset.x = lastPan.x + dx;
                        panOffset.y = lastPan.y + dy;
                        
                        updatePan();
                        updateNodesAndBranches();
                    }
                }
                
                // 拖动组件处理
                if (isDragging && currentNode) {
                    if (e.touches && e.touches[0]) {
                        const touchX = e.touches[0].clientX - panOffset.x;
                        const touchY = e.touches[0].clientY - panOffset.y;
                        
                        // 获取元素的矩形边界
                        const rect = currentNode.getBoundingClientRect();
                        const halfWidth = rect.width / 2;
                        const halfHeight = rect.height / 2;
                        
                        // 计算网格位置
                        const gridX = snapToGridCellCenter(touchX);
                        const gridY = snapToGridCellCenter(touchY);
                        
                        // 检查位置是否有效
                        const validPosition = checkValidPosition(gridX, gridY);
                        
                        // 应用视觉提示
                        if (validPosition) {
                            currentNode.classList.remove('invalid-position');
                            showSnapPoint(gridX, gridY);
                        } else {
                            currentNode.classList.add('invalid-position');
                            hideSnapPoint();
                        }
                        
                        // 设置新的位置
                        currentNode.style.left = `${gridX - halfWidth}px`;
                        currentNode.style.top = `${gridY - halfHeight}px`;
                        
                        // 更新连接线位置
                        updateNodesAndBranches();
                    }
                    
                    // 防止页面滚动
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('touchend', function() {
                if (isPanning) {
                    isPanning = false;
                    lastPan.x = panOffset.x;
                    lastPan.y = panOffset.y;
                }
                
                if (isDragging && currentNode) {
                    isDragging = false;
                    currentNode = null;
                    hideSnapPoint();
                }
            });
            
            // 为节点添加触摸拖动事件
            document.addEventListener('touchstart', function(e) {
                // 只在合适的模式下允许拖动
                if (currentMobileMode !== 'pan' && currentMobileMode !== 'connect') return;
                
                // 检查是否点击了节点
                let target = e.target;
                while (target && !target.classList.contains('node') && !target.classList.contains('grid-container')) {
                    target = target.parentElement;
                }
                
                if (target && target.classList.contains('node')) {
                    // 进入拖动模式
                    isDragging = true;
                    currentNode = target;
                    
                    // 防止页面滚动
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        console.log('Drag and drop setup complete');
    }

    // 初始化拖放功能 - 确保在最后调用，覆盖任何之前的设置
    setupDragAndDrop();

    // 初始化时同步一次
            
            // 对延时触发器节点处理右键事件
            if (node.dataset.componentType === '延时触发器') {
                // 如果之前有其他输入框，先移除
                const existingDialog = document.getElementById('delay-time-dialog');
                if (existingDialog) {
                    existingDialog.remove();
                }
                
                // 显示延时设置输入框
                showDelayTimeInput(node, e.clientX, e.clientY);
            }
            // 对开关触发器节点处理右键事件
            else if (node.dataset.componentType === '开关触发器') {
                // 移除可能存在的开关菜单
                const existingMenu = document.getElementById('switch-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }
                
                // 显示开关菜单
                showSwitchMenu(node, e.clientX, e.clientY);
            }
            // 为所有信号图标添加右键删除功能
            else {
                // 移除可能存在的右键菜单
                const existingMenu = document.getElementById('node-context-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }
                
                // 显示节点右键菜单
                showNodeContextMenu(node, e.clientX, e.clientY);
            }
        });
    }

    // 初始化节点事件处理
    setupNodeEvents();

    // 添加一个新函数用于更新信号指示器
    function updateSignalIndicator(node, value) {
        if (!node || !node.signalIndicator) return;
        
        // 更新信号指示器文本
        node.signalIndicator.textContent = value ? '1' : '0';
        
        // 根据信号值更新指示器样式
        if (value) {
            node.signalIndicator.style.backgroundColor = 'rgba(0, 128, 0, 0.7)'; // 绿色背景表示1
            node.signalIndicator.style.boxShadow = '0 0 5px rgba(0, 255, 0, 0.5)'; // 发光效果
        } else {
            node.signalIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; // 黑色背景表示0
            node.signalIndicator.style.boxShadow = 'none';
        }
    }

    // 不再记录电路状态
    document.addEventListener('node-move', function(e) {
        // 节点移动事件处理，不记录状态
    });

    // 调试功能已删除
    function addDebugButton() {
        // 空函数，不添加调试按钮
    }

    // 不添加调试按钮

    // 创建延时时间输入对话框
    function showDelayTimeInput(node, x, y) {
        // 创建对话框容器
        const dialog = document.createElement('div');
        dialog.id = 'delay-time-dialog';
        dialog.style.position = 'fixed';
        dialog.style.left = `${x}px`;
        dialog.style.top = `${y}px`;
        dialog.style.backgroundColor = 'rgba(35, 41, 70, 0.95)';
        dialog.style.border = '1px solid var(--primary-color)';
        dialog.style.borderRadius = '8px';
        dialog.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
        dialog.style.zIndex = '1001';
        dialog.style.minWidth = '160px';
        dialog.style.maxWidth = '220px';
        dialog.style.backdropFilter = 'blur(5px)';
        dialog.style.animation = 'fadeIn 0.2s ease-out';
        dialog.style.overflow = 'hidden';
        dialog.style.fontSize = '12px';
        
        // 获取节点ID
        const nodeId = node.dataset.componentId || '';
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .delay-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
            }
            
            .delay-btn {
                transition: all 0.2s ease;
                min-width: 60px;
                padding: 4px 10px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
            }
            
            .menu-btn {
                display: flex;
                align-items: center;
                padding: 6px 12px;
                cursor: pointer;
                transition: all 0.2s;
                color: #fff;
                font-size: 12px;
            }
            
            .menu-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
                transform: translateX(5px);
            }
            
            .menu-btn-delete {
                color: #ff4d4f;
            }
            
            .menu-btn-delete:hover {
                background-color: rgba(255, 77, 79, 0.15);
            }
            
            .delay-input {
                background-color: rgba(60, 70, 110, 0.3);
                color: white;
                border: 1px solid rgba(127, 140, 255, 0.3);
                border-radius: 6px;
                padding: 6px 8px;
                font-size: 12px;
                width: 100%;
                box-sizing: border-box;
                transition: all 0.2s;
            }
            
            .delay-input:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(127, 140, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
        
        // 创建标题
        const title = document.createElement('div');
        title.textContent = `延时触发器 #${nodeId}`;
        title.style.padding = '4px 12px 8px 12px';
        title.style.color = 'var(--primary-color)';
        title.style.fontSize = '14px';
        title.style.fontWeight = 'bold';
        title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        title.style.marginBottom = '4px';
        
        // 添加信号状态信息
        const infoContainer = document.createElement('div');
        infoContainer.style.padding = '4px 12px 8px 12px';
        infoContainer.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        infoContainer.style.marginBottom = '4px';
        infoContainer.style.fontSize = '11px';
        infoContainer.style.color = '#ddd';
        
        // 当前设置时间文本和输出状态显示
        const outputValue = node.state && node.state.outputValues ? node.state.outputValues[0] : 'N/A';
        const isActive = node.classList.contains('active');
        
        const statusDiv = document.createElement('div');
        statusDiv.innerHTML = `<span style="color:#aaa;">输出状态:</span> <span style="color:${outputValue === 1 ? '#4caf50' : '#888'};font-weight:bold;">${outputValue}</span>`;
        statusDiv.style.marginBottom = '4px';
        infoContainer.appendChild(statusDiv);
        
        const currentTime = document.createElement('div');
        currentTime.innerHTML = `<span style="color:#aaa;">当前延时:</span> <span style="color:#4c8bf5;font-weight:bold;">${node.delayTime || 1}秒</span>`;
        currentTime.style.marginBottom = '4px';
        infoContainer.appendChild(currentTime);
        
        // 获取连接信息
        const connInfo = getNodeConnectionInfo(node);
        
        // 输入连接
        const inputsDiv = document.createElement('div');
        inputsDiv.innerHTML = `<span style="color:#aaa;">输入自:</span> ${connInfo.inputs.length > 0 ? connInfo.inputs.join(', ') : '无'}`;
        inputsDiv.style.marginBottom = '4px';
        infoContainer.appendChild(inputsDiv);
        
        // 输出连接
        const outputsDiv = document.createElement('div');
        outputsDiv.innerHTML = `<span style="color:#aaa;">输出至:</span> ${connInfo.outputs.length > 0 ? connInfo.outputs.join(', ') : '无'}`;
        infoContainer.appendChild(outputsDiv);
        
        // 创建内容容器
        const content = document.createElement('div');
        content.style.padding = '4px 12px 8px 12px';
        content.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        
        // 创建输入容器
        const inputContainer = document.createElement('div');
        inputContainer.style.marginBottom = '8px';
        
        // 创建输入标签
        const inputLabel = document.createElement('div');
        inputLabel.textContent = '设置延时时间（秒）:';
        inputLabel.style.marginBottom = '4px';
        inputLabel.style.color = '#ddd';
        inputLabel.style.fontSize = '11px';
        
        // 创建输入框
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0.1';
        input.step = '0.1';
        input.value = node.delayTime || 1;
        input.className = 'delay-input';
        
        // 添加输入框到容器
        inputContainer.appendChild(inputLabel);
        inputContainer.appendChild(input);
        
        // 创建按钮容器
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.justifyContent = 'space-between';
        buttons.style.gap = '8px';
        buttons.style.marginTop = '8px';
        
        // 创建确认按钮
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确认';
        confirmBtn.className = 'delay-btn';
        confirmBtn.style.backgroundColor = '#4c8bf5';
        confirmBtn.style.color = 'white';
        confirmBtn.style.flex = '1';
        
        confirmBtn.onclick = function() {
            // 获取输入值，并确保它是有效的正数
            const value = parseFloat(input.value);
            if (value > 0) {
                // 保存延时时间到节点状态
                node.delayTime = value;
                showToast(`延时设置为 ${value} 秒`);
                console.log(`延时触发器延时时间设置为 ${value} 秒`);
                dialog.remove();
            } else {
                showToast('延时时间必须大于0');
                input.focus();
                input.style.borderColor = '#ff4d4f';
            }
        };
        
        // 创建取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.className = 'delay-btn';
        cancelBtn.style.backgroundColor = '#555';
        cancelBtn.style.color = 'white';
        cancelBtn.style.flex = '1';
        
        cancelBtn.onclick = function() {
            dialog.remove();
        };
        
        // 组装按钮
        buttons.appendChild(confirmBtn);
        buttons.appendChild(cancelBtn);
        
        // 组装内容
        content.appendChild(inputContainer);
        content.appendChild(buttons);
        
        // 组装对话框
        dialog.appendChild(title);
        dialog.appendChild(infoContainer);
        dialog.appendChild(content);
        
        // 添加删除按钮
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'menu-btn menu-btn-delete';
        
        // 添加删除图标和文本
        const deleteIcon = document.createElement('span');
        deleteIcon.textContent = '🗑️';
        deleteIcon.style.marginRight = '8px';
        deleteIcon.style.fontSize = '12px';
        
        const deleteText = document.createElement('span');
        deleteText.textContent = '删除节点';
        
        deleteBtn.appendChild(deleteIcon);
        deleteBtn.appendChild(deleteText);
        
        deleteBtn.addEventListener('click', function() {
            // 删除与该节点有关的所有连接线
            connections = connections.filter(conn => {
                if (conn.startNode === node || conn.endNode === node) {
                    conn.element.remove(); // 从DOM中删除线条
                    return false; // 从数组中过滤掉
                }
                return true;
            });
            
            // 从节点数组中移除
            const index = nodes.indexOf(node);
            if (index > -1) {
                nodes.splice(index, 1);
            }
            
            // 移除DOM元素
            node.remove();
            
            // 重置状态
            if (selectedNode === node) {
                selectedNode = null;
            }
            if (hoveredNode === node) {
                hoveredNode = null;
            }
            
            // 如果正在连接的节点被删除，重置连接状态
            if (connectingStart === node) {
                connectingStart = null;
            }
            
            // 关闭菜单
            dialog.remove();
            
            // 显示提示
            showToast(`延时触发器已删除`);
            console.log(`节点已删除: 延时触发器`);
        });
        
        // 将删除按钮添加到对话框
        dialog.appendChild(deleteBtn);
        
        // 添加到文档
        document.body.appendChild(dialog);
        
        // 设置焦点到输入框
        setTimeout(() => {
        input.focus();
        input.select();
        }, 100);
        
        // 点击其他地方关闭对话框
        function closeOnOutsideClick(e) {
            if (!dialog.contains(e.target)) {
                dialog.remove();
                document.removeEventListener('mousedown', closeOnOutsideClick);
            }
        }
        
        // 延迟添加事件监听，避免立即触发
        setTimeout(() => {
            document.addEventListener('mousedown', closeOnOutsideClick);
        }, 100);
    }

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

    // 创建开关菜单函数
    function showSwitchMenu(node, x, y) {
        // 创建菜单容器
        const menu = document.createElement('div');
        menu.id = 'switch-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.backgroundColor = 'rgba(35, 41, 70, 0.95)';
        menu.style.border = '1px solid var(--primary-color)';
        menu.style.borderRadius = '8px';
        menu.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
        menu.style.zIndex = '1001';
        menu.style.minWidth = '160px';
        menu.style.maxWidth = '220px';
        menu.style.backdropFilter = 'blur(5px)';
        menu.style.animation = 'fadeIn 0.2s ease-out';
        menu.style.overflow = 'hidden';
        menu.style.fontSize = '12px';
        
        // 获取节点ID
        const nodeId = node.dataset.componentId || '';
        
        // 添加菜单标题
        const title = document.createElement('div');
        title.textContent = `开关触发器 #${nodeId}`;
        title.style.padding = '4px 12px 8px 12px';
        title.style.color = 'var(--primary-color)';
        title.style.fontSize = '14px';
        title.style.fontWeight = 'bold';
        title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        title.style.marginBottom = '4px';
        menu.appendChild(title);
        
        // 添加信号状态信息
        const infoContainer = document.createElement('div');
        infoContainer.style.padding = '4px 12px 8px 12px';
        infoContainer.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        infoContainer.style.marginBottom = '4px';
        infoContainer.style.fontSize = '11px';
        infoContainer.style.color = '#ddd';
        
        // 当前状态
        const isActive = node.classList.contains('active');
        const outputValue = isActive ? 1 : 0;
        const outputStateDiv = document.createElement('div');
        outputStateDiv.innerHTML = `<span style="color:#aaa;">当前状态:</span> <span style="color:${isActive ? '#4caf50' : '#888'};font-weight:bold;">${isActive ? '开启 (1)' : '关闭 (0)'}</span>`;
        outputStateDiv.style.marginBottom = '4px';
        infoContainer.appendChild(outputStateDiv);
        
        // 获取连接信息
        const connInfo = getNodeConnectionInfo(node);
        
        // 输入连接
        const inputsDiv = document.createElement('div');
        inputsDiv.innerHTML = `<span style="color:#aaa;">输入自:</span> ${connInfo.inputs.length > 0 ? connInfo.inputs.join(', ') : '无'}`;
        inputsDiv.style.marginBottom = '4px';
        infoContainer.appendChild(inputsDiv);
        
        // 输出连接
        const outputsDiv = document.createElement('div');
        outputsDiv.innerHTML = `<span style="color:#aaa;">输出至:</span> ${connInfo.outputs.length > 0 ? connInfo.outputs.join(', ') : '无'}`;
        infoContainer.appendChild(outputsDiv);
        
        menu.appendChild(infoContainer);
        
        // 创建开关状态容器
        const switchContainer = document.createElement('div');
        switchContainer.style.display = 'flex';
        switchContainer.style.justifyContent = 'space-between';
        switchContainer.style.padding = '4px 12px 8px 12px';
        switchContainer.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        switchContainer.style.gap = '8px';
        menu.appendChild(switchContainer);
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .switch-btn:hover:not([disabled]) {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
            }
            
            .switch-btn {
                transition: all 0.2s ease;
                width: 65px;
                height: 28px;
            }
            
            .menu-btn {
                display: flex;
                align-items: center;
                padding: 6px 12px;
                cursor: pointer;
                transition: all 0.2s;
                color: #fff;
                font-size: 12px;
            }
            
            .menu-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
                transform: translateX(5px);
            }
            
            .menu-btn-delete {
                color: #ff4d4f;
            }
            
            .menu-btn-delete:hover {
                background-color: rgba(255, 77, 79, 0.15);
            }
        `;
        document.head.appendChild(style);
        
        // 创建开启按钮
        const onBtn = document.createElement('button');
        onBtn.textContent = '打开';
        onBtn.className = 'switch-btn';
        onBtn.style.padding = '4px 6px';
        onBtn.style.backgroundColor = '#4caf50';
        onBtn.style.color = 'white';
        onBtn.style.border = 'none';
        onBtn.style.borderRadius = '6px';
        onBtn.style.cursor = isActive ? 'default' : 'pointer';
        onBtn.style.fontSize = '12px';
        onBtn.style.fontWeight = 'bold';
        onBtn.style.flex = '1';
        
        // 根据当前状态设置禁用状态
        if (isActive) {
            onBtn.style.opacity = '0.6';
            onBtn.disabled = true;
        }
        
        onBtn.onclick = function() {
            if (isActive) return; // 已经是开启状态，不做处理
            
            // 检查是否有输入信号为0
            const hasInputConnections = connections.some(conn => conn.endNode === node);
            const hasZeroInput = hasInputConnections ? 
                node.state.inputValues.some(v => v === 0) : false;
            
            if (hasZeroInput) {
                showToast('无法激活开关：输入信号为0');
                console.log(`开关激活失败：输入信号为0`);
                menu.remove();
                return;
            }
            
            // 添加点击效果
            onBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                // 打开开关
                node.classList.add('active');
                node.state.outputValues[0] = 1;
                console.log(`开关从关闭状态切换为打开状态，输出: 1`);
                updateSignalIndicator(node, 1);
                
                // 传播信号变化
                propagateSignal(node, new Set());
                logCircuitState();
                
                menu.remove();
                showToast('开关已开启');
            }, 100);
        };
        
        // 创建关闭按钮
        const offBtn = document.createElement('button');
        offBtn.textContent = '关闭';
        offBtn.className = 'switch-btn';
        offBtn.style.padding = '4px 6px';
        offBtn.style.backgroundColor = '#f44336';
        offBtn.style.color = 'white';
        offBtn.style.border = 'none';
        offBtn.style.borderRadius = '6px';
        offBtn.style.cursor = !isActive ? 'default' : 'pointer';
        offBtn.style.fontSize = '12px';
        offBtn.style.fontWeight = 'bold';
        offBtn.style.flex = '1';
        
        // 根据当前状态设置禁用状态
        if (!isActive) {
            offBtn.style.opacity = '0.6';
            offBtn.disabled = true;
        }
        
        offBtn.onclick = function() {
            if (!isActive) return; // 已经是关闭状态，不做处理
            
            // 添加点击效果
            offBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                // 关闭开关
                node.classList.remove('active');
                node.state.outputValues[0] = 0;
                console.log(`开关从打开状态切换为关闭状态，输出: 0`);
                updateSignalIndicator(node, 0);
                
                // 传播信号变化
                propagateSignal(node, new Set());
                logCircuitState();
                
                menu.remove();
                showToast('开关已关闭');
            }, 100);
        };
        
        // 组装开关按钮到容器
        switchContainer.appendChild(onBtn);
        switchContainer.appendChild(offBtn);
        
        // 添加删除按钮
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'menu-btn menu-btn-delete';
        
        // 添加删除图标和文本
        const deleteIcon = document.createElement('span');
        deleteIcon.textContent = '🗑️';
        deleteIcon.style.marginRight = '8px';
        deleteIcon.style.fontSize = '12px';
        
        const deleteText = document.createElement('span');
        deleteText.textContent = '删除节点';
        
        deleteBtn.appendChild(deleteIcon);
        deleteBtn.appendChild(deleteText);
        
        deleteBtn.addEventListener('click', function() {
            // 删除与该节点有关的所有连接线
            connections = connections.filter(conn => {
                if (conn.startNode === node || conn.endNode === node) {
                    conn.element.remove(); // 从DOM中删除线条
                    return false; // 从数组中过滤掉
                }
                return true;
            });
            
            // 从节点数组中移除
            const index = nodes.indexOf(node);
            if (index > -1) {
                nodes.splice(index, 1);
            }
            
            // 移除DOM元素
            node.remove();
            
            // 重置状态
            if (selectedNode === node) {
                selectedNode = null;
            }
            if (hoveredNode === node) {
                hoveredNode = null;
            }
            
            // 如果正在连接的节点被删除，重置连接状态
            if (connectingStart === node) {
                connectingStart = null;
            }
            
            // 关闭菜单
            menu.remove();
            
            // 显示提示
            showToast(`开关触发器已删除`);
            console.log(`节点已删除: 开关触发器`);
        });
        
        // 将删除按钮添加到菜单
        menu.appendChild(deleteBtn);
        
        // 添加到文档
        document.body.appendChild(menu);
        
        // 点击其他地方关闭菜单
        function closeOnOutsideClick(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('mousedown', closeOnOutsideClick);
            }
        }
        
        // 延迟添加事件监听，避免立即触发
        setTimeout(() => {
            document.addEventListener('mousedown', closeOnOutsideClick);
        }, 100);
    }

    // 获取节点连接信息的辅助函数
    function getNodeConnectionInfo(node) {
        const info = {
            inputs: [],
            outputs: []
        };
        
        // 获取输入连接
        connections.forEach(conn => {
            if (conn.endNode === node) {
                const sourceType = conn.startNode.dataset.componentType || '未知';
                const sourceId = conn.startNode.dataset.componentId || '';
                info.inputs.push(`${sourceType}${sourceId}`);
            }
        });
        
        // 获取输出连接
        connections.forEach(conn => {
            if (conn.startNode === node) {
                const targetType = conn.endNode.dataset.componentType || '未知';
                const targetId = conn.endNode.dataset.componentId || '';
                info.outputs.push(`${targetType}${targetId}`);
            }
        });
        
        return info;
    }
    
    // 显示节点右键菜单
    function showNodeContextMenu(node, x, y) {
        // 创建菜单容器
        const menu = document.createElement('div');
        menu.id = 'node-context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.backgroundColor = 'rgba(35, 41, 70, 0.95)';
        menu.style.border = '1px solid var(--primary-color)';
        menu.style.borderRadius = '8px';
        menu.style.padding = '6px 0';
        menu.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
        menu.style.zIndex = '1000';
        menu.style.minWidth = '160px';
        menu.style.maxWidth = '220px';
        menu.style.backdropFilter = 'blur(5px)';
        menu.style.animation = 'fadeIn 0.2s ease-out';
        menu.style.fontSize = '12px';
        
        // 获取节点ID
        const nodeId = node.dataset.componentId || '';
        const nodeType = node.dataset.componentType || '节点';
        
        // 添加菜单标题
        const title = document.createElement('div');
        title.textContent = `${nodeType} #${nodeId}`;
        title.style.padding = '4px 12px 8px 12px';
        title.style.color = 'var(--primary-color)';
        title.style.fontSize = '14px';
        title.style.fontWeight = 'bold';
        title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        title.style.marginBottom = '4px';
        menu.appendChild(title);
        
        // 添加信号状态信息
        const infoContainer = document.createElement('div');
        infoContainer.style.padding = '4px 12px 8px 12px';
        infoContainer.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        infoContainer.style.marginBottom = '4px';
        infoContainer.style.fontSize = '11px';
        infoContainer.style.color = '#ddd';
        
        // 输出状态
        const outputValue = node.state && node.state.outputValues ? node.state.outputValues[0] : 'N/A';
        const outputStateDiv = document.createElement('div');
        outputStateDiv.innerHTML = `<span style="color:#aaa;">输出状态:</span> <span style="color:${outputValue === 1 ? '#4caf50' : '#888'};font-weight:bold;">${outputValue}</span>`;
        outputStateDiv.style.marginBottom = '4px';
        infoContainer.appendChild(outputStateDiv);
        
        // 为标记储存装置添加控制端和数据端信息
        if (node.dataset.componentType === '标记储存装置') {
            // 端口识别状态
            const identifyStatus = node.state && node.state.portIdentified ? '已识别' : '未完成识别';
            const identifyDiv = document.createElement('div');
            identifyDiv.innerHTML = `<span style="color:#aaa;">端口识别:</span> <span style="color:${node.state && node.state.portIdentified ? '#4caf50' : '#ff5722'};font-weight:bold;">${identifyStatus}</span>`;
            identifyDiv.style.marginBottom = '4px';
            infoContainer.appendChild(identifyDiv);
            
            // 连接顺序信息
            if (node.state && node.state.connectionOrder && node.state.connectionOrder.length > 0) {
                const orderDiv = document.createElement('div');
                orderDiv.innerHTML = `<span style="color:#aaa;">连接顺序:</span> <span style="color:#9c27b0;font-weight:bold;">${node.state.connectionOrder.join(' -> ')}</span>`;
                orderDiv.style.marginBottom = '4px';
                infoContainer.appendChild(orderDiv);
            }
            
            // 控制端信息
            let controlPortText = '未确定';
            let controlSourceText = '未连接';
            
            if (node.state && node.state.controlPort !== undefined) {
                controlPortText = `端口${node.state.controlPort}`;
                controlSourceText = node.state.controlSource || '未连接';
            } else if (node.state && node.state.connectionOrder && node.state.connectionOrder.length > 0) {
                controlPortText = `端口${node.state.connectionOrder[0]}(首个连接)`;
                controlSourceText = node.state.controlSource || '未连接';
            }
            
            const controlDiv = document.createElement('div');
            controlDiv.innerHTML = `<span style="color:#aaa;">控制端(CLK):</span> <span style="color:#ff9800;font-weight:bold;">${controlPortText}</span> <span style="color:#ddd;">${controlSourceText}</span>`;
            controlDiv.style.marginBottom = '4px';
            infoContainer.appendChild(controlDiv);
            
            // 数据端信息
            let dataPortText = '未确定';
            let dataSourceText = '未连接';
            
            if (node.state && node.state.dataPort !== undefined) {
                dataPortText = `端口${node.state.dataPort}`;
                dataSourceText = node.state.dataSource || '未连接';
            } else if (node.state && node.state.connectionOrder && node.state.connectionOrder.length > 1) {
                dataPortText = `端口${node.state.connectionOrder[1]}(第二连接)`;
                dataSourceText = node.state.dataSource || '未连接';
            }
            
            const dataDiv = document.createElement('div');
            dataDiv.innerHTML = `<span style="color:#aaa;">数据端(D):</span> <span style="color:#2196f3;font-weight:bold;">${dataPortText}</span> <span style="color:#ddd;">${dataSourceText}</span>`;
            dataDiv.style.marginBottom = '4px';
            infoContainer.appendChild(dataDiv);
        }
        
        // 获取连接信息
        const connInfo = getNodeConnectionInfo(node);
        
        // 输入连接
        const inputsDiv = document.createElement('div');
        inputsDiv.innerHTML = `<span style="color:#aaa;">输入自:</span> ${connInfo.inputs.length > 0 ? connInfo.inputs.join(', ') : '无'}`;
        inputsDiv.style.marginBottom = '4px';
        infoContainer.appendChild(inputsDiv);
        
        // 输出连接
        const outputsDiv = document.createElement('div');
        outputsDiv.innerHTML = `<span style="color:#aaa;">输出至:</span> ${connInfo.outputs.length > 0 ? connInfo.outputs.join(', ') : '无'}`;
        infoContainer.appendChild(outputsDiv);
        
        menu.appendChild(infoContainer);
        
        // 创建删除按钮
        const deleteBtn = document.createElement('div');
        deleteBtn.textContent = '删除节点';
        deleteBtn.style.padding = '6px 12px';
        deleteBtn.style.color = '#ff4d4f';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.transition = 'all 0.2s';
        deleteBtn.style.display = 'flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.fontSize = '12px';
        
        // 添加删除图标
        const deleteIcon = document.createElement('span');
        deleteIcon.textContent = '🗑️';
        deleteIcon.style.marginRight = '8px';
        deleteIcon.style.fontSize = '12px';
        deleteBtn.prepend(deleteIcon);
        
        deleteBtn.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'rgba(255, 77, 79, 0.15)';
            this.style.transform = 'translateX(5px)';
        });
        
        deleteBtn.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
            this.style.transform = 'translateX(0)';
        });
        
        deleteBtn.addEventListener('click', function() {
            // 删除与该节点有关的所有连接线
            connections = connections.filter(conn => {
                if (conn.startNode === node || conn.endNode === node) {
                    conn.element.remove(); // 从DOM中删除线条
                    return false; // 从数组中过滤掉
                }
                return true;
            });
            
            // 从节点数组中移除
            const index = nodes.indexOf(node);
            if (index > -1) {
                nodes.splice(index, 1);
            }
            
            // 移除DOM元素
            node.remove();
            
            // 重置状态
            if (selectedNode === node) {
                selectedNode = null;
            }
            if (hoveredNode === node) {
                hoveredNode = null;
            }
            
            // 如果正在连接的节点被删除，重置连接状态
            if (connectingStart === node) {
                connectingStart = null;
            }
            
            // 关闭菜单
            menu.remove();
            
            // 显示提示
            showToast(`节点已删除`);
            console.log(`节点已删除: ${nodeType}`);
        });
        
        // 将删除按钮添加到菜单
        menu.appendChild(deleteBtn);
        
        // 将菜单添加到文档
        document.body.appendChild(menu);
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        // 点击其他区域关闭菜单
        function closeOnOutsideClick(e) {
            if (!menu.contains(e.target) && e.target !== node) {
                menu.remove();
                document.removeEventListener('click', closeOnOutsideClick);
            }
        }
        
        // 延迟添加点击事件，避免立即触发
        setTimeout(() => {
            document.addEventListener('click', closeOnOutsideClick);
        }, 10);
    }

    // 添加显示组件信息菜单的函数 
    function showIconInfoMenu(componentType, x, y) {
        // 移除可能存在的旧菜单
        const oldMenu = document.getElementById('icon-info-menu');
        if (oldMenu) oldMenu.remove();
        
        // 创建菜单容器
        const menu = document.createElement('div');
        menu.id = 'icon-info-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.backgroundColor = 'rgba(35, 41, 70, 0.95)';
        menu.style.border = '1px solid var(--primary-color)';
        menu.style.borderRadius = '8px';
        menu.style.padding = '10px 12px';
        menu.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
        menu.style.zIndex = '1000';
        menu.style.minWidth = '250px';
        menu.style.maxWidth = '300px';
        menu.style.backdropFilter = 'blur(5px)';
        menu.style.animation = 'fadeIn 0.2s ease-out';
        menu.style.color = '#fff';
        menu.style.fontSize = '13px';
        
        // 添加标题
        const title = document.createElement('div');
        // 如果是XOR信号器，添加（异或门）的说明
        title.textContent = componentType === 'XOR信号器' ? 'XOR信号器（异或门）' : componentType;
        title.style.fontSize = '15px';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
        title.style.paddingBottom = '5px';
        title.style.color = 'var(--primary-color)';
        menu.appendChild(title);
        
        // 添加组件描述
        const description = document.createElement('div');
        description.style.lineHeight = '1.5';
        
        // 根据组件类型设置描述文本
        switch(componentType) {
            case '开关触发器':
                description.innerHTML = '输入端和输出端都只有1个<br>未激活状态为0，开启后输出1，关闭后输出0';
                break;
            case '与门（&）':
                description.innerHTML = '输入端接口没有上限，输出端只有1个<br>只有当输入端都为1时，与门才会输出信号1';
                break;
            case '或门（OR）':
                description.innerHTML = '输入端接口没有上限，输出端只有1个<br>输入端只需要接收到一个1，或门就会输出信号1<br>当输入端全部为0时，或门才会输出0';
                break;
            case '非门（NOT）':
                description.innerHTML = '输入端和输出端都只有1个<br>输入端接收到1则输出0，反之，输入端接收到0就输出1';
                break;
            case '分支（BR）':
                description.innerHTML = '输入端接口只有1个，输出端没有上限<br>输入端接受到1就输出1，输入端接受到0就输出0';
                break;
            case '延时触发器':
                description.innerHTML = '输入端和输出端都只有1个<br>输入端接受到信号后，经过设定的延迟后发送信号到输出端<br>输入端接受到1就输出1，输入端接受到0就输出0';
                break;
            case 'XOR信号器':
                description.innerHTML = '输入端接口有2个，输出端只有1个<br>只允许输入端接受一个信号1，才会输出1';
                break;
            case '标记储存装置':
                description.innerHTML = '输入端接口有2个（一个是控制端，另一个是数据端），输出端只有1个<br>当控制端为1时，输出端直接输出控制端的信号，后面输出的信号跟随数据端的信号变化<br>当控制端为0时，输出的信号保持不变，锁存当前的状态<br>初始状态下，如果没有接收过有效输入，输出默认为0';
                break;
            case '灯':
                description.innerHTML = '只有1个输入端，没有输出端<br>输入端为1时灯亮起，输入端为0时灯熄灭<br>也可以代替游戏中的"铁门""传送门""箱子"等';
                break;
            case '跟随器':
                description.innerHTML = '输入端和输出端都只有1个<br>输入端接受到1就输出1，输入端接受到0就输出0<br>用来模拟游戏中PVE模式里的"NPC"、"防御核心装置"等';
                break;
            default:
                description.textContent = '未知组件';
        }
        
        menu.appendChild(description);
        
        // 添加到文档
        document.body.appendChild(menu);
        
        // 点击其他地方关闭菜单
        function closeOnOutsideClick(e) {
            if (!menu.contains(e.target) && e.target !== menu) {
                menu.remove();
                document.removeEventListener('mousedown', closeOnOutsideClick);
            }
        }
        document.addEventListener('mousedown', closeOnOutsideClick);
    }

    // 初始化时为左侧图标添加右键菜单
    const initSidebarIconContextMenu = function() {
        const sidebarIcons = document.querySelectorAll('.sidebar-icon');
        sidebarIcons.forEach(icon => {
            // 为左侧图标添加右键菜单
            icon.addEventListener('contextmenu', function(e) {
                e.preventDefault(); // 阻止默认右键菜单
                
                // 显示组件信息菜单
                showIconInfoMenu(icon.dataset.icon, e.clientX, e.clientY);
            });
        });
    };
    
    // 立即初始化
    initSidebarIconContextMenu();

    // 为按钮添加美观的悬停提示功能
    function createCustomTooltip() {
        // 如果已存在tooltip，直接使用它
        let existingTooltip = document.getElementById('custom-tooltip');
        if (existingTooltip) {
            return existingTooltip;
        }
        
        // 添加tooltip动画CSS
        if (!document.getElementById('tooltip-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'tooltip-styles';
            styleSheet.textContent = `
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                #custom-tooltip.arrow-top::before {
                    content: '';
                    position: absolute;
                    top: -8px;
                    left: var(--arrow-h-pos, 50%);
                    transform: translateX(-50%);
                    border-width: 0 8px 8px 8px;
                    border-style: solid;
                    border-color: transparent transparent var(--border-color) transparent;
                    z-index: 99999;
                }
                #custom-tooltip.arrow-top::after {
                    content: '';
                    position: absolute;
                    top: -6px;
                    left: var(--arrow-h-pos, 50%);
                    transform: translateX(-50%);
                    border-width: 0 7px 7px 7px;
                    border-style: solid;
                    border-color: transparent transparent var(--tooltip-color) transparent;
                    z-index: 99999;
                }
                #custom-tooltip.arrow-bottom::before {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: var(--arrow-h-pos, 50%);
                    transform: translateX(-50%);
                    border-width: 8px 8px 0 8px;
                    border-style: solid;
                    border-color: var(--border-color) transparent transparent transparent;
                    z-index: 99999;
                }
                #custom-tooltip.arrow-bottom::after {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: var(--arrow-h-pos, 50%);
                    transform: translateX(-50%);
                    border-width: 7px 7px 0 7px;
                    border-style: solid;
                    border-color: var(--tooltip-color) transparent transparent transparent;
                    z-index: 99999;
                }
            `;
            document.head.appendChild(styleSheet);
        }
        
        // 创建tooltip元素
        const tooltip = document.createElement('div');
        tooltip.id = 'custom-tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.display = 'none';
        tooltip.style.backgroundColor = 'rgba(35, 41, 70, 0.95)';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '10px 15px';
        tooltip.style.borderRadius = '8px';
        tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        tooltip.style.zIndex = '99999'; // 确保tooltip在最上层
        tooltip.style.fontSize = '14px';
        tooltip.style.maxWidth = '350px';
        tooltip.style.border = '1px solid var(--primary-color)';
        tooltip.style.backdropFilter = 'blur(5px)';
        tooltip.style.transition = 'opacity 0.2s ease-in-out';
        tooltip.style.lineHeight = '1.6';
        tooltip.style.fontWeight = '400';
        tooltip.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
        tooltip.style.animation = 'tooltipFadeIn 0.2s ease-out';
        
        // 添加小三角形指示的CSS变量
        tooltip.style.setProperty('--tooltip-color', 'rgba(35, 41, 70, 0.95)');
        tooltip.style.setProperty('--border-color', 'var(--primary-color)');
        tooltip.style.setProperty('--arrow-size', '8px');
        
        // 添加带有阴影效果的边框
        tooltip.style.boxSizing = 'border-box';
        
        document.body.appendChild(tooltip);
        return tooltip;
    }
    
    // 保存当前激活的按钮和计时器
    let activeTooltipElement = null;
    let tooltipUpdateTimer = null;
    
    // 显示自定义tooltip
    function showTooltip(element, text, event) {
        // 记录当前活动元素
        activeTooltipElement = element;
        
        const tooltip = createCustomTooltip();
        tooltip.textContent = text;
        tooltip.style.display = 'block'; // 先显示以计算尺寸
        tooltip.style.opacity = '0'; // 但保持不可见
        
        // 获取元素位置和大小
        const rect = element.getBoundingClientRect();
        
        // 计算tooltip尺寸
        const tooltipWidth = Math.min(350, Math.max(rect.width + 60, text.length * 7));
        tooltip.style.width = tooltipWidth + 'px';
        
        // 清除之前的计时器，防止多个动画重叠
        clearTimeout(tooltipUpdateTimer);
        
        // 延迟一下以确保tooltip已渲染并有正确的尺寸
        tooltipUpdateTimer = setTimeout(() => {
            // 检查当前激活的元素是否仍然是这个元素
            if (activeTooltipElement !== element) return;
            
            // 计算位置 - 优先显示在元素上方并居中，如果空间不足则显示在下方
            let top, left;
            
            // 修正箭头位置 - 确保指向按钮中心
            const arrowOffset = rect.width / 2;
            
            // 计算水平位置（居中对齐）
            left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
            
            // 确保左边界不会超出屏幕
            const minLeft = 10;
            const originalLeft = left; // 保存原始计算的left值，用于箭头定位
            left = Math.max(minLeft, left);
            
            // 确保右边界不会超出屏幕
            const maxLeft = window.innerWidth - tooltip.offsetWidth - 10;
            left = Math.min(left, maxLeft);
            
            // 计算箭头的水平偏移量，使其指向按钮中心
            const arrowLeftOffset = rect.left + (rect.width / 2) - left;
            
            // 尝试在元素上方显示
            if (rect.top > tooltip.offsetHeight + 20) {
                // 元素上方有足够空间
                top = rect.top - tooltip.offsetHeight - 15;
                // 修改箭头位置为底部
                tooltip.classList.add('arrow-bottom');
                tooltip.classList.remove('arrow-top');
                
                // 设置箭头水平位置
                tooltip.style.setProperty('--arrow-h-pos', `${arrowLeftOffset}px`);
            } else {
                // 在元素下方显示
                top = rect.bottom + 15;
                // 修改箭头位置为顶部
                tooltip.classList.add('arrow-top');
                tooltip.classList.remove('arrow-bottom');
                
                // 设置箭头水平位置
                tooltip.style.setProperty('--arrow-h-pos', `${arrowLeftOffset}px`);
            }
            
            // 设置最终位置
            tooltip.style.top = top + 'px';
            tooltip.style.left = left + 'px';
            tooltip.style.opacity = '1'; // 现在显示出来
        }, 20);
    }
    
    // 隐藏自定义tooltip
    function hideTooltip() {
        // 清除当前活动元素
        activeTooltipElement = null;
        
        const tooltip = document.getElementById('custom-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.pointerEvents = 'none'; // 立即禁用鼠标事件
            
            // 延迟隐藏，允许在按钮间切换时平滑过渡
            setTimeout(() => {
                // 如果没有活动的tooltip元素，才真正隐藏
                if (!activeTooltipElement) {
                    tooltip.style.display = 'none';
                }
            }, 200);
        }
    }
    
    // 清除所有tooltip的计时器
    function clearTooltipTimers() {
        if (window.tooltipTimers) {
            window.tooltipTimers.forEach(timer => clearTimeout(timer));
        }
        window.tooltipTimers = [];
        clearTimeout(tooltipUpdateTimer);
    }

    // 将title转换为自定义tooltip
    function setupCustomTooltips() {
        // 记录当前鼠标是否在控制面板区域内
        let isInControlPanel = false;
        
        // 为控制面板的按钮设置自定义tooltip
        const setupButtonTooltip = (button, tooltipText) => {
            if (!button) return;
            
            // 移除title属性
            const title = button.title || '';
            button.removeAttribute('title');
            
            // 每个按钮的延迟显示timer
            let showTimer;
            
            // 使用自定义tooltip替代
            button.addEventListener('mouseenter', (e) => {
                // 设置为当前在控制面板内
                isInControlPanel = true;
                
                // 清除显示计时器，但不清除隐藏计时器，避免闪烁
                clearTimeout(showTimer);
                
                // 延迟显示tooltip，防止快速滑过时闪烁
                showTimer = setTimeout(() => {
                    if (isInControlPanel) {
                        showTooltip(button, tooltipText || title, e);
                    }
                }, 80); // 缩短延迟时间，提高响应速度
                
                // 保存计时器引用
                if (!window.tooltipTimers) window.tooltipTimers = [];
                window.tooltipTimers.push(showTimer);
            });
            
            button.addEventListener('mouseleave', () => {
                // 标记鼠标离开控制面板区域
                isInControlPanel = false;
                
                // 清除显示计时器
                clearTimeout(showTimer);
                
                // 延迟隐藏tooltip，给切换按钮的时间
                setTimeout(() => {
                    // 如果鼠标不在控制面板内，才隐藏tooltip
                    if (!isInControlPanel) {
                        hideTooltip();
                    }
                }, 50);
            });
        };
        
        // 设置各按钮的tooltip
        setupButtonTooltip(
            document.getElementById('ctrl-connection-icon'), 
            '连线模式'
        );
        
        setupButtonTooltip(
            document.getElementById('clear-circuit-icon'), 
            '删除所有信号'
        );
        
        setupButtonTooltip(
            document.getElementById('reset-connections-icon'), 
            '清除连接状态'
        );
        
        setupButtonTooltip(
            document.getElementById('reset-state-icon'), 
            '重置激活状态'
        );
    }

    // 初始化按钮
    addCtrlIcon();
    setTimeout(addClearButton, 100);
    setTimeout(addResetConnectionsButton, 100);
    setTimeout(addResetStateButton, 100);
    
    // 初始化自定义tooltip (延迟执行确保按钮已创建)
    setTimeout(() => {
        setupCustomTooltips();
        
        // 确保帮助按钮不显示tooltip
        const helpButton = document.getElementById('help-icon');
        if (helpButton) {
            helpButton.removeAttribute('title');
            
            // 移除可能添加的事件监听器
            const oldHelpButton = helpButton.cloneNode(true);
            helpButton.parentNode.replaceChild(oldHelpButton, helpButton);
            
            // 重新添加点击事件
            oldHelpButton.addEventListener('click', function() {
                showHelpDialog();
            });
        }
    }, 200);

    // 添加一个更全面的退出连线模式的函数
    function forceExitConnectionMode() {
        // 重置连线模式状态
        branchMode = false;
        connectingStart = null;
        
        // 重置UI状态
        gridContainer.style.cursor = 'default';
        document.body.classList.remove('connection-mode');
        setCtrlIconActive(false);
        
        // 清除所有可能的连接相关CSS类
        document.querySelectorAll('.connecting-start').forEach(node => {
            node.classList.remove('connecting-start');
        });
        document.querySelectorAll('.selected-input, .selected-output').forEach(node => {
            node.classList.remove('selected-input', 'selected-output');
        });
        
        console.log('已强制退出连线模式');
    }

    // 初始化全局变量
    let isMobileDevice = false;
    let currentMobileMode = 'pan'; // 默认为平移模式：'pan', 'connect', 'delete', 'reset'

    // 检测设备类型
    function detectMobileDevice() {
        isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                        || window.innerWidth <= 768;
        
        // 调整UI显示
        if (isMobileDevice) {
            console.log("检测到移动设备，启用移动适配模式");
            setupMobileControls();
        } else {
            console.log("检测到桌面设备，使用标准模式");
            // 隐藏移动控制面板
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'none';
            }
        }
    }

    // 设置移动端控制
    function setupMobileControls() {
        // 确保移动控制面板存在
        const mobileControls = document.getElementById('mobile-controls');
        if (!mobileControls) return;
        
        // 获取所有控制按钮
        const panBtn = document.getElementById('mobile-pan-btn');
        const connectBtn = document.getElementById('mobile-connect-btn');
        const deleteBtn = document.getElementById('mobile-delete-btn');
        const resetBtn = document.getElementById('mobile-reset-btn');
        const helpBtn = document.getElementById('mobile-help-btn');
        
        // 设置按钮激活状态
        function setActiveMobileButton(activeBtn) {
            [panBtn, connectBtn, deleteBtn, resetBtn].forEach(btn => {
                if (btn) btn.classList.remove('active');
            });
            if (activeBtn) activeBtn.classList.add('active');
        }
        
        // 平移模式 - 默认模式
        if (panBtn) {
            panBtn.classList.add('active'); // 默认激活
            panBtn.addEventListener('click', function() {
                currentMobileMode = 'pan';
                setActiveMobileButton(panBtn);
                forceExitConnectionMode(); // 退出可能的连接模式
                showToast('平移模式：拖动屏幕移动视图');
            });
        }
        
        // 连接模式
        if (connectBtn) {
            connectBtn.addEventListener('click', function() {
                currentMobileMode = 'connect';
                setActiveMobileButton(connectBtn);
                showToast('连接模式：点击两个组件进行连接');
            });
        }
        
        // 删除模式
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                currentMobileMode = 'delete';
                setActiveMobileButton(deleteBtn);
                forceExitConnectionMode();
                showToast('删除模式：点击组件或连线删除');
            });
        }
        
        // 重置模式
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                currentMobileMode = 'reset';
                setActiveMobileButton(resetBtn);
                forceExitConnectionMode();
                
                // 弹出确认框
                if (confirm('确定要重置所有连线状态吗？')) {
                    // 重置所有连线状态
                    resetAllConnectionStates();
                    showToast('已重置所有连线状态');
                }
                
                // 重置回平移模式
                setTimeout(() => {
                    currentMobileMode = 'pan';
                    setActiveMobileButton(panBtn);
                }, 300);
            });
        }
        
        // 帮助按钮
        if (helpBtn) {
            helpBtn.addEventListener('click', function() {
                // 显示移动端专用的帮助对话框
                showMobileHelpDialog();
            });
        }
        
        // 添加移动端专用的双击操作 - 在连接模式下单击即可选择节点
        document.querySelectorAll('.node').forEach(node => {
            node.addEventListener('click', function(e) {
                if (isMobileDevice && currentMobileMode === 'connect') {
                    handleMobileNodeConnect(node);
                } else if (isMobileDevice && currentMobileMode === 'delete') {
                    // 在删除模式下，点击节点删除它
                    removeNode(node);
                }
            });
        });
    }

    // 移动端连接节点处理
    function handleMobileNodeConnect(node) {
        if (!connectingStart) {
            // 第一次点击，记录起始节点
            connectingStart = node;
            node.classList.add('connecting-start');
            showToast('已选择起始组件，请选择目标组件');
        } else if (connectingStart !== node) {
            // 第二次点击，建立连接
            createConnection(connectingStart, node);
            connectingStart.classList.remove('connecting-start');
            connectingStart = null;
            showToast('已连接组件');
        }
    }

    // 移动端专用的帮助对话框
    function showMobileHelpDialog() {
        // 创建模态对话框背景
        const modalBg = document.createElement('div');
        modalBg.style.position = 'fixed';
        modalBg.style.top = '0';
        modalBg.style.left = '0';
        modalBg.style.width = '100%';
        modalBg.style.height = '100%';
        modalBg.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modalBg.style.zIndex = '9999';
        modalBg.style.display = 'flex';
        modalBg.style.alignItems = 'center';
        modalBg.style.justifyContent = 'center';
        
        // 创建对话框内容
        const dialog = document.createElement('div');
        dialog.style.width = '85%';
        dialog.style.maxWidth = '350px';
        dialog.style.maxHeight = '80%';
        dialog.style.backgroundColor = 'var(--light-bg)';
        dialog.style.borderRadius = '16px';
        dialog.style.padding = '20px';
        dialog.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        dialog.style.overflowY = 'auto';
        dialog.style.color = '#fff';
        
        // 标题
        const title = document.createElement('h2');
        title.textContent = '移动端操作指南';
        title.style.textAlign = 'center';
        title.style.color = 'var(--secondary-color)';
        title.style.marginBottom = '15px';
        
        // 内容
        const content = document.createElement('div');
        content.innerHTML = `
            <p style="margin-bottom:12px;"><i class="fas fa-arrows-alt" style="color:var(--primary-color);margin-right:8px;"></i> <strong>平移模式</strong>：拖动屏幕移动视图</p>
            <p style="margin-bottom:12px;"><i class="fas fa-link" style="color:var(--primary-color);margin-right:8px;"></i> <strong>连接模式</strong>：依次点击两个组件进行连接</p>
            <p style="margin-bottom:12px;"><i class="fas fa-trash" style="color:var(--primary-color);margin-right:8px;"></i> <strong>删除模式</strong>：点击组件删除</p>
            <p style="margin-bottom:12px;"><i class="fas fa-redo-alt" style="color:var(--primary-color);margin-right:8px;"></i> <strong>重置模式</strong>：重置所有连线状态</p>
            <p style="margin-bottom:20px;">从左侧拖动组件到网格上创建新元素</p>
            <p style="margin-bottom:12px;"><strong>电路组件使用说明：</strong></p>
            <p style="margin-bottom:8px;">· 开关触发器：用于手动触发信号</p>
            <p style="margin-bottom:8px;">· 与门：当所有输入为1时，输出为1</p>
            <p style="margin-bottom:8px;">· 或门：当任意输入为1时，输出为1</p>
            <p style="margin-bottom:8px;">· 非门：反转输入信号</p>
            <p style="margin-bottom:8px;">· 分支：将信号分支到多个输出</p>
            <p style="margin-bottom:8px;">· 延时触发器：延迟一段时间后触发</p>
            <p style="margin-bottom:8px;">· XOR信号器：当输入不同时输出为1</p>
            <p style="margin-bottom:8px;">· 标记储存装置：存储和显示信号状态</p>
            <p style="margin-bottom:8px;">· 灯：显示当前信号状态</p>
        `;
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.display = 'block';
        closeBtn.style.margin = '20px auto 0 auto';
        closeBtn.style.padding = '8px 20px';
        closeBtn.style.backgroundColor = 'var(--secondary-color)';
        closeBtn.style.color = '#fff';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '8px';
        closeBtn.style.cursor = 'pointer';
        
        // 组装对话框
        dialog.appendChild(title);
        dialog.appendChild(content);
        dialog.appendChild(closeBtn);
        modalBg.appendChild(dialog);
        document.body.appendChild(modalBg);
        
        // 关闭事件
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(modalBg);
        });
        
        // 点击背景关闭
        modalBg.addEventListener('click', function(e) {
            if (e.target === modalBg) {
                document.body.removeChild(modalBg);
            }
        });
    }

    // 重置所有连线状态的函数
    function resetAllConnectionStates() {
        // 重置节点激活状态
        nodes.forEach(node => {
            node.classList.remove('active');
            if (node.state) {
                // 重置输入和输出状态
                if (node.state.inputValues) {
                    node.state.inputValues.fill(0);
                }
                if (node.state.outputValues) {
                    node.state.outputValues.fill(0);
                }
            }
        });
        
        // 重置连接线的激活状态
        connections.forEach(conn => {
            if (conn.element) {
                conn.element.classList.remove('active');
            }
        });
        
        // 更新UI显示
        updateNodesAndBranches();
    }

    // 移动节点的函数 - 在这个函数中处理移动端删除模式
    function removeNode(node) {
        // 检查并删除与此节点相关的所有连接
        connections = connections.filter(conn => {
            if (conn.startNode === node || conn.endNode === node) {
                // 删除相关的连接线元素
                if (conn.element && conn.element.parentNode) {
                    conn.element.parentNode.removeChild(conn.element);
                }
                return false;
            }
            return true;
        });
        
        // 从DOM中移除节点
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        
        // 从节点列表中移除
        nodes = nodes.filter(n => n !== node);
        
        showToast('已删除组件');
    }

}); 