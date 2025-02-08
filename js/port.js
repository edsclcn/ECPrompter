const DELIMITER = '<----->';

function exportLineup() {
    if (activeTabs.length == 0) {
        alert('No selected tab!');
        return;
    }

    const tabId = document.getElementById('tabs-list').getElementsByClassName('active')[0].dataset.tabId;
    const tab = document.getElementById(`tab-${tabId}`);
    const textareas = tab.querySelectorAll('textarea');

    if (textareas.length == 0) {
        alert('Current tab does not have any sets!');
        return;
    }

    let data = Array.from(textareas)
        .map(textarea => textarea.value.trim())
        .filter(value => value)
        .join(`\n${DELIMITER}\n`);

    if (data) {
        download(
            "ECPrompter-" + [new Date().getMonth() + 1, new Date().getDate(), new Date().getFullYear(), new Date().getHours(), new Date().getMinutes()].join('-'),
            data
        )
    } else alert('Lineup is empty! Export was unsuccessful.');
}

function importLineup() {
    let importBtn = document.getElementById('import-btn');
    importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    upload()
        .then(values => {
            if (!values) return;

            const tabId = parseInt(document.getElementById('tabs-list').getElementsByClassName('active')[0].dataset.tabId);
            const addBtn = document.getElementById(`add-set-${tabId}`);
            let current = 0;
            for (let i = 1; true; i++) {
                let value = values[current];
                if (!value) break;
                const textarea = document.getElementById(`textarea-${tabId}-${i}`);
                if (!textarea) {
                    addBtn.click();
                    i--;
                    continue;
                }
                
                if (!textarea.value) {
                    textarea.value = value.trim();
                    current++;
                }
            }
        })
        .catch(err => {
            alert(`Failed to import lineup: ${err}`);
        }).finally(() => {
            importBtn.innerHTML = '<i class="fa-solid fa-upload"></i>';
        });
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function upload() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';

        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const fileExtension = file.name.split('.').pop();
                if (fileExtension.toLowerCase() === 'txt') {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const content = e.target.result;
                        const values = content.split(DELIMITER);
                        resolve(values);
                    };
                    reader.onerror = (err) => {
                        reject(`Failed to read file: ${err}`);
                    };
                    reader.readAsText(file);
                } else {
                    alert('Please select a text file (.txt).');
                    reject('Invalid file type');
                }
            } else {
                alert('No file selected.');
                reject('No file selected');
            }
        };

        input.click();
    });
}