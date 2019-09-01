const properties = require('./properties.json')
// const torrent = require('./torrent')

function open (provider, fullname, errorFn) {
  play(fullname, (error) => {
    errorFn(error)
  })
}

function play (fullname, errorFn) {
  require('child_process').exec(properties.playerPath + ' "' + fullname + '"', (error) => {
    if (errorFn) {
      errorFn(error)
    }
  })
}

module.exports = {
  open: open
}
