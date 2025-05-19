document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const gridBg = document.querySelector('.grid-bg');
    const addNodeBtn = document.getElementById('add-node');
    const addBranchBtn = document.getElementById('add-branch');
    const clearBtn = document.getElementById('clear');
    const nodeColorInput = document.getElementById('node-color');
    const sidebarIcons = document.querySelectorAll('.sidebar-icon');
    
    
    createLogPanel();
    
    
    function createLogPanel() {
        
        const logPanelContainer = document.createElement('div');
        logPanelContainer.id = 'log-panel-container';
        logPanelContainer.style.position = 'fixed';
        logPanelContainer.style.right = '20px';
        logPanelContainer.style.top = '80px';
        logPanelContainer.style.width = '350px';
        logPanelContainer.style.height = 'calc(100vh - 100px)';
        logPanelContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        logPanelContainer.style.border = '1px solid #444';
        logPanelContainer.style.borderRadius = '8px';
        logPanelContainer.style.zIndex = '1000';
        logPanelContainer.style.display = 'flex';
        logPanelContainer.style.flexDirection = 'column';
        
        
        const logPanelHeader = document.createElement('div');
        logPanelHeader.id = 'log-panel-header';
        logPanelHeader.style.display = 'flex';
        logPanelHeader.style.justifyContent = 'space-between';
        logPanelHeader.style.alignItems = 'center';
        logPanelHeader.style.padding = '10px';
        logPanelHeader.style.borderBottom = '1px solid #444';
        logPanelHeader.style.color = '#fff';
        logPanelHeader.style.fontSize = '16px';
        logPanelHeader.style.fontWeight = 'bold';
        logPanelHeader.textContent = '??????';
        
        
        const logPanelActions = document.createElement('div');
        
        
        const clearLogBtn = document.createElement('button');
        clearLogBtn.textContent = '??????';
        clearLogBtn.style.padding = '5px 10px';
        clearLogBtn.style.backgroundColor = '#555';
        clearLogBtn.style.color = '#fff';
        clearLogBtn.style.border = 'none';
        clearLogBtn.style.borderRadius = '4px';
        clearLogBtn.style.cursor = 'pointer';
        clearLogBtn.onclick = function() {
            const logPanel = document.getElementById('log-panel-content');
            if (logPanel) {
                logPanel.innerHTML = '';
            }
        };
        
        
        const toggleLogBtn = document.createElement('button');
        toggleLogBtn.textContent = '???';
        toggleLogBtn.style.padding = '5px 10px';
        toggleLogBtn.style.backgroundColor = '#555';
        toggleLogBtn.style.color = '#fff';
        toggleLogBtn.style.border = 'none';
        toggleLogBtn.style.borderRadius = '4px';
        toggleLogBtn.style.marginLeft = '5px';
        toggleLogBtn.style.cursor = 'pointer';
        toggleLogBtn.onclick = function() {
            const logPanel = document.getElementById('log-panel-content');
            if (logPanel.style.display === 'none') {
                logPanel.style.display = 'block';
                toggleLogBtn.textContent = '???';
                logPanelContainer.style.height = 'calc(100vh - 100px)';
            } else {
                logPanel.style.display = 'none';
                toggleLogBtn.textContent = '???';
                logPanelContainer.style.height = 'auto';
            }
        };
        
        
        logPanelActions.appendChild(clearLogBtn);
        logPanelActions.appendChild(toggleLogBtn);
        
        
        logPanelHeader.appendChild(logPanelActions);
        
        
        const logPanelContent = document.createElement('div');
        logPanelContent.id = 'log-panel-content';
        logPanelContent.style.flex = '1';
        logPanelContent.style.padding = '10px';
        logPanelContent.style.overflowY = 'auto';
        logPanelContent.style.color = '#ddd';
        logPanelContent.style.fontSize = '14px';
        logPanelContent.style.fontFamily = 'monospace';
        
        
        logPanelContainer.appendChild(logPanelHeader);
        logPanelContainer.appendChild(logPanelContent);
        
        
        
        
        const originalConsoleLog = console.log;
        console.log = function() {
            
            originalConsoleLog.apply(console, arguments);
            
            
            const logPanel = document.getElementById('log-panel-content');
            if (logPanel) {
                
                logEntry.style.marginBottom = '5px';
                logEntry.style.borderBottom = '1px solid #333';
                logEntry.style.paddingBottom = '5px';
                
                
                const now = new Date();
                const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                                now.getMinutes().toString().padStart(2, '0') + ':' +
                                now.getSeconds().toString().padStart(2, '0') + '.' +
                                now.getMilliseconds().toString().padStart(3, '0');
                
                
                timestamp.style.color = '#888';
                timestamp.style.marginRight = '5px';
                timestamp.textContent = `[${timeStr}]`;
                logEntry.appendChild(timestamp);
                
                
                const content = document.createElement('span');
                
                const message = Array.from(arguments).map(arg => {
                    return (typeof arg === 'object') ? JSON.stringify(arg) : String(arg);
                }).join(' ');
                
                
                if (message.includes('???') || message.includes('???') || message.includes('???')) {
                    content.style.color = '#ff6b6b'; 
                } else if (message.includes('???') || message.includes('???????1')) {
                    content.style.color = '#69db7c'; 
                } else if (message.includes('???') || message.includes('?????????')) {
                    content.style.color = '#4dabf7'; 
                } else if (message.includes('????????')) {
                    content.style.color = '#ffd43b'; 
                } else if (message.includes('???')) {
                    content.style.color = '#ae3ec9'; 
                }
                
                content.textContent = message;
                logEntry.appendChild(content);
                
                
                
                
            }
        };
    }
    
    
    function logCircuitState() {
        console.log('========= ??????????=========');
        
        
        nodes.forEach((node, index) => {
            if (!node.dataset.componentType) return;
            
            const type = node.dataset.componentType;
            const inputs = node.state ? node.state.inputValues : [];
            const outputs = node.state ? node.state.outputValues : [];
            const isActive = node.classList.contains('active');
            
            console.log(`???${index} [${type}]: ????${isActive}, ???=[${inputs.join(',')}], ???=[${outputs.join(',')}]`);
        });
        
        
        connections.forEach((conn, index) => {
            if (!conn.startNode || !conn.endNode) return;
            
            const startType = conn.startNode.dataset.componentType || '???';
            const endType = conn.endNode.dataset.componentType || '???';
            const inputIndex = conn.inputIndex;
            
            console.log(`???${index}: [${startType}] -> [${endType}], ??????=${inputIndex}`);
        });
        
        console.log('========= ??????????=========');
    }
    
    
    let nodes = [];
    let branches = [];
    let isDragging = false;
    let isPanning = false;
    let currentNode = null;
    let nodeMode = false;
    let branchMode = false;
    let branchStart = null;
    let branchStartPort = null;  
    let currentColor = nodeColorInput.value;
    let panStart = { x: 0, y: 0 };
    let panOffset = { x: 0, y: 0 };
    
    window.panOffset = panOffset;
    let lastPan = { x: 0, y: 0 };
    const gridSize = 48; 
    let dragIconSrc = null;
    let circuitRunning = false;  
    
    
    let connections = []; 
    
    const componentLogic = {
        '????????': {
            inputs: 1,  
                
                
                
                    
                    if (node && node.classList.contains('active')) {
                        console.log(`??????????????????????????????);
                        
                        requestAnimationFrame(() => {
                            node.classList.remove('active');
                            node.state.outputValues[0] = 0;
                        });
                    }
                    return 0; 
                }
                
                
                
                if (!node || !node.classList.contains('active')) {
                    console.log(`??????????????????????: 0`);
                    return 0;
                }
                
                
                    const result = validInputs[0] ? 1 : 0;
                    console.log(`?????????????????????????: [${validInputs.join(', ')}], ???: ${result}`);
                    return result;
                }
                
                
                console.log(`????????????????????????????: 1`);
                return 1;
            }
        },
        '??: {
            inputs: 1,
            outputs: 0, 
            process: function(inputs, node) {
                
                
                
                
                console.log(`???????? [${validInputs.join(', ')}], ???? ${isOn ? '?? : '??}`);
                
                
                if (node && node.querySelector('.node-icon-img')) {
                    const imgEl = node.querySelector('.node-icon-img');
                    
                    if (isOn) {
                        
                        node.classList.add('active');
                    } else {
                        
                        imgEl.src = 'PNG/??png';
                        node.classList.remove('active');
                    }
                }
                
                return 0; 
        },
        '????????: {
            inputs: 1,
            outputs: 1,
            process: function(inputs, node) {
                
                
                
                if(validInputs.length === 0) return 0;
                
                if(validInputs[0]) {
                    
                        node.processingDelay = true;
                        
                        
                        console.log(`???????????????????{delayTime/1000}??????`);
                        
                        setTimeout(() => {
                            node.state.outputValues[0] = 1;
                            node.classList.add('active');
                            console.log(`???????????${delayTime/1000}?????????????`);
                            propagateSignal(node);
                            node.processingDelay = false;
                        }, delayTime);
                    }
                    return 0; 
                console.log(`???????????????????`);
                return 0;
            }
        },
        '???????: {
            inputs: Infinity, 
            outputs: 1,
            process: function(inputs, node) {
                
                
                
                
                console.log(`??????: ?????????: ${connectedInputs.length}`);
                
                
                if(connectedInputs.length === 0) {
                    console.log('??????: ???????????????0');
                    return 0;
                }
                
                
                let allConnectedInputsAreOne = true;
                let connectedValues = [];
                
                
                    const inputIndex = conn.inputIndex;
                    const inputValue = inputs[inputIndex];
                    connectedValues.push(inputValue);
                    
                    if(inputValue !== 1) {
                        allConnectedInputsAreOne = false;
                    }
                });
                
                
                const result = allConnectedInputsAreOne ? 1 : 0;
                
                
                console.log(`??????: ??????????????1? ${allConnectedInputsAreOne}, ??????? ${result}`);
                
                return result;
            }
        },
        'XOR?????: {
            inputs: 2,
            outputs: 1,
            process: function(inputs) {
                
                
                
                if(validInputs.length < 2) return 0;
                
                
                const result = (validInputs[0] ? 1 : 0) ^ (validInputs[1] ? 1 : 0);
                console.log(`XOR??????????? [${validInputs.join(', ')}], ???: ${result}`);
                return result;
            }
        },
        '?????R??: {
            inputs: Infinity,
            outputs: 1,
            process: function(inputs) {
                
                
                
                if(validInputs.length === 0) return 0;
                
                
                const result = validInputs.some(val => val === 1) ? 1 : 0;
                console.log(`?????????: [${validInputs.join(', ')}], ???: ${result}`);
                return result;
            }
        },
        '?????OT??: {
            inputs: 1,
            outputs: 1,
            process: function(inputs) {
                
                
                
                if(validInputs.length === 0) return 1;
                
                
                const result = validInputs[0] ? 0 : 1;
                console.log(`?????????: [${validInputs.join(', ')}], ???: ${result}`);
                return result;
            }
        },
        '?????R??: {
            inputs: 1,
            outputs: Infinity, 
                
                
                
                if(validInputs.length === 0) return 0;
                
                
                console.log(`?????????: [${validInputs.join(', ')}], ???: ${result}`);
                return result;
            }
        },
        '?????????': {
            inputs: 2,  
            process: function(inputs, node) {
                
                
                
                if(validInputs.length === 0) {
                    console.log(`??????????????????: 0`);
                    return 0;
                }
                
                
                    
                        if (inputs[i] !== undefined) {
                            node.state.controlPort = i;
                            node.state.controlPortIdentified = true;
                            console.log(`???????????????????????? ${i}`);
                            break;
                        }
                    }
                }
                
                
                if (node.state.controlPortIdentified) {
                    const controlInput = inputs[node.state.controlPort];
                    
                    
                    for (let i = 0; i < inputs.length; i++) {
                        if (i !== node.state.controlPort && inputs[i] !== undefined) {
                            dataInput = inputs[i];
                            break;
                        }
                    }
                    
                    
                    if (controlInput === 0) {
                        console.log(`???????????????0?????????????????: 0`);
                        return 0;
                    }
                    
                    
                        console.log(`???????????????1???????? ${dataInput}????? ${dataInput}`);
                        return dataInput;
                    } else {
                        console.log(`???????????????1????????????????? 0`);
                        return 0;
                    }
                }
                
                
                console.log(`????????????????????????? 0`);
                return 0;
            },
            reset: function(node) {
                
                node.state.controlPortIdentified = false;
                node.state.controlPort = undefined;
                console.log(`?????????????????????????????`);
                return 0;
            }
        }
    };
    
    
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
    
    
    function updateColorTheme(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        currentColor = color;
    }
    
    
        const node = document.createElement('div');
        if (iconSrc) {
            node.className = 'node node-icon-card';
            node.dataset.componentType = iconType;

            
                inputValues: [],
                outputValues: [],
                stored: false
            };
            
            if(componentLogic[iconType]) {
                const logic = componentLogic[iconType];
                
                
                if (iconType === '????????') {
                    node.state.inputValues = new Array(logic.inputs === Infinity ? 2 : logic.inputs).fill(undefined);
                    node.state.outputValues = new Array(logic.outputs === Infinity ? 2 : logic.outputs).fill(0);
                    node.state.outputValues[0] = 0;
                    node.classList.remove('active');
                    console.log(`???????????????????????????? 0?????????`);
                } else {
                    
                    node.state.outputValues = new Array(logic.outputs === Infinity ? 2 : logic.outputs).fill(0);
                }
                
                
                    node.state.controlPortIdentified = false; 
                    node.state.controlPort = undefined;       
                }
                
                
                    const signalIndicator = document.createElement('div');
                    signalIndicator.className = 'signal-indicator';
                    signalIndicator.textContent = '0'; 
                    
                    
                    signalIndicator.style.position = 'absolute';
                    signalIndicator.style.top = '-18px'; 
                    signalIndicator.style.transform = 'translateX(-50%)';
                    signalIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                    signalIndicator.style.color = 'white';
                    signalIndicator.style.padding = '2px 8px';
                    signalIndicator.style.borderRadius = '10px';
                    signalIndicator.style.fontSize = '12px';
                    signalIndicator.style.fontWeight = 'bold';
                    signalIndicator.style.zIndex = '5';
                    signalIndicator.style.userSelect = 'none';
                    signalIndicator.style.pointerEvents = 'none'; 
                    
                    node.appendChild(signalIndicator);
                    node.signalIndicator = signalIndicator; 
                }
            }
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
        
        
        node.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('port')) {
                e.stopPropagation();
                return;
            }
            e.stopPropagation();
            if (branchMode) {
                
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
        
        
        
        gridContainer.appendChild(node);
        nodes.push(node);
        return node;
    }
    
    
    function updateNodesAndBranches() {
        
        const updates = [];
        
        
            updates.push(() => {
                node.style.left = `${parseInt(node.dataset.x) + panOffset.x}px`;
                node.style.top = `${parseInt(node.dataset.y) + panOffset.y}px`;
                node.style.zIndex = '1'; 
            });
        });
        
        
        connections.forEach(conn => {
            updates.push(() => updateConnectionPosition(conn));
        });
        
        
        connections.forEach(conn => {
            if (conn.element && conn.element.parentNode === gridContainer) {
                updates.push(() => {
                    
                        gridContainer.insertBefore(conn.element, gridContainer.firstChild);
                    }
                });
            }
        });
        
        
        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
    }
    
    
    gridContainer.addEventListener('mousemove', function(e) {
        if (branchMode && connectStartPort) {
            

        if (isDragging && currentNode) {
            
            const rect = gridContainer.getBoundingClientRect();
            const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
            const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
            
            
            if (parseInt(currentNode.dataset.x) !== x || parseInt(currentNode.dataset.y) !== y) {
                
                const isValidPosition = !nodes.some(node => {
                    if (node === currentNode) return false; 
                    
                    const nodeX = parseInt(node.dataset.x);
                    const nodeY = parseInt(node.dataset.y);
                    
                    const gridSizeValue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
                    const minDistance = gridSizeValue * 1.5; 
                    const distance = Math.sqrt(Math.pow(nodeX - x, 2) + Math.pow(nodeY - y, 2));
                    
                    return distance < minDistance;
                });
                
                if (isValidPosition) {
                    
                    showSnapPoint(x + 20, y + 20);
                    setTimeout(hideSnapPoint, 800);
                    currentNode.dataset.x = x;
                    currentNode.dataset.y = y;
                    
                    
                    
                    
                    requestAnimationFrame(() => {
                        updateNodesAndBranches();
                        
                        
                            detail: { node: currentNode }
                        }));
                    });
                } else {
                    
                    currentNode.classList.add('invalid-position');
                }
            }
        } else if (isPanning) {
            
            const deltaX = e.clientX - panStart.x;
            const deltaY = e.clientY - panStart.y;
            
            
            if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                panOffset.x = lastPan.x + deltaX;
                panOffset.y = lastPan.y + deltaY;
                
                
                window.panOffset = panOffset;
                
                
                requestAnimationFrame(() => {
                    updatePan();
                    
                    
                        detail: { panOffset: panOffset }
                    }));
                });
            }
        }
    });
    
    
    function setupNodeEvents() {
        
            if(node.dataset.componentType === '????????') {
                toggleSwitch(node);
                return true;
            } else if(node.dataset.componentType === '?????????') {
                resetStorage(node);
                return true;
            }
            return false;
        };
        
        
        document.addEventListener('click', function(e) {
            const node = e.target.closest('.node');
            if (!node) return;
            
            
            if (node.dataset.componentType === '??) return;
            
            const now = Date.now();
            if (!node.lastClickTime) {
                node.lastClickTime = now;
                return;
            }
            
            
            if (now - node.lastClickTime < 300) {
                handleNodeDoubleClick(node);
                e.stopPropagation(); 
                node.lastClickTime = 0; 
                node.lastClickTime = now;
            }
        });
        
        
            const node = e.target.closest('.node');
            if (!node) return;
            
            
                e.preventDefault(); 
                
                
                const existingDialog = document.getElementById('delay-time-dialog');
                if (existingDialog) {
                    existingDialog.remove();
                }
                
                
            }
        });
    }
    
    
    function toggleSwitch(node) {
        if(!node.state) return;
        
        
        
        
        
            node.state.inputValues.some(v => v === 0) : false;
        
        
        
        console.log(`?????????? ???????${currentActive ? '???? : '???'}, ????????${hasInputConnections}, ????????=${hasZeroInput}`);
        
        
            
                showToast('???????????????????');
                console.log(`???????????????????`);
                return; 
            
            
            node.state.outputValues[0] = 1; 
            console.log(`???????????????????????????: 1`);
            
            
        } else {
            
            node.state.outputValues[0] = 0; 
            console.log(`???????????????????????????: 0`);
            
            
        }
        
        
        console.log(`????????????? ${relatedConnections.length}`);
        
        
            const endNode = conn.endNode;
            const isActive = node.classList.contains('active');
            const signalValue = isActive ? 1 : 0;
            
            if(endNode.dataset.componentType === '???????) {
                
                console.log(`????????????[${conn.inputIndex}]??{signalValue}`);
            } else {
                
            }
            
            
            processNodeLogic(endNode, new Set());
        });
        
        
        
        
        requestAnimationFrame(() => {
            
                
                propagateSignal(node, new Set());
            }, 0);
        });
    }
    
    
        if(!node.state || !node.dataset.componentType) return;
        
        const logic = componentLogic[node.dataset.componentType];
        if(logic && logic.reset) {
            node.state.outputValues[0] = logic.reset(node);
            
            
            if(node.state.outputValues[0]) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
            
            
            propagateSignal(node);
        }
    }
    
    
    function propagateSignal(startNode, visited = new Set()) {
        if (visited.has(startNode)) return;
        visited.add(startNode);
        
        
        const connectedLines = connections.filter(conn => 
            conn.startNode === startNode || conn.endNode === startNode
        );
        
        
        
        
            for (let conn of connectedLines) {
                let outputNode, inputNode, inputIndex = 0;
                
                
                    
                    outputNode = startNode;
                    inputNode = conn.endNode;
                    inputIndex = conn.inputIndex || 0;
                } else if (startNode === conn.endNode) {
                    
                        
                        inputNode = conn.startNode;
                        inputIndex = 0; 
                    } else {
                        
                    }
                }
                
                
                    const signalValue = outputNode.state.outputValues[0];
                    
                    
                    if (inputNode.dataset.componentType === '???????) {
                        inputNode.state.inputValues[inputIndex] = signalValue;
                    } else {
                        inputNode.state.inputValues[0] = signalValue;
                    }
                    
                    
                    processNodeLogic(inputNode, visited);
                }
                
                
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
        };
        
        processConnections();
    }
    
    
    function processNodeLogic(node, visited = new Set()) {
        if(!node.state || !node.dataset.componentType) return;
        
        const logic = componentLogic[node.dataset.componentType];
        if(!logic) return;
        
        console.log(`?????????: ${node.dataset.componentType}, ?????[${node.state.inputValues.join(',')}]`);
        
        
            const result = logic.process(node.state.inputValues, node);
            node.state.outputValues[0] = result;
            if(result) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
            
            
            return;
        }
        
        
            logic.process(node.state.inputValues, node);
            
            return; 
        
        
        
        
        const result = logic.process(node.state.inputValues, node);
        node.state.outputValues[0] = result;
        
        console.log(`${node.dataset.componentType}??????: ???=${result}, ?????${result ? '???? : '?????}`);
        
        
            
            node.classList.add('active');
        } else {
            node.classList.remove('active');
        }
        
        
        
        
        if (prevOutput !== result) {
            console.log(`${node.dataset.componentType}????????{prevOutput}???${result}???????????);
            
            
                
                const connectedNodes = connections.filter(conn => conn.startNode === node)
                    .map(conn => conn.endNode);
                
                console.log(`????????{connectedNodes.length}????????);
                
                
                    
                    console.log(`????????????${endNode.dataset.componentType}??????${result}`);
                    
                    
                        const lightLogic = componentLogic['??];
                        if(lightLogic) {
                            lightLogic.process(endNode.state.inputValues, endNode);
                            console.log(`??????${result}???????????`);
                            
                        }
                    } else {
                        
                        processNodeLogic(endNode, visited);
                    }
                });
            }
            
            
            requestAnimationFrame(() => {
                setTimeout(() => {
                    propagateSignal(node, visited);
                }, 0);
            });
        }
    }
    
    
        if (branchMode && connectStartPort) {
            

        if (isDragging && currentNode) {
            
            const rect = gridContainer.getBoundingClientRect();
            const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
            const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
            
            
            const isValidPosition = !nodes.some(node => {
                if (node === currentNode) return false; 
                
                const nodeX = parseInt(node.dataset.x);
                const nodeY = parseInt(node.dataset.y);
                
                const gridSizeValue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
                const minDistance = gridSizeValue * 1.5; 
                const distance = Math.sqrt(Math.pow(nodeX - x, 2) + Math.pow(nodeY - y, 2));
                
                return distance < minDistance;
            });
            
            if (isValidPosition) {
                
                showSnapPoint(x + 20, y + 20);
                setTimeout(hideSnapPoint, 800);
                currentNode.dataset.x = x;
                currentNode.dataset.y = y;
                
                
            } else {
                
                currentNode.classList.add('invalid-position');
            }
            
            
            updateNodesAndBranches();
            
            
                detail: { node: currentNode }
            }));
        } else if (isPanning) {
            
            const deltaX = e.clientX - panStart.x;
            const deltaY = e.clientY - panStart.y;
            panOffset.x = lastPan.x + deltaX;
            panOffset.y = lastPan.y + deltaY;
            
            
            window.panOffset = panOffset;
            
            
                detail: { panOffset: panOffset }
            }));
            
            updatePan();
        }
    });
    
    function updatePan() {
        
        if (gridBg) {
            gridBg.style.backgroundPosition = `${panOffset.x % gridSize}px ${panOffset.y % gridSize}px`;
        }
        
        window.panOffset = panOffset;
        
        
        document.dispatchEvent(new CustomEvent('pan-update', {
            detail: { panOffset: panOffset }
        }));
        
        
        console.log(`?????????: x=${panOffset.x}, y=${panOffset.y}`);
        
        updateNodesAndBranches();
    }
    
    function updateNodesAndBranches() {
        
        nodes.forEach(node => {
            node.style.left = `${parseInt(node.dataset.x) + panOffset.x}px`;
            node.style.top = `${parseInt(node.dataset.y) + panOffset.y}px`;
            node.style.zIndex = '1'; 
        });
        
        
        connections.forEach(conn => {
            updateConnectionPosition(conn);
        });
        
        
        connections.forEach(conn => {
            if (conn.element && conn.element.parentNode === gridContainer) {
                
                    gridContainer.insertBefore(conn.element, gridContainer.firstChild);
                }
            }
        });
    }
    
    
        isPanning = false;
        
        if(branchMode && branchStart && !e.target.closest('.node')) {
            branchStart.classList.remove('connecting-start');
            branchStart = null;
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
        
        
            connectingStart.classList.remove('connecting-start');
            connectingStart = null;
        }
        
        addBranchBtn.classList.toggle('active', branchMode);
        addNodeBtn.classList.remove('active');
        gridContainer.style.cursor = branchMode ? 'pointer' : 'default';
        
        console.log('??????: ' + (branchMode ? '???? : '???'));
    });
    
    clearBtn.addEventListener('click', () => {
        
        nodes.forEach(node => node.remove());
        nodes = [];
        
        
        connections = [];
        
        
        branchMode = false;
        
        if (connectingStart) {
            connectingStart.classList.remove('connecting-start');
            connectingStart = null;
        }
        
        addNodeBtn.classList.remove('active');
        addBranchBtn.classList.remove('active');
        
        console.log('??????????);
    });
    
    nodeColorInput.addEventListener('input', () => {
        updateColorTheme(nodeColorInput.value);
        updateNodesAndBranches();
    });
    
    
        return Math.floor(value / gridSize) * gridSize + gridSize / 2 - 20; 
    }

    
        console.log('Setting up drag and drop...');
        
        
        warningCursor.className = 'warning-cursor';
        warningCursor.innerHTML = '??;
        warningCursor.style.display = 'none';
        warningCursor.style.position = 'absolute';
        warningCursor.style.color = 'red';
        warningCursor.style.fontSize = '24px';
        warningCursor.style.pointerEvents = 'none';
        warningCursor.style.zIndex = '1000';
        warningCursor.style.marginLeft = '10px';
        warningCursor.style.marginTop = '-10px';
        document.body.appendChild(warningCursor);
        
        
        const sidebarIcons = document.querySelectorAll('.sidebar-icon');
        sidebarIcons.forEach(icon => {
            icon.draggable = true;
            
            icon.addEventListener('dragstart', function(e) {
                console.log('DRAG START:', icon.dataset.icon);
                
                e.dataTransfer.setData('icon-type', icon.dataset.icon);
                e.dataTransfer.setData('icon-src', icon.src);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
        
        
        
        
        gridContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            
            
            const rect = gridContainer.getBoundingClientRect();
            const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
            const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
            
            
            
            
            warningCursor.style.display = 'block';
            warningCursor.style.left = (e.clientX + 10) + 'px';
            warningCursor.style.top = (e.clientY - 10) + 'px';
            
            
            if (isValidPosition) {
                e.dataTransfer.dropEffect = 'copy';
                warningCursor.style.display = 'none';
            } else {
                e.dataTransfer.dropEffect = 'none';
                warningCursor.style.display = 'block';
            }
        });

        
        gridContainer.addEventListener('dragenter', function(e) {
            e.preventDefault();
        });
        
        
            warningCursor.style.display = 'none';
        });
        
        
        gridContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            
            warningCursor.style.display = 'none';
            
            console.log('DROP EVENT TRIGGERED');
            
            
            const iconSrc = e.dataTransfer.getData('icon-src');
            
            console.log('Dropped icon:', iconType, iconSrc);
            
            if (iconType && iconSrc) {
                
                const rect = gridContainer.getBoundingClientRect();
                const x = snapToGridCellCenter(e.clientX - rect.left - panOffset.x);
                const y = snapToGridCellCenter(e.clientY - rect.top - panOffset.y);
                
                
                if (checkValidPosition(x, y)) {
                    console.log('Creating node at:', x, y);
                    
                    console.log('Node created:', newNode);
                } else {
                    console.log('Invalid position - too close to another node');
                }
            }
        });
        
        
            const gridSizeValue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
            const minDistance = gridSizeValue * 1.5; 
            
            
            return !nodes.some(node => {
                const nodeX = parseInt(node.dataset.x);
                const nodeY = parseInt(node.dataset.y);
                const distance = Math.sqrt(Math.pow(nodeX - x, 2) + Math.pow(nodeY - y, 2));
                return distance < minDistance;
            });
        }
        
        console.log('Drag and drop setup complete');
    }

    

    

    
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 17 && !branchMode) {
                branchMode = true;
                gridContainer.style.cursor = 'pointer';
                document.body.classList.add('connection-mode');
                setCtrlIconActive(true);
            }
            
            if ((e.keyCode === 46 || e.keyCode === 8) && (selectedNode || hoveredNode)) {
                const nodeToDelete = selectedNode || hoveredNode;
                if (nodeToDelete) {
                    
                    connections = connections.filter(conn => {
                        if (conn.startNode === nodeToDelete || conn.endNode === nodeToDelete) {
                            conn.element.remove(); 
                        return true;
                    });
                    
                    
                    const index = nodes.indexOf(nodeToDelete);
                    if (index > -1) {
                        nodes.splice(index, 1);
                    }
                    
                    
                    nodeToDelete.remove();
                    
                    
                    hoveredNode = null;
                    
                    
                        connectingStart = null;
                    }
                }
            }
        });

        document.addEventListener('keyup', function(e) {
            if (e.keyCode === 17) {
                branchMode = false;
                connectingStart = null;
                gridContainer.style.cursor = 'default';
                document.body.classList.remove('connection-mode');
                setCtrlIconActive(false);
                document.querySelectorAll('.connecting-start').forEach(node => {
                    node.classList.remove('connecting-start');
                });
                document.querySelectorAll('.selected-input, .selected-output').forEach(node => {
                    node.classList.remove('selected-input', 'selected-output');
                });
            }
        });

        
        gridContainer.addEventListener('mouseover', function(e) {
            
            if (e.target.classList.contains('node') || e.target.closest('.node')) {
                const node = e.target.classList.contains('node') ? e.target : e.target.closest('.node');
                
                
                
                
                if (!node.classList.contains('selected')) {
                    node.classList.add('hovered');
                }
            }
        });

        
        gridContainer.addEventListener('mouseout', function(e) {
            
                const node = e.target.classList.contains('node') ? e.target : e.target.closest('.node');
                
                
                if (node === hoveredNode) {
                    node.classList.remove('hovered');
                    hoveredNode = null;
                }
            }
        });

        
        gridContainer.addEventListener('click', function(e) {
            
                return; 
            
            if (e.target.classList.contains('node') || e.target.closest('.node')) {
                const node = e.target.classList.contains('node') ? e.target : e.target.closest('.node');
                
                
                
                
                selectedNode = node;
                node.classList.add('selected');
                node.classList.remove('hovered');  
            } else {
                
                if (selectedNode) {
                    selectedNode.classList.remove('selected');
                    selectedNode = null;
                }
            }
        });
    }

    
    setupNodeSelection();

    
    function setupPortConnections() {
        
        console.log('Port connection handling delegated to connection.js');
    }

    
    function createBranch(startNode, endNode, startPort, endPort, highlight = false) {
        
        if (window.connectionAPI && typeof window.connectionAPI.createConnection === 'function') {
            return window.connectionAPI.createConnection(startNode, endNode, startPort, endPort);
        }
        
        console.log('Connection API not available, cannot create connection');
        return null;
    }

    

    
    gridContainer.addEventListener('click', function(e) {
        
        
        console.log('??????????????????');
        
        
        const node = clickedElement.closest('.node');
        
        if (!node) {
            
            if (connectingStart) {
                connectingStart.classList.remove('connecting-start');
                connectingStart = null;
                console.log('?????? - ?????????');
            }
            return;
        }
        
        
            
                showToast('??????????????????????????);
                console.log('?????? - ???????????);
                return;
            }
            
            
            connectingStart = node;
            node.classList.add('connecting-start');
            console.log('?????????:', node.dataset.componentType || '???????);
        } 
        else if (node !== connectingStart) {
            
            const existingConnection = connections.find(conn => 
                (conn.startNode === connectingStart && conn.endNode === node) ||
                (conn.startNode === node && conn.endNode === connectingStart)
            );
            
            if (existingConnection) {
                
                
                
                existingConnection.element.remove();
                
                
                if (connectionIndex !== -1) {
                    connections.splice(connectionIndex, 1);
                }
                
                
                    
                    console.log(`?????? ${existingConnection.endNode.dataset.componentType} ???????${existingConnection.inputIndex}]`);
                    
                    
                    processNodeLogic(existingConnection.endNode, new Set());
                }
                
                showToast('????????);
                logCircuitState();
            } else {
                
                          connectingStart.dataset.componentType || '???', 
                          '->', 
                          node.dataset.componentType || '???');
                const result = createConnection(connectingStart, node);
            }
            
            
            connectingStart = null;
        }
        else {
            
            connectingStart = null;
            console.log('?????? - ?????????');
        }
    });

    
        if (!node || !node.dataset || !node.dataset.componentType) return 'unknown';
        
        const componentType = node.dataset.componentType;
        
        
            componentType === '?????R?? || 
            componentType === '??????? || 
            componentType === 'XOR????? || 
            componentType === '?????R?? ||
            componentType === '????????') return 'output';
        
        
        
        
            componentType === '?????????') {
            return 'both';
        }
        
        return 'unknown';
    }

    function createConnection(startNode, endNode) {
        
        if (startNode.dataset.componentType === '??) {
            showToast('????????????????????????');
            console.log('?????????: ??????????????);
            return null;
        }
        
        let startType = getPortType(startNode);
        let endType = getPortType(endNode);
        
        
            
                startType = 'output';
            }
            
                startType = 'input';
            }
            
            else if (endType === 'both') {
                startType = 'output';
                endType = 'input';
            }
        }
        else if (endType === 'both') {
            
                endType = 'output';
            }
            
                endType = 'input';
            }
        }
        
        
        if (startNode.dataset.componentType === '??????? && endNode.dataset.componentType === '????????') {
            startType = 'output';
            endType = 'input';
            console.log('????????????????????');
        }
        
        
        if (startType !== 'output' || endType !== 'input') {
            showToast('???????????????????????);
            console.log(`??????: ${startNode.dataset.componentType}(${startType}) -> ${endNode.dataset.componentType}(${endType})`);
            return null;
        }
        
        
            showToast('???????????????????????);
            return null;
        }
        
        
        if (endNode.dataset.componentType === '??) {
            if (connections.some(conn => conn.endNode === endNode)) {
                showToast('?????????????????');
                return null;
            }
        }
        
        if (endNode.dataset.componentType === '?????OT??) {
            if (connections.some(conn => conn.endNode === endNode)) {
                showToast('??????????????????');
                return null;
            }
        }
        
        if (endNode.dataset.componentType === 'XOR?????) {
            const inputConnections = connections.filter(conn => conn.endNode === endNode);
            if (inputConnections.length >= 2) {
                showToast('XOR????????????2?????????');
                return null;
            }
        }
        
        if (endNode.dataset.componentType === '????????) {
            if (connections.some(conn => conn.endNode === endNode)) {
                showToast('???????????????????????');
                return null;
            }
        }
        
        if (endNode.dataset.componentType === '?????????') {
            const inputConnections = connections.filter(conn => conn.endNode === endNode);
            if (inputConnections.length >= 2) {
                showToast('?????????????????2?????????');
                return null;
            }
            
            
        }
        
        if (endNode.dataset.componentType === '?????R??) {
            if (connections.some(conn => conn.endNode === endNode)) {
                showToast('??????????????????');
                return null;
            }
        }
        
        if (endNode.dataset.componentType === '????????') {
            const inputConnections = connections.filter(conn => conn.endNode === endNode);
            if (inputConnections.length >= 1) {
                showToast('????????????????1?????????');
                return null;
            }
        }
        
        if (startNode.dataset.componentType === '????????') {
            const outputConnections = connections.filter(conn => conn.startNode === startNode);
            if (outputConnections.length >= 1) {
                showToast('????????????????1?????????');
                return null;
            }
        }
        
        
            (conn.startNode === startNode && conn.endNode === endNode) ||
            (conn.startNode === endNode && conn.endNode === startNode))) {
            console.log('????????');
            showToast('????????);
            return null;
        }
        let inputIndex = 0;
        
        if (endNode.dataset.componentType === '???????) {
            if (endNode.state && Array.isArray(endNode.state.inputValues)) {
                
                for (let i = 0; i < endNode.state.inputValues.length; i++) {
                    if (endNode.state.inputValues[i] === undefined) {
                        inputIndex = i;
                        break;
                    }
                    
                    if (i === endNode.state.inputValues.length - 1) {
                        endNode.state.inputValues.push(undefined);
                        inputIndex = endNode.state.inputValues.length - 1;
                    }
                }
            }
        }
        
        line.className = 'branch active';
        line.style.position = 'absolute';
        line.style.height = '3px';
        line.style.transformOrigin = 'left center';
        line.style.backgroundColor = '#3ddad7';
        line.style.boxShadow = '0 0 10px #3ddad7, 0 0 20px rgba(61,218,215,0.3)';
        line.style.borderRadius = '1.5px';
        line.style.zIndex = '0';
        const firstChild = gridContainer.firstChild;
        if (firstChild) {
            gridContainer.insertBefore(line, firstChild);
        } else {
            gridContainer.appendChild(line);
        }
        
        const connection = {
            element: line,
            startNode: startNode,
            endNode: endNode,
            inputIndex: (endNode.dataset.componentType === '???????) ? inputIndex : 0
        };
        updateConnectionPosition(connection);
        connections.push(connection);
        showToast('??????');
        
        
        if (startNode.state && endNode.state) {
            const signalValue = startNode.state.outputValues[0];
            console.log(`??????: ${startNode.dataset.componentType} -> ${endNode.dataset.componentType}, ???????? ${signalValue}`);
            
            
                
                    const isActive = startNode.classList.contains('active');
                    endNode.state.inputValues[inputIndex] = isActive ? 1 : 0;
                    console.log(`???????? -> ???: ???????${isActive ? 1 : 0}`);
                    
                    
                    updateSignalIndicator(startNode, isActive ? 1 : 0);
                    
                    
                } else {
                    endNode.state.inputValues[inputIndex] = signalValue;
                    
                    
                    
                    
                }
            } else if (endNode.dataset.componentType === '?????????') {
                
                if (startNode.dataset.componentType === '????????') {
                    const isActive = startNode.classList.contains('active');
                    
                    console.log(`???????? -> ?????????: ???????${isActive ? 1 : 0}`);
                    
                    
                } else {
                    
                    endNode.state.inputValues[inputIndex] = signalValue;
                    console.log(`${startNode.dataset.componentType} -> ?????????: ???????${signalValue}`);
                    
                    
                    updateSignalIndicator(startNode, signalValue);
                }
            } else {
                
                    const isActive = startNode.classList.contains('active');
                    endNode.state.inputValues[0] = isActive ? 1 : 0;
                    console.log(`???????? -> ${endNode.dataset.componentType}: ???????${isActive ? 1 : 0}`);
                    
                    
                } else {
                    endNode.state.inputValues[0] = signalValue;
                    
                    
                    updateSignalIndicator(startNode, signalValue);
                }
            }
            
            
            processNodeLogic(endNode);
            
            
            if (startNode.dataset.componentType === '????????') {
                if (startNode.classList.contains('active')) {
                    console.log(`?????????????????????????1`);
                    propagateSignal(startNode, new Set());
                } else {
                    console.log(`???????????????????????????);
                }
            } else {
                
                propagateSignal(startNode, new Set());
            }
        }
        
        
        logCircuitState();
        
        return connection;
    }

    
        if (!connection || !connection.element || 
            !connection.startNode || !connection.endNode) {
            return;
        }
        
        const line = connection.element;
        const startNode = connection.startNode;
        const endNode = connection.endNode;
        
        try {
            
            const startX = parseInt(startNode.dataset.x) + panOffset.x;
            const startY = parseInt(startNode.dataset.y) + panOffset.y;
            const endX = parseInt(endNode.dataset.x) + panOffset.x;
            const endY = parseInt(endNode.dataset.y) + panOffset.y;
            
            
            const nodeWidth = startNode.offsetWidth || 40;
            const nodeHeight = startNode.offsetHeight || 40;
            
            
            const centerStartY = startY + nodeHeight / 2;
            const centerEndX = endX + nodeWidth / 2;
            const centerEndY = endY + nodeHeight / 2;
            
            
                Math.pow(centerEndX - centerStartX, 2) + 
                Math.pow(centerEndY - centerStartY, 2)
            );
            const angle = Math.atan2(
                centerEndY - centerStartY, 
                centerEndX - centerStartX
            ) * 180 / Math.PI;
            
            
            line.style.left = `${centerStartX}px`;
            line.style.top = `${centerStartY}px`;
            line.style.width = `${length}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.zIndex = '0'; 
            
            
            line.style.visibility = 'visible';
            line.style.display = 'block';
            
            
            if (line.parentNode === gridContainer) {
                
                    gridContainer.insertBefore(line, gridContainer.firstChild);
                }
            }
            
        } catch (error) {
            console.error('???????????', error);
        }
    }

    
    let dragInfo = null;
    let svgLayer = document.getElementById('connection-svg');
    if (!svgLayer) {
        svgLayer = document.createElementNS('http:
        svgLayer.classList.add('connection-svg');
        svgLayer.setAttribute('id', 'connection-svg');
        svgLayer.style.position = 'absolute';
        svgLayer.style.left = '0'; svgLayer.style.top = '0';
        svgLayer.style.width = '100%'; svgLayer.style.height = '100%';
        svgLayer.style.pointerEvents = 'none';
        svgLayer.style.zIndex = '0';
        document.getElementById('grid-container').appendChild(svgLayer);
    }
    window.svgLayer = svgLayer; 

    
    function onPortMouseDown(e) {
        if (!e.target.classList.contains('input-port') && !e.target.classList.contains('output-port')) return;
        const port = e.target;
        const node = port.closest('.node');
        const portType = port.classList.contains('input-port') ? 'input' : 'output';
        const portRect = port.getBoundingClientRect();
        const gridRect = document.getElementById('grid-container').getBoundingClientRect();
        const startX = portRect.left + portRect.width/2 - gridRect.left;
        const startY = portRect.top + portRect.height/2 - gridRect.top;

        
        tempPath.setAttribute('class', 'temp-branch');
        svgLayer.appendChild(tempPath);

        dragInfo = { startNode: node, startPort: port, startType: portType, startX, startY, tempPath };

        document.addEventListener('mousemove', onPortMouseMove);
        document.addEventListener('mouseup', onPortMouseUp);
    }

    document.addEventListener('mousedown', onPortMouseDown);

    function onPortMouseMove(e) {
        if (!dragInfo) return;
        const svgRect = svgLayer.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;

        
        const c1x = dragInfo.startX + (dragInfo.startType === 'output' ? 60 : -60);
        const c2x = mouseX + (dragInfo.startType === 'output' ? -60 : 60);
        const d = `M${dragInfo.startX},${dragInfo.startY} C${c1x},${dragInfo.startY} ${c2x},${mouseY} ${mouseX},${mouseY}`;
        dragInfo.tempPath.setAttribute('d', d);

        
        document.querySelectorAll('.node').forEach(node => {
            const rect = node.getBoundingClientRect();
            if (
                e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom
            ) {
                highlightNode = node;
                const isRight = (e.clientX - rect.left) > rect.width / 2;
                if (isRight) {
                    node.classList.add('highlight-right');
                    node.classList.remove('forbid-left');
                    document.body.style.cursor = 'pointer';
                } else {
                    node.classList.remove('highlight-right');
                    node.classList.add('forbid-left');
                    document.body.style.cursor = 'not-allowed';
                }
            } else {
                node.classList.remove('highlight-right', 'forbid-left');
            }
        });
        if (!highlightNode) document.body.style.cursor = '';
    }

    function onPortMouseUp(e) {
        if (!dragInfo) return;
        let connected = false;
        document.querySelectorAll('.node').forEach(node => {
            const rect = node.getBoundingClientRect();
            if (
                e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom
            ) {
                const isRight = (e.clientX - rect.left) > rect.width / 2;
                if (isRight && node !== dragInfo.startNode) {
                    
                    connected = true;
                }
            }
            node.classList.remove('highlight-right', 'forbid-left');
        });
        dragInfo.tempPath.remove();
        dragInfo = null;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onPortMouseMove);
        document.removeEventListener('mouseup', onPortMouseUp);
    }

    function createSVGConnection(startNode, endNode, startPort, endPort) {
        
        const gridRect = document.getElementById('grid-container').getBoundingClientRect();
        const startRect = startPort.getBoundingClientRect();
        const endRect = endPort.getBoundingClientRect();
        const x1 = startRect.left + startRect.width/2 - gridRect.left;
        const y1 = startRect.top + startRect.height/2 - gridRect.top;
        const x2 = endRect.left + endRect.width/2 - gridRect.left;
        const y2 = endRect.top + endRect.height/2 - gridRect.top;
        const c1x = x1 + 60, c2x = x2 - 60;
        const d = `M${x1},${y1} C${c1x},${y1} ${c2x},${y2} ${x2},${y2}`;
        const path = document.createElementNS('http:
        path.setAttribute('class', 'branch-path');
        path.setAttribute('d', d);
        svgLayer.appendChild(path);
    }

    
    let dragLineDiv = null;
    let dragStart = null;

    
    function onDivPortMouseDown(e) {
        if (!e.target.classList.contains('input-port') && !e.target.classList.contains('output-port')) return;
        const port = e.target;
        const node = port.closest('.node');
        const portRect = port.getBoundingClientRect();
        const gridRect = document.getElementById('grid-container').getBoundingClientRect();
        const startX = portRect.left + portRect.width/2 - gridRect.left;
        const startY = portRect.top + portRect.height/2 - gridRect.top;

        dragStart = { node, port, x: startX, y: startY };

        
        dragLineDiv.className = 'temp-branch';
        dragLineDiv.style.left = `${startX}px`;
        dragLineDiv.style.top = `${startY}px`;
        document.getElementById('grid-container').appendChild(dragLineDiv);

        document.addEventListener('mousemove', onDragLineMove);
        document.addEventListener('mouseup', onDragLineUp);
    }

    document.getElementById('grid-container').addEventListener('mousedown', onDivPortMouseDown);

    function onDragLineMove(e) {
        if (!dragLineDiv || !dragStart) return;
        const gridRect = document.getElementById('grid-container').getBoundingClientRect();
        const mouseX = e.clientX - gridRect.left;
        const mouseY = e.clientY - gridRect.top;
        const dx = mouseX - dragStart.x;
        const dy = mouseY - dragStart.y;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        dragLineDiv.style.width = `${length}px`;
        dragLineDiv.style.transform = `rotate(${angle}deg)`;
    }

    function onDragLineUp(e) {
        if (!dragLineDiv || !dragStart) return;
        
        let connected = false;
        document.querySelectorAll('.node').forEach(node => {
            const rect = node.getBoundingClientRect();
            if (
                e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom
            ) {
                const isRight = (e.clientX - rect.left) > rect.width / 2;
                if (isRight && node !== dragStart.node) {
                    
                    createDivConnection(dragStart, node, rect, document.getElementById('grid-container').getBoundingClientRect());
                    connected = true;
                }
            }
        });
        dragLineDiv.remove();
        dragLineDiv = null;
        dragStart = null;
        document.removeEventListener('mousemove', onDragLineMove);
        document.removeEventListener('mouseup', onDragLineUp);
    }

    function createDivConnection(start, endNode, endRect, gridRect) {
        
        if (start && start.node && endNode) {
            
        }
        
        
        console.error('??????????????????????????);
        showToast('??????????????????');
        return null;
    }

    
    let connectMode = null; 
    let connectNode = null;

    gridContainer.addEventListener('mousedown', function(e) {
        console.log('mousedown', e.button, e.target);
        if (!e.target.classList.contains('node') && !e.target.closest('.node')) return;
        const node = e.target.classList.contains('node') ? e.target : e.target.closest('.node');
        
        
            showToast('??????????????????????????);
            console.log('??????????????);
            return;
        }
        
        if (e.button === 0) { 
            connectMode = 'output';
            connectNode = node;
            node.classList.add('selected-output');
            console.log('????????', node);
        }
        

    gridContainer.addEventListener('mouseup', function(e) {
        console.log('mouseup', e.button, e.target);
        if (!connectMode || !connectNode) return;
        if (!e.target.classList.contains('node') && !e.target.closest('.node')) return;
        const targetNode = e.target.classList.contains('node') ? e.target : e.target.closest('.node');
        if (targetNode === connectNode) return; 
        if (connectMode === 'output') {
            
        }
        connectNode.classList.remove('selected-input', 'selected-output');
        connectMode = null;
        connectNode = null;
    });

    gridContainer.addEventListener('contextmenu', e => e.preventDefault());

    function createGlowConnection(startNode, endNode) {
        console.log('createGlowConnection called', startNode, endNode);
        
        
            (conn.startNode === startNode && conn.endNode === endNode)
        );
        
        if (existingConnection) {
            console.log('?????????????????);
            showToast('????????);
            return existingConnection;
        }
        
        const gridRect = gridContainer.getBoundingClientRect();
        const startRect = startNode.getBoundingClientRect();
        const endRect = endNode.getBoundingClientRect();
        const x1 = startRect.left + startRect.width/2 - gridRect.left;
        const y1 = startRect.top + startRect.height/2 - gridRect.top;
        const x2 = endRect.left + endRect.width/2 - gridRect.left;
        const y2 = endRect.top + endRect.height/2 - gridRect.top;
        const dx = x2 - x1, dy = y2 - y1;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const branch = document.createElement('div');
        branch.className = 'glow-branch branch'; 
        branch.style.top = `${y1}px`;
        branch.style.width = `${length}px`;
        branch.style.transform = `rotate(${angle}deg)`;
        branch.style.zIndex = '0'; 
        branch.style.cursor = 'pointer'; 
        
        
            gridContainer.insertBefore(branch, gridContainer.firstChild);
        } else {
            gridContainer.appendChild(branch);
        }

        
        const result = createConnection(startNode, endNode);
        if (result) {
            showToast('??????');
            
            
            if (startNode.state && endNode.state) {
                const signalValue = startNode.state.outputValues[0];
                console.log(`??????: ${startNode.dataset.componentType} -> ${endNode.dataset.componentType}, ???????? ${signalValue}`);
                
                
                    
                        const isActive = startNode.classList.contains('active');
                        endNode.state.inputValues[result.inputIndex] = isActive ? 1 : 0;
                        console.log(`???????? -> ???: ???????${isActive ? 1 : 0}`);
                        
                        
                        updateSignalIndicator(startNode, isActive ? 1 : 0);
                        
                        
                    } else {
                        endNode.state.inputValues[result.inputIndex] = signalValue;
                        
                        
                        
                        
                    }
                } else if (endNode.dataset.componentType === '?????????') {
                    
                    if (startNode.dataset.componentType === '????????') {
                        const isActive = startNode.classList.contains('active');
                        
                        console.log(`???????? -> ?????????: ???????${isActive ? 1 : 0}`);
                        
                        
                    } else {
                        
                        endNode.state.inputValues[result.inputIndex] = signalValue;
                        console.log(`${startNode.dataset.componentType} -> ?????????: ???????${signalValue}`);
                        
                        
                        updateSignalIndicator(startNode, signalValue);
                    }
                } else {
                    
                        const isActive = startNode.classList.contains('active');
                        endNode.state.inputValues[0] = isActive ? 1 : 0;
                        console.log(`???????? -> ${endNode.dataset.componentType}: ???????${isActive ? 1 : 0}`);
                        
                        
                    } else {
                        endNode.state.inputValues[0] = signalValue;
                        
                        
                        updateSignalIndicator(startNode, signalValue);
                    }
                }
                
                
                processNodeLogic(endNode);
                
                
                if (startNode.dataset.componentType === '????????') {
                    if (startNode.classList.contains('active')) {
                        console.log(`?????????????????????????1`);
                        propagateSignal(startNode, new Set());
                    } else {
                        console.log(`???????????????????????????);
                    }
                } else {
                    
                    propagateSignal(startNode, new Set());
                }
            }
            
            return result;
        } else {
            
            return null;
        }
    }

    
    function showToast(message) {
        let toast = document.getElementById('custom-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'custom-toast';
            toast.style.position = 'fixed';
            toast.style.left = '50%'; 
            toast.style.top = '15%'; 
            toast.style.transform = 'translateX(-50%)'; 
            toast.style.zIndex = 9999;
            toast.style.background = 'rgba(40, 60, 80, 0.95)';
            toast.style.color = '#fff';
            toast.style.padding = '16px 32px';
            toast.style.borderRadius = '12px';
            toast.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
            toast.style.fontSize = '18px';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
        }, 1800);
    }

    
    function addCtrlIcon() {
        let icon = document.getElementById('ctrl-connection-icon');
        if (!icon) {
            icon = document.createElement('div');
            icon.id = 'ctrl-connection-icon';
            icon.style.position = 'fixed';
            icon.style.left = '32px';
            icon.style.top = '32px';
            icon.style.width = '56px';
            icon.style.height = '56px';
            icon.style.borderRadius = '16px';
            icon.style.background = 'rgba(80,80,80,0.7)';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
            icon.style.zIndex = 9999;
            icon.style.transition = 'background 0.2s, color 0.2s';
            icon.innerHTML = '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http:
            document.body.appendChild(icon);
        }
        return icon;
    }
    addCtrlIcon();

    
        const icon = document.getElementById('ctrl-connection-icon');
        if (!icon) return;
        if (active) {
            icon.style.background = 'rgba(220,40,40,0.92)';
            icon.innerHTML = '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http:
        } else {
            icon.style.background = 'rgba(80,80,80,0.7)';
            icon.innerHTML = '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http:
        }
    }

    
    createConnection = function(startNode, endNode) {
        const result = oldCreateConnection.apply(this, arguments);
        if (result) {
            
            connectingStart = null;
            gridContainer.style.cursor = 'default';
            document.body.classList.remove('connection-mode');
            setCtrlIconActive(false);
            document.querySelectorAll('.connecting-start').forEach(node => {
                node.classList.remove('connecting-start');
            });
            document.querySelectorAll('.selected-input, .selected-output').forEach(node => {
                node.classList.remove('selected-input', 'selected-output');
            });
        }
        return result;
    };

    
    function setupConnectionRemoval() {
        
        document.addEventListener('click', function(e) {
            
                e.target.classList.contains('glow-branch') || 
                e.target.classList.contains('branch-path')) {
                
                
                const connectionIndex = connections.findIndex(conn => conn.element === clickedElement);
                
                if (connectionIndex !== -1) {
                    
                    
                    
                    connection.element.remove();
                    
                    
                    connections.splice(connectionIndex, 1);
                    
                    
                    showToast('????????);
                    
                    console.log('??????:', connectionIndex);
                }
            }
        });
    }
    
    

    
    function setupNodeEvents() {
        
            if(node.dataset.componentType === '????????') {
                toggleSwitch(node);
                return true;
            } else if(node.dataset.componentType === '?????????') {
                resetStorage(node);
                return true;
            }
            return false;
        };
        
        
        document.addEventListener('click', function(e) {
            const node = e.target.closest('.node');
            if (!node) return;
            
            
            if (node.dataset.componentType === '??) return;
            
            const now = Date.now();
            if (!node.lastClickTime) {
                node.lastClickTime = now;
                return;
            }
            
            
            if (now - node.lastClickTime < 300) {
                handleNodeDoubleClick(node);
                e.stopPropagation(); 
                node.lastClickTime = 0; 
                node.lastClickTime = now;
            }
        });
        
        
            const node = e.target.closest('.node');
            if (!node) return;
            
            
                e.preventDefault(); 
                
                
                const existingDialog = document.getElementById('delay-time-dialog');
                if (existingDialog) {
                    existingDialog.remove();
                }
                
                
            }
        });
    }

    

    
        if (!node || !node.signalIndicator) return;
        
        
        
        
        if (value) {
            node.signalIndicator.style.backgroundColor = 'rgba(0, 128, 0, 0.7)'; 
            node.signalIndicator.style.boxShadow = '0 0 5px rgba(0, 255, 0, 0.5)'; 
        } else {
            node.signalIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; 
            node.signalIndicator.style.boxShadow = 'none';
        }
    }

    
        console.log(`??????: ${e.detail.node.dataset.componentType}`);
        logCircuitState();
    });

    
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '??????';
        debugBtn.style.position = 'fixed';
        debugBtn.style.bottom = '20px';
        debugBtn.style.right = '20px';
        debugBtn.style.padding = '8px 12px';
        debugBtn.style.backgroundColor = '#6200ea';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '4px';
        debugBtn.style.cursor = 'pointer';
        debugBtn.style.zIndex = '1000';
        
        debugBtn.onclick = function() {
            console.log('===== ???????????? =====');
            logCircuitState();
            
            
            andGates.forEach((gate, index) => {
                const inputs = gate.state ? gate.state.inputValues : [];
                const outputs = gate.state ? gate.state.outputValues : [];
                console.log(`???????{index}: ???=[${inputs.join(',')}], ???=${outputs[0]}`);
                
                
                const validInputs = inputs.filter(v => v !== undefined);
                const expectedOutput = validInputs.length > 0 && validInputs.every(v => v === 1) ? 1 : 0;
                
                if (outputs[0] !== expectedOutput) {
                    console.log(`???: ???${index}?????????! ???${expectedOutput}, ?????{outputs[0]}`);
                } else {
                    console.log(`???${index}??????`);
                }
            });
        };
        
        document.body.appendChild(debugBtn);
    }

    
    setTimeout(addDebugButton, 1000);

    
        
        dialog.id = 'delay-time-dialog';
        dialog.style.position = 'fixed';
        dialog.style.left = `${x}px`;
        dialog.style.top = `${y}px`;
        dialog.style.padding = '10px';
        dialog.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
        dialog.style.border = '1px solid #555';
        dialog.style.borderRadius = '5px';
        dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        dialog.style.zIndex = '1001';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        dialog.style.gap = '8px';
        
        
        const title = document.createElement('div');
        title.textContent = '??????????????;
        title.style.color = 'white';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '5px';
        
        
        const currentTime = document.createElement('div');
        currentTime.textContent = `??????: ${node.delayTime || 1} ??;
        currentTime.style.color = '#aaa';
        currentTime.style.fontSize = '12px';
        currentTime.style.marginBottom = '5px';
        
        
        input.type = 'number';
        input.min = '0.1';
        input.step = '0.1';
        input.value = node.delayTime || 1;
        input.style.padding = '5px';
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.style.backgroundColor = '#333';
        input.style.color = 'white';
        input.style.border = '1px solid #555';
        input.style.borderRadius = '3px';
        
        
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.justifyContent = 'space-between';
        buttons.style.marginTop = '5px';
        
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '???';
        confirmBtn.style.padding = '5px 10px';
        confirmBtn.style.backgroundColor = '#4c8bf5';
        confirmBtn.style.color = 'white';
        confirmBtn.style.border = 'none';
        confirmBtn.style.borderRadius = '3px';
        confirmBtn.style.cursor = 'pointer';
        confirmBtn.style.marginRight = '5px';
        confirmBtn.onclick = function() {
            
            const value = parseFloat(input.value);
            if (value > 0) {
                
                showToast(`???????????? ${value} ??);
                console.log(`?????????????????? ${value} ??);
            } else {
                showToast('????????????0');
            }
            dialog.remove();
        };
        
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '???';
        cancelBtn.style.padding = '5px 10px';
        cancelBtn.style.backgroundColor = '#555';
        cancelBtn.style.color = 'white';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '3px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.onclick = function() {
            dialog.remove();
        };
        
        
        buttons.appendChild(confirmBtn);
        buttons.appendChild(cancelBtn);
        
        
        dialog.appendChild(currentTime);
        dialog.appendChild(input);
        dialog.appendChild(buttons);
        
        
        
        
        input.focus();
        input.select();
        
        
            if (!dialog.contains(e.target)) {
                dialog.remove();
                document.removeEventListener('mousedown', closeOnOutsideClick);
            }
        }
        
        
            document.addEventListener('mousedown', closeOnOutsideClick);
        }, 100);
    }

    
    function getPortType(node) {
        if (!node || !node.dataset || !node.dataset.componentType) return 'unknown';
        
        const componentType = node.dataset.componentType;
        
        
            componentType === '?????R?? || 
            componentType === '??????? || 
            componentType === 'XOR????? || 
            componentType === '?????R?? ||
            componentType === '????????') return 'output';
        
        
        
        
            componentType === '?????????') {
            return 'both';
        }
        
        return 'unknown';
    }
}); 
