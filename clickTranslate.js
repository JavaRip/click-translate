document.addEventListener('click', async function(event) {
    let word = '';
    const caretPos = document.caretPositionFromPoint(event.clientX, event.clientY);
    if (caretPos && caretPos.offsetNode.nodeType === Node.TEXT_NODE) {
        word = getWordFromPosition(caretPos.offsetNode.textContent, caretPos.offset);
    }

    if (word) {
        word = trimPunctuation(word);
        const translation = await translate(word);
        console.log('Clicked word:', word);
        console.log('Translation:', translation);

        saveTranslation(word, translation);
    }
});

/*
Function trimPunctuation replaces unnecessary tokens in the target string with
whitespaces, then trims the remaining whitespaces.
 */
function trimPunctuation(word) {
    let finalString = "";

    for (let i = 0; i < word.length; i++) {
        const tokenFound = tokensInString(word.charAt(i));
        if (tokenFound) {
            finalString += " ";
        } else {
            finalString += word.charAt(i);
        }
    }

    return finalString.replaceAll(" ", "");
}

/*
Function tokensInString checks if a letter from a string matches the token
string.
 */
function tokensInString(letter) {
    const tokens = `¬\`¦!"£$%^&*()_+-={}~[]#|\\:@;'<>?,./1234567890`;
    for (const token of tokens) {
        if (letter === token) {
            return true;
        }
    }

    return false;
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
    const res = await fetch("https://libretranslate.eownerdead.dedyn.io/translate", {
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
