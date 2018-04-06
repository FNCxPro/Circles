const { Command } = require('../../handler')
const r = require('../../db')
const SERVER = '431864638385291264'

module.exports = class BetrayCommand extends Command {
  constructor() {
    super('betray', {
      name: 'Betray',
      description: 'Betray a circle',
      module: 'circles',
      ownerOnly: false,
      args: [{
        name: 'id',
        type: 'string',
        required: true,
        description: 'The ID of the circle'
      }, {
        name: 'key',
        type: 'string',
        required: true,
        description: 'The key for the circle'
      }]
    })
  }
  async run(args, msg, api) {
    if (msg.channel.type !== 'dm') {
      msg.delete()
      return api.error('This command can only be run in a DM with the bot.')
    }
    const circle = await r.table('circles').get(args.id.value).run()
    if (typeof circle === 'undefined' || !circle) {
      return api.error('That circle doesn\'t exist.')
    }
    if (circle.members.indexOf(msg.author.id) !== -1) {
      return api.error('You have already joined that circle.')
    }
    if (circle.betrayed) {
      return api.error('That circle has already been betrayed.')
    }
    if (args.key.value !== circle.key) {
      return api.error('The key you provided is invalid.')
    }
    await r.table('circles').get(args.id.value).update({
      betrayed: true
    }).run()
    let channel = api.handler.client.guilds.get(SERVER).channels.get(circle.channel)
    await api.handler.client.users.get(circle.owner).send(`Your circle was betrayed with ${circle.members.length} :(`)
    await channel.delete()
    await api.handler.client.guilds.get(SERVER).members.get(msg.author.id).addRole('431868770760392704')
    return api.success('The circle was betrayed.')
  }
}