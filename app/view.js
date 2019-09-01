const runner = require('./player')
const toastr = require('toastr')
const myTab = document.getElementById('myTab')
const myTabContent = document.getElementById('myTabContent')
const { dialog } = require('electron').remote

let defaultSet

function addTab (provider) {
  if (provider.type === 'folder' && !defaultSet) {
    myTab.innerHTML += `<li class="nav-item"><a class="nav-link active" id="${provider.name}-tab" data-toggle="tab" href="#${provider.name}" role="tab" aria-controls="${provider.name}"aria-selected="false">${provider.name}</a></li>`
    myTabContent.innerHTML += `<div class="tab-pane fade show active" id="${provider.name}" role="tabpanel" aria-labelledby="${provider.name}-tab"><div class="container" id="${provider.name}container"></div></div>`
    defaultSet = true
  } else {
    myTab.innerHTML += `<li class="nav-item"><a class="nav-link" id="${provider.name}-tab" data-toggle="tab" href="#${provider.name}" role="tab" aria-controls="${provider.name}"aria-selected="false">${provider.name}</a></li>`
    myTabContent.innerHTML += `<div class="tab-pane fade" id="${provider.name}" role="tabpanel" aria-labelledby="${provider.name}-tab"><div class="container" id="${provider.name}container"></div></div>`
  }
}

function addDownloadTab () {
  myTab.innerHTML += `<li class="nav-item"><a class="nav-link" id="result-tab" data-toggle="tab" href="#download" role="tab" aria-controls="result" aria-selected="false">Download</a></li>`
  myTabContent.innerHTML += `<div class="tab-pane fade" id="download" role="tabpanel" aria-labelledby="result-tab"><div class="container" id="resultcontainer"></div></div>`
}
function renderTabs (providers) {
  myTab.innerHTML = ''
  myTabContent.innerHTML = ''
  defaultSet = false
  providers.forEach(provider => {
    addTab(provider)
  })
  addDownloadTab()
  // add 'onClick' tab event listener
  $('#myTab a').on('click', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })
}
function setLoading (provider) {
  getContainer(provider).innerHTML = `Loading...<div class="spinner-grow" role="status"><span class="sr-only">Loading...</span></div>`
}
function addItem (provider, item) {
  const node = document.createElement('a')
  node.setAttribute('name', item.fullname)
  node.setAttribute('href', '#')
  node.setAttribute('class', 'list-group-item list-group-item-action')
  node.innerHTML = '<i class="fas fa-file-video"></i>&nbsp;' + ' ' + item.name
  node.addEventListener('click', (elem) => {
    toastr.info('Playing: ' + item.name)
    runner.open(provider, elem.target.name, (error) => {
      if (error) {
        toastr.error(error)
      } else {
        toastr.info('Finished: ' + item.name)
      }
    })
  })
  getContainer(provider).appendChild(node)
}
function getContainer (provider) {
  return document.getElementById(provider.name + 'container')
}
function setError (provider, error) {
  getContainer(provider).innerHTML = `<br><div class="alert alert-danger" role="alert">ERROR: ${error}</div>`
  showError(`[${provider.name}] ${error}`)
}
function init (provider) {
  getContainer(provider).innerHTML = provider.path + '<br><br><div class="list-group">'
}
function end (provider) {
  getContainer(provider).innerHTML += '</div>'
}
function setTorrentListener (fn) {
  document.getElementById('openTorrent').addEventListener('click', (elem) => {
    elem.preventDefault()
    dialog.showOpenDialog(this, function (names) {
      if (names) {
        fn(names[0])
      }
    })
  })
}
function setSearchListener (fn) {
  document.getElementById('search').addEventListener('click', (elem) => {
    elem.preventDefault()
    const searchInput = document.getElementById('searchText')
    if (searchInput.value) {
      fn(searchInput.value)
      searchInput.value = ''
    } else {
      toastr.info('search string cannot be empty!')
    }
    searchInput.focus()
  })
}
function setMagnetListener (fn) {
  
}
function showInfo (message) {
  toastr.info(message)
}
function showError (message) {
  toastr.error(message)
}
function showSuccess (message) {
  toastr.success(message)
}
/**
 * Returns path item with href property
 * @param {object} path a element path
 */
function getHref (path) {
  for (var i = 0; i < path.length; i++) {
    if (path[i].href) {
      return path[i]
    }
  }
  return undefined
}

function addContent (provider, data, isDetail, fn) {
  const target = isDetail ? { name: 'result' } : provider
  getContainer(target).innerHTML = data
  getContainer(target).querySelectorAll('a').forEach(element => {
    element.addEventListener('click', ref => {
      if (!isDetail) {
        setLoading({ name: 'result' })
        $('#myTab a[href="#download"]').tab('show')
      }
      ref.preventDefault()
      const link = getHref(ref.path)
      fn(link.href)
    })
  })
}
module.exports = {
  renderTabs: renderTabs,
  setLoading: setLoading,
  setError: setError,
  getContainer: getContainer,
  addItem: addItem,
  init: init,
  end: end,
  setSearchListener: setSearchListener,
  setTorrentListener: setTorrentListener,
  setMagnetListener: setMagnetListener,
  showInfo: showInfo,
  showError: showError,
  showSuccess: showSuccess,
  addContent: addContent
}
