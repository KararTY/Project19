/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

const PlatformNotFoundException = use('App/Exceptions/PlatformNotFoundException')

Route.get('/live/:platform?/:channel?', async ({ params, request, response, view }) => {
  if (params.platform) {
    const platform = params.platform.toLowerCase()

    if (!['mixer', 'twitch'].includes(platform)) throw new PlatformNotFoundException()
  }

  return view.render('core.template', {
    web: {
      title: `Live chat${params.channel ? ` - ${params.channel.toUpperCase()}` : ''}`,
      template: 'partials.live'
    }
  })
}).as('live')
