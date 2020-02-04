'use strict'

const User = use('App/Models/User')

const Twitch = use('Service/Twitch')
const Mixer = use('Service/Mixer')
const Socket = use('Service/Socket')

const EmptyQueryResult = use('App/Exceptions/EmptyQueryResultException')
const UserNotFoundException = use('App/Exceptions/UserNotFoundException')

class DashboardController {
  async index ({ request, view }) {
    return view.render('core.dashboard', {
      web: {
        title: 'Dashboard',
        template: 'partials.dashboard.index',
        navbarActive: 'dashboard'
      }
    })
  }

  async create ({ request, response }) {
    const { name } = request.only(['platform', 'name'])
    const { platform } = request.middlewares

    let platformDetails
    try {
      switch (platform.toUpperCase()) {
        case 'TWITCH':
          platformDetails = await Twitch.getUser(name)
          break
        case 'MIXER':
          platformDetails = await Mixer.getUser(name)
          break
      }
    } catch (err) {
      throw new UserNotFoundException()
    }

    const userId = `${platform.toLowerCase().charAt(0)}-${platformDetails.id}`
    const user = await User.findBy('userid', userId)

    if (!user) {
      const newUser = new User()
      newUser.userid = userId
      newUser.name = platformDetails.name.toLowerCase()
      newUser.platform = platform.toUpperCase()

      await newUser.save()

      return response.redirect(`/dashboard/${newUser.userid}?success=true`)
    } else return response.redirect(`/dashboard/${user.userid}?exists=true`)
  }

  async query ({ request, view }) {
    const method = request.method()

    const { name, userid, platform, pagination } = request.only(['userid', 'platform', 'name', 'pagination'])
    let track = request.only(['track']).track

    if (typeof track === 'string' && track.length > 0) {
      if (track === 'true') track = true
      else track = false
    }

    if (method === 'POST') {
      const queryBuilder = User.query()

      if (typeof track === 'boolean') queryBuilder.where('track', track)

      if (userid && userid.length > 0) queryBuilder.where('userid', userid)

      if (platform && platform.length > 0) queryBuilder.where('platform', platform.toUpperCase())

      if (name && name.length > 0) queryBuilder.where('name', name.toLowerCase())

      const result = await queryBuilder.paginate(Number.isNaN(Number(pagination)) ? 1 : Number(pagination), 20)

      if (result.rows.length > 0) {
        const results = result.toJSON()
        return {
          page: results.page,
          max: results.lastPage,
          data: results.data.map(result => {
            return {
              userid: result.userid,
              name: result.name,
              platform: result.platform,
              track: result.track,
              rank: result.rank
            }
          }),
          total: results.total
        }
      } else throw new EmptyQueryResult()
    } else {
      return view.render('core.dashboard', {
        web: {
          title: 'Dashboard',
          template: 'partials.dashboard.query',
          navbarActive: 'dashboard'
        }
      })
    }
  }

  async read ({ request, view }) {
    return view.render('core.dashboard', {
      web: {
        title: 'Dashboard',
        template: 'partials.dashboard.user',
        navbarActive: 'dashboard',
        user: request.middlewares.user.toJSON()
      }
    })
  }

  async update ({ request, response }) {
    const { name, userid: userIdNumber, rank, platform } = request.only(['name', 'userid', 'rank', 'platform'])
    let track = request.only(['track']).track

    if (typeof track === 'string' && track.length > 0) {
      if (track === 'true') track = true
      else track = false
    }

    const user = request.middlewares.user

    const newUserId = `${platform.toLowerCase().charAt(0)}-${userIdNumber}`

    user.name = name
    user.userid = newUserId
    user.rank = Number.isNaN(Number(rank)) ? 0 : Number(rank)
    user.platform = platform.toUpperCase()
    user.track = track

    await user.save()

    return response.redirect(`/dashboard/${newUserId}?success=true&date=${new Date().getTime()}`)
  }

  async delete ({ request, response }) {
    await request.middlewares.user.delete()

    return response.redirect('/dashboard?success=true')
  }

  async updateBots ({ response }) {
    try {
      await Socket.sendStreamers()
    } catch (err) {
      return response.redirect(`/dashboard?command=${err.message}`)
    }

    return response.redirect('/dashboard?command=true')
  }
}

module.exports = DashboardController
