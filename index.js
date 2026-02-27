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
const OWNER_ID = "1471837933429325855";
const cooldown = new Map();
const COOLDOWN_TIME = 2 * 60 * 60 * 1000; // 2 hours
let generatorEnabled = true; // 🔥 Generator toggle

// 🔥 Keep Alive Server (Railway compatible)
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("Web server running.")
);

// 🎲 Generate random mixed code
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

  // 🔥 OWNER ONLY: ENABLE GENERATOR
  if (command === "enablegen") {
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ You are not allowed to use this.");

    generatorEnabled = true;
    return message.reply("✅ Generator has been ENABLED.");
  }

  // 🔥 OWNER ONLY: DISABLE GENERATOR
  if (command === "disablegen") {
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ You are not allowed to use this.");

    generatorEnabled = false;
    return message.reply("🛑 Generator has been DISABLED.");
  }

  // 🔥 OWNER RESET COMMAND
  if (command === "reset") {
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ You are not allowed to use this command.");

    const target = message.mentions.users.first() || message.author;

    for (let key of cooldown.keys()) {
      if (key.startsWith(target.id)) {
        cooldown.delete(key);
      }
    }

    return message.reply(`✅ All cooldowns reset for ${target.tag}`);
  }

  // 🔥 GEN COMMAND
  if (command === "gen") {

    // 🔒 If disabled
    if (!generatorEnabled) {
      return message.reply("🛑 The generator is currently disabled by the owner.");
    }

    const type = args[0]?.toLowerCase();

    if (!["steam", "minecraft", "crunchyroll"].includes(type)) {
      return message.reply("❌ Use: .gen steam | minecraft | crunchyroll");
    }

    const now = Date.now();
    const cooldownKey = `${message.author.id}-${type}`;

    if (cooldown.has(cooldownKey)) {
      const expiration = cooldown.get(cooldownKey) + COOLDOWN_TIME;

      if (now < expiration) {
        const timeLeft = ((expiration - now) / 60000).toFixed(1);
        return message.reply(`⏳ You are on cooldown for ${type} for ${timeLeft} more minutes.`);
      }
    }

    cooldown.set(cooldownKey, now);

    let length;
    if (type === "crunchyroll") length = 6;
    if (type === "minecraft") length = 5;
    if (type === "steam") length = 3;

    const userCode = generateCode(length);

    const gifURL = "https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif?ex=69a24df8&is=69a0fc78&hm=0a92a2bbf02f7414da6d763fba4ce075e42902cd1599db5dfaee5aafb5f72e32&";

    const serverEmbed = new EmbedBuilder()
      .setDescription("✅ Thanks for using gen! Check your DMs.")
      .setColor("#8e44ff")
      .setImage(gifURL);

    await message.channel.send({ embeds: [serverEmbed] });

    const embed = new EmbedBuilder()
      .setTitle(`Incredible Gen ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .setDescription(
`Do the following for your ticket:

1️⃣ Go to the #tickets channel  
2️⃣ Give this code to staff  

🔑 **Your Code:** ${userCode}

⏳ Cooldown for ${type}: 2 Hours`
      )
      .setColor("#8e44ff")
      .setImage(gifURL);

    try {
      await message.author.send({ embeds: [embed] });
    } catch {
      message.reply("❌ I couldn't DM you. Please enable DMs.");
    }
  }
});

client.login(process.env.TOKEN);

process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", error => {
  console.error("Uncaught exception:", error);
});