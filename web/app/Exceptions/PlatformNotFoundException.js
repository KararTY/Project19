'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')
const message = 'That platform input is not supported.'
const status = 404
const code = 'E_PLATFORM_NOT_FOUND'

class PlatformNotFoundException extends LogicalException {
  constructor () {
    super(message, status, code)
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = PlatformNotFoundException
