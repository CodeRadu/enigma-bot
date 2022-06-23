import { CacheType, CommandInteraction, GuildMember, Interaction, MessageEmbed, User, VoiceState } from "discord.js";
import { Bot, BotCommand } from "../structures";
import { SlashCommandBuilder } from '@discordjs/builders'
import { Data } from "../structures/BotCommand";
import { QueryType } from "discord-player";

class Radio extends BotCommand {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName("radio")
        .setDescription("Play music in a VC")
        .addSubcommandGroup(subg =>
          subg
            .setName("play")
            .setDescription("Play songs")
            .addSubcommand(sub =>
              sub
                .setName("song")
                .setDescription("Play a single sonog from URL")
                .addStringOption(opt =>
                  opt
                    .setName("url")
                    .setDescription("The URL for the song")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub =>
              sub
                .setName("playlist")
                .setDescription("Load a playlist of songs from URL")
                .addStringOption(opt =>
                  opt
                    .setName("url")
                    .setDescription("The URL for the playlist")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub =>
              sub
                .setName("search")
                .setDescription("Search for song")
                .addStringOption(opt =>
                  opt
                    .setName("query")
                    .setDescription("What to search for")
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(subg =>
          subg
            .setName("queue")
            .setDescription("Queue commands")
            .addSubcommand(sub =>
              sub
                .setName("display")
                .setDescription("Displays the current queue")
                .addNumberOption(opt =>
                  opt
                    .setName("page")
                    .setDescription("Page number")
                    .setMinValue(1)
                )
            )
            .addSubcommand(sub =>
              sub
                .setName("clear")
                .setDescription("Clear the queue and leave the channel")
            )
            .addSubcommand(sub =>
              sub
                .setName("pause")
                .setDescription("Pauses the music")
            )
            .addSubcommand(sub =>
              sub
                .setName("resume")
                .setDescription("Resumes the music")
            )
            .addSubcommand(sub =>
              sub
                .setName("skip")
                .setDescription("Skips the current song")
            )
            .addSubcommand(sub =>
              sub
                .setName("skipto")
                .setDescription("Skips to song #")
                .addNumberOption(opt =>
                  opt
                    .setName("track")
                    .setDescription("Track number")
                    .setRequired(true)
                )
            )
        )
        .toJSON() as Data
    )
  }

  public async execute(interaction: CommandInteraction, client: Bot) {
    const subcommandGroup = interaction.options.getSubcommandGroup()
    const subCommand = interaction.options.getSubcommand()
    const { guildId } = interaction
    if (!guildId) {
      throw new Error("This belongs in a server.");
    }
    switch (subcommandGroup || subCommand) {
      case "play":
        const member = interaction.member as unknown as GuildMember
        if (!member.voice?.channel) {
          throw new Error("You need to be in a voice channel")
        }
        const queue = await client.player?.createQueue(guildId)
        if (!queue?.connection) await queue?.connect(member.voice.channel)
        const embed = new MessageEmbed()
        switch (subCommand) {
          case "song":
            {
              const url = interaction.options.getString('url')
              const result = await client.player?.search(url!, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
              })
              if (result?.tracks.length === 0) {
                interaction.reply("No result")
                return
              }
              const song = result?.tracks[0]
              queue?.addTrack(song!)
              embed.setDescription(`**[${song?.title}](${song?.url})** has been added to queue`)
                .setThumbnail(song?.thumbnail!)
                .setFooter({ text: `Duration: ${song?.duration}` })
              break
            }
          case "playlist":
            {
              const url = interaction.options.getString('url')
              const result = await client.player?.search(url!, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
              })
              if (result?.tracks.length === 0) {
                interaction.reply("No result")
                return
              }
              const playlist = result?.playlist
              queue?.addTracks(result?.tracks!)
              embed.setDescription(`**${result?.tracks.length} songs from [${playlist?.title}](${playlist?.url})** has been added to queue`)
                .setThumbnail(playlist?.thumbnail!)
              break
            }
          case "search":
            {
              const url = interaction.options.getString("query")
              const result = await client.player?.search(url!, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
              })
              if (result?.tracks.length === 0) {
                await interaction.reply("No results")
                return
              }
              const song = result?.tracks[0]
              await queue?.addTrack(song!)
              embed.setDescription(`**[${song!.title}](${song!.url})** has been added to the Queue`)
                .setThumbnail(song!.thumbnail)
                .setFooter({ text: `Duration: ${song?.duration}` })
            }
            break;
          default:
            await interaction.reply("How did we get here?");
            return;
        }
        if (!queue?.playing) queue?.play()
        interaction.reply({ embeds: [embed], content: "Success" })
        break
      case "queue":
        switch (subCommand) {
          case "display":
            {
              const queue = client.player?.getQueue(guildId)
              if (!queue || !queue.playing) {
                await interaction.reply("There are no songs in queue")
                return
              }
              const totalPages = Math.ceil(queue.tracks.length / 10) || 1
              const opPage = interaction.options.getNumber("page") || 1
              const page = (opPage - 1 || 0)
              if (page + 1 > totalPages) {
                await interaction.reply(`Invalid page. Total number of pages is ${totalPages}`)
                return
              }
              const queueString = queue.tracks.slice(page * 10, page * 10 + 10).map((song, i) => {
                return `**${page * 10 + i + 1}**. \`[${song.duration}]\` ${song.title} -- <@${song.requestedBy.id}>\n`
              })

              const currentSong = queue.current
              await interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setDescription(`**Currently Playing**\n` +
                      (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.requestedBy.id}>` : "None") +
                      `\n\n**Queue**\n${queueString}`
                    )
                    .setFooter({
                      text: `Page ${page + 1} of ${totalPages}`
                    })
                    .setThumbnail(currentSong.thumbnail)
                ]
              })
              break
            }
          case "clear":
            {
              const queue = client.player?.getQueue(guildId)
              if (!queue) {
                await interaction.reply("There are no songs in queue")
                return
              }
              queue.destroy()
              await interaction.reply("Bye!")
              break
            }
          case "pause":
            {
              const queue = client.player?.getQueue(guildId)
              if (!queue) {
                await interaction.reply("No songs in queue")
                return
              }
              queue.setPaused(true)
              await interaction.reply("Paused")
              break
            }
          case "resume":
            {
              const queue = client.player?.getQueue(guildId)
              if (!queue) {
                await interaction.reply("No songs in queue")
                return
              }
              queue.setPaused(false)
              await interaction.reply("Resumed")
              break
            }
          case "skip":
            {
              const queue = client.player?.getQueue(guildId)
              if (!queue) {
                await interaction.reply("No songs in queue")
                return
              }
              const currentSong = queue.current
              queue.skip()
              await interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setDescription(`${currentSong.title} has been skipped`).setThumbnail(currentSong.thumbnail)
                ]
              })
              break
            }
          case "skipto":
            {
              const queue = client.player?.getQueue(guildId)
              if (!queue) {
                await interaction.reply("No songs in queue")
                return
              }
              const trackNum = interaction.options.getNumber("track")
              if (trackNum! > queue.tracks.length)
                queue.skipTo(trackNum! - 1)
              await interaction.reply(`Skipped to track no. ${trackNum}`)
              break
            }
        }
        break
      default:
        await interaction.reply("How did we get here?");
        return;
    }
  }
}

export default new Radio()