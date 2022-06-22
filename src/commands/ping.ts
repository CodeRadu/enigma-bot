import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { BotCommand } from "../structures";
import { Data } from "../structures/BotCommand";

class Ping extends BotCommand {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pings the bot.")
        .toJSON() as Data,
    );
  }

  public async execute(
    interaction: CommandInteraction<"cached">
  ): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle("Ping")
      .setDescription(`API Latency: \`${interaction.client.ws.ping}\`ms`)
      .setColor("ORANGE");
    interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

export default new Ping();