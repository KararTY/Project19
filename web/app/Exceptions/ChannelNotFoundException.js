'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')
const message = 'Channel not found.'
const status = 404
const code = 'E_CHANNEL_NOT_FOUND'

class ChannelNotFoundException extends LogicalException {
  constructor () {
    super(message, status, code)
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = ChannelNotFoundException
