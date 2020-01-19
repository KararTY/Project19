'use strict'

const { readFile, path, mkdir, Stream } = require('../Utilities/filesys')

const Logger = use('Logger')

/** Categorization
 * Channel/Year/Month/Day/_.txt (ALL MESSAGES)
 * Channel/Year/Month/Day/<Userid>.txt
 */

// Timestamps are "moment" Date objects.

class Logs {
  constructor (Config) {
    this.Config = Config || {}
    this.pathToLogs = this.Config.get('logs.pathToFile').toString()
    this.enabled = this.Config.get('logs.enabled')
    this.writeTimer = Number(this.Config.get('logs.writeTimer'))

    this.queue = []
    this.streams = []

    this.timer = () => setTimeout(async () => {
      const tempQueue = [...this.queue]
      const tempQueueLen = Number(this.queue.length)
      this.queue = []

      if (tempQueue.length) {
        const objects = Object.keys(this.streams)

        for (let i = 0; i < objects.length; i++) {
          const streams = this.streams[objects[i]]

          // Hasn't been updated for some time.
          if (new Date() - streams.lastUpdate >= ((1000 * 60) * 5)) {
            this.streams[objects[i]].writeStream.end()
            delete this.streams[objects[i]]
          }
        }

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
    if (this.enabled) {
      let error = ''
      if (!json) error += 'No json.'
      else if (!message) error += 'No message.'
      if (error.length > 0) throw new Error(error)

      this.queue.push({ json, message })

      return this.queue.length
    }
  }

  async writeLog ({ channel, platform, timestamp, author }, message) {
    const pathToChannel = path.join(this.pathToLogs, platform, channel.id.toString(), timestamp.year().toString(), Number(timestamp.month() + 1).toString(), timestamp.date().toString(), '_.txt')
    const pathToUser = path.join(pathToChannel.replace('_.txt', `${author.id}.txt`))

    if (!this.streams[channel.id]) {
      await mkdir(pathToChannel.replace('_.txt', ''), { recursive: true })
      this.streams[channel.id] = new Stream(pathToChannel)
    }

    if (!this.streams[author.id]) {
      await mkdir(pathToUser.replace(`${author.id}.txt`, ''), { recursive: true })
      this.streams[author.id] = new Stream(pathToUser)
    }

    try {
      this.streams[channel.id].lastUpdate = new Date()
      this.streams[author.id].lastUpdate = new Date()

      await this.streams[channel.id].write(message + '\r\n')
      await this.streams[author.id].write(message + '\r\n')

      return Promise.resolve()
    } catch (err) {
      Logger.warn('[Logs] Error in writeLog %j', err)
    }
  }

  async readLog ({ channel, platform, timestamp }, author) {
    if (!channel) throw new Error('No channel selected.')

    try {
      let file

      const pathToChannel = path.join(this.pathToLogs, platform.toLowerCase(), channel.userIdNumber, timestamp.year().toString(), Number(timestamp.month() + 1).toString(), timestamp.date().toString(), '_.txt')

      if (!author) file = await readFile(pathToChannel, 'utf-8')
      else file = await readFile(path.join(pathToChannel.replace('_.txt', `${author.userIdNumber}.txt`)), 'utf-8')

      return Promise.resolve(file)
    } catch (err) {
      if (err.code !== 'ENOENT') Logger.warn('[Logs] Error in readLog %j', err)
    }
  }
}

module.exports = Logs
