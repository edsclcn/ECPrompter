const AREA_PER_ROW = 5;                                     // Number of textarea tags per row
const SESSION_ID = Math.random().toString().substring(2);   // Random number to avoid overlap with different sessions

let tabCount = 0;
let activeTabs = []; // List of currently open tabs (tracks their IDs)
let textNum = {};

function addTab(tabName = `Tab ${tabCount + 1}`, isImageTab = false) {
    if (activeTabs.length >= 10) {
        alert("Maximum 10 tabs allowed.");
        return 0;
    }

    tabCount++;
    activeTabs.push(tabCount);
    textNum[tabCount.toString()] = [0, null, null]; // Area count, window, active text area

    const tab = document.createElement('li');
    tab.classList.add('tab');
    tab.dataset.tabId = tabCount;

    if (isImageTab) {
        tab.innerHTML = '<i class="fa-solid fa-image"></i>';  // Add the image icon alongside "IMG" text
        tab.classList.add('image-tab');
    } else {
        tab.textContent = tabName;

        // Create the close button for other tabs
        const closeButton = document.createElement('span');
        closeButton.classList.add('close-btn');
        closeButton.textContent = '×';
        closeButton.onclick = function (event) {
            event.stopPropagation();
            handleTabClose(tab);
        };

        tab.appendChild(closeButton);
    }

    // Disable rename function for the image tab
    tab.ondblclick = isImageTab ? null : () => renameTab(tab);

    document.getElementById('tabs-list').appendChild(tab);
    addTabContent(tabCount, isImageTab);
    if (tabName !== "Image") {
        showTabContent(tabCount);
    }
    return tabCount;
}

function addTabContent(tabId, isImageTab) {
    const tabContent = document.getElementById('tab-content');
    const content = document.createElement('div');
    content.classList.add('tab-pane');
    content.id = `tab-${tabId}`;

    if (isImageTab) {
        content.innerHTML = `
            <main class="main-content">
                <div class="main-image">
                    <div class="container">
                        <div class="table-container">
                            <div class="header">
                                <div class="file-input-wrapper">
                                    <input type="file" id="imageInput" multiple accept="image/*">
                                    <label for="imageInput" class="file-input-label">Choose Files</label>
                                </div>
                            </div>
                            <table id="imageTable" class="display compact">
                                <thead>
                                    <tr>
                                        <th>Move</th>
                                        <th>File Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="imageTableBody"></tbody>
                            </table>
                        </div>
                        <div class="preview-container">
                            <div id="preview">
                                <p>No image selected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>`;
    } else {
        const container = document.createElement('div');
        container.classList.add('textareas-container');

        createTextareasRow(container, tabId);

        const addSetButton = document.createElement('button');
        addSetButton.classList.add('add-set-btn');
        addSetButton.id = `add-set-${tabId}`;
        addSetButton.title = "Add new set";

        addSetButton.innerHTML = '<i class="fa-solid fa-boxes-stacked"></i> +';
        addSetButton.onclick = function () {
            createTextareasRow(container, tabId);
        };

        content.appendChild(container);
        content.appendChild(addSetButton);
    }
    tabContent.appendChild(content);
}

function createTextareasRow(container, tabId) {
    const rowContainer = document.createElement('div');
    rowContainer.classList.add('textareas-row');
    rowContainer.style.position = 'relative';

    for (let i = 1; i <= AREA_PER_ROW; i++) {
        const textareaItem = document.createElement('div');
        textareaItem.classList.add('textarea-item');

        const textId = ++textNum[tabId.toString()][0];
        const textarea = document.createElement('textarea');
        textarea.id = `textarea-${tabId}-${textId}`;
        textarea.placeholder = `Text Area #${textId}`;
        textarea.addEventListener('paste', () => {
            setTimeout(() => {
                textarea.scrollTop = 0;
            }, 0);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const promptButton = document.createElement('button');
        promptButton.textContent = 'PROMPT';
        promptButton.title = 'Send to Prompter';
        promptButton.onclick = () => {
            if (textNum[tabId.toString()][2]) textNum[tabId.toString()][2].style.border = '1px solid white';
            textarea.style.border = '2px solid red';
            textNum[tabId.toString()][2] = textarea;

            const id = promptButton.parentElement.parentElement.getElementsByTagName("textarea")[0].id.split("-")[2];

            sendPrompt(tabId, parseInt(id));
        };

        const resetButton = document.createElement('button');
        resetButton.classList.add('reset-scroll-btn');
        resetButton.innerHTML = '<i class="fa-solid fa-circle-up"></i>';
        resetButton.title = 'Scroll to top';
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
    removeSetButton.title = 'Remove set';
    removeSetButton.onclick = function () {
        rowContainer.remove();
        rearrangeTextAreas(tabId);
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

function rearrangeTextAreas(tabId) {
    const tab = document.getElementById(`tab-${tabId}`);
    const textareas = tab.querySelectorAll('textarea');
    const newTextAreaCount = textareas.length;
    textNum[tabId.toString()][0] = newTextAreaCount;

    let newTextId = 0;
    for (let textarea of textareas) {
        newTextId++;
        textarea.id = `textarea-${tabId}-${newTextId}`;
        textarea.placeholder = `Text Area #${newTextId}`;
    }
}

function handleTabClose(tab) {
    const tabId = parseInt(tab.dataset.tabId);
    tab.remove();
    document.getElementById(`tab-${tabId}`).remove();

    activeTabs = activeTabs.filter((id) => id !== tabId);

    delete textNum[tabId.toString()];

    if (tab.classList.contains('active')) {
        if (activeTabs.length > 0) showTabContent(activeTabs[activeTabs.length - 1]);
    }
}

function renameTab(tab) {
    const name = prompt('Enter new tab name:', tab.textContent.replace('×', '').trim());
    if (name) tab.firstChild.textContent = name;
}

function sendPrompt(tabId, textId) {
    let data = [];
    for (let i = 1; true; i++) {
        const textarea = document.getElementById(`textarea-${tabId}-${i}`);
        if (!textarea) break;
        data.push("\n" + formatText(textarea.value));
    }

    const title = `${SESSION_ID}-${tabId}`;
    localStorage.setItem(title, JSON.stringify(data));
    textNum[tabId.toString()][1] = window.open(`prompter.html?title=${encodeURIComponent(title)}&current=${textId-1}`, title, 'width=800,height=450');
    textNum[tabId.toString()][1].focus();
}

document.getElementById('add-tab-btn').addEventListener('click', () => addTab());
document.getElementById('tabs-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        showTabContent(parseInt(e.target.dataset.tabId));
    }
});

// Set Tab 1 as default on page load
window.onload = () => {
    const imageTabId = addTab("Image", true);  // Add Image tab first
    const tab1Id = addTab("Tab 1");             // Add Tab 1
    showTabContent(tab1Id);                     // Show Tab
    // 1 content as default
};

window.addEventListener('beforeunload', function (event) {
    for (let i = 1; i <= tabCount; i++) {
        this.localStorage.removeItem(`${SESSION_ID}-${i}`);
    }
});

