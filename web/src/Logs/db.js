'use strict'

const Logger = use('Logger')
const ChatLog = use('App/Models/ChatLog')

class DbLogs {
  constructor (Config) {
    this.Config = Config || {}
    this.pathToLogs = this.Config.get('logs.pathToFile').toString()
    this.enabled = this.Config.get('logs.enabled')
    this.writeTimer = Number(this.Config.get('logs.writeTimer'))

    this.queue = []

    this.timer = () => setTimeout(async () => {
      const tempQueue = [...this.queue]
      const tempQueueLen = Number(this.queue.length)
      this.queue = []

      if (tempQueue.length > 0) {
        tempQueue.sort((a, b) => {
          return a.timestamp - b.timestamp
        })

        while (tempQueue.length) {
          const queueItem = tempQueue.shift()
          await this.writeLog(queueItem.json, queueItem.message)
        }

        Logger.info(`[Logs] Logged ${tempQueueLen} messages...`)
      }

      this.timer()
    }, typeof this.writeTimer === 'number' ? this.writeTimer : (1000 * 60) * 5)

    if (this.enabled) this.timer()
  }

  queueWrite (json, message) {
    if (!this.enabled) return

    let error = ''
    if (!json) error += 'No json.'
    else if (!message) error += 'No message.'
    if (error.length > 0) throw new Error(error)

    this.queue.push({ json, message })

    return this.queue.length
  }

  async writeLog ({ channel, platform, timestamp, author }, message) {
    const userId = `${platform.toLowerCase().charAt(0)}-${author.userId}`
    const channelUserId = `${platform.toLowerCase().charAt(0)}-${channel.userId}`

    const chatLog = new ChatLog()
    chatLog.userid = userId
    chatLog.channeluserid = channelUserId
    chatLog.message = message
    chatLog.created_at = timestamp

    try {
      await chatLog.save()
      return Promise.resolve()
    } catch (err) {
      Logger.error('[Logs] Error in writeLog')
      console.error(err)
    }
  }

  async readLog ({ channel, platform, timestamp }, author) {
    if (!channel) return Promise.reject(new Error('No channel selected.'))

    try {
      const today = timestamp.set('m', 0).set('s', 0).set('ms', 0).toDate()
      const tomorrow = timestamp.add(1, 'd').set('m', 0).set('s', 0).set('ms', 0).toDate()

      const channelUserId = channel.userid
      const queryBuilder = ChatLog.query().where('channeluserid', channelUserId).where('created_at', '>', today).where('created_at', '<', tomorrow)

      if (author) {
        const userId = author.userId
        queryBuilder.where('userid', userId)
      }

      let result = (await queryBuilder.fetch()).toJSON()

      if (result) {
        // Could be heavy.
        result = result.map(i => i.message).join('\r\n')
      }

      return Promise.resolve(result)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        Logger.error('[Logs] Error in readLog')
        console.error(err)
      }
    }
  }
}

module.exports = DbLogs
