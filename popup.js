function setup() {
    document.addEventListener('DOMContentLoaded', async function() {
        // fetch language data from the API and dynamically load elements into the drop-down menus.
        const resp = await fetch('https://libretranslate.eownerdead.dedyn.io/languages');
        const languageData =  await resp.json();
        loadLanguages(languageData);

        // setup local storage for the extension to access language features.
        /*
        1. Initialise the user's language preferences during translation.
        2. Set the selected property of the drop-down menus' options accordingly.
         */
        const prefs = await initialiseLanguageSelection();
        console.log('What is prefs? ' + JSON.stringify(prefs));
        initialiseLanguagePreferences(prefs.source, prefs.target);

        sourceLanguageListener();
        targetLanguageListener();

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
        sourceOption.value = language.code;
        sourceOption.text = language.name + '.';
        const targetOption = sourceOption.cloneNode(true);

        source.add(sourceOption);
        if (targetOption.text !== 'English.') {
            target.add(targetOption);
        }
    }

    return source;
}

/*
Function initialiseLanguageSelection retrieves the user's language preferences
for how they translate words.
The data is used to provide visible feedback in drop-down menus and to set the
correct payload for querying the translation API.
 */
async function initialiseLanguageSelection() {
    let source = await browser.storage.local.get('source');
    console.log('Getting source lang on startup: ' + JSON.stringify(source));

    // check if source is an empty object.
    if (Object.keys(source).length === 0 && source.constructor === Object) {
        console.log('Source === {}');
        await browser.storage.local.set({ 'source': 'auto' });
        source = { 'source': 'auto' } ;
    }

    let target = await browser.storage.local.get('target');
    console.log('Getting target lang on startup: ' + JSON.stringify(target));

    // check if target is an empty object.
    if (Object.keys(target).length === 0 && target.constructor === Object) {
        console.log('Target === {}');
        browser.storage.local.set({ 'target': 'en' });
        target = { 'target': 'en' };
    }

    return { 'source': source.source, 'target': target.target };
}

/*
Function initialiseLanguagePreferences updates the drop-down menus for the
source and target languages in the extension's popup menu upon initialisation.
This feature provides visible feedback to the user on the extension's startup
sequence so the user is more aware of their current language selections.
 */
function initialiseLanguagePreferences(source, target) {
    console.log(source, ' and ', target);
    // Get a handle on the drop-down menus in popup.html.
    const sourceLanguageMenu = document.querySelector('#source-lang');
    const targetLanguageMenu = document.querySelector('#target-lang');

    sourceLanguageMenu.value = source;
    targetLanguageMenu.value = target;
}

function sourceLanguageListener() {
    const source = document.querySelector('#source-lang');
    source.addEventListener('input', () => {
        browser.storage.local.set({ 'source': source.value });
    })
}

function targetLanguageListener() {
    const target = document.querySelector('#target-lang');
    target.addEventListener('input', () => {
        browser.storage.local.set({ 'target': target.value });
    })
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
