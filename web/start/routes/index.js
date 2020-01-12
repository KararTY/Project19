'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', async ({ params, request, response, view }) => {
  return view.render('core.template', {
    web: {
      template: 'index'
    }
  })
}).as('index')
