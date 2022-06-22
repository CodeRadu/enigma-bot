import { Interaction, MessageEmbed } from "discord.js";

import { Bot } from "../structures";
import { TypedEvent } from "../types";

export default TypedEvent({
  eventName: "interactionCreate",
  run: async (client: Bot, interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return;
      }

      if (command.requiredPerms) {
        if (!interaction.inCachedGuild()) {
          return;
        }
        const hasPerms = interaction.member.permissions.has(
          command.requiredPerms
        );
        if (!hasPerms) {
          const invalidPermissionsEmbed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Command Failed")
            .setDescription(
              "You have insufficient permissions to use" +
              " this command."
            );
          await interaction.reply({
            embeds: [invalidPermissionsEmbed],
            ephemeral: true,
          });
          return;
        }
      }

      try {
        await command.execute(interaction, client);
      } catch (e) {
        let msg = "NULL";
        if (e instanceof Error) {
          msg = e.message;
        } else if (typeof e === "object" && e !== null) {
          msg = e.toString();
        }

        console.error(e);
        const errorEmbed = new MessageEmbed()
          .setColor("RED")
          .setDescription(
            "❌ An error occurred while executing the command." +
            `\`\`\`\n${msg}\`\`\``
          );

        if (interaction.deferred) {
          await interaction.editReply({
            content: " ",
            embeds: [errorEmbed],
          });
        } else if (interaction.replied) {
          await interaction.followUp({
            content: " ",
            embeds: [errorEmbed],
          });
        } else {
          await interaction.reply({
            content: " ",
            embeds: [errorEmbed],
            ephemeral: true,
          });
        }
      }
    }
  },
});