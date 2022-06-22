import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { BaseCommandInteraction, PermissionResolvable } from "discord.js";

import Bot from "./Bot";

export type BotCommandOpt = {
  requiredPerms?: PermissionResolvable;
  timeout?: number;
};

export type Data = RESTPostAPIApplicationCommandsJSONBody & { description: string }

export default abstract class BotCommand {
  public readonly data: Data;

  public readonly timeout?: number;

  public readonly requiredPerms?: PermissionResolvable;

  protected constructor(
    data: Data,
    opt?: BotCommandOpt
  ) {
    this.data = data;
    this.timeout = opt?.timeout;
    this.requiredPerms = opt?.requiredPerms;
  }

  public abstract execute(
    interaction: BaseCommandInteraction,
    client: Bot
  ): Promise<void>;
}