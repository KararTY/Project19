'use strict'

class LiveController {
  async index ({ params, request, view }) {
    const format = request.get().format
    const { platform, channel } = request.middlewares

    if (format && format === 'plain' && platform && channel) {
      return view.render('partials.live-plain', {
        web: {
          title: `Live chat - ${channel.name.toUpperCase()}`,
          navbarActive: 'live'
        }
      })
    } else {
      return view.render('core.template', {
        web: {
          title: `Live chat${channel ? ` - ${channel.name.toUpperCase()}` : ''}`,
          template: 'partials.live',
          navbarActive: 'live'
        }
      })
    }
  }
}

module.exports = LiveController
