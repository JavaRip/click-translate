document.addEventListener('click', async function(event) {
    let word = '';
    const caretPos = document.caretPositionFromPoint(event.clientX, event.clientY);
    if (caretPos && caretPos.offsetNode.nodeType === Node.TEXT_NODE) {
        word = getWordFromPosition(caretPos.offsetNode.textContent, caretPos.offset);
    }

    if (word) {
        const trimmedWord = trimPunctuation(word);
        if (trimmedWord) {
            const translation = await translate(trimmedWord);
            console.log('Clicked word:', trimmedWord);
            console.log('Translation:', translation);
            saveTranslation(trimmedWord, translation);
        }

    }
});

/*
Function trimPunctuation replaces unnecessary tokens in the target string with
whitespaces, then trims the remaining whitespaces. If a word contains any
numbers, from zero to nine, then the function will return an empty string.
 */
// TODO:
//  Fix Regex to include UNICODE
function trimPunctuation(word) {
    const nums = /[0123456789]/g;
    const re = /[¬`¦!"£$%^&*()_+1234567890={}~\[\]#:@;'|<>?,.\/]/g;

    // We return an empty string because it is meaningless to translate numeric
    // values.
    if (word.match(nums)) {
        return "";
    }

    return word.replace(re, "");
}

function getWordFromPosition(text, position) {
    const words = text.split(/\s+/);
    let cumulativeLength = 0;
    for (let i = 0; i < words.length; i += 1) {
        cumulativeLength += words[i].length + 1;
        if (position <= cumulativeLength) {
            return words[i];
        }
    }
    return '';
}

async function translate(word) {
    const res = await fetch("https://libretranslate.eownerdead.dedyn.io/", {
        method: "POST",
        body: JSON.stringify({
                q: word,
                source: "de",
                target: "en",
                format: "text",
        }),
        headers: { "Content-Type": "application/json" }
    });

    const translatedWord = await res.json();

    return translatedWord.translatedText;
}

translationData = {};

function saveTranslation(word, translation) {
    translationData[word] = translation;
}

function init() {
    console.log('hello from clickTranslate.js!');
    console.log(browser);
    browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('event recieved');
        console.log(request);
        if (request.action === "getClickedWords") {
            console.log('translationData:', translationData);
            sendResponse({ data: translationData });
        }
    });
}

init();
