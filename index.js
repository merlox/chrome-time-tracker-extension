String.prototype.toTime = function () {
    var sec_num = parseInt(this, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60)
    var seconds = sec_num - (hours * 3600) - (minutes * 60)

    if (hours   < 10) {hours   = "0"+hours}
    if (minutes < 10) {minutes = "0"+minutes}
    if (seconds < 10) {seconds = "0"+seconds}
    return {hours, minutes, seconds}
}

function start() {
    let app = ''
    let pageCounter = {}
    let orderedArrayCounter = {}

    // let orderedElements = {
    //     hostnamePage: {
    //         main: 100 secs
    //         subpage: 70 secs
    //         subpage: 42 secs
    //         subpage: 10 secs
    //     }
    // }
    // 1. if this is a hostname add it with the subproperty main with the time
    // 2. if not, create the hostname property and add it as a subpage if the hostname has not been created and set up the main as 0 time
    // 3. when you find the hostname in this situation just override the 0 main time with the new one
    // 4. else just add it as the subpage property of the existing hostname
    let orderedElements = {}

    // Because the resulting object is not ordered, create an index ordered of hostnames to show the user the ordered ting
    let orderedHostnamesKeys = []

    try {
        pageCounter = JSON.parse(localStorage.getItem("pageCounter"))
        orderedArrayCounter = {...pageCounter}
    } catch(e) {}

    // Order the pages showing those with the most time on top
    orderedArrayCounter = Object.keys(pageCounter).sort((a, b) => {
        return pageCounter[b] - pageCounter[a]
    })

    // Sacar el hostname de esos elementos ordenados en el array y ponerlos en el
    for(let b = 0; b < orderedArrayCounter.length; b++) {
        let page = orderedArrayCounter[b]
        if(page.substring(0, 4) != 'http') page = 'https://' + page
        let urlFromString = new URL(page)

        // If it doesn't exist already add it otherwise don't
        if(orderedHostnamesKeys.indexOf(urlFromString.hostname) == -1) {
            orderedHostnamesKeys.push(urlFromString.hostname)
        }
    }

    // Creation of the ordered elements object
    for(let i = 0; i < orderedArrayCounter.length; i++) {
        let page = orderedArrayCounter[i]

        // If this is a href not a hostname then do the following
        if(page.substring(0, 4) == 'http' || page.search('/') != -1) {
            let pageWithHttps = page
            // If the url doesn't have http, add it
            if(page.substring(0, 4) != 'http') {
                pageWithHttps = 'https://' + page
            }
            let urlFromString = new URL(pageWithHttps)

            // If this hostname doesn't exists yet, then create the hostname and add it as a subproperty plus the main time with this page's time
            if(Object.keys(orderedElements).indexOf(urlFromString.hostname) == -1) {
                orderedElements[urlFromString.hostname] = {
                    main: pageCounter[page],
                    [page]: pageCounter[page]
                }
            } else {
                // Else push it inside the hostname
                orderedElements[urlFromString.hostname][page] = pageCounter[page]
            }
        } else {
            // Find if the hostname is already existing or not if so, just override the main time. It could exist already because of what we did with the hrefs creating hostnames not because it's duplicated, it can't be duplicated
            if(Object.keys(orderedElements).indexOf(page) == -1) {
                orderedElements[page] = {
                    main: pageCounter[page]
                }
            } else {
                orderedElements[page]['main'] = pageCounter[page]
            }
        }
    }

    // Generate the html with the pages
    for(let i = 0; i < orderedHostnamesKeys.length; i++) {
        let page = orderedHostnamesKeys[i]
        let secs = orderedElements[page].main
        // Avoid those with bad data and showing pages where you've spent less than 1 minute
        if(secs == NaN || secs == undefined || Number(secs) <= 60) continue
        let {hours, minutes, seconds} = String(secs).toTime()
        let uniqueID = "details-" + (i+1)

        app += `<div>
            ${i+1} - You spent in <a href="${page}">${page}</a> <b>${(Number(hours) == 0) ? '' : hours + " hours"}</b>, <b class="blue">${(Number(minutes) == 0) ? '' : minutes + " minutes"}</b>, <b class="green">${seconds} seconds</b> <a href="#" class="show-details-button" data-id-selector=${uniqueID}>[Show Details]</a>
            <ul id=${uniqueID} class="hidden">`

        // These are the subpages
        for(let subpage in orderedElements[page]) {
            // Avoid the main subpage
            if(subpage == 'main') continue
            let subpageTime = orderedElements[page][subpage]
            // Avoid those with bad data
            if(subpageTime == NaN || subpageTime == undefined) continue
            console.log('string subpage time', String(subpageTime))
            console.log('conversion', String(subpageTime).toTime())
            let {hours, minutes, seconds} = String(subpageTime).toTime()

            app += `<li> Subpage <a href="${subpage}">${subpage}</a> <b>${(Number(hours) == 0) ? '' : hours + " hours"}</b>, <b class="blue">${(Number(minutes) == 0) ? '' : minutes + " minutes"}</b>, <b class="green">${seconds} seconds</b></li>`
        }
        app += '</ul></div>'
    }

    document.querySelector('#root').innerHTML = app

    // Add listeners to all the [Show Details] buttons
    document.querySelectorAll('.show-details-button').forEach(button => {
        button.addEventListener('click', e => {
            // Prevent the scrolling top when clicking on href="#"
            e.preventDefault()
            let uniqueID = button.getAttribute('data-id-selector')
            let className = document.querySelector('#' + uniqueID).className
            if (className == 'hidden') {
                document.querySelector('#' + uniqueID).className = ''
            } else {
                document.querySelector('#' + uniqueID).className = 'hidden'
            }
        })
    })
}
start()
