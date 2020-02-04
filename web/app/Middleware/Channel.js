'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */

const ChannelNotFoundException = use('App/Exceptions/ChannelNotFoundException')

const User = use('App/Models/User')

class ChannelName {
  async handle ({ params, request }, next) {
    if (!request.middlewares) request.middlewares = {}

    const { platform } = request.middlewares

    if (params.channel) {
      const channelName = params.channel.toLowerCase()
      const channelQuery = await User.query().where('name', channelName).where('platform', platform.toUpperCase()).fetch()
      if (channelQuery.rows.length > 0) request.middlewares.channel = channelQuery.toJSON()[0]
      if (!request.middlewares.channel) throw new ChannelNotFoundException()
    }

    await next()
  }
}

module.exports = ChannelName
