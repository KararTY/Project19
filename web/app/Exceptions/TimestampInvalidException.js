'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')
const message = 'That timestamp is not a valid UTC timestamp. Format is "YYYY-MM-DD".'
const status = 400
const code = 'E_TIMESTAMP_INVALID'

class TimestampInvalidException extends LogicalException {
  constructor () {
    super(message, status, code)
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = TimestampInvalidException
