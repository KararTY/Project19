'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

const PlatformNotFoundException = use('App/Exceptions/PlatformNotFoundException')

Route.get('/live/:platform?/:channel?', async ({ params, request, response, view }) => {
  const format = request.get().format
  if (params.platform) {
    const platform = params.platform.toLowerCase()

    if (!['mixer', 'twitch'].includes(platform)) throw new PlatformNotFoundException()
  }

  if (format && format === 'plain' && params.platform && params.channel) {
    return view.render('partials.live-plain', {
      web: {
        title: `Live chat - ${params.channel.toUpperCase()}`,
        navbarActive: 'live'
      }
    })
  } else {
    return view.render('core.template', {
      web: {
        title: `Live chat${params.channel ? ` - ${params.channel.toUpperCase()}` : ''}`,
        template: 'partials.live',
        navbarActive: 'live'
      }
    })
  }
}).as('live')
