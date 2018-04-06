const { Command } = require('../../handler')
const r = require('../../db')
const { Guild } = require('discord.js')
const randomWords = require('random-words')
const CIRCLES_CATEGORY = '431866855792181248'
const SERVER = '431864638385291264'

String.prototype.capitalabc = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};


module.exports = class CreateCommand extends Command {
  constructor() {
    super('create', {
      name: 'Create',
      description: '**RUN THIS ONLY IN A DM WITH THE BOT!!!!!!!!!!!**\nCreates a new circle',
      module: 'circles',
      args: [{
        name: 'key',
        type: 'string',
        required: true,
        description: 'The key for your circle **(IT CAN ONLY BE ONE WORD!)**'
      }, {
        name: 'name',
        type: 'string',
        multiword: true,
        required: true,
        description: 'A multi word name for your circle.'
      }],
      ownerOnly: false,
      usage: 'create <key> <name>'
    })
  }
  async run(args, msg, api) {
    if (msg.channel.type !== 'dm') {
      await msg.delete()
      return api.error('You may only run this command in a DM!')
    }
    const check = await r.table('circles').getAll(msg.author.id, {
      index: 'owner'
    }).run()
    if (check.length >= 1) {
      return api.error('You already have a circle.')
    }
    /**
     * @type {Guild}
     */
    const guild = api.handler.client.guilds.get(SERVER)
    let _words = randomWords({ exactly: 4 })
    for(var i=0; i < _words.length; i++) {
      _words[i] = _words[i].capitalabc();
    }
    const words = _words.join('')
    const chan = await guild.createChannel(args.name.value.replaceAll(' ', '-'), 'text', [
      {
        deny: ['VIEW_CHANNEL'],
        id: SERVER
      },
      {
        allow: ['VIEW_CHANNEL'],
        id: msg.author.id
      }
    ])
    await r.table('circles').insert({
      id: words,
      key: args.key.value,
      channel: chan.id,
      members: [msg.author.id],
      name: args.name.value,
      owner: msg.author.id,
      betrayed: false
    }).run()
    chan.setParent(CIRCLES_CATEGORY)
    chan.setTopic(`ID: ${words}\nKey: ${args.key.value}`)
    msg.channel.send(`Your circle was created.\nYour circle's ID is: **${words}**.\nYour circle's key is: \`${args.key.value}\`\nGo to your circle at <#${chan.id}>`)
  }
}