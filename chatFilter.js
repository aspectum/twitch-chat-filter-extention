function textImgChildren(el, descendants) {
    var children = el.childNodes;
    if (children.length > 0) {
        children.forEach(child => {
            if (child.nodeType === 1) {
                textImgChildren(child, descendants);
            }
            if (child.nodeName === '#text' || child.nodeName === 'IMG') {
                descendants.push(child);
            }
        })
    }
}

function callback(mutationList, observer) {
  mutationList.forEach( (mutation) => {
    switch(mutation.type) {
      case 'childList':
        if (mutation.addedNodes) {
            mutation.addedNodes.forEach(node => {
                let msg = node.querySelector('span.message')
                if (msg) {
                    var des = []
                    textImgChildren(msg, des)

                    var txt = ''
                    des.forEach(cn => {
                        if (cn.nodeName === '#text') {
                            txt = txt + ' ' + cn.textContent
                        }
                        else if (cn.nodeName === 'IMG') {
                            txt = txt + ' ' + cn.alt
                        }

                    })
                    if (debugFlag) {
                        console.log(`TwitchChatFilter: ${txt}`)
                    }
                    filterList.forEach(f => {
                        let re = new RegExp(f, 'i')
                        if (txt.search(re) >= 0) {
							console.log(`TwitchChatFilter: Blocked ${f}`)
                            node.style.display = 'none'
                        }
                    })
                }
            })
        }
        break;
      case 'attributes':
        /* An attribute value changed on the element in
           mutation.target.
           The attribute name is in mutation.attributeName, and
           its previous value is in mutation.oldValue. */
        break;
    }
  });
}

function loadFilters() {
    chrome.storage.local.get(['twitchChatFilterList'], function(data) {
        if (data.twitchChatFilterList) {
            console.log('TwitchChatFilter: loaded ', data.twitchChatFilterList)
            filterList = data.twitchChatFilterList
        }
    })
}

function enableDebug() {
    debugFlag = !debugFlag
    console.log(`TwitchChatFilter: Debug is ${debugFlag}`)
}

// function injectSettings() {
//     var settings = document.querySelector('.chat-settings__content')

//     let opt = document.createElement('DIV')
//     opt.textContent = 'TwitchChatFilter: Reload filters'
//     opt.onclick = () => loadFilters()
//     let debugOpt = document.createElement('DIV')
//     debugOpt.textContent = 'TwitchChatFilter: Enable debug'
//     debugOpt.onclick = () => enableDebug()
//     settings.appendChild(opt)
//     settings.appendChild(debugOpt)
//     console.log('TwitchChatFilter: Injected settings');
// }

window.addEventListener("load", () => {
    
    loadFilters()
    
    var chat = document.querySelector('.chat-scrollable-area__message-container')
    
    // console.log(`TwitchChatFilter: ${chat}`);
    // console.log(`TwitchChatFilter: ${document.readyState}`);
    
    if (chat) {
        var observerOptions = {
            childList: true,
            attributes: true,
    
            // Omit (or set to false) to observe only changes to the parent node
            subtree: true
        }
    
        var observer = new MutationObserver(callback);
        observer.observe(chat, observerOptions);
    
        // injectSettings()
    }
})

var filterList = []
var debugFlag = false
