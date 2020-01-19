/* global adonis */
let ws = null

function onWsOpen (ws) {
  return new Promise(resolve => {
    ws.on('open', () => {
      ws.clearListeners()
      resolve()
    })
  })
}

// eslint-disable-next-line no-unused-vars
async function startChat (platform, channel) {
  ws = adonis.Ws(null, { path: 'ws' }).connect()

  await onWsOpen(ws)
  document.getElementById('connection').innerText = 'Websocket online.'
  await subscribeToChannel(platform, channel)
  return Promise.resolve()
}

async function subscribeToChannel (platform, channel) {
  const chat = ws.subscribe(`chat:${platform.toLowerCase()}.${channel.toLowerCase()}`)

  chat.on('ready', () => {
    return Promise.resolve()
  })

  chat.on('error', err => {
    document.getElementById('connection').innerText = err.message
    if (err.code === 'E_CHANNEL_NOT_FOUND' && new URL(window.location).searchParams.has('redirect')) {
      window.alert(`Error ${err.message}`)
      window.history.back()
    }
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
