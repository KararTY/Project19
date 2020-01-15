'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const moment = require('moment')

const PlatformNotFoundException = use('App/Exceptions/PlatformNotFoundException')
const TimestampInvalidException = use('App/Exceptions/TimestampInvalidException')
const ChannelNotFoundException = use('App/Exceptions/ChannelNotFoundException')
const UserNotFoundException = use('App/Exceptions/UserNotFoundException')

const Logs = use('Service/Logs')
const User = use('App/Models/User')

Route.get('/logs/:platform?/:timestamp?/:channelname?/:username?', async ({ params, request, response, view }) => {
  // const format = request.get().format

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
  if (params.channelname) {
    const channelName = params.channelname.toLowerCase()
    channel = await User.findBy('name', channelName)
    if (!channel) throw new ChannelNotFoundException()
  }

  let user
  if (params.username) {
    const userName = params.username.toLowerCase()
    user = await User.findBy('name', userName)
    if (!user) throw new UserNotFoundException()
  }

  if (channel) {
    let logFile
    if (user) {
      logFile = await Logs.readLog({ channel: channel.toJSON(), platform, timestamp: moment(timestamp) }, user.toJSON())
    } else {
      // Display all of chat
      logFile = await Logs.readLog({ channel: channel.toJSON(), platform, timestamp: moment(timestamp) })
    }

    return logFile
  } else {

  }

  // if (format && format === 'plain' && params.platform && params.channel) {
  //   return view.render('partials.live-plain', {
  //     web: {
  //       title: `Live chat - ${params.channel.toUpperCase()}`,
  //       navbarActive: 'live'
  //     }
  //   })
  // } else {
  //   return view.render('core.template', {
  //     web: {
  //       title: `Live chat${params.channel ? ` - ${params.channel.toUpperCase()}` : ''}`,
  //       template: 'partials.live',
  //       navbarActive: 'live'
  //     }
  //   })
  // }
}).as('logs')
