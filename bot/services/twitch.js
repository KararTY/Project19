'use strict'

const { ChatClient } = require('dank-twitch-irc')
const client = new ChatClient({ username: process.env.TWITCH_BOT_USERNAME, password: process.env.TWITCH_CHAT_TOKEN })

async function initialize ({ messageClient, eventClient }, testChannels, isDebug) {
  let messageWebsocketFullyOnline = false
  let eventWebsocketFullyOnline = false
  let messages = []
  let events = []

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

  client.on('PRIVMSG', msg => {
    if (isDebug) console.log(`Twitch: #${msg.channelName} ${msg.displayName}: ${msg.messageText}`)
    if (messageWebsocketFullyOnline) messageClient.emit('chat', { twitch: msg })
    else messages.push(msg)
  })

  client.on('USERNOTICE', event => {
    if (isDebug) console.log(`Twitch Event: #${event.channelName} ${event.displayName}: ${event.systemMessage}`)
    if (eventWebsocketFullyOnline) eventClient.emit('event', { twitch: event })
    else events.push(event)
  })

  messageClient.on('socketJoinAck', topic => {
    if (topic === messageClient.socket.topic) {
      messageWebsocketFullyOnline = true
      if (messages.length > 0) {
        messageClient.emit('chat', { twitchOfflineBatch: messages })
        messages = []
      }
    }
  })

  eventClient.on('socketJoinAck', topic => {
    if (topic === eventClient.socket.topic) {
      eventWebsocketFullyOnline = true
      if (events.length > 0) {
        eventClient.emit('event', { twitchOfflineBatch: messages })
        events = []
      }
    }
  })

  messageClient.on('socketOffline', () => {
    messageWebsocketFullyOnline = false
  })

  eventClient.on('socketOffline', () => {
    eventWebsocketFullyOnline = false
  })

  messageClient.on('keepTwitchData', data => {
    if (data.twitch) messages.push(data.twitch)
    else if (data.twitchOfflineBatch) messages.push(...data.twitchOfflineBatch)
  })

  eventClient.on('keepTwitchData', data => {
    if (data.twitch) events.push(data.twitch)
    else if (data.twitchOfflineBatch) events.push(...data.twitchOfflineBatch)
  })

  client.connect()
}

module.exports = initialize
