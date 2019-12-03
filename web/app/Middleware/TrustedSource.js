'use strict'

const Env = use('Env')
const Logger = use('Logger')

class TrustedSource {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async wsHandle ({ request, response }, next) {
    const ip = request.ip()

    Logger.debug('[TrustedSource] IP: %s, ENV HOST: %s', ip, Env.get('HOST'))

    if (ip !== Env.get('HOST')) return response.unauthorized('Untrusted source.')
    // call next to advance the request
    await next()
  }
}

module.exports = TrustedSource
