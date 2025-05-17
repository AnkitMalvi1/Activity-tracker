const { ipcRenderer } = require('electron');
const { saveActivity } = require('./utils/storage');
const fs = require('fs');
const path = require('path');

// Initialize counters
let clickCount = 0;
let rightClickCount = 0;
let doubleClickCount = 0;
let keyCount = 0;
let scrollCount = 0;

// Mouse event listeners
document.addEventListener('click', (e) => {
    clickCount++;
    document.getElementById('clickCount').textContent = clickCount;
    updateLastActivity('Left Click');
    saveActivity({ type: 'leftClick', timestamp: new Date() });
});

document.addEventListener('contextmenu', (e) => {
    rightClickCount++;
    document.getElementById('rightClickCount').textContent = rightClickCount;
    updateLastActivity('Right Click');
    saveActivity({ type: 'rightClick', timestamp: new Date() });
});

document.addEventListener('dblclick', (e) => {
    doubleClickCount++;
    document.getElementById('doubleClickCount').textContent = doubleClickCount;
    updateLastActivity('Double Click');
    saveActivity({ type: 'doubleClick', timestamp: new Date() });
});

// Keyboard event listener
document.addEventListener('keydown', (e) => {
    keyCount++;
    document.getElementById('keyCount').textContent = keyCount;
    document.getElementById('keyCombination').textContent = getKeyCombination(e);
    updateLastActivity('Keyboard');
    saveActivity({ type: 'keyPress', key: e.key, timestamp: new Date() });
});

// Scroll event listener
document.addEventListener('scroll', (e) => {
    scrollCount++;
    document.getElementById('scrollCount').textContent = scrollCount;
    updateLastActivity('Scroll');
    saveActivity({ type: 'scroll', timestamp: new Date() });
}, true);

// Helper functions
function getKeyCombination(e) {
    const keys = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift') {
        keys.push(e.key);
    }
    return keys.join(' + ') || '-';
}

function updateLastActivity(type) {
    const now = new Date();
    document.getElementById('lastActivity').textContent = 
        `${type} at ${now.toLocaleTimeString()}`;
}

// Window tracking
ipcRenderer.on('active-window-changed', (event, windowTitle) => {
    document.getElementById('currentWindow').textContent = windowTitle;
    saveActivity({ type: 'windowChange', window: windowTitle, timestamp: new Date() });
});


// Add after the existing event listeners
function checkStorage() {
    const dataDir = path.join(__dirname, 'data');  // Changed to use project root directory
    const exists = fs.existsSync(dataDir);
    const today = new Date().toISOString().split('T')[0];
    const todayFile = path.join(dataDir, `activity-${today}.json`);
    const fileExists = fs.existsSync(todayFile);
    
    // console.log('Storage Check:', {
    //     dataDirectory: dataDir,
    //     directoryExists: exists,
    //     todayFile: todayFile,
    //     todayFileExists: fileExists
    // });

    // Force create an empty activity file if it doesn't exist
    if (!fileExists) {
        fs.writeFileSync(todayFile, JSON.stringify([], null, 2));
        console.log('Created new activity file:', todayFile);
    }
}

// Call this function to check
checkStorage();