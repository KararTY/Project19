'use strict'

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const isDebug = process.env.NODE_ENV !== 'production'

const testChannels = {
  twitch: ['notkarar', 'forsen', 'drdisrespect', 'xqcow', 'mizkif', 'pajlada', 'nymn', 'riotgames', 'esl_csgo'],
  mixer: ['frozen-bags', 'shroud', 'ninja', 'kinggothalion']
}

const helper = require('./helpers/message')
const Client = require('./services/socket')

const messageClient = new Client(`http://${process.env.HOST}:${process.env.PORT}/ws`, 'rawchat:all', isDebug)
const eventClient = new Client(`http://${process.env.HOST}:${process.env.PORT}/ws`, 'rawstreamevent:all', isDebug)

function sendChatPacket (client, event, data) {
  if (client.socket.readyState !== 0) {
    client.socket.send(client.packets.event(event, data), err => {
      if (err) {
        client.counts.errors++
        client.events.emit('socketError', err)
        client.events.emit(`keep${(data.twitch || data.twitchOfflineBatch) ? 'Twitch' : 'Mixer'}Data`, data)
      }
    })
  } else {
    client.counts.errors++
    client.events.emit('socketError', new Error('readyState 0'))
    client.events.emit(`keep${(data.twitch || data.twitchOfflineBatch) ? 'Twitch' : 'Mixer'}Data`, data)
  }
}

messageClient.events.on('chat', data => {
  if (data.twitch || data.twitchOfflineBatch) {
    const twitch = data.twitch || data.twitchOfflineBatch
    if (isDebug && data.twitchOfflineBatch) console.log(`Client: Sending over twitch ${twitch.length} messages.`)
    if (data.twitch || data.twitchOfflineBatch.length <= 100) {
      sendChatPacket(messageClient, 'message', data)
    } else {
      const chunks = helper.chunks(data.twitchOfflineBatch, 100)
      let counter = 0
      const i = setInterval(() => {
        if (counter < chunks.length) {
          sendChatPacket(messageClient, 'message', { twitchOfflineBatch: chunks[counter] })
          counter++
        } else clearInterval(i)
      }, 1000)
    }
  } else if (data.mixer || data.mixerOfflineBatch) {
    const mixer = data.mixer || data.mixerOfflineBatch
    if (isDebug && data.mixerOfflineBatch) console.log(`Client: Sending over mixer ${mixer.length} messages.`)
    if (data.mixer || data.mixerOfflineBatch.length <= 100) {
      sendChatPacket(messageClient, 'message', data)
    } else {
      const chunks = helper.chunks(data.mixerOfflineBatch, 100)
      let counter = 0
      const i = setInterval(() => {
        if (counter < chunks.length) {
          sendChatPacket(messageClient, 'message', { mixerOfflineBatch: chunks[counter] })
          counter++
        } else clearInterval(i)
      }, 1000)
    }
  }
})

eventClient.events.on('chat', data => {
  if (data.twitch || data.twitchOfflineBatch) {
    const twitch = data.twitch || data.twitchOfflineBatch
    if (isDebug && data.twitchOfflineBatch) console.log(`Client: Sending over twitch ${twitch.length} events.`)
    if (data.twitch || data.twitchOfflineBatch.length <= 100) {
      sendChatPacket(eventClient, 'message', data)
    } else {
      const chunks = helper.chunks(data.twitchOfflineBatch, 100)
      let counter = 0
      const i = setInterval(() => {
        if (counter < chunks.length) {
          sendChatPacket(eventClient, 'message', { twitchOfflineBatch: chunks[counter] })
          counter++
        } else clearInterval(i)
      }, 1000)
    }
  } else if (data.mixer || data.mixerOfflineBatch) {
    const mixer = data.mixer || data.mixerOfflineBatch
    if (isDebug && data.mixerOfflineBatch) console.log(`Client: Sending over mixer ${mixer.length} events.`)
    if (data.mixer || data.mixerOfflineBatch.length <= 100) {
      sendChatPacket(eventClient, 'message', data)
    } else {
      const chunks = helper.chunks(data.mixerOfflineBatch, 100)
      let counter = 0
      const i = setInterval(() => {
        if (counter < chunks.length) {
          sendChatPacket(eventClient, 'message', { mixerOfflineBatch: chunks[counter] })
          counter++
        } else clearInterval(i)
      }, 1000)
    }
  }
})

require('./services/twitch')({ messageClient: messageClient.events, eventClient: eventClient.events }, testChannels.twitch, isDebug)
require('./services/mixer')({ messageClient: messageClient.events, eventClient: eventClient.events }, testChannels.mixer, isDebug)

messageClient.start()
eventClient.start()
