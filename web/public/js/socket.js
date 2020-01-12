/* global adonis */
let ws = null

// eslint-disable-next-line no-unused-vars
async function startChat (platform, channel) {
  ws = adonis.Ws(null, { path: 'ws' }).connect()

  ws.on('open', async () => {
    document.getElementById('connection').innerText = 'Websocket online.'
    await subscribeToChannel(platform, channel)
    return Promise.resolve()
  })

  ws.on('error', (err) => {
    document.getElementById('connection').innerText = `Error: ${err.message}`
  })
}

async function subscribeToChannel (platform, channel) {
  const chat = ws.subscribe(`chat:${platform.toLowerCase()}.${channel.toLowerCase()}`)

  chat.on('ready', () => {
    return Promise.resolve()
  })

  chat.on('error', () => {
    document.getElementById('connection').innerText = 'Connected to websocket, but erroring.'
  })

  chat.on('message', message => {
    const lines = document.getElementById('chat').querySelectorAll('div').length

    const div = document.createElement('div')
    div.innerText = message
    div.classList.add('chat-message')
    document.getElementById('chat').prepend(div)

    if (lines >= 20) document.getElementById('chat').removeChild(document.getElementById('chat').lastChild)
  })
}
