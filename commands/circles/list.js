const { Command } = require('../../handler')
const r = require('../../db')
const Discord = require('discord.js')

module.exports = class ListCommand extends Command {
  constructor() {
    super('list', {
      name: 'List',
      description: 'List all circles',
      module: 'circles',
      ownerOnly: false
    })
  }
  async run(args, msg, api) {
    let circles = await r.table('circles').run()
    let buf = '--==: **Circles** :==--\n'
    circles.forEach((circle) => {
      let owner = msg.guild.members.get(circle.owner)
      buf += `\`${circle.id}\` ${circle.name} - ${owner.user.username}#${owner.user.discriminator}\n`
    })
    let split = Discord.Util.splitMessage(buf, {
      char: '\n',
      prepend: '--==: **Circles** :==--\n'
    })
    if (typeof split === 'string') {
      msg.channel.send(split)
    } else {
      split.forEach((msg) => {
        msg.channel.send(msg)
      })
    }
  }
}