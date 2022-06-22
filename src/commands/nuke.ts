import { Bot, BotCommand } from "../structures";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";
import { Data } from "../structures/BotCommand";

class Nuke extends BotCommand {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName("nuke")
        .setDescription("Deletes every message in the channel")
        .toJSON() as Data,
      { requiredPerms: ["MANAGE_CHANNELS"] }
    )
  }

  public async execute(interaction: CommandInteraction, client: Bot): Promise<void> {
    const channel = interaction.channel as TextChannel
    await channel.clone()
    await channel.delete()
  }
}

export default new Nuke()