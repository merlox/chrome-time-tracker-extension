// The content script is the one injected into the web page which has access to the DOM
console.log('Content script loaded')

const timeInterval = 5
const page = window.location.hostname
const fullPage = window.location.href

setInterval(() => {
    // Only update the time for the active tab
    if(document.visibilityState != 'hidden') {
        chrome.runtime.sendMessage({action: "update-time", page, fullPage})
    }
}, 5 * 1e3)
