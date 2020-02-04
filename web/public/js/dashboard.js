'use strict'

const { html, render } = window.lighterhtml

const url = new URL(window.location)
const currentFullPathArray = url.pathname.slice(1).split('/')

async function getPath (fullPathArray) {
  const currentPath = fullPathArray[0]
  switch (currentPath) {
    case 'dashboard': {
      const id = fullPathArray[1]
      const params = new URL(window.location).searchParams
      let el
      if (id === 'query') {
        // Display query.
        el = document.getElementById('query')
        if (Array.from(params.values()).length > 0) {
          appendParams(params)
          await query(el)
        } else el.parentElement.parentElement.outerHTML = ''
      } else if (id) {
        // Display user details.
        el = document.getElementById('user')
        if (Array.from(params.values()).length > 0) {
          const el = document.getElementById('message')
          render(el, html`
            ${params.get('success') === 'true' ? html`<strong class="has-text-primary is-size-1">Success!</strong>` : ''}
            ${params.get('exists') === 'true' ? html`<strong class="is-size-1">User already exists! Details below.</strong>` : ''}
            ${params.get('success') === 'true' && params.get('date') && !Number.isNaN(Number(params.get('date'))) ? html`<h1 class="subtitle"> ${new Date(Number(params.get('date'))).toUTCString()}</h1>` : ''}
          `)
          el.classList.remove('is-hidden')
        }
        const newURL = new URL(window.location.href)
        newURL.search = ''
        const deleteButtonEl = document.getElementById('delete')
        if (deleteButtonEl) {
          deleteButtonEl.onclick = ($ev) => {
            $ev.stopPropagation()
            document.forms.editUser.action = `${newURL.href}/delete`
            document.forms.editUser.submit()
          }
        }
      } else {
        // Dashboard index. Display tracked users.
        document.querySelector('[name="newUser"]').querySelector('[name="userid"]').parentElement.parentElement.outerHTML = ''
        document.querySelector('[name="newUser"]').querySelector('[name="rank"]').parentElement.parentElement.outerHTML = ''
        document.querySelector('[name="newUser"]').querySelector('[name="track"]').parentElement.parentElement.parentElement.outerHTML = ''
        if (params.get('success')) {
          const messageEl = document.getElementById('message')
          render(messageEl, html`
            <strong class="has-text-primary is-size-1">Deletion ${params.get('success')}!</strong>
          `)
          messageEl.classList.remove('is-hidden')
        } else if (params.get('command')) {
          const commandEl = document.getElementById('command')
          render(commandEl, html`
            <strong class="is-size-1">${params.get('command')}</strong>
          `)
          commandEl.classList.remove('is-hidden')
        }
        const el = document.getElementById('tracked')
        await query(el, { track: true })
      }
      break
    }
  }
  return `Done loading "${fullPathArray.join('/')}".`
}

