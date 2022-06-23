import { Player } from "discord-player";
import { Client, Collection, GuildAuditLogsEntry, Intents } from "discord.js";
import { eventFiles } from "../files";
import { IBotEvent } from "../types";
import BotCommand from "./BotCommand";
import Logger from "./Logger";

export default class Bot extends Client<true> {
  protected static instance: Bot
  public commands = new Collection<string, BotCommand>()
  public logger = new Logger({ level: process.env.LOG_LEVEL || "info" })
  private lastLoggedDeletion: Map<
    string,
    GuildAuditLogsEntry<"MESSAGE_DELETE">
  >;
  player: Player | undefined;
  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES
      ],
      partials: ["MESSAGE", "CHANNEL", "REACTION"],
    });
    this.lastLoggedDeletion = new Map();
    Bot.instance = this;
  }
  static getInstance(): Bot {
    return Bot.instance;
  }
  getLastLoggedDeletion(
    guildId: string
  ): GuildAuditLogsEntry<"MESSAGE_DELETE"> | null {
    return this.lastLoggedDeletion.get(guildId) || null;
  }
  setLastLoggedDeletion(
    guildId: string,
    value?: GuildAuditLogsEntry<"MESSAGE_DELETE">
  ) {
    if (value !== undefined) {
      this.lastLoggedDeletion.set(guildId, value);
    }
  }
  async start() {
    if (process.env.TOKEN === undefined) {
      this.logger.console.error("No token was provided")
      return
    }
    await this.initModules();
    await this.login(process.env.TOKEN || "");
  }
  async initModules() {
    this.logger.console.info("Registering slash commands");
    const tasks: Promise<unknown>[] = [];
    for (let i = 0; i < eventFiles.length; i += 1) {
      const file = eventFiles[i];
      const task = import(file);
      task.then((module) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event = module.default as IBotEvent<any>;
        if (!event) {
          this.logger.console.error(
            `File at path ${file} seems to incorrectly be exporting an event.`
          );
        } else {
          if (event.once) {
            this.once(event.eventName, event.run.bind(null, this));
          } else {
            this.on(event.eventName, event.run.bind(null, this));
          }
          this.logger.console.debug(
            `Registered event ${event.eventName}`
          );
        }
      });
      tasks.push(task);
    }

    await Promise.all(tasks);
  }
}