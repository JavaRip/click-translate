document.addEventListener('DOMContentLoaded', function() {
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
