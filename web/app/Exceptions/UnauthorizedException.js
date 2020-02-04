'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')
const message = 'Your IP is unauthorized.'
const status = 401
const code = 'E_UNAUTHORIZED_CONNECTION'

class UnauthorizedException extends LogicalException {
  constructor () {
    super(message, status, code)
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = UnauthorizedException
