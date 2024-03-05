function setup() {
    document.addEventListener('DOMContentLoaded', async function() {
        // fetch language data from the API and dynamically load elements into the drop-down menus.
        const resp = await fetch('https://libretranslate.eownerdead.dedyn.io/languages');
        const languageData =  await resp.json();
        loadLanguages(languageData);

        console.log('dom content loaded');
        console.log(chrome);
        console.log(chrome.tabs);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log(tabs);
        });

        const downloadButton = document.querySelector('button');
        if (downloadButton) {
            downloadButton.addEventListener('click', function() {
                setupDownloadButton();
            });
        }
    });
}

/*
Function loadLanguages collects a list of languages and appends them to both
drop-down menus.
 */
function loadLanguages(languages) {
    const source = document.querySelector('#source-lang');
    const target = document.querySelector('#target-lang');
    for (const language of languages) {
        const sourceOption = document.createElement('option');
        sourceOption.value = language.code + '.';
        sourceOption.text = language.name + '.';
        const targetOption = sourceOption.cloneNode(true);

        source.add(sourceOption);
        if (targetOption.text !== 'English.') {
            target.add(targetOption);
        }
    }

    return source;
}

function setupDownloadButton() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getClickedWords"}, function(response) {
            console.log('response:', response);
            if (response && response.data) {
                downloadDataAsCSV(response.data);
            }
        });
    });
}

function downloadDataAsCSV(data) {
    let csvContent = "data:text/csv;charset=utf-8,Word,Translation\n";
    data.forEach(({ word, translation }) => {
        csvContent += `"${word}","${translation}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "translations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

console.log('hello world');
setup();
