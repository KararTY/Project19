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

      if (tempQueue.length > 0) {
        const arr = []
        let counter = 0

        while (tempQueue.length) {
          const queueItem = tempQueue.shift()

          let cont = false

          const platformUserAndChannel = `${queueItem.platform.charAt(0)}-${queueItem.author.userId}-${queueItem.channel.userId}`
          if (!arr.includes(platformUserAndChannel)) {
            arr.push(platformUserAndChannel)
            cont = true
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
      User.findBy('userid', `${json.platform.charAt(0)}-${json.author.userId}`),
      User.findBy('userid', `${json.platform.charAt(0)}-${json.channel.userId}`)
    ])

    for (let index = 0; index < requests.length; index++) {
      let request = requests[index]

      try {
        if (request === null) {
          request = new User()
          request.userid = `${json.platform.charAt(0)}-${index === 0 ? json.author.userId : json.channel.userId}`
          request.name = index === 0 ? json.author.username : json.channel.name
          request.platform = json.platform.toUpperCase()

          Logger.debug('[Db] New user.')

          if (index === 0) request.channels = [json.channel.userId]
          await request.save()
        } else if (index === 0) {
          const requestJSON = request.toJSON()

          let changes = false

          if (!requestJSON.channels.includes(json.channel.userId)) {
            request.channels = requestJSON.channels.concat(json.channel.userId)
            changes = true
          }

          if (request.name !== json.author.username.toLowerCase()) {
            request.name = json.author.username
            changes = true
          }

          if (changes) {
            Logger.debug(`[Db] User ${request.userId} changes.`)
            await request.save()
          }
        } else if (index === 1) {
          let changes = false

          if (request.name !== json.channel.name.toLowerCase()) {
            request.name = json.channel.name
            changes = true
          }

          if (changes) {
            Logger.debug(`[Db] User (Channel) ${request.userId} changes.`)
            await request.save()
          }
        }
      } catch (err) {
        Logger.error('[Db] Error %j', request)
        console.error(err)
      }
    }

    return Promise.resolve()
  }
}

module.exports = Database
