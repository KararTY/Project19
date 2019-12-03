'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

const PlatformNotFoundException = use('App/Exceptions/PlatformNotFoundException')

Route.get('/:platform/:channel?', async ({ params, request, response }) => {
  const platform = params.platform.toLowerCase()
  // const channel = params.channel

  if (!['mixer', 'twitch'].includes(platform)) throw new PlatformNotFoundException()

  return `
    <html>
      <head>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <section>
          <p id="connection">Websocket offline.</p>
          <div id="chat"></div>
        </section>
      </body>
      <script src="/babel-polyfill.min@6.26.0.js"></script>
      <script src="/Ws.browser.min@1.0.9.js"></script>
      <script src="/socket.js"></script>
    </html>
  `
})
