import { getClient } from "."
import { Role } from "discord.js"
import { Bot } from "../structures"

export type Roles =
  | "modmail"

export async function getRoleId(guildId: string, label: Roles) {
  const client = getClient()
  const result = await client.role.findFirst({
    select: { roleId: true },
    where: { guildId, label }
  })
  return result?.roleId || null
}

export async function getRole<T extends Role>(
  roleId: string,
  label: Roles
): Promise<T | null> {
  const bot = Bot.getInstance();
  const channelId = await getRoleId(roleId, label);
  if (channelId === null) {
    return null;
  }
  const role = await (await bot.guilds.fetch(roleId)).roles.fetch(roleId)
  if (!role) {
    return null;
  }
  return role as T;
}

export async function setRole(guildId: string, label: Roles, roleId: string) {
  const client = getClient()
  const res = await getRoleId(guildId, label)
  if (res === null) {
    await client.role.create({
      data: {
        roleId,
        guildId,
        label
      }
    })
  }
  else {
    await client.role.updateMany({
      where: {
        guildId, label
      },
      data: {
        roleId,
        guildId,
        label
      }
    })
  }
}