var filterList = []

function createDeleteButton(id, word) {
    function deleteWord() {
        let row = document.querySelector(`tr#${word}`)
        let i = filterList.indexOf(word)
        if (i > -1) {
            filterList.splice(i, 1)
        }
        row.remove()
        chrome.storage.local.set({twitchChatFilterList: filterList})
    }
    let btn = document.createElement('BUTTON')
    btn.onclick = deleteWord
    btn.innerText = 'Remove'
    return btn
}

function showList() {
	
	chrome.storage.local.get(['twitchChatFilterList'], function(data) {
		console.log('loaded: ', data.twitchChatFilterList)
		if (data.twitchChatFilterList) {
			filterList = data.twitchChatFilterList
		}
		
		let list = document.querySelector('#list')

		let newlist = document.createElement('DIV')
		newlist.id = 'list'
		let tbl = document.createElement('TABLE')

		filterList.forEach(word => {
			let row = document.createElement('TR')
			let wordCell = document.createElement('TD')
			wordCell.innerText = word

			let btnCell = document.createElement('TD')
			let btn = createDeleteButton(word, word)
			btnCell.appendChild(btn)

			row.id = word
			row.appendChild(wordCell)
			row.appendChild(btnCell)

			tbl.appendChild(row)
		})

		let row = document.createElement('TR')

		let addRow = document.createElement('TR')
		let inputCell = document.createElement('TD')
		let inpt = document.createElement('INPUT')
		inpt.placeholder = 'Word'
		inpt.id = 'add-word-inpt'
		inputCell.appendChild(inpt)

		function addWord() {
			let inpt = document.querySelector('input#add-word-inpt')
			let word = inpt.value
			filterList.push(word)
			chrome.storage.local.set({twitchChatFilterList: filterList}, () => {
				console.log(`Added ${word}`)
				showList()
			})
		}

		let addBtnCell = document.createElement('TD')
		let addBtn = document.createElement('BUTTON')
		addBtn.innerText = 'Add'
		addBtn.onclick = addWord
		addBtnCell.appendChild(addBtn)

		row.id = 'add-word-row'
		row.appendChild(inputCell)
		row.appendChild(addBtnCell)

		tbl.appendChild(row)
		newlist.appendChild(tbl)
		console.log(list)
		console.log(list.parentNode)
		list.parentNode.replaceChild(newlist, list)

	})
}

showList()
