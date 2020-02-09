'use strict'

const StreamEvent = use('App/Models/StreamEvent')

const topStreams = {
  nextUpdate: new Date(),
  streams: []
}

class StatController {
  async index ({ request, view }) {
    const method = request.method()
    const { channel, platform } = request.middlewares

    if (platform === 'top' && method === 'POST') {
      // Get top
      if (topStreams.nextUpdate.getTime() < new Date().getTime()) {
        const streams = []
        for (let i = 0; i < 3; i++) {
          const topTwitchStreamer = await StreamEvent.findBy('event_name', `twitch-top-${i}`)
          if (topTwitchStreamer) {
            const json = topTwitchStreamer.toJSON()
            if (!streams.find(stream => stream.name === json.event_extra.name && stream.platform === 'TWITCH')) {
              streams.push({
                platform: 'TWITCH',
                viewers: json.event_value,
                time: json.updated_at,
                thumbnail: json.event_extra.thumbnail,
                name: json.event_extra.name
              })
            }
          }

          const topMixerStreamer = await StreamEvent.findBy('event_name', `mixer-top-${i}`)
          if (topMixerStreamer) {
            const json = topMixerStreamer.toJSON()
            if (!streams.find(stream => stream.name === json.event_extra.name && stream.platform === 'MIXER')) {
              streams.push({
                platform: 'MIXER',
                viewers: json.event_value,
                time: json.updated_at,
                thumbnail: json.event_extra.thumbnail,
                name: json.event_extra.name
              })
            }
          }
        }

        topStreams.nextUpdate = new Date(new Date().getTime() + ((1000 * 60) * 5))
        topStreams.streams = streams
      }

      return topStreams.streams
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
          chart: platform && channel ? `chart.${platform}.${channel.name}` : 'top'
        }
      })
    }
  }
}

module.exports = StatController
