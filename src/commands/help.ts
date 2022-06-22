import { Bot, BotCommand } from "../structures";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { helpstring as cmds } from '../events/ready'
import { Data } from "../structures/BotCommand";

class Help extends BotCommand {
  constructor() {
    super(
      new SlashCommandBuilder().setName("help").setDescription("Shows help page").toJSON() as Data
    )
  }

  public async execute(interaction: CommandInteraction, client: Bot): Promise<void> {
    const embed = new MessageEmbed().setTitle("Help").setColor("ORANGE").setDescription(cmds)
    interaction.reply({ embeds: [embed], ephemeral: true })
  }
}

export default new Help()