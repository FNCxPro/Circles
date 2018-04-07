const { Command } = require('../../handler')
const db = require('../../db')
module.exports = class ReputationCommand extends Command {
  constructor() {
    super('reputation', {
      name: 'Reputation',
      description: 'Gather the reputation for a user',
      module: 'circles',
      aliases: ['rep'],
      args: [{
        name: 'user',
        type: 'user',
        required: true,
        description: 'User to get the rep for'
      }],
      ownerOnly: false
    })
  }
  async run(args, msg, api) {
    let embed = api.embed('Reputation')
    let user = args.user.value
    let duser = await db.getUser(user)
    let joined = await db.r.table('circles').run()
    let joinedFinal = 0
    joined.forEach((circle) => {
      if (circle.members.indexOf(args.user.value.id) !== -1) joinedFinal++
    })
    embed.setAuthor(`${user.username}#${user.discriminator}`, user.displayAvatarURL)
    embed.setDescription(`Reputation for user <@${user.id}>`)
    embed.addField('Circles Joined', joinedFinal.toString())
    embed.addField('Circle Members', duser.members)
    embed.addField('Betrayed', duser.betrayed)
    return embed
  }
}