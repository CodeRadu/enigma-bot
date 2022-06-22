import { BotCommand } from "../structures";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIApplicationCommandOptionChoice, ChannelType } from "discord-api-types/v10";
import { CommandInteraction } from "discord.js";
import { removeSpecialChannel, setSpecialChannel, SpecialChannel } from "../database";
import { Data } from "../structures/BotCommand";

const specChannels: APIApplicationCommandOptionChoice<string>[] = [
  "announcements",
  "suggestions",
  "modmail"
].map((v) => ({
  name: v,
  value: v,
}));

class Config extends BotCommand {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName("config")
        .setDescription("Changes the bot\'s config")
        .addSubcommand((sub) =>
          sub
            .setName("setchannel")
            .setDescription("Set a special channel")
            .addStringOption((opt) =>
              opt
                .setName("label")
                .setDescription("The special channel type")
                .addChoices(...specChannels)
                .setRequired(true)
            )
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription("The channel")
                .addChannelTypes(ChannelType.GuildText)
                .addChannelTypes(ChannelType.GuildNews)
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("delchannel")
            .setDescription("Delete a special channel")
            .addStringOption(opt =>
              opt
                .setName("label")
                .setDescription("The special channel type")
                .addChoices(...specChannels)
                .setRequired(true)
            )
        )
        .toJSON() as Data,
      { requiredPerms: ["ADMINISTRATOR"] }
    )
  }
  public async setChannel(
    guildId: string,
    interaction: CommandInteraction
  ) {
    const label = interaction.options.getString("label", true)
    const channel = interaction.options.getChannel("channel", true)
    await setSpecialChannel(guildId, label as SpecialChannel, channel.id)
  }

  public async delChannel(
    guildId: string,
    interaction: CommandInteraction
  ) {
    const label = interaction.options.getString("label", true)
    await removeSpecialChannel(guildId, label as SpecialChannel)
  }

  public async execute(interaction: CommandInteraction) {
    const subCommand = interaction.options.getSubcommand();
    const { guildId } = interaction;
    if (guildId === null) {
      await interaction.reply("This command belongs in a server.");
      return;
    }
    switch (subCommand) {
      case "setchannel":
        await this.setChannel(guildId, interaction);
        break;
      case "delchannel":
        await this.delChannel(guildId, interaction);
        break;
      default:
        await interaction.reply("How did we get here?");
        return;
    }
    await interaction.reply({ ephemeral: true, content: "Done" });
  }
}


export default new Config()