let tabCount = 0; 
let activeTabs = []; // List of currently open tabs (tracks their IDs)
let textNum = {};
let lastSelectedTextarea = null; 

function addTab() {
    if (activeTabs.length >= 10) {
        alert("Maximum 10 tabs allowed.");
        return;
    } 

    tabCount++;
    activeTabs.push(tabCount);
    textNum[tabCount.toString()] = [0, null];

    const tab = document.createElement('li');
    tab.classList.add('tab');
    
    tab.textContent = `Tab ${tabCount}`;
    tab.dataset.tabId = tabCount;

    const closeButton = document.createElement('span');
    closeButton.classList.add('close-btn');
    closeButton.textContent = '×';
    closeButton.onclick = function (event) {
        event.stopPropagation();
        handleTabClose(tab);
    };

    tab.appendChild(closeButton);
    tab.ondblclick = () => renameTab(tab);

    document.getElementById('tabs-list').appendChild(tab);
    addTabContent(tabCount);
    showTabContent(tabCount);
}

function addTabContent(tabId) {
    const tabContent = document.getElementById('tab-content');
    const content = document.createElement('div');
    content.classList.add('tab-pane');
    content.id = `tab-${tabId}`;

    const container = document.createElement('div');
    container.classList.add('textareas-container');

    createTextareasRow(container, tabId);

    const addSetButton = document.createElement('button');
    addSetButton.classList.add('add-set-btn');

    addSetButton.innerHTML = '<i class="fa-solid fa-boxes-stacked"></i> +';
    addSetButton.onclick = function () {
        createTextareasRow(container, tabId);
    };

    container.appendChild(addSetButton);
    content.appendChild(container);
    content.appendChild(addSetButton);
    tabContent.appendChild(content);
}

function createTextareasRow(container, tabId) {
    const rowContainer = document.createElement('div');
    rowContainer.classList.add('textareas-row');
    rowContainer.style.position = 'relative';

    for (let i = 1; i <= 5; i++) {
        const textareaItem = document.createElement('div');
        textareaItem.classList.add('textarea-item');

        const textId = ++textNum[tabId.toString()][0];
        const textarea = document.createElement('textarea');
        textarea.id = `textarea-${tabId}-${textId}`;
        textarea.placeholder = `Text Area #${textId}`;

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const promptButton = document.createElement('button');
        promptButton.textContent = 'PROMPT';
        promptButton.onclick = () => {
            if (lastSelectedTextarea) lastSelectedTextarea.style.border = '1px solid white'; 
            textarea.style.border = '2px solid red';
            lastSelectedTextarea = textarea;
            
            sendPrompt(tabId, textId);
        };

        const resetButton = document.createElement('button');
        resetButton.classList.add('reset-scroll-btn');
        resetButton.innerHTML = '<i class="fa-solid fa-circle-up"></i>';
        resetButton.onclick = () => (textarea.scrollTop = 0);

        buttonContainer.appendChild(promptButton);
        buttonContainer.appendChild(resetButton);

        textareaItem.appendChild(textarea);
        textareaItem.appendChild(buttonContainer);

        rowContainer.appendChild(textareaItem);
    }

    const removeSetButton = document.createElement('button');
    removeSetButton.classList.add('remove-set-btn');
    removeSetButton.innerHTML = '×';
    removeSetButton.onclick = function () {
        rowContainer.remove();
    };

    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('remove-set-btn-wrapper');
    buttonWrapper.appendChild(removeSetButton);
    rowContainer.appendChild(buttonWrapper);
    container.appendChild(rowContainer);
}

function showTabContent(tabId) {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach((pane) => (pane.style.display = 'none'));
    const activeTab = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeContent.style.display = 'block';
    }
}

function handleTabClose(tab) {
    const tabId = parseInt(tab.dataset.tabId);
    tab.remove();
    document.getElementById(`tab-${tabId}`).remove();

    activeTabs = activeTabs.filter((id) => id !== tabId);

    delete textNum[tabCount.toString()];

    if (tab.classList.contains('active')) {
        if (activeTabs.length > 0) showTabContent(activeTabs[activeTabs.length - 1]);
    }
}

function renameTab(tab) {
    const name = prompt('Enter new tab name:', tab.textContent.replace('×', '').trim());
    if (name) tab.firstChild.textContent = name;
}

function sendPrompt(tabId, textId) {
    const text = document.getElementById(`textarea-${tabId}-${textId}`).value;
    const title = `window-${tabId}`;
    localStorage.setItem(title, text);
    let prompter = window.open(`prompter/content.html?title=${encodeURIComponent(title)}`, title, 'width=800,height=450');
    prompter.focus();
    textNum[tabId.toString()][1] = prompter;
}

document.getElementById('add-tab-btn').addEventListener('click', addTab);
document.getElementById('tabs-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        showTabContent(parseInt(e.target.dataset.tabId));
    }
});

window.onload = () => addTab();

window.addEventListener('beforeunload', function (event) { event.preventDefault(); event.returnValue = ''; });