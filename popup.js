document.addEventListener('DOMContentLoaded', function() {
    console.log('dom content loaded');
    console.log(chrome);
    console.log(chrome.tabs);
    console.log(chrome.tabs.query({active: true, currentWindow: true}));
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getClickedWords"}, function(response) {
            console.log('response:', response);
            if (response && response.data) {
                setupDownloadButton(response.data);
            }
        });
    });
});

function setupDownloadButton(data) {
    document.getElementById('downloadButton').addEventListener('click', function() {
        console.log('button clicked', data);
        downloadDataAsCSV(data);
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