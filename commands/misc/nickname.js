const { Command } = require('../../handler')
module.exports = class NicknameCommand extends Command {
  constructor() {
    super('nickname', {
      name: 'Nickname',
      description: 'Nick command',
      module: 'misc',
      ownerOnly: false,
      args: [{
        name: 'nickname',
        type: 'string',
        required: true,
        multiword: true,
        description: 'The nickname you want to have'
      }]
    })
  }
  async run(args, msg, api) {
    let member = msg.member
    if (member.nickname) {
      let bracket = member.nickname.lastIndexOf('[')
      if (bracket === -1) {
        member.setNickname(args.nickname.value)
        return api.success(`Your nickname was changed to ${args.nickname.value}`)
      }
      let subbed = member.nickname.substr(bracket)
      member.setNickname(`${args.nickname.value} ${bracket}`)
      return api.success(`Your nickname was changed to ${args.nickname.value}`)
    }
  }
}