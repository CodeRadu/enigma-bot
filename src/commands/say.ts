import { Bot, BotCommand } from "../structures";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, ModalSubmitInteraction, TextChannel } from "discord.js";
import { Data } from "../structures/BotCommand";
import { ChannelType } from "discord-api-types/v10";

class Say extends BotCommand {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName('say')
        .setDescription("Say something")
        .addChannelOption(opt =>
          opt
            .setName('channel')
            .setDescription("Channel in which to send")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
        .toJSON() as Data
    )
  }

  public async execute(interaction: CommandInteraction, client: Bot): Promise<void> {
    await interaction.showModal({
      customId: `send_${interaction.id}`,
      title: "Send a message",
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "TEXT_INPUT",
              customId: "content",
              label: "Message",
              style: "PARAGRAPH",
              required: true,
            },
          ],
        },
      ],
    });
    const modalInteraction = await interaction
      .awaitModalSubmit({
        filter: (i: ModalSubmitInteraction) =>
          i.user.id === interaction.user.id &&
          i.customId === `send_${interaction.id}`,
        time: 600_000,
      })
      .catch(() => null);
    if (!modalInteraction) {
      const errorEmbed = new MessageEmbed()
        .setColor("RED")
        .setDescription("Send cancelled.");
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      return;
    }
    const { guildId } = interaction;
    const channel = interaction.options.getChannel('channel')
    if (guildId === null) {
      await interaction.reply("This command belongs in a server.");
      return;
    }
    if (channel) {
      const actualChannel = await client.channels.fetch(channel.id) as TextChannel
      actualChannel.send(modalInteraction.fields.getTextInputValue("content"))
    }
    else {
      await interaction.channel?.send(modalInteraction.fields.getTextInputValue("content"))
    }
    await modalInteraction.reply({ content: "Done", ephemeral: true })
  }
}

export default new Say()