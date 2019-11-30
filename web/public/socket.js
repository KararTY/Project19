/* global adonis */
let ws = null

function startChat () {
  ws = adonis.Ws(null, { path: 'ws' }).connect()

  ws.on('open', () => {
    document.getElementById('connection').innerText = 'Websocket online.'
    subscribeToChannel()
  })

  ws.on('error', (err) => {
    document.getElementById('connection').innerText = `Error: ${err.message}`
  })
}

function subscribeToChannel () {
  const chat = ws.subscribe('chat:parsed')

  chat.on('error', () => {
    document.getElementById('connection').innerText = 'Connected to topic "chat".'
  })

  chat.on('message', (message) => {
    const lines = document.getElementById('chat').querySelectorAll('div').length

    const div = document.createElement('div')
    div.innerText = message
    document.getElementById('chat').appendChild(div)

    if (lines >= 10) document.getElementById('chat').removeChild(document.getElementById('chat').firstChild)
  })
}

startChat()
