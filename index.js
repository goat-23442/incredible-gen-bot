const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require("express");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const prefix = ".";
const cooldown = new Map();
const COOLDOWN_TIME = 2 * 60 * 60 * 1000; // 2 hours

// 🔥 Keep Alive Server (Railway compatible)
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("Web server running.")
);

// 🎲 Generate random mixed code (letters + numbers + symbols)
function generateCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "gen") {
    const type = args[0]?.toLowerCase();

    if (!["steam", "minecraft", "crunchyroll"].includes(type)) {
      return message.reply("❌ Use: .gen steam | minecraft | crunchyroll");
    }

    const now = Date.now();

    if (cooldown.has(message.author.id)) {
      const expiration = cooldown.get(message.author.id) + COOLDOWN_TIME;

      if (now < expiration) {
        const timeLeft = ((expiration - now) / 60000).toFixed(1);
        return message.reply(`⏳ You are on cooldown for ${timeLeft} more minutes.`);
      }
    }

    cooldown.set(message.author.id, now);

    let length;
    if (type === "crunchyroll") length = 6;
    if (type === "minecraft") length = 5;
    if (type === "steam") length = 3;

    const userCode = generateCode(length);

    // ✅ Server embed with GIF
    const serverEmbed = new EmbedBuilder()
      .setDescription("✅ Thanks for using gen! Check your DMs.")
      .setColor("#8e44ff")
      .setImage("https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif?ex=69a24df8&is=69a0fc78&hm=0a92a2bbf02f7414da6d763fba4ce075e42902cd1599db5dfaee5aafb5f72e32&");

    await message.channel.send({ embeds: [serverEmbed] });

    // ✅ DM embed
    const embed = new EmbedBuilder()
      .setTitle(`Incredible Gen ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .setDescription(
`Do the following for your ticket:

1️⃣ Go to the #tickets channel  
2️⃣ Give this code to staff  

🔑 **Your Code:** ${userCode}

⏳ Cooldown: 2 Hours`
      )
      .setColor("#8e44ff")
      .setImage("https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif?ex=69a24df8&is=69a0fc78&hm=0a92a2bbf02f7414da6d763fba4ce075e42902cd1599db5dfaee5aafb5f72e32&");

    try {
      await message.author.send({ embeds: [embed] });
    } catch {
      message.reply("❌ I couldn't DM you. Please enable DMs.");
    }
  }
});

client.login(process.env.TOKEN);

// Crash protection
process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", error => {
  console.error("Uncaught exception:", error);
});