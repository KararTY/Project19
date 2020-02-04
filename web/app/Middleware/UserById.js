'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */

const UserNotFoundException = use('App/Exceptions/UserNotFoundException')

const User = use('App/Models/User')

class UserById {
  async handle ({ params, request }, next) {
    if (!request.middlewares) request.middlewares = {}

    if (params.userid) {
      request.middlewares.userId = params.userid.toLowerCase()
      const userQuery = await User.findBy('userid', request.middlewares.userId)
      if (userQuery) request.middlewares.user = userQuery
      if (!request.middlewares.user) throw new UserNotFoundException()
    }

    await next()
  }
}

module.exports = UserById
