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
        navigator.clipboard.writeText(data)
            .then(() => {
                alert('Lineup successfully exported to clipboard!');
            })
            .catch(err => {
                alert(`Failed to export lineup: ${err}`);
            });
    } else alert('Lineup is empty! Export was unsuccessful.');
}

function importLineup() {
    navigator.clipboard.readText()
        .then(text => {
            const values = text.split(DELIMITER);
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
            alert(`Failed to read clipboard contents: ${err}`);
        });
}