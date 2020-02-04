'use strict'

const { ChatClient } = require('dank-twitch-irc')
const client = new ChatClient({ username: process.env.TWITCH_BOT_USERNAME, password: 'oauth:' + process.env.TWITCH_CHAT_TOKEN })

async function initialize (messageClient, isDebug) {
  let messages = []
  const streamers = []

  async function addNewStreamer (user) {
    if (streamers.includes(user.name)) {
      console.log('Twitch: Already added streamer. Skipping.')
    } else if (client.ready) {
      await client.join(user.name)
      console.log('Twitch: Joined', user.name)
      streamers.push(user.name)
    } else {
      setTimeout(() => {
        addNewStreamer(user)
      }, 1000)
    }
  }

  client.on('ready', async () => {
    if (isDebug) console.log('Twitch: Successfully connected to Twitch IRC.')
  })

  client.on('close', err => {
    if (err != null) {
      console.error('Twitch: Client closed due to error', err)
    }
  })

  client.on('PRIVMSG', msg => {
    if (isDebug) console.log(`Twitch: #${msg.channelName} ${msg.displayName}: ${msg.messageText}`)

    if (String(messageClient.socket.socket.readyState) === '1') messageClient.emit('chat', { twitch: msg })
    else messages.push(msg)
  })

  client.on('USERNOTICE', event => {
    const eventObj = { ...event, _type: 'event' }
    if (isDebug) console.log(`Twitch Event: #${event.channelName} ${event.displayName}: ${event.systemMessage}`)

    if (String(messageClient.socket.socket.readyState) === '1') messageClient.emit('chat', { twitch: eventObj })
    else messages.push(eventObj)
  })

  messageClient.on('socketJoinAck', topic => {
    if (topic === messageClient.socket.topic) {
      if (messages.length > 0) {
        messageClient.emit('chat', { twitchOfflineBatch: messages })
        messages = []
      }
    }
  })

  messageClient.on('keepTwitchData', data => {
    if (data.twitch) messages.push(data.twitch)
    else if (data.twitchOfflineBatch) messages.push(...data.twitchOfflineBatch)
  })

  messageClient.on('newStreamer', data => {
    if (data.platform === 'TWITCH') addNewStreamer(data)
  })

  client.connect()
}

module.exports = initialize
