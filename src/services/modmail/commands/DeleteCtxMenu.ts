import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types/v10";
import { MessageContextMenuInteraction } from "discord.js";
import { getMessageByAuthor } from "../util";
import { BotCommand } from "../../../structures";
import { syncDelete } from "../sync";
import { Data } from "../../../structures/BotCommand";

export default class ModmailDeleteContext extends BotCommand {
  constructor() {
    super(
      new ContextMenuCommandBuilder()
        .setName("Delete Modmail")
        .setType(ApplicationCommandType.Message)
        .toJSON() as Data
    );
  }

  public async execute(int: MessageContextMenuInteraction): Promise<void> {
    const [modmail, msg] = await getMessageByAuthor(int);
    await syncDelete(modmail, msg);
    await int.reply({ content: "Deleted.", ephemeral: true });
  }
}