/* global adonis */
let ws = null

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
  const chat = ws.subscribe(`chat:${platform}.${channel}`)

  chat.on('ready', () => {
    for (let index = 0; index < 15; index++) {
      const div = document.createElement('div')
      div.innerHTML = '<br>'
      document.getElementById('chat').appendChild(div)
    }
    return Promise.resolve()
  })

  chat.on('error', () => {
    document.getElementById('connection').innerText = 'Connected to websocket, but erroring.'
  })

  chat.on('message', message => {
    const lines = document.getElementById('chat').querySelectorAll('div').length

    const div = document.createElement('div')
    div.innerText = message
    document.getElementById('chat').appendChild(div)

    if (lines >= 15) document.getElementById('chat').removeChild(document.getElementById('chat').firstChild)
  })
}
