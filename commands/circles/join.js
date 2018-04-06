const { Command } = require('../../handler')
const r = require('../../db')
const SERVER = '431864638385291264'
const utils = require('../../utils')

module.exports = class JoinCommand extends Command {
  constructor() {
    super('join', {
      name: 'Join',
      description: 'Join a circle',
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
        multiword: true,
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
      return api.error('That circle has been betrayed.')
    }
    if (args.key.value !== circle.key) {
      return api.error('The key you provided is invalid.')
    }
    let members = circle.members
    members.push(msg.author.id)
    await r.table('circles').get(args.id.value).update({
      members
    })
    let channel = api.handler.client.guilds.get(SERVER).channels.get(circle.channel)
    await channel.overwritePermissions(msg.author, {
      VIEW_CHANNEL: true
    })
    let guild = api.handler.client.guilds.get(SERVER)
    let member = guild.members.get(msg.author.id)
    let nums = utils.getNumbers(member.nickname || `${member.user.username} [0,0]`)
    let replaced = utils.replaceNumbers(member.nickname || `${member.user.username} [0,0]`, nums[0], nums[1] + 1)
    member.setNickname(replaced)

    let owner = guild.members.get(circle.owner)
    let numsOwner = utils.getNumbers(owner.nickname || `${owner.user.username} [0,0]`)
    let replacedOwner = utils.replaceNumbers(owner.nickname || `${owner.user.username} [0,0]`, numsOwner[0] + 1, numsOwner[1])
    owner.setNickname(replacedOwner)
    
    return api.success('You have joined that circle.')
  }
}