'use strict'

const Ws = use('Ws')

class ChatUpdateController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request

    if (process.env.NODE_ENV !== 'production') console.log(socket, request)
  }

  onMessage (message) {
    const channel = Ws.getChannel('chat:*').topic('chat:parsed')
    if (message.twitch) {
      if (process.env.NODE_ENV !== 'production') console.log('Twitch message received:', message.twitch.messageText)
      if (channel) channel.broadcast('message', `[Twitch#${message.twitch.channelName}] ${message.twitch.displayName}: ${message.twitch.messageText}`)
    }
    if (message.twitchOfflineBatch) console.log('Twitch messages batch received:', message.twitchOfflineBatch.length)
    // message.twitchOfflineBatch.map(message => message.messageText).join('| ')

    if (message.mixer) {
      if (process.env.NODE_ENV !== 'production') console.log('Mixer message received:', message.mixer.message.message.map(message => message.text).join(''))
      if (channel) channel.broadcast('message', `[Mixer#${message.mixer.channel}] ${message.mixer.user_name}: ${message.mixer.message.message.map(message => message.text).join('')}`)
    }
    if (message.mixerOfflineBatch) console.log('Mixer messages batch received:', message.mixerOfflineBatch.length)
    // message.mixerOfflineBatch.map(mixer => mixer.message.message.map(message => message.text).join('')).join('| ')

    // same as: socket.on('message')
  }

  onClose (close) {
    if (process.env.NODE_ENV !== 'production') console.log('close')
    // same as: socket.on('close')
  }

  onError (error) {
    if (process.env.NODE_ENV !== 'production') console.log(error)
    // same as: socket.on('error')
  }
}

module.exports = ChatUpdateController
