const log = require('json-log').log
const lj = require('load-json-file')
const wj = require('write-json-file')

function open (data) {
  return write(log.info('open media', data))
}

function write (msg) {
  let items = [JSON.parse(msg)]
  if (items[0].searchText.length === 0) {
    return get()
  }
  try {
    items = items.concat(get())
  } catch (error) {
    console.error(error)
    return get()
  }
  const result = items.slice(0, 200)
  wj.sync('history.json', result)
  return result
}

function get (data) {
  if (data) return data
  return lj.sync('history.json')
}
module.exports = {
  open: open,
  get: get
}
