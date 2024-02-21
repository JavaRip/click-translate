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
        chrome.tabs.sendMessage(tabs[0].id, {action: "getClickedWords"}, function (response) {
            console.log('response:', response);
            if (response && response.data) {
                const translations = JSON.parse(JSON.stringify(response.data));
                const csvPairs = [];

                for (const [key, value] of Object.entries(translations)) {
                    csvPairs.push(`${key},${value}\n`);
                }

                downloadTranslation(csvPairs);
            }
        });
    });
}

/*
function downloadTranslation converts the input data into a plaintext Blob
and generates an Object URL out of it. The resulting URL is used as a target
for downloading data into the user's filesystem.
 */
function downloadTranslation(data) {
    const b = new Blob(data, { type: "text/plain" });
    const url = URL.createObjectURL(b);
    browser.downloads.download({
        filename: "translation-pairs.csv",
        url: url
    });
}
