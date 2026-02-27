const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

const prefix = ".";
const OWNER_ID = "1471837933429325855";
const COOLDOWN_TIME = 24 * 60 * 60 * 1000;

let generatorEnabled = true;
const cooldown = new Map();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

function generateRandomString(length = 18) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ================= OWNER COMMANDS =================

  if (command === "enablegen") {
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");
    generatorEnabled = true;
    return message.reply("✅ Generator ENABLED.");
  }

  if (command === "disablegen") {
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");
    generatorEnabled = false;
    return message.reply("🛑 Generator DISABLED.");
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

    return message.reply(`✅ Cooldown reset for user ${userId}`);
  }

  // ================= GENERATOR =================

  if (command === "gen") {
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
        const timeLeft = ((expiration - now) / 3600000).toFixed(1);
        return message.reply(
          `⏳ You must wait ${timeLeft} more hours before generating ${type} again.`
        );
      }
    }

    cooldown.set(cooldownKey, now);

    const generated = generateRandomString(18);

    const embed = new EmbedBuilder()
      .setTitle(`🎁 ${type.toUpperCase()} Account`)
      .setDescription(`\`\`\`${generated}\`\`\``)
      .setImage("https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif?ex=69a24df8&is=69a0fc78&hm=0a92a2bbf02f7414da6d763fba4ce075e42902cd1599db5dfaee5aafb5f72e32&")
      .setColor("Green")
      .setFooter({ text: "Enjoy!" })
      .setTimestamp();

    try {
      await message.author.send({ embeds: [embed] });
      await message.reply("📩 Check your DMs!");
    } catch (error) {
      await message.reply("❌ I cannot DM you. Please enable DMs from server members.");
    }
  }
});

client.login(process.env.TOKEN);