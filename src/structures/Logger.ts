import { MessageEmbed, TextChannel } from 'discord.js';
import pino, { Logger as PinoLogger, LoggerOptions } from 'pino'
import { getSpecialChannel } from '../database';

export default class Logger {
  console: PinoLogger;

  constructor(options: LoggerOptions) {
    this.console = pino({
      transport: { target: "pino-pretty" },
      ...options
    })
  }

  async channel(guildId: string, embed: MessageEmbed | MessageEmbed[]) {
    const embeds = embed instanceof Array ? embed : [embed];
    const logOpt = await getSpecialChannel(guildId, "logger");
    if (logOpt !== null) {
      const logChannel = logOpt as TextChannel;
      await logChannel.send({ embeds });
    }
  }
}