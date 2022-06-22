import ModmailDeleteContext from "./commands/DeleteCtxMenu";
import ModmailEditContext from "./commands/EditCtxMenu";
import ModmailCommand from "./commands/ModmailCmd";
import { BotCommand } from "../../structures";

export default function getCommands(): BotCommand[] {
  return [
    new ModmailCommand(),
    new ModmailEditContext(),
    new ModmailDeleteContext(),
  ];
}