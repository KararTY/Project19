'use strict'

const User = use('App/Models/User')
const Logger = use('Logger')

class Database {
  constructor (Config) {
    this.Config = Config || {}
    this.enabled = this.Config.get('db.enabled')
    this.writeTimer = Number(this.Config.get('db.writeTimer'))

    this.queue = []

    this.timer = () => setTimeout(async () => {
      const tempQueue = [...this.queue]
      this.queue = []

      if (tempQueue.length) {
        const map = new Map()
        let counter = 0
        while (tempQueue.length) {
          const queueItem = tempQueue.shift()

          let cont = false

          if (!map.has(queueItem.author.id)) {
            cont = true
            map.set(queueItem.author.id)
          } else if (!map.has(queueItem.channel.id)) {
            cont = true
            map.set(queueItem.channel.id)
          }

          if (cont) {
            counter++
            await this.handleUser(queueItem)
          }
        }

        Logger.info(`[Db] Checked ${counter} users...`)
      }

      this.timer()
    }, typeof this.writeTimer === 'number' ? this.writeTimer : (1000 * 60) * 5)

    if (this.enabled) this.timer()
  }

  queueUser (json) {
    if (this.enabled) {
      if (!json) throw new Error('No json.')

      this.queue.push(json)

      return this.queue.length
    }
  }

  async handleUser (json) {
    // Order is important.
    const requests = await Promise.all([
      User.findBy('userid', `${json.platform.charAt(0)}-${json.author.id}`),
      User.findBy('userid', `${json.platform.charAt(0)}-${json.channel.id}`)
    ])

    for (let index = 0; index < requests.length; index++) {
      let request = requests[index]

      try {
        if (request === null) {
          request = new User()
          request.userid = `${json.platform.charAt(0)}-${index === 0 ? json.author.id : json.channel.id}`
          request.name = index === 0 ? json.author.name : json.channel.name
          Logger.debug('[Db] New user.')
          request.platform = json.platform.toUpperCase()
          if (index === 0) request.channels = JSON.stringify([json.channel.id])
          await request.save()
        } else if (index === 0) {
          let changes = false

          const channels = JSON.parse(request.channels)

          if (!channels.includes(json.channel.id)) {
            channels.push(json.channel.id)
            request.channels = channels
            changes = true
          }

          if (request.name !== json.author.name) {
            request.name = json.author.name
            changes = true
          }

          if (changes) {
            Logger.debug(`[Db] User ${request.id} changes.`)
            await request.save()
          }
        } else if (index === 1) {
          let changes = false

          if (request.name !== json.channel.name) {
            request.name = json.channel.name
            changes = true
          }

          if (changes) {
            Logger.debug(`[Db] User (Channel) ${request.id} changes.`)
            await request.save()
          }
        }
      } catch (err) {
        console.error(err)
        console.log(request)
      }
    }

    return Promise.resolve()
  }
}

module.exports = Database
