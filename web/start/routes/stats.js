'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

const PlatformNotFoundException = use('App/Exceptions/PlatformNotFoundException')
const ChannelNotFoundException = use('App/Exceptions/ChannelNotFoundException')

const User = use('App/Models/User')
const StreamEvent = use('App/Models/StreamEvent')

const topStreams = {
  nextUpdate: new Date(),
  streams: []
}

Route.route('/stats/:platform?/:channelname?', async ({ params, request, response, view }) => {
  const method = request.method()

  let platform
  if (params.platform) {
    if (params.platform === 'top' && method === 'POST') {
      // Get top
      if (topStreams.nextUpdate.getTime() < new Date().getTime()) {
        const streams = []
        for (let i = 0; i < 3; i++) {
          const topTwitchStreamer = await StreamEvent.findBy('event_name', `twitch-top-${i}`)
          const topMixerStreamer = await StreamEvent.findBy('event_name', `mixer-top-${i}`)
          if (topTwitchStreamer && !streams.find(stream => stream.name === topTwitchStreamer.event_extra.name && stream.platform === 'TWITCH')) streams.push({ platform: 'TWITCH', viewers: topTwitchStreamer.event_value, time: topTwitchStreamer.updated_at, thumbnail: topTwitchStreamer.event_extra.thumbnail, name: topTwitchStreamer.event_extra.name })
          if (topMixerStreamer && !streams.find(stream => stream.name === topMixerStreamer.event_extra.name && stream.platform === 'MIXER')) streams.push({ platform: 'MIXER', viewers: topMixerStreamer.event_value, time: topMixerStreamer.updated_at, thumbnail: topMixerStreamer.event_extra.thumbnail, name: topMixerStreamer.event_extra.name })
        }

        topStreams.nextUpdate = new Date(new Date().getTime() + ((1000 * 60) * 5))
        topStreams.streams = streams
      }

      return topStreams.streams
    } else {
      platform = params.platform.toLowerCase()

      if (!['mixer', 'twitch'].includes(platform)) throw new PlatformNotFoundException()
    }
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
