'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')
const message = 'Logs not found.'
const status = 404
const code = 'E_LOGS_NOT_FOUND'

class LogsNotFoundException extends LogicalException {
  constructor () {
    super(message, status, code)
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = LogsNotFoundException
