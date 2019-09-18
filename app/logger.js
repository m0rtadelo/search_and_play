const log = require('json-log').log

function open (data) {
  log.info('open media', data)
}
function request (data) {
  log.info('request url', data)
}

module.exports = {
  open: open,
  request: request
}
