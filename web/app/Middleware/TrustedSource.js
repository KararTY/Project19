'use strict'

const Logger = use('Logger')

const UnauthorizedWebsocketException = use('App/Exceptions/UnauthorizedWebsocketException')
const UnauthorizedException = use('App/Exceptions/UnauthorizedException')

const Config = use('Adonis/Src/Config')

class TrustedSource {
  // For WS requests.
  async wsHandle ({ request }, next) {
    const trustedIPs = Config.get('trustedSources.websocketIPs')
    const ip = request.ip()

    if (!trustedIPs.includes(ip)) throw new UnauthorizedWebsocketException()
    Logger.info('[TrustedSource] IP: (WEBSOCKET) %s %s %s', ip, request.method(), request.url())

    // call next to advance the request
    await next()
  }

  // For HTTP requests.
  async handle ({ request }, next) {
    const trustedIPs = Config.get('trustedSources.dashboardIPs')
    const ip = request.ip()

    if (!trustedIPs.includes(ip)) throw new UnauthorizedException()
    Logger.info('[TrustedSource] IP: %s %s %s', ip, request.method(), request.url())

    // call next to advance the request
    await next()
  }
}

module.exports = TrustedSource
