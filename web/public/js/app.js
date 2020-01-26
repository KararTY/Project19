const { html, render } = window.lighterhtml

const url = new URL(window.location)
const currentFullPathArray = url.pathname.slice(1).split('/')

const chartData = {}

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
        const paramTimestamp = url.searchParams.get('timestamp')
        document.querySelector('input[name="timestamp"]').valueAsDate = (timestamp ? new Date(timestamp) : (paramTimestamp ? new Date(paramTimestamp) : todayTimestamp))
        document.querySelector('input[name="channelName"]').value = channel || url.searchParams.get('channelname')
        document.querySelector('input[name="userName"]').value = user || url.searchParams.get('username')
      }
      break
    }
    case 'stats': {
      const canvas = document.querySelector('canvas')
      const id = canvas.id
      const platform = fullPathArray[1]
      const channel = fullPathArray[2]
      const rendered = await chart(canvas, id, platform, channel)
      if (!rendered) {

      }
      break
    }
    default: {
      const topChart = document.getElementById('top')
      let chart
      if (topChart && window.Chart) {
        window.Chart.platform.disableCSSInjection = true
        chart = new window.Chart(topChart.getContext('2d'), {
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

    const newUrl = new URL(window.location)
    const redirectUrl = new URL(window.location)
    redirectUrl.search = ''
    redirectUrl.searchParams.set('redirect', 'true')

    newUrl.searchParams.set('platform', selectedPlatformValue)
    newUrl.searchParams.set('channelname', inputtedChannelNameValue)
    window.history.replaceState({}, document.title, newUrl)

    redirectUrl.pathname = `/live/${selectedPlatformValue}/${inputtedChannelNameValue}`
    window.location.href = redirectUrl
  }

  const selectedPlatform = window.location.pathname.slice(1).split('/').length > 1 ? window.location.pathname.slice(1).split('/')[1].toLowerCase() : url.searchParams.get('platform')
  return html`
    <h1>Live chat</h1>
    <form name="liveChatSearch" onsubmit=${onsubmit}>
      <div class="field has-addons">
        <div class="control">
          <span class="select">
            <select name="platformName">
              <option value="twitch" selected="${selectedPlatform === 'twitch'}">Twitch</option>
              <option value="mixer" selected="${selectedPlatform === 'mixer'}">Mixer</option>
            </select>
          </span>
        </div>
        <div class="control">
          <input class="input" type="text" name="channelName" placeholder="Channel name..." value="${url.searchParams.get('channelname')}" required>
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
    const redirectUrl = new URL(window.location)
    redirectUrl.search = ''
    redirectUrl.searchParams.set('redirect', 'true')

    newUrl.searchParams.set('platform', selectedPlatformValue)
    newUrl.searchParams.set('timestamp', inputtedTimestampValue)
    newUrl.searchParams.set('channelname', inputtedChannelNameValue)
    if (inputtedUserNameValue) newUrl.searchParams.append('username', inputtedUserNameValue)
    window.history.replaceState({}, document.title, newUrl)

    redirectUrl.pathname = `/logs/${selectedPlatformValue}/${inputtedTimestampValue}/${inputtedChannelNameValue}${inputtedUserNameValue ? `/${inputtedUserNameValue}` : ''}`
    window.location.href = redirectUrl
  }

  const todayTimestamp = new Date().toLocaleDateString('en-SE')
  const selectedPlatform = window.location.pathname.slice(1).split('/').length > 1 ? window.location.pathname.slice(1).split('/')[1].toLowerCase() : url.searchParams.get('platform')
  return html`
    <h1>Logs</h1>
    <form name="logsSearch" onsubmit=${onsubmit}>
      <div class="field has-addons">
        <div class="control">
          <span class="select">
            <select name="platformName">
              <option value="twitch" selected="${selectedPlatform === 'twitch'}">Twitch</option>
              <option value="mixer" selected="${selectedPlatform === 'mixer'}">Mixer</option>
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
      <h1>${channel.toUpperCase()} <span class="is-size-6" id="connection" ></span></h1>
      <div id="siteloading" class="loader-wrapper">
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
        <h1>${channel.toUpperCase()} <span class="is-size-6">${user ? user.toUpperCase() + ' ' : ''}logs for <span title="All timestamps are in UTC +0.">${timestamp}</span></span></h1>
        <p><a onclick="${() => { const newUrl = new URL(window.location); newUrl.searchParams.append('format', 'plain'); window.location = newUrl }}">Click here, or add <span>?format=plain</span> to current url, to only see logs.</a></p>
        <div class="logs">${logFile}</div>
      `)
      return true
    } else {
      try {
        const error = await response.json()
        window.alert(`Error ${error.message}`)
        if (new URL(window.location).searchParams.has('redirect')) window.history.back()
      } catch (e) {
        window.alert(`Server returned ${response.status}: ${response.statusText}`)
      }
    }
  }
  return false
}

async function chart (el, id, platform, channel) {
  if (id.split('.')[0] === 'chart') {
    const response = await fetch(window.location.href, { method: 'POST' })
    if (response.status === 200) {
      const data = await response.json()
      window.Chart.platform.disableCSSInjection = true
      chartData[id] = {
        chart: null,
        data
      }
      chartData[id].chart = new window.Chart(el.getContext('2d'), {
        type: 'line',
        data: {
          labels: data.map(i => new Date(i.time).toLocaleTimeString()),
          datasets: [{
            label: 'Viewers',
            data: data.map(i => i.value)
          }]
        },
        options: {
          tooltips: {
            callbacks: {
              title: function (tooltip) {
                return new Date(chartData[this._chart.canvas.id].data[tooltip[0].index].time).toUTCString()
              }
            }
          }
        }
      })
    } else {
      try {
        const error = await response.json()
        window.alert(`Error ${error.message}`)
      } catch (e) {
        window.alert(`Server returned ${response.status}: ${response.statusText}`)
      }
    }
  }
}

Promise.all([getPath(currentFullPathArray)]).then(rs => rs.forEach(r => console.log(r)))
