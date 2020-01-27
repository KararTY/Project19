# Project19
Chat bot with Web UI. Challenge for the holidays.

<p align="center">
  <img height="500" src="https://i.imgur.com/W7W7T8J.png">
  <br>Project 19 web
</p>

## WORK IN PROGRESS v0.3.5
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
### Configuring
  * All configurations are inside `web/config/`.
  * Notable configuration files:
    * db.js
    * logs.js
    * twitch.js
    * mixer.js
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

## Implemented features
  * Platform support:
    * Twitch.
    * Mixer.
  * Logs storage.
  * General activity:
    * View count every X minutes.

## Planned features
### High priority
  * General chatting statistics. (+ Leaderboard system)
    * Level of user "toxicity".
    * General chat activity:
      * Chats per minute.
      * Users per minute.
      * Most used emotes every minute (Twitch, Mixer, BTTV, FFZ).
    * Displaying emotes in the live chat.
### Low priority
  * Points system (Maybe streaming site offers API for their points system?)
  * Moderation actions:
    * Time out phrase list.
    * PerspectiveAPI?
  * Video requests (Cytube implementation, or custom?)
  * Login system in Web UI.
    * Twitch oauth.
    * Does Mixer have auth support?

## Features for the future
  * Use a text compression algorithm for logging, maybe Huffman coding?

## ISC License
See [LICENSE](LICENSE). Karar Al-Remahy
