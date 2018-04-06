const { Command } = require('../../handler')
const r = require('../../db')
const { Guild, RichEmbed } = require('discord.js')
const { Colors } = require('../../handler/Constants')
const randomWords = require('random-words')
const CIRCLES_CATEGORY = '431866855792181248'
const SERVER = '431864638385291264'

String.prototype.capitalabc = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

const utils = require('../../utils')

global.usersObj = {}

module.exports = class CreateCommand extends Command {
  constructor() {
    super('create', {
      name: 'Create',
      description: '**RUN THIS ONLY IN A DM WITH THE BOT!!!!!!!!!!!**\nCreates a new circle',
      module: 'circles',
      ownerOnly: false,
      usage: 'create'
    })
  }
  postConstruct(handler) {
    global.createHook = async (msg) => {
      /**
       * @type {Guild}
       */
      const guild = msg.client.guilds.get(SERVER)
      let uo = usersObj[msg.author.id]
      if (typeof uo !== 'object' || msg.channel.type !== 'dm') return
      if (uo.stage === 0) {
        uo.name = msg.content
        msg.channel.send('Please type in the desired key for your Circle and press enter.')
        uo.stage = 1
        usersObj[msg.author.id] = uo
      } else if (uo.stage === 1) {
        uo.key = msg.content
        uo.stage = 2
        usersObj[msg.author.id] = uo
        const chan = await guild.createChannel(uo.name.replaceAll(' ', '-'), 'text', [
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
          id: uo.words,
          key: uo.key,
          channel: chan.id,
          members: [msg.author.id],
          name: uo.name,
          owner: msg.author.id,
          betrayed: false
        }).run()
        let member = guild.members.get(msg.author.id)
        let nick = member.nickname
        if (!member.nickname) {
          member.setNickname(`${member.user.username} [1,0]`)
        } else {
          member.setNickname(utils.replaceNumbers(nick, 1, ''))
        }
        chan.setParent(CIRCLES_CATEGORY)
        chan.setTopic(`ID: ${uo.words}\nKey: ${uo.key}`)
        const embed = new RichEmbed()
        embed.setColor(Colors.green).setTitle('Circle Created')
        embed.setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.displayAvatarURL)
        embed.setDescription('A circle was created')
        embed.addField('Circle Name', uo.name)
        embed.addField('Circle ID', uo.words)
        embed.addField('Owner', `<@${msg.author.id}>`)
        logchan.send({embed})
        msg.channel.send(`Your circle was created.\nYour circle's ID is: **${uo.words}**.\nYour circle's key is: \`${uo.key}\`\nGo to your circle at <#${chan.id}>`)
        usersObj[msg.author.id] = undefined
      }
    }
    this.handler.client.on('message', global.createHook)
  }
  async run(args, msg, api) {
    if (msg.channel.type !== 'dm') {
      await msg.delete()
      return api.error('You may only run this command in a DM!')
    }
    
    let _words = randomWords({ exactly: 4 })
    for(var i=0; i < _words.length; i++) {
      _words[i] = _words[i].capitalabc();
    }
    const words = _words.join('')
    usersObj[msg.author.id] = {
      in: true,
      words: words,
      stage: 0
    }
    const check = await r.table('circles').getAll(msg.author.id, {
      index: 'owner'
    }).run()
    if (check.length >= 1) {
      return api.error('You already have a circle.')
      usersObj[msg.author.id] = undefined
    }
    msg.channel.send('Please type in the desired name for your Circle and press enter.')
  }
}