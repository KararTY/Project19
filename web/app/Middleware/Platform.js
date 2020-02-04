'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */

const PlatformNotFoundException = use('App/Exceptions/PlatformNotFoundException')

class Platform {
  async handle ({ params, request }, next) {
    if (!request.middlewares) request.middlewares = {}

    const value = params.platform || request.only(['platform']).platform

    if (value) {
      request.middlewares.platform = value.toLowerCase()

      if (!['top', 'mixer', 'twitch'].includes(request.middlewares.platform)) throw new PlatformNotFoundException()
    }

    await next()
  }
}

module.exports = Platform
