import { AnyChannel } from "discord.js"
import { getClient } from "."
import { Bot } from "../structures"

export type SpecialChannel =
  | "announcements"
  | "suggestions"
  | "modmail"

async function getChannelId(guildId: string, label: SpecialChannel) {
  const client = getClient()
  const result = await client.specialChannel.findFirst({
    select: { channelId: true },
    where: { guildId, label }
  })
  return result?.channelId || null
}
export async function getSpecialChannel<T extends AnyChannel>(
  guildId: string,
  label: SpecialChannel
): Promise<T | null> {
  const bot = Bot.getInstance();
  const channelId = await getChannelId(guildId, label);
  if (channelId === null) {
    return null;
  }
  const channel = await bot.channels.fetch(channelId);
  if (!channel) {
    return null;
  }
  return channel as T;
}

export async function setSpecialChannel(
  guildId: string,
  label: SpecialChannel,
  channelId: string
): Promise<void> {
  const client = getClient();
  const res = await getChannelId(guildId, label);
  if (res === null) {
    await client.specialChannel.create({
      data: {
        channelId,
        guildId,
        label,
      },
    });
  } else {
    await client.specialChannel.updateMany({
      where: {
        guildId,
        label,
      },
      data: {
        channelId,
        guildId,
        label,
      },
    });
  }
}

export async function removeSpecialChannel(
  guildId: string,
  label: SpecialChannel,
) {
  const client = getClient()
  const channel = await client.specialChannel.findFirst({
    select: { id: true },
    where: { guildId, label }
  })
  if (!channel) return
  await client.specialChannel.delete({
    where: { id: channel.id }
  })
}
