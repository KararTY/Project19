'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

const PlatformNotFoundException = use('App/Exceptions/PlatformNotFoundException')
const ChannelNotFoundException = use('App/Exceptions/ChannelNotFoundException')

const User = use('App/Models/User')
const StreamEvent = use('App/Models/StreamEvent')

Route.route('/stats/:platform?/:channelname?', async ({ params, request, response, view }) => {
  const method = request.method()

  let platform
  if (params.platform) {
    platform = params.platform.toLowerCase()

    if (!['mixer', 'twitch'].includes(platform)) throw new PlatformNotFoundException()
  }

  let channel
  let channelName
  if (params.channelname) {
    channelName = params.channelname.toLowerCase()
    const channelQuery = await User.query().where('name', channelName).where('platform', platform.toUpperCase()).fetch()
    if (channelQuery.rows.length > 0) channel = channelQuery.toJSON()[0]
    if (!channel) throw new ChannelNotFoundException()
  }

  if (method === 'POST') {
    let data
    if (platform && channel) {
      const eventQuery = await StreamEvent.query().where('event_name', 'viewers').where('userid', channel.userid).orderBy('created_at', 'desc').limit(50).fetch()
      if (eventQuery.rows.length > 0) data = eventQuery.toJSON().map(obj => { return { time: obj.created_at, value: obj.event_value } })
    }

    return JSON.stringify(data)
  } else {
    return view.render('core.template', {
      web: {
        template: 'partials.stats',
        navbarActive: 'stats',
        chart: platform && channelName ? `chart.${platform}.${channelName}` : 'top'
      }
    })
  }
}, ['GET', 'POST']).as('stats')
