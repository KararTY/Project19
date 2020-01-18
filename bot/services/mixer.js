'use strict'

const Mixer = require('@mixer/client-node')
const ws = require('ws')

let isDebug

let messages = []
let events = []

const client = new Mixer.Client(new Mixer.DefaultRequestRunner())

client.use(new Mixer.OAuthProvider(client, {
  tokens: {
    access: process.env.MIXER_TOKEN,
    expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
  }
}))

async function initialize ({ messageClient, eventClient }, testChannels, isdebug) {
  isDebug = isdebug

  messageClient.on('socketJoinAck', topic => {
    if (topic === messageClient.socket.topic) {
      if (messages.length > 0) {
        messageClient.emit('chat', { mixerOfflineBatch: messages })
        messages = []
      }
    }
  })

  eventClient.on('socketJoinAck', topic => {
    if (topic === eventClient.socket.topic) {
      if (events.length > 0) {
        eventClient.emit('chat', { mixerOfflineBatch: events })
        events = []
      }
    }
  })

  messageClient.on('keepMixerData', data => {
    if (data.mixer) messages.push(data.mixer)
    else if (data.mixerOfflineBatch) messages.push(...data.mixerOfflineBatch)
  })

  eventClient.on('keepMixerData', data => {
    if (data.mixer) events.push(data.mixer)
    else if (data.mixerOfflineBatch) events.push(...data.mixerOfflineBatch)
  })

  try {
    // Loop all requested channels, as each channel requires a separate websocket connection.
    for (let index = 0; index < testChannels.length; index++) {
      const channelName = testChannels[index]

      const channelData = await client.request('GET', `/channels/${channelName}`)
      // Our chat connection details.
      const channel = await new Mixer.ChatService(client).join(channelData.body.id)

      // if (isDebug) console.log('Mixer:', channel)
      await createChatSocket(channelData, channel, { messageClient, eventClient })
    }
  } catch (err) {
    console.error('Mixer: Something went wrong.')
    console.error('Mixer:', err)
  }
}

/**
 * Creates a Mixer chat socket and sets up listeners to various chat events.
 * @param {number} userId The user to authenticate as
 * @param {number} channelId The channel id to join
 * @param {string[]} endpoints An array of endpoints to connect to
 * @param {string} authkey An authentication key to connect with
 * @returns {Promise.<>}
 */
async function createChatSocket (channelData, channel, { messageClient, eventClient }) {
  const { /* userId, */ id: channelId, token } = channelData.body
  const { endpoints /*, authkey */ } = channel.body

  const socket = new Mixer.Socket(ws, endpoints).boot()
  socket.__token = token

  // if (isDebug) console.log('Mixer:', userId, channelId, endpoints, authkey)

  try {
    // You don't need to wait for the socket to connect before calling
    // methods. We spool them and run them when connected automatically.
    await socket.auth(channelId)
    console.log(`Mixer: You are now Mixer authenticated in ${channelId}!`)

    // Send a chat message
    // return socket.call('msg', ['Hello world!'])

    // Listen for chat messages. Note you will also receive your own!
    socket.on('ChatMessage', data => {
      data.token = socket.__token.toLowerCase()

      if (isDebug) console.log(`Mixer: #${data.token} ${data.user_name}: ${data.message.message.map(message => message.text).join('')}`)

      if (String(messageClient.socket.socket.readyState) === '1') messageClient.emit('chat', { mixer: data })
      else messages.push(data)
    })

    socket.on('SkillAttribution', event => {
      event.token = socket.__token.toLowerCase()

      if (isDebug) console.log(`Mixer Event: #${event.token} ${event.user_name}: Executed [${event.skill.skill_name}] for ${event.skill.cost} ${event.skill.currency}.`)

      if (String(eventClient.socket.socket.readyState) === '1') eventClient.emit('event', { mixer: event })
      else events.push(event)
    })

    // Listen for socket errors. You will need to handle these here.
    socket.on('error', err => {
      console.error('Mixer: Socket error.')
      console.error('Mixer:', err)
    })
  } catch (err) {
    console.error('Mixer: Oh no! An error occurred.')
    console.error('Mixer:', err)
  }
}

module.exports = initialize
