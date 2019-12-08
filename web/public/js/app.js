const { html, render } = window.lighterhtml

async function getPath (fullPathArray) {
  const currentPath = fullPathArray[0]
  switch (currentPath) {
    case 'live': {
      const el = document.querySelector('.card-content.content')
      const platform = fullPathArray[1]
      const channel = fullPathArray[2]
      const rendered = await liveChat(el, platform, channel)
      if (!rendered) render(el, inputChat())
      break
    }
    default:
      break
  }
  return `Done loading "${fullPathArray.join('/')}".`
}

function inputChat () {
  async function onclick () {
    const form = document.forms.liveChatSearch
    const inputtedChannelNameElement = form.elements.channelName
    const inputtedChannelNameValue = inputtedChannelNameElement.value
    const selectedPlatformValue = form.elements.platformName.value

    let errorPath
    let errorMessage
    if (inputtedChannelNameValue.length === 0) {
      errorPath = 'liveChatChannelNameError'
      errorMessage = "Can't be empty."
    }

    if (errorMessage && !document.getElementById(errorPath)) {
      inputtedChannelNameElement.parentElement.appendChild(html.node`
        <p id="${errorPath}" class="help is-danger">${errorMessage}</p>
      `)
    } else {
      await liveChat(document.querySelector('.card-content.content'), selectedPlatformValue || 'twitch', inputtedChannelNameValue)
      const newUrl = new URL(window.location)
      const fullPath = newUrl.pathname.slice(1).split('/')
      if (fullPath[0] === 'live') {
        newUrl.pathname = `/live/${selectedPlatformValue}/${inputtedChannelNameValue}`
      } else {
        newUrl.searchParams.append('platform', selectedPlatformValue || 'twitch')
        newUrl.searchParams.append('chat', inputtedChannelNameValue)
      }
      document.title = `${document.title} - ${inputtedChannelNameValue.toUpperCase()}`
      window.history.replaceState({}, `${document.title} - ${inputtedChannelNameValue.toUpperCase()}`, newUrl)
    }
  }

  return html`
    <h1>Live chat</h1>
    <form name="liveChatSearch">
      <div class="field has-addons">
        <div class="control">
          <span class="select">
            <select name="platformName">
              <option value="twitch" selected="${window.location.pathname.slice(1).split('/').length > 1 && window.location.pathname.slice(1).split('/')[1].toLowerCase() === 'twitch'}">Twitch</option>
              <option value="mixer" selected="${window.location.pathname.slice(1).split('/').length > 1 && window.location.pathname.slice(1).split('/')[1].toLowerCase() === 'mixer'}">Mixer</option>
            </select>
          </span>
        </div>
        <div class="control">
          <input class="input" type="text" name="channelName" placeholder="Channel name...">
        </div>
        <div class="control">
          <a class="button" onclick=${onclick}>Search</a>
        </div>
      </div>
    </form>
  `
}

async function liveChat (el, platform, channel) {
  if (channel) {
    render(el, html`
      <div id="siteloading" class="loader-wrapper">
        <div id="connection" class="loader-line loader-animate"></div>
        <div id="chat" class="loader-line loader-animate"></div>
      </div>
    `)
    await startChat(platform, channel)
    document.getElementById('siteloading').classList.remove('loader-wrapper')
    document.getElementById('connection').classList.remove('loader-line', 'loader-animate')
    document.getElementById('chat').classList.remove('loader-line', 'loader-animate')
    return true
  } else return false
}

const currentFullPathArray = new URL(window.location.href).pathname.slice(1).split('/')
Promise.all([getPath(currentFullPathArray)]).then(rs => rs.forEach(r => console.log(r)))
