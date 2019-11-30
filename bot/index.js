require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const isDebug = process.env.NODE_ENV !== 'production'

const testChannels = {
  twitch: ['notkarar', 'forsen', 'drdisrespect', 'xqcow', 'mizkif', 'pajlada', 'nymn'],
  mixer: ['frozen-bags', 'shroud', 'ninja', 'KingGothalion']
}

const helper = require('./helpers/message')
const Client = require('./services/socket')

const client = new Client(`http://${process.env.HOST}:${process.env.PORT}/ws`, 'chat:raw', isDebug)

function sendChatPacket (event, data) {
  client.socket.send(client.packets.event(event, data), err => {
    if (err) {
      client.counts.errors++
      client.events.emit('socketError', err)
      client.events.emit(`keep${(data.twitch || data.twitchOfflineBatch) ? 'Twitch' : 'Mixer'}Message`, data)
    }
  })
}

client.events.on('chat', data => {
  if (data.twitch || data.twitchOfflineBatch) {
    const twitch = data.twitch || data.twitchOfflineBatch
    if (isDebug && data.twitchOfflineBatch) console.log(`Client: Sending over twitch ${twitch.length} messages.`)
    if (data.twitch || data.twitchOfflineBatch.length <= 100) {
      sendChatPacket('message', data)
    } else {
      const chunks = helper.chunks(data.twitchOfflineBatch, 100)
      let counter = 0
      const i = setInterval(() => {
        if (counter < chunks.length) {
          sendChatPacket('message', { twitchOfflineBatch: chunks[counter] })
          counter++
        } else clearInterval(i)
      }, 1000)
    }
  } else if (data.mixer || data.mixerOfflineBatch) {
    const mixer = data.mixer || data.mixerOfflineBatch
    if (isDebug && data.mixerOfflineBatch) console.log(`Client: Sending over mixer ${mixer.length} messages.`)
    if (data.mixer || data.mixerOfflineBatch.length <= 100) {
      sendChatPacket('message', data)
    } else {
      const chunks = helper.chunks(data.mixerOfflineBatch, 100)
      let counter = 0
      const i = setInterval(() => {
        if (counter < chunks.length) {
          sendChatPacket('message', { mixerOfflineBatch: chunks[counter] })
          counter++
        } else clearInterval(i)
      }, 1000)
    }
  }
})

require('./services/twitch')(client.events, testChannels.twitch, isDebug)
require('./services/mixer')(client.events, testChannels.mixer, isDebug)

client.start()
