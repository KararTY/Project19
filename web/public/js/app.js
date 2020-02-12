'use strict'

const { html, render } = window.lighterhtml

const url = new URL(window.location)
const currentFullPathArray = url.pathname.slice(1).split('/')

const chartData = {}

const colors = {
  malachite: '#0CCA4A',
  northTexasGreen: '#099336',
  onyx: '#3C3744',
  gunMetal: '#292F36',
  smokyBlack: '#0A0908',
  quartz: '#4D4955',
  whiteSmoke: '#F6F7F7',
  platinum: '#E0E1E1'
}

async function getPath (fullPathArray) {
  const currentPath = fullPathArray[0]
  const el = document.querySelector('.card-content.content')
  const platform = fullPathArray[1]
  switch (currentPath) {
    case 'live': {
      const channel = fullPathArray[2]
      const rendered = await liveChat(el, platform, channel)
      if (!rendered) render(el, inputChat())
      break
    }
    case 'logs': {
      const timestamp = fullPathArray[2]
      const channel = fullPathArray[3]
      const user = fullPathArray[4]
      const rendered = await logs(el, platform, timestamp, channel, user)
      if (!rendered) {
        render(el, inputLogs())
        const todayTimestamp = new Date()
        const paramTimestamp = url.searchParams.get('timestamp')
        document.querySelector('input[name="timestamp"]').valueAsDate = (timestamp ? new Date(timestamp) : (paramTimestamp ? new Date(paramTimestamp) : todayTimestamp))
        document.querySelector('input[name="channelName"]').value = channel || url.searchParams.get('channel')
        document.querySelector('input[name="userName"]').value = user || url.searchParams.get('username')
      }
      break
    }
    case 'stats': {
      const canvasEl = document.querySelector('canvas')
      const id = canvasEl.id
      const channel = fullPathArray[2]
      const rendered = await chart(canvasEl, id, platform, channel)
      if (!rendered) {
        await chart(canvasEl, id, platform, 'top')
      }
      document.querySelector('.card .card-content').prepend(html.node`
        <div class="card>
          <div class="card-content>
            <div class="columns">
              ${(platform === 'twitch' || !channel) ? html`
                <div class="column has-text-centered">
                  <a class="button" href="/stats/twitch">Top Twitch</a>
                </div>
              ` : ''}
              ${(platform === 'mixer' || !channel) ? html`
              <div class="column has-text-centered">
                <a class="button" href="/stats/mixer">Top Mixer</a>
              </div>
            ` : ''}
            </div>
          </div>
        </div>
      `)
      break
    }
    default: {
      const canvasEl = document.querySelector('canvas')
      if (canvasEl) {
        const id = canvasEl.id
        const rendered = await chart(canvasEl, id, null, 'top')
        if (!rendered) {}
        if (chartData.top.data.length > 0) {
          for (let i = 0; i < 3; i++) {
            const el = document.getElementById(`top-${i}`)
            const streamer = chartData.top.data[i]
            if (streamer) {
              el.querySelector('figure img').src = streamer.thumbnail
              const title = el.querySelector('.card-header .card-header-title')
              title.innerText = streamer.name.toUpperCase()
              title.href = streamer.url
            } else el.parentElement.outerHTML = ''
          }
        }
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
    newUrl.searchParams.set('channel', inputtedChannelNameValue)
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
          <input class="input" type="text" name="channelName" placeholder="Channel name..." value="${url.searchParams.get('channel')}" required>
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
    newUrl.searchParams.set('channel', inputtedChannelNameValue)
    if (inputtedUserNameValue) newUrl.searchParams.append('username', inputtedUserNameValue)
    window.history.replaceState({}, document.title, newUrl)

    redirectUrl.pathname = `/logs/${selectedPlatformValue}/${inputtedTimestampValue}/${inputtedChannelNameValue}${inputtedUserNameValue ? `/${inputtedUserNameValue}` : ''}`
    window.location.href = redirectUrl
  }

  const todayTimestamp = new Date().toLocaleDateString('en-SE')
  const selectedPlatform = window.location.pathname.slice(1).split('/').length > 1 ? window.location.pathname.slice(1).split('/')[1].toLowerCase() : url.searchParams.get('platform')
  return html`
    <h1>Logs</h1>
    <form class="form" name="logsSearch" onsubmit=${onsubmit}>
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
        <h1>${channel.toUpperCase()} <span class="is-size-6">${platform.toUpperCase()}, ${user ? user.toUpperCase() + ' ' : ''}logs for <span title="All timestamps are in UTC +0.">${timestamp}</span></span></h1>
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
      const data = (await response.json()).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
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
            borderColor: colors.malachite,
            backgroundColor: colors.onyx,
            data: data.map(i => i.value)
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Viewers',
            fontColor: colors.platinum,
            fontSize: 16
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                fontColor: colors.platinum
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontColor: colors.whiteSmoke
              }
            }]
          },
          tooltips: {
            callbacks: {
              title: function (tooltip) {
                return new Date(chartData[this._chart.canvas.id].data[tooltip[0].index].time).toUTCString()
              }
            }
          }
        }
      })

      const titleHTML = html.node`
        <h1 class="title is-marginless">${channel.toUpperCase()} <span class="is-size-6">${platform.toUpperCase()}</span></h1>
      `
      el.parentElement.prepend(titleHTML)
      return true
    } else {
      try {
        const error = await response.json()
        window.alert(`Error ${error.message}`)
      } catch (e) {
        window.alert(`Server returned ${response.status}: ${response.statusText}`)
      }
    }
  } else if (channel === 'top') {
    const response = await fetch(`${window.location.origin}/stats/top`, { method: 'POST' })
    if (response.status === 200) {
      const data = (await response.json()).sort((a, b) => Number(b.viewers) - Number(a.viewers)).filter(stream => {
        if (platform && platform !== 'top') {
          return stream.platform === platform.toUpperCase()
        } else return true
      }).map(stream => {
        switch (stream.platform) {
          case 'TWITCH':
            stream.url = `https://www.twitch.tv/${stream.name}`
            break
          case 'MIXER':
            stream.url = `https://mixer.com/${stream.name}`
            break
        }
        return stream
      }).slice(0, 3)
      window.Chart.platform.disableCSSInjection = true
      chartData[id] = {
        chart: null,
        data
      }

      chartData[id].chart = new window.Chart(el.getContext('2d'), {
        type: 'bar',
        data: {
          labels: data.map(i => `${i.platform} - ${i.name}`),
          datasets: [{
            label: 'Viewers',
            borderColor: colors.malachite,
            borderWidth: 3,
            backgroundColor: currentFullPathArray[0] === 'stats' ? colors.onyx : colors.gunMetal,
            data: data.map(i => Number(i.viewers))
          }]
        },
        options: {
          title: currentFullPathArray[0] === 'stats' ? {
            display: true,
            text: 'Viewers',
            fontColor: colors.platinum,
            fontSize: 16
          } : undefined,
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                fontColor: colors.platinum
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                fontColor: colors.whiteSmoke
              }
            }]
          },
          tooltips: {
            callbacks: {
              title: function (tooltip) {
                return new Date(chartData[this._chart.canvas.id].data[tooltip[0].index].time).toUTCString()
              }
            }
          },
          onClick: function (ev, el) {
            const elZero = el[0]
            if (elZero) {
              const index = elZero._index
              const selection = this.data.labels[index].split(' - ')
              window.location.href = `${window.location.origin}/stats/${selection[0].toLowerCase()}/${selection[1]}`
            }
          }
        }
      })
      if (currentFullPathArray[0] === 'stats') {
        const titleHTML = html.node`
          <h1 class="title is-marginless">TOP ${data.length}${platform ? ' ' + platform.toUpperCase() : ''} <span class="is-size-6">streamers by view count.</span></h1>
        `
        el.parentElement.prepend(titleHTML)
      }
      return true
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
