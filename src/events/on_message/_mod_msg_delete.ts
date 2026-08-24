import { userMention, type Message } from 'discord.js'
import { mod_forward, mod_log } from '../../utils/mod_logs'

export async function mod_message_delete(message: Message) {
  Promise.allSettled([
    mod_forward(message),
    mod_log(message.client, `Message by ${userMention(message.author.id)} in ${message.channel} has been deleted.`)
  ])
}
