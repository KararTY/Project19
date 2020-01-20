'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const moment = require('moment')

const PlatformNotFoundException = use('App/Exceptions/PlatformNotFoundException')
const TimestampInvalidException = use('App/Exceptions/TimestampInvalidException')
const ChannelNotFoundException = use('App/Exceptions/ChannelNotFoundException')
const UserNotFoundException = use('App/Exceptions/UserNotFoundException')
const LogsNotFoundException = use('App/Exceptions/LogsNotFoundException')

const Logs = use('Service/Logs')
const User = use('App/Models/User')

Route.route('/logs/:platform?/:timestamp?/:channelname?/:username?', async ({ params, request, view }) => {
  const method = request.method()

  let format
  if (method === 'GET') format = request.get().format

  let platform
  if (params.platform) {
    platform = params.platform.toLowerCase()

    if (!['mixer', 'twitch'].includes(platform)) throw new PlatformNotFoundException()
  }

  let timestamp
  if (params.timestamp) {
    timestamp = params.timestamp.toLowerCase()

    const regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/

    if (!timestamp.match(regex)) throw new TimestampInvalidException()
  }

  let channel
  let channelName
  if (params.channelname) {
    channelName = params.channelname.toLowerCase()
    const channelQuery = await User.query().where('name', channelName).where('platform', platform.toUpperCase()).fetch()
    if (channelQuery.rows.length) channel = channelQuery.toJSON()[0]
    if (!channel) throw new ChannelNotFoundException()
  }

  let user
  if (params.username) {
    const userName = params.username.toLowerCase()
    const userQuery = await User.query().where('name', userName).where('platform', platform.toUpperCase()).fetch()
    if (userQuery.rows.length) user = userQuery.toJSON()[0]
    if (!user) throw new UserNotFoundException()
  }

  let logFile
  if ((channel && method === 'POST') || (format && format === 'plain')) logFile = await Logs.readLog({ channel: channel, platform, timestamp: moment(timestamp) }, user || undefined)

  if (method === 'POST') {
    if (logFile && logFile.length) return logFile
    else throw new LogsNotFoundException()
  } else {
    return view.render((format && format === 'plain')
      ? 'partials.logs-plain'
      : 'core.template', {
      web: {
        title: `Logs${channelName ? ` - ${channelName.toUpperCase()}` : ''}${timestamp ? ` - ${timestamp}` : ''}`,
        template: 'partials.logs',
        navbarActive: 'logs',
        logFile: logFile || new LogsNotFoundException()
      }
    })
  }
}, ['GET', 'POST']).as('logs')
