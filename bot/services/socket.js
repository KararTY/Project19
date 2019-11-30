const WS = require('ws')
const { EventEmitter } = require('events')

const packets = require('../helpers/packets')

class Client {
  constructor (socketUrl, topic, isDebug) {
    this.socket = null
    this.socketUrl = socketUrl
    this.isDebug = isDebug
    this.events = new EventEmitter()

    this.topic = topic
    this.packets = packets(this.topic)

    this.counts = {
      pings: 0,
      errors: 0,
      reconnects: 0
    }

    this.timer = null
    this.socketSettings = {}
    this.mixer = null
    this.twitch = null

    this.events.on('socketOpen', () => {
      console.log('Socket: Connected to web server.')

      this.counts.pings = 0
      this.counts.reconnects = 0

      this.socket.send(this.packets.join)
    })

    this.events.on('socketMessage', data => {
      if (this.isDebug) console.log('Socket:', JSON.parse(data))

      if (this.packets.isOpen(data)) {
        this.socketSettings = JSON.parse(data).d
        // Start pinging server to stay alive.
        this.timer = setInterval(() => {
          this.socket.send(JSON.stringify(this.packets.ping), err => {
            if (err) {
              this.counts.pings++
              this.events.emit('socketError', err)
            }
          })
        }, this.socketSettings.clientInterval)
      } else if (this.packets.isJoinAck(data)) {
        data = JSON.parse(data)
        this.events.emit('socketJoinAck', data.d.topic)
        console.log(`Socket: Acknowledged joining "${data.d.topic}".`)
      } else if (this.packets.isPong(data) && this.isDebug) console.log('Socket: PONG')
    })

    this.events.on('socketError', err => {
      if (this.isDebug) console.log('Socket:', err)

      if (err.code === 'ECONNREFUSED') {
        console.log('Socket: Unable to connect to web server... Waiting 10 seconds before retrying connection.')
        this.reconnect()
      } else if (this.socket.readyState === 3 || err.message === 'WebSocket is not open: readyState 3 (CLOSED)') {
        console.log('Socket: Websocket closed? Waiting 10 seconds before retrying connection.')
        this.reconnect()
      } else if (this.counts.errors > 3) {
        this.reconnect()
      }
    })
  }

  start () {
    this.socket = new WS(this.socketUrl)

    this.socket.on('open', () => this.events.emit('socketOpen'))
    this.socket.on('message', data => this.events.emit('socketMessage', data))
    this.socket.on('error', err => this.events.emit('socketError', err))
  }

  reconnect () {
    if (this.socket.readyState === 3 || this.socket.readyState === 2) {
      this.events.emit('socketOffline')

      this.counts.reconnects++

      console.log(`Socket: Reconnecting x${this.counts.reconnects}.`)
      clearInterval(this.timer)
      this.socket.terminate()
      this.socket.removeAllListeners()
      setTimeout(() => {
        this.start()
      }, 10000)
    }
  }
}

module.exports = Client