async function query (el, query) {
  const addQuery = currentFullPathArray.length === 1 && currentFullPathArray[0] === 'dashboard'

  const newURL = new URL(window.location.href)
  if (addQuery) newURL.search = ''

  try {
    const response = await fetch(`${newURL.href}${addQuery ? '/query' : ''}`, {
      method: 'POST',
      headers: query ? { 'content-type': 'application/json' } : undefined,
      body: query ? JSON.stringify(query) : undefined
    })
    if (response.status === 200) {
      const result = await response.json()

      let paginationHTML = ''
      if (result.max > 1 && !addQuery) {
        const nextURL = new URL(window.location)
        nextURL.searchParams.set('pagination', result.page + 1)

        const nextNextURL = new URL(window.location)
        nextNextURL.searchParams.set('pagination', result.page + 2)

        const nextNextNextURL = new URL(window.location)
        nextNextNextURL.searchParams.set('pagination', result.page + 3)

        const prevURL = new URL(window.location)
        prevURL.searchParams.set('pagination', result.page - 1)

        const prevPrevURL = new URL(window.location)
        prevPrevURL.searchParams.set('pagination', result.page - 2)

        const prevPrevPrevURL = new URL(window.location)
        prevPrevPrevURL.searchParams.set('pagination', result.page - 3)

        const firstURL = new URL(window.location)
        firstURL.searchParams.set('pagination', 1)

        const lastURL = new URL(window.location)
        lastURL.searchParams.set('pagination', result.max)

        paginationHTML = html`
          <nav class="pagination">
            ${result.page > 1 ? html`<a href="${prevURL.href}" class="pagination-previous">Previous</a>` : ''}
            ${result.max > result.page ? html`<a href="${nextURL.href}" class="pagination-next">Next page</a>` : ''}
            <ul class="pagination-list">
              ${result.page < 3 && result.max > 4 ? html`
                <li><a class="${result.page === 1 ? 'pagination-link is-current' : 'pagination-link'}" href="${firstURL.href}">1</a></li>
                <li><span class="pagination-ellipsis">&hellip;</span></li>
                <li><a class="${result.page === 2 ? 'pagination-link is-current' : 'pagination-link'}" href="${result.page === 1 ? nextURL.href : ''}">${result.page === 1 ? result.page + 1 : result.page}</a></li>
                <li><a class="pagination-link" href="${result.page === 1 ? nextNextURL.href : nextURL.href}">${result.page === 2 ? result.page + 1 : result.page + 2}</a></li>
                <li><a class="pagination-link" href="${result.page === 1 ? nextNextNextURL.href : nextNextURL.href}">${result.page === 2 ? result.page + 2 : result.page + 3}</a></li>
                <li><span class="pagination-ellipsis">&hellip;</span></li>
                <li><a class="pagination-link" href="${lastURL.href}">${result.max}</a></li>
              ` : (result.page > result.max - 2) && result.max > 4 ? html`
                <li><a class="pagination-link" href="${firstURL.href}">1</a></li>
                <li><span class="pagination-ellipsis">&hellip;</span></li>
                <li><a class="pagination-link" href="${result.page === result.max ? prevPrevPrevURL.href : prevPrevURL.href}">${result.page === result.max ? result.page - 3 : result.page - 2}</a></li>
                <li><a class="pagination-link" href="${result.page === result.max ? prevPrevURL.href : prevURL.href}">${result.page === result.max ? result.page - 2 : result.page - 1}</a></li>
                <li><a class="${result.page === result.max - 1 ? 'pagination-link is-current' : 'pagination-link'}" href="${result.page === result.max ? prevURL.href : ''}">${result.page === result.max ? result.page - 1 : result.page}</a></li>
                <li><span class="pagination-ellipsis">&hellip;</span></li>
                <li><a class="${result.page === result.max ? 'pagination-link is-current' : 'pagination-link'}" href="${lastURL.href}">${result.max}</a></li>
              ` : result.page > 4 ? html`
                <li><a class="pagination-link" href="${firstURL.href}">1</a></li>
                <li><span class="pagination-ellipsis">&hellip;</span></li>
                <li><a class="pagination-link" href="${prevURL.href}">${result.page - 1}</a></li>
                <li><a class="is-current pagination-link">${result.page}</a></li>
                <li><a class="pagination-link" href="${nextURL.href}">${result.page + 1}</a></li>
                <li><span class="pagination-ellipsis">&hellip;</span></li>
                <li><a class="pagination-link" href="${lastURL.href}">${result.max}</a></li>
              ` : ''}
            </ul>
          </nav>
        `
      } else if (result.max > 1) {
        paginationHTML = html`
          <a href="${window.location.origin}/dashboard/query?track=true&pagination=2">See more results...</a>
        `
      }

      render(el, html`
        <p>Total returned results: ${result.total}</p>
        <hr>
        ${result.data.map(result => html`
          <a href="${window.location.origin}/dashboard/${result.userid}">
            <h1 class="is-size-5">${result.name}</h1>
            <span>Platform: ${result.platform}</span>
          </a>
          <hr>
        `)}
        ${paginationHTML}
      `)
    } else if (response.status === 201) {
      const result = await response.json()
      render(el, html`
        <p>${result.message}</p>
      `)
    }
  } catch (err) {
    window.alert(`Server returned ${err.status}: ${err.statusText}`)
  }
}

function appendParams (map) {
  const p = map.get('platform')
  const t = map.get('track')
  const u = map.get('userid')
  const n = map.get('name')
  const r = map.get('rank')

  if (p) {
    const platform = document.querySelector('[name="platform"]').querySelector(`[value="${p}"]`)
    if (platform) platform.selected = 'selected'
  }

  if (t) {
    const track = document.querySelector('[name="track"]').querySelector(`[value="${t}"]`)
    if (track) track.selected = 'selected'
  }

  if (u) {
    document.querySelector('[name="userid"]').value = u
  }

  if (n) {
    document.querySelector('[name="name"]').value = n
  }

  if (r && !Number.isNaN(Number(r))) {
    document.querySelector('[name="rank"]').value = Number(r)
  }
}

Promise.all([getPath(currentFullPathArray)]).then(rs => rs.forEach(r => console.log(r)))
