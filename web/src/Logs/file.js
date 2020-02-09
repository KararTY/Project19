'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const readFile = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)

class Stream {
  constructor (pathToFile) {
    this.writeStream = fs.createWriteStream(pathToFile, { flags: 'a', encoding: 'utf-8' })
    this.lastUpdate = new Date()
  }

  write (data) {
    return new Promise((resolve, reject) => {
      if (!this.writeStream.write(data)) {
        this.writeStream.once('drain', () => {
          resolve()
        })
      } else resolve()
    })
  }
}

const Logger = use('Logger')

/** Categorization
 * Channel/Year/Month/Day/_.txt (ALL MESSAGES)
 * Channel/Year/Month/Day/<Userid>.txt
 */

// Timestamps are "moment" Date objects.

class FileLogs {
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

      if (tempQueue.length > 0) {
        tempQueue.sort((a, b) => {
          return a.timestamp - b.timestamp
        })

        while (tempQueue.length) {
          const queueItem = tempQueue.shift()
          await this.writeLog(queueItem.json, queueItem.message)
        }

        const objects = Object.keys(this.streams)
        for (let i = 0; i < objects.length; i++) {
          const streams = this.streams[objects[i]]

          // Remove stream for channels that haven't been updated for some time.
          if (new Date() - streams.lastUpdate >= ((1000 * 60) * 5)) {
            this.streams[objects[i]].writeStream.end()
            delete this.streams[objects[i]]
          }
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
    const pathToChannel = path.join(this.pathToLogs, platform, channel.userId.toString(), timestamp.year().toString(), Number(timestamp.month() + 1).toString(), timestamp.date().toString(), '_.txt')
    const pathToUser = path.join(pathToChannel.replace('_.txt', `${author.userId}.txt`))

    if (!this.streams[channel.userId]) {
      await mkdir(pathToChannel.replace('_.txt', ''), { recursive: true })
      this.streams[channel.userId] = new Stream(pathToChannel)
    }

    if (!this.streams[author.userId]) {
      await mkdir(pathToUser.replace(`${author.userId}.txt`, ''), { recursive: true })
      this.streams[author.userId] = new Stream(pathToUser)
    }

    try {
      this.streams[channel.userId].lastUpdate = new Date()
      this.streams[author.userId].lastUpdate = new Date()

      await this.streams[channel.userId].write(message + '\r\n')
      await this.streams[author.userId].write(message + '\r\n')

      return Promise.resolve()
    } catch (err) {
      Logger.error('[Logs] Error in writeLog')
      console.error(err)
    }
  }

  async readLog ({ channel, platform, timestamp }, author) {
    if (!channel) return Promise.reject(new Error('No channel selected.'))

    try {
      let file

      const pathToChannel = path.join(this.pathToLogs, platform.toLowerCase(), channel.userIdNumber, timestamp.year().toString(), Number(timestamp.month() + 1).toString(), timestamp.date().toString(), '_.txt')

      if (!author) file = await readFile(pathToChannel, 'utf-8')
      else file = await readFile(path.join(pathToChannel.replace('_.txt', `${author.userIdNumber}.txt`)), 'utf-8')

      return Promise.resolve(file)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        Logger.error('[Logs] Error in readLog')
        console.error(err)
      }
    }
  }
}

module.exports = FileLogs
