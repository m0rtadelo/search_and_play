const request = require('request')
/**
 * Returns true if the link is a magnet link
 * @param {string} link url or magnet link
 */
function isMagnetLink (link) {
  return link && link.indexOf('magnet:') === 0
}
function get (url, fn) {
  var steam = request(url).pipe(require('fs').createWriteStream('data.torrent'))
  steam.on('finish', function () {
    let path = require('path').resolve('.')
    fn(path + '/data.torrent')
  })
}
module.exports = {
  isMagnetLink: isMagnetLink,
  get: get
}
