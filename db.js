const config = require('config')
const r = require('rethinkdbdash')({
  host: config.get('rethink.host'),
  port: 28015,
  username: config.get('rethink.username'),
  password: config.get('rethink.password'),
  db: config.get('rethink.db'),
  pool: true
})

module.exports = r