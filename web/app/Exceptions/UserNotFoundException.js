'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')
const message = 'User not found.'
const status = 404
const code = 'E_USER_NOT_FOUND'

class UserNotFoundException extends LogicalException {
  constructor () {
    super(message, status, code)
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = UserNotFoundException
