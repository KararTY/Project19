const { ChatClient } = require('dank-twitch-irc')
const client = new ChatClient({ username: process.env.TWITCH_BOT_USERNAME, password: process.env.TWITCH_CHAT_TOKEN })

async function initialize (events, testChannels, isDebug) {
  let websocketFullyOnline = false
  let messages = []

  client.on('ready', async () => {
    if (isDebug) console.log('Twitch: Successfully connected to Twitch IRC.')

    // Join chatrooms
    for (let index = 0; index < testChannels.length; index++) {
      const channelName = testChannels[index]
      await client.join(channelName)
      console.log('Twitch: Joined', channelName)
    }
  })

  client.on('close', err => {
    if (err != null) {
      console.error('Twitch: Client closed due to error', err)
    }
  })

  client.on('PRIVMSG', async msg => {
    if (isDebug) console.log(`Twitch: #${msg.channelName} ${msg.displayName}: ${msg.messageText}`)
    if (websocketFullyOnline) events.emit('chat', { twitch: msg })
    else messages.push(msg)
  })

  events.on('socketJoinAck', (topic) => {
    if (topic === events.socket.topic) {
      websocketFullyOnline = true
      if (messages.length > 0) {
        events.emit('chat', { twitchOfflineBatch: messages })
        messages = []
      }
    }
  })

  events.on('socketOffline', () => {
    websocketFullyOnline = false
  })

  events.on('keepTwitchMessage', (data) => {
    if (data.twitch) messages.push(data.twitch)
    else if (data.twitchOfflineBatch) messages.push(...data.twitchOfflineBatch)
  })

  client.connect()
}

module.exports = initialize
