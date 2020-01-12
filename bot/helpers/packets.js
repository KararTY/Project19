'use strict'

// Helper for Adonis websocket packets.

// https://github.com/adonisjs/adonis-websocket-packet
// https://github.com/adonisjs/adonis-websocket-protocol

const wsp = require('@adonisjs/websocket-packet')

module.exports = (topic) => {
  return {
    join: JSON.stringify(wsp.joinPacket(topic)),
    leave: JSON.stringify(wsp.leavePacket(topic)),
    event: (event, data) => JSON.stringify(wsp.eventPacket(topic, event, data)),
    isJoinAck: (packet) => wsp.isJoinAckPacket(JSON.parse(packet)),
    isOpen: (packet) => wsp.isOpenPacket(JSON.parse(packet)),
    isPong: (packet) => wsp.isPongPacket(JSON.parse(packet)),
    ping: wsp.pingPacket(),
    wsp: wsp
  }
}
