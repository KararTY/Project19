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
    } else if (!errorMessage) {
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
          <input class="input" type="text" name="channelName" placeholder="Channel name...">
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

const currentFullPathArray = new URL(window.location.href).pathname.slice(1).split('/')
Promise.all([getPath(currentFullPathArray)]).then(rs => rs.forEach(r => console.log(r)))
