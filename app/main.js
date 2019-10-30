const view = require('./view')
const search = require('./search')
const providers = require('./providers.json')
const rra = require('recursive-readdir-async')

function main () {
  view.setSearchListener(searchString => {
    search.byText(providers, searchString)
  })
  view.setTorrentListener(fullname => {
    search.open(undefined, fullname)
  })
  view.setMagnetListener(magnet => {
    search.open(undefined, magnet)
  })
  view.renderTabs(providers.data)
  activateTabs()
};

function activateTabs () {
  providers.data.forEach(provider => {
    if (provider.type === 'folder') { activateFolderTab(provider) }
  })
  view.refreshHistory()
}

function activateFolderTab (provider) {
  view.init(provider)
  rra.list(provider.path, { normalizePath: false }, (item) => {
    if (!item.isDirectory) {
      view.addItem(provider, item)
    }
  }).then(result => {
    if (result.error) {
      view.setError(provider, result.error)
    }
  }).catch(err => {
    view.setError(provider, err)
  })
  view.end(provider)
}

function test () {
  view.showInfo('test')
}
main()
