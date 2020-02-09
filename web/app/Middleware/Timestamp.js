'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */

const TimestampInvalidException = use('App/Exceptions/TimestampInvalidException')

class Timestamp {
  async handle ({ params, request }, next) {
    if (!request.middlewares) request.middlewares = {}

    if (params.timestamp) {
      request.middlewares.timestamp = params.timestamp.toLowerCase()

      const regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/

      if (!request.middlewares.timestamp.match(regex)) throw new TimestampInvalidException()
    }

    await next()
  }
}

module.exports = Timestamp
