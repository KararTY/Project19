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
  const path = window.location.pathname.slice(1).split('/')
  const platform = path[0].toLowerCase()
  const channel = path[1].toLowerCase()
  const chat = ws.subscribe(`chat:${platform}.${channel}`)

  chat.on('error', () => {
    document.getElementById('connection').innerText = 'Connected to websocket, but erroring.'
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
