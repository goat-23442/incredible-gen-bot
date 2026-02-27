const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require("discord.js");

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

// ✅ 2 HOURS
const COOLDOWN_TIME = 2 * 60 * 60 * 1000;

let generatorEnabled = true;
const cooldown = new Map();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

function generateRandomString(length = 18) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ================= OWNER COMMANDS =================

  if (command === "disablegen") {
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");
    generatorEnabled = false;
    return message.reply("🛑 Generator DISABLED.");
  }

  if (command === "enablegen") {
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");
    generatorEnabled = true;
    return message.reply("✅ Generator ENABLED.");
  }

  if (command === "resettime") {
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");

    const userId = args[0];
    if (!userId) return message.reply("❌ Provide a user ID.");

    for (let key of cooldown.keys()) {
      if (key.startsWith(userId)) {
        cooldown.delete(key);
      }
    }

    return message.reply(`✅ Cooldown reset for ${userId}`);
  }

  // ================= GENERATOR =================

  if (command === "gen") {

    if (!generatorEnabled) {
      return message.reply("🛑 Generator is disabled.");
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
        return message.reply(
          `⏳ Wait ${timeLeft} more minutes before generating ${type} again.`
        );
      }
    }

    cooldown.set(cooldownKey, now);

    const generated = generateRandomString(18);

    const embed = new EmbedBuilder()
      .setTitle(`🎁 ${type.toUpperCase()} Account`)
      .setDescription(`\`\`\`${generated}\`\`\``)
      .setImage("https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif")
      .setColor("Green")
      .setTimestamp();

    try {
      await message.author.send({ embeds: [embed] });
      await message.reply("📩 Check your DMs!");
    } catch (err) {
      console.log("DM ERROR:", err);
      await message.reply("❌ I cannot DM you. Enable DMs from server members.");
    }
  }
});

client.login(process.env.TOKEN);