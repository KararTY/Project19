'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const readFile = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)

/** TODO: SPLIT INTO 3 FOLDERS:
 * Channel/Year/Month/Day/_.txt (ALL MESSAGES)
 * Channel/Year/Month/Day/<Userid>.txt
 */

class Logs {
  constructor (Config) {
    this.Config = Config || {}
    this.pathToLogs = this.Config.get('logs.pathToFile').toString()

    this.queue = []
    this.writeStreams = []

    this.timer = () => setTimeout(async () => {
      const tempQueue = [...this.queue]
      this.queue = []

      const objects = Object.keys(this.writeStreams)

      for (let i = 0; i < objects.length; i++) {
        const writeStream = this.writeStreams[objects[i]]

        // Hasn't been updated for some time.
        if (new Date() - writeStream.lastUpdate >= ((1000 * 60) * 5)) {
          await writeStream.stream.end()
          delete this.writeStreams[i]
        }
      }

      while (tempQueue.length) {
        const queueItem = tempQueue.shift()
        await this.writeLog(queueItem.json, queueItem.message)
      }

      this.timer()
    }, typeof Number(this.Config.get('logs.writeTimer')) === 'number' ? Number(this.Config.get('logs.writeTimer')) : (1000 * 60) * 5)

    this.timer()
  }

  queueWrite (json, message) {
    let error = ''
    if (!json) error += 'No json.'
    else if (!message) error += 'No message.'
    if (error.length > 0) throw new Error(error)

    this.queue.push({ json, message })

    return this.queue.length
  }

  async writeLog ({ channel, platform, timestamp, author }, message) {
    // let pathToFile
    // if (!user) pathToFile = path.join(this.pathToLogs, channel.platform, channel.id, timestamp.getUTCFullYear().toString(), Number(timestamp.getUTCMonth() + 1).toString(), '_.txt')
    const pathToChannel = path.join(this.pathToLogs, platform, channel.id.toString(), timestamp.year().toString(), Number(timestamp.month() + 1).toString(), timestamp.date().toString(), '_.txt')
    const pathToUser = path.join(pathToChannel.replace('_.txt', `${author.id}.txt`))

    if (!this.writeStreams[channel.id]) {
      await mkdir(pathToChannel.replace('_.txt', ''), { recursive: true })

      // Create new writeStream
      this.writeStreams[channel.id] = {
        lastUpdate: new Date(),
        stream: fs.createWriteStream(pathToChannel, { flags: 'a', encoding: 'utf-8' })
      }
    }

    if (!this.writeStreams[author.id]) {
      await mkdir(pathToUser.replace(`${author.id}.txt`, ''), { recursive: true })

      // Create new writeStream
      this.writeStreams[author.id] = {
        lastUpdate: new Date(),
        stream: fs.createWriteStream(pathToUser, { flags: 'a', encoding: 'utf-8' })
      }
    }

    try {
      this.writeStreams[channel.id].lastUpdate = new Date()
      this.writeStreams[author.id].lastUpdate = new Date()

      await this.writeStreams[channel.id].stream.write(message + '\r\n')
      await this.writeStreams[author.id].stream.write(message + '\r\n')

      return Promise.resolve()
    } catch (err) {
      console.log(err)
    }
  }

  async displayLog ({ channel, timestamp }, user) {
    if (!channel) throw new Error('No channel selected.')

    try {
      let file
      if (!user) file = await readFile(path.join(this.pathToLogs, channel.platform, channel.id, timestamp.getUTCFullYear().toString(), Number(timestamp.getUTCMonth() + 1).toString(), '_.txt'), 'utf-8')
      else file = await readFile(path.join(this.pathToLogs, channel.platform, channel.id, timestamp.getUTCFullYear().toString(), Number(timestamp.getUTCMonth() + 1).toString(), '_.txt'), 'utf-8')

      return Promise.resolve(file)
    } catch (err) {
      if (err.code !== 'ENOENT') console.log(err)
    }
  }
}

module.exports = Logs
