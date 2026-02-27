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
const COOLDOWN_TIME = 2 * 60 * 60 * 1000; // 2 HOURS
const BANNER_URL = "https://cdn.discordapp.com/attachments/1474387569818079395/1476581540740726979/lv_0_20260226193526.gif";

let generatorEnabled = true;
const cooldown = new Map();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== GENERATORS =====

function generateSteam() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 3; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateMinecraft() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // 5 digit
}

function generateCrunchyroll() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
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

  // ================= GENERATOR =================

  if (command === "gen") {

    if (!generatorEnabled)
      return message.reply("🛑 Generator is currently disabled by the owner.");

    const type = args[0]?.toLowerCase();

    if (!["steam", "minecraft", "crunchyroll"].includes(type)) {
      return message.reply("❌ Usage: `.gen steam | minecraft | crunchyroll`");
    }

    const now = Date.now();
    const cooldownKey = `${message.author.id}-${type}`;

    if (cooldown.has(cooldownKey)) {
      const expiration = cooldown.get(cooldownKey) + COOLDOWN_TIME;

      if (now < expiration) {
        const timeLeft = expiration - now;
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);

        return message.reply(
          `⏳ You must wait ${hours}h ${minutes}m before generating ${type} again.`
        );
      }
    }

    cooldown.set(cooldownKey, now);

    let generated;
    let instruction;

    if (type === "steam") {
      generated = generateSteam();
      instruction = "This is a 3 character Steam code.";
    }

    if (type === "minecraft") {
      generated = generateMinecraft();
      instruction = "This is a 5 digit Minecraft code.";
    }

    if (type === "crunchyroll") {
      generated = generateCrunchyroll();
      instruction = "This is a 6 digit Crunchyroll code.";
    }

    const serverEmbed = new EmbedBuilder()
      .setTitle("✅ Generation Successful")
      .setDescription("Thank you for using the gen.\n📩 Check your DMs.")
      .setImage(BANNER_URL)
      .setColor("#8e44ff");

    await message.reply({ embeds: [serverEmbed] });

    const dmEmbed = new EmbedBuilder()
      .setTitle(`Incredible Gen ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .setDescription(
`Do the following for your account:

1. Go to the tickets channel
2. Give this code to staff

**Your Code: ${generated}**

${instruction}`
      )
      .setImage(BANNER_URL)
      .setColor("#8e44ff");

    try {
      await message.author.send({ embeds: [dmEmbed] });
    } catch (err) {
      await message.reply("❌ I cannot DM you. Please enable DMs.");
    }
  }

  // ================= SENDALL (OWNER ONLY TROLL) =================

  if (command === "sendall") {

    if (message.author.id !== OWNER_ID)
      return message.reply("❌ Owner only.");

    const target = message.mentions.users.first();
    if (!target)
      return message.reply("❌ Mention a user.");

    // Ping ONCE
    await message.channel.send(`${target} 👀`);

    // Send 99 messages without ping
    for (let i = 1; i <= 99; i++) {
      await new Promise(resolve => setTimeout(resolve, 800)); // delay to avoid rate limit
      await message.channel.send(`SPAM ${i} - ${target.username}`);
    }
  }

});

client.login(process.env.TOKEN);