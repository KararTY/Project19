'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')
const message = 'No results found.'
const status = 201
const code = 'E_EMPTY_QUERY_RESULT'

class EmptyQueryResultException extends LogicalException {
  constructor () {
    super(message, status, code)
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = EmptyQueryResultException
