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

// 🎲 Generate number code
function generateCode(length) {
  let result = "";
  const numbers = "0123456789";
  for (let i = 0; i < length; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
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

    await message.channel.send({
      content: "✅ Thanks for using gen! Check your DMs.",
      files: [
        "https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif"
      ]
    });

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
      .setImage("https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif");

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