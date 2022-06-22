-- CreateTable
CREATE TABLE "SpecialChannel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "SpecialChannel_pkey" PRIMARY KEY ("id")
);
