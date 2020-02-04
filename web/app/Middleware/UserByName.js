'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */

const UserNotFoundException = use('App/Exceptions/UserNotFoundException')

const User = use('App/Models/User')

class UserByName {
  async handle ({ params, request }, next) {
    if (!request.middlewares) request.middlewares = {}

    const { platform } = request.middlewares

    if (params.username) {
      request.middlewares.userName = params.username.toLowerCase()
      const userQuery = await User.query().where('name', request.middlewares.userName).where('platform', platform.toUpperCase()).fetch()
      if (userQuery.rows.length > 0) request.middlewares.user = userQuery.toJSON()[0]
      if (!request.middlewares.user) throw new UserNotFoundException()
    }

    await next()
  }
}

module.exports = UserByName
