const view = require('./view')
const request = require('request')
const player = require('./player')
const torrent = require('./torrent')
const log = require('./logger')

let searchText = ''

function byText (providers, text) {
  providers.data.forEach(provider => {
    if (provider.searchUrl) {
      searchText = text
      view.setLoading(provider)
      view.showInfo(`[${provider.name}] Searching: "${text}"...`)
      requestUrl(provider, provider.searchUrl + text)
    }
  })
}
function requestUrl (provider, url, isDetail) {
  if (torrent.isMagnetLink(url)) {
    open(provider, url)
  } else {
    if (url.startsWith('file://')) { // relative link
      const uri = new URL(provider.lastUrl)
      url = uri.origin + url.substring(10)
    }
    request(url, (error, response, body) => {
      if (error) {
        view.setError(provider, error)
      } else {
        if (provider.type === 'web') {
          provider.lastUrl = url
          parseWeb(provider, body, isDetail)
          if (!isDetail) {
            view.showSuccess(`[${provider.name}] Search finished!`)
          }
        } else if (provider.type === 'jacket') {
          // TODO: Add Jacket
        } else {
          view.setError(provider, `incorrect provider type for Search!`)
        }
      }
    })
  }
}
function parseWeb (provider, body, isDetail) {
  const parser = new DOMParser()
  const selector = isDetail ? provider.downSelector : provider.searchSelector
  try {
    const xml = parser.parseFromString(body, 'text/html')
    const list = xml.querySelectorAll(selector)
    view.addContent(provider, list[0].outerHTML, isDetail, url => {
      requestUrl(provider, url, true)
    })
  } catch (error) {
    if (error.toString().includes('outerHTML')) {
      view.setError(provider, error)
    } else {
      torrent.get(provider.lastUrl, (fullname) => {
        open(provider, fullname)
      })
    }
  }
}
function open (provider, url) {
  view.refreshHistory(log.open({ provider: provider, url: url, searchText: searchText }))
  player.open(provider, url, (error) => {
    if (error) {
      view.showError(error)
    } else {
      view.showInfo('Player finished')
    }
  })
}
module.exports = {
  byText: byText,
  open: open,
  requestUrl: requestUrl
}
