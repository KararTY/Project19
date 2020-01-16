const { html, render } = window.lighterhtml

const currentFullPathArray = new URL(window.location.href).pathname.slice(1).split('/')

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
    case 'logs': {
      const el = document.querySelector('.card-content.content')
      const platform = fullPathArray[1]
      const timestamp = fullPathArray[2]
      const channel = fullPathArray[3]
      const user = fullPathArray[4]
      const rendered = await logs(el, platform, timestamp, channel, user)
      if (!rendered) {
        render(el, inputLogs())
        const todayTimestamp = new Date()
        document.querySelector('input[name="timestamp"]').valueAsDate = timestamp ? new Date(timestamp) : todayTimestamp
        document.querySelector('input[name="channelName"]').value = channel || ''
        document.querySelector('input[name="userName"]').value = user || ''
      }
      break
    }
    default: {
      const generalChart = document.getElementById('generalChart')
      let chart
      if (generalChart && window.Chart) {
        window.Chart.platform.disableCSSInjection = true
        chart = new window.Chart(generalChart.getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
        })
      }
      break
    }
  }
  return `Done loading "${fullPathArray.join('/')}".`
}

function inputChat () {
  async function onsubmit ($ev) {
    $ev.preventDefault()
    const form = document.forms.liveChatSearch

    const inputtedChannelNameElement = form.elements.channelName
    const inputtedChannelNameValue = inputtedChannelNameElement.value
    const selectedPlatformValue = form.elements.platformName.value

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

  return html`
    <h1>Live chat</h1>
    <form name="liveChatSearch" onsubmit=${onsubmit}>
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
          <input class="input" type="text" name="channelName" placeholder="Channel name..." required>
        </div>
        <div class="control">
          <button class="button" type="submit">Search</button>
        </div>
      </div>
    </form>
  `
}

function inputLogs () {
  async function onsubmit ($ev) {
    $ev.preventDefault()
    const form = document.forms.logsSearch

    const selectedPlatformValue = form.elements.platformName.value

    const inputtedTimestampElement = form.elements.timestamp
    const inputtedTimestampValue = inputtedTimestampElement.value

    const inputtedChannelNameElement = form.elements.channelName
    const inputtedChannelNameValue = inputtedChannelNameElement.value

    const inputtedUserNameValue = form.elements.userName.value

    const newUrl = new URL(window.location)
    newUrl.pathname = `/logs/${selectedPlatformValue}/${inputtedTimestampValue}/${inputtedChannelNameValue}${inputtedUserNameValue ? `/${inputtedUserNameValue}` : ''}`
    document.title = `Logs - ${inputtedChannelNameValue.toUpperCase()} - ${inputtedTimestampValue}`
    window.history.replaceState({}, `${document.title}`, newUrl)

    await logs(document.querySelector('.card-content'), selectedPlatformValue || 'twitch', inputtedTimestampValue, inputtedChannelNameValue, inputtedUserNameValue)
  }

  const todayTimestamp = new Date().toLocaleDateString('en-SE')
  return html`
    <h1>Logs</h1>
    <form name="logsSearch" onsubmit=${onsubmit}>
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
          <input class="input" type="date" name="timestamp" min="2020-01-16" max="${todayTimestamp}" valueAsDate="${new Date()}" required>
        </div>
        <div class="control">
          <input class="input" type="text" name="channelName" placeholder="Channel name..." required>
        </div>
        <div class="control">
          <input class="input" type="text" name="userName" placeholder="User name...">
        </div>
        <div class="control">
          <button class="button" type="submit">Search</button>
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
        <div id="chat" class="chat loader-line loader-animate"></div>
      </div>
    `)
    await window.startChat(platform, channel)
    document.getElementById('siteloading').classList.remove('loader-wrapper')
    document.getElementById('connection').classList.remove('loader-line', 'loader-animate')
    document.getElementById('chat').classList.remove('loader-line', 'loader-animate')
    return true
  } else return false
}

async function logs (el, platform, timestamp, channel, user) {
  if (channel) {
    const response = await fetch(window.location.href, { method: 'POST' })
    if (response.status === 200) {
      const logFile = await response.text()
      render(el, html`
        <div class="logs">${logFile}</div>
      `)
      return true
    } else {
      const error = await response.json()
      window.alert(`Error ${error.message}`)
    }
  }
  return false
}

Promise.all([getPath(currentFullPathArray)]).then(rs => rs.forEach(r => console.log(r)))
