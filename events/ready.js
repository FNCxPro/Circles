const logger = require('../logger')
module.exports = (client) => {
  logger.info(`${client.user.username} is ready.`)
  global.logchan = client.channels.get('431900922604421140')
}