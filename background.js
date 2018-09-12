// Keeps track of the time spent on the different pages with a persistant background that updates continuosly

const timeInterval = 5
let pageCounter = {}

// Executed everytime you open the browser
async function start() {
    // Initialize the page information from the local storage
    let pages = {}
    try {
        pages = JSON.parse(localStorage.getItem("pageCounter"))
    } catch(e) {}
    console.log('Page counter:', pages)
    pageCounter = pages
}

// Updates the time spent on that page
function updateTime(page, fullPage) {
    pageCounter[page] == undefined ? pageCounter[page] = timeInterval : pageCounter[page] += timeInterval
    pageCounter[fullPage] == undefined ? pageCounter[fullPage] = timeInterval : pageCounter[fullPage] += timeInterval

    localStorage.setItem("pageCounter", JSON.stringify(pageCounter))
}

// Listening for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == 'update-time') {
        updateTime(request.page, request.fullPage)
    }
})

start()
