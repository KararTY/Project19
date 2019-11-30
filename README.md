# Project19
Chat bot with Web UI. Challenge for the holidays.

## Technologies
  * AdonisJS
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