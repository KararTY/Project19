# Project19
Chat bot with Web UI. Challenge for the holidays.

## WORK IN PROGRESS v0.1.2
Since the project is still a work in progress, all updates will most likely introduce breaking changes. This is not a production-ready project.

## Technologies
  * For the front-end:
    * Back-end: AdonisJS, node-sass
    * Front-end: lighterhtml, babel-polyfill, adonis-websocket-client
  * For the bots:
    * dank-twitch-irc
    * @mixer/client-node
  * PostgreSQL

## Running it
### Creating the .env file
  * `npm i`
  * Copy `.env.example` and rename copy to `.env`.
  * Edit the .env file, make sure you set `APP_KEY` to something random.
### Running the bot
  * `cd .\bot\`
  * `npm i`
  * `npm start`
### The database
  * Install PostgreSQL. Make sure uuid-ossp is included in your installation, which it should be on PostgreSQL versions +9.4. **My personal setup runs PostgreSQL version 12.**
  * `cd .\web\`
  * `npm run migration`
### Running the website
  * `cd .\web\`
  * `npm i`
  * `npm start`
  * If the `.env` settings are default, browse to http://localhost:3333/.

## Planned features
### High priority
  * Platform support:
    * Twitch.
    * Mixer.
  * Points system (Maybe streaming site offers API for their points system?)
  * Logs storage.
  * General chatting statistics.
  * Moderation actions:
    * Time out phrase list.
### Low priority
  * Video requests (Cytube implementation, or custom?)
  * Login system in Web UI.
    * Twitch oauth.
    * Does Mixer have auth support?

## ISC License
See [LICENSE](LICENSE). Karar Al-Remahy
