'use strict'

const Logger = use('Logger')

const UnauthorizedWebsocketException = use('App/Exceptions/UnauthorizedWebsocketException')

const Config = use('Adonis/Src/Config')

class TrustedSource {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async wsHandle ({ request }, next) {
    const trustedIPs = Config.get('trustedSources.websocketIPs')
    const ip = request.ip()

    Logger.info('[TrustedSource] IP: %s', ip)

    if (!trustedIPs.includes(ip)) throw new UnauthorizedWebsocketException()

    // call next to advance the request
    await next()
  }
}

module.exports = TrustedSource
