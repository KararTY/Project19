'use strict'

const LogsNotFoundException = use('App/Exceptions/LogsNotFoundException')

const Logs = use('Service/Logs')

class LogController {
  async index ({ params, request, view }) {
    const method = request.method()
    const { platform, timestamp, user, channel } = request.middlewares

    let format
    if (method === 'GET') format = request.get().format

    let logFile
    if ((channel && method === 'POST') || (format && format === 'plain')) logFile = await Logs.readLog({ channel: channel, platform, timestamp: request.moment(timestamp) }, user || undefined)

    if (method === 'POST') {
      if (logFile && logFile.length > 0) return logFile
      else throw new LogsNotFoundException()
    } else {
      return view.render((format && format === 'plain')
        ? 'partials.logs-plain'
        : 'core.template', {
        web: {
          title: `Logs${channel ? ` - ${channel.name.toUpperCase()}` : ''}${user ? ` ${user.name.toUpperCase()} ` : ''}${timestamp ? ` - ${timestamp}` : ''}`,
          template: 'partials.logs',
          navbarActive: 'logs',
          logFile: logFile || new LogsNotFoundException()
        }
      })
    }
  }
}

module.exports = LogController
