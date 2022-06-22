import { BotCommand } from "../structures";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, ModalSubmitInteraction, TextChannel } from "discord.js";
import { getSpecialChannel } from "../database";
import { Data } from "../structures/BotCommand";

class Suggest extends BotCommand {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Send a suggestion")
        .toJSON() as Data,
      { timeout: 60000 }
    )
  }

  public async execute(interaction: CommandInteraction) {
    if (interaction.guildId === null) {
      throw new Error("This belongs in a server.");
    }
    const optAnnounce = await getSpecialChannel(
      interaction.guildId,
      "suggestions"
    );
    if (optAnnounce === null) {
      throw new Error("There is not an suggestions channel configured");
    }
    const suggestionsChannel = optAnnounce as TextChannel;
    await interaction.showModal({
      customId: `suggestion_${interaction.id}`,
      title: "Make a suggestion",
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "TEXT_INPUT",
              customId: "title",
              label: "Title",
              style: "SHORT",
              required: true,
              maxLength: 256,
            },
          ],
        },
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "TEXT_INPUT",
              customId: "content",
              label: "content",
              style: "PARAGRAPH",
              required: true
            }
          ]
        }
      ]
    })
    const modalInteraction = await interaction.awaitModalSubmit({
      filter: (i: ModalSubmitInteraction) =>
        i.user.id === interaction.user.id &&
        i.customId === `suggestion_${interaction.id}`,
      time: 600_000
    }).catch(() => null)
    if (!modalInteraction) {
      const errorEmbed = new MessageEmbed()
        .setColor("RED")
        .setDescription("Announcement cancelled.");
      await interaction.followUp({ embeds: [errorEmbed] });
      return;
    }
    const suggestionEmbed = new MessageEmbed()
      .setColor("ORANGE")
      .setTitle(modalInteraction.fields.getTextInputValue("title"))
      .setDescription(
        modalInteraction.fields.getTextInputValue("content")
      );
    const successEmbed = new MessageEmbed()
      .setColor("GREEN")
      .setDescription(
        `Successfully created suggestion in ${suggestionsChannel}`
      );
    await modalInteraction.reply({
      embeds: [successEmbed],
    });
    await suggestionsChannel.send({
      embeds: [suggestionEmbed],
    });
  }
}

export default new Suggest()