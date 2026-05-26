const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");

const TOKEN = process.env.TOKEN;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let config = {
  canal: "",
  mensagem: "✨ Bem-vindo {user} ao servidor!"
};

if (fs.existsSync("./config.json")) {
  config = JSON.parse(fs.readFileSync("./config.json"));
}

client.once(Events.ClientReady, async (bot) => {

  console.log(`✅ Bot online como ${bot.user.tag}`);

  const commands = [

new SlashCommandBuilder()
.setName("painel")
.setDescription("Configurar boas-vindas")

.addChannelOption(option =>
  option
  .setName("canal")
  .setDescription("Canal")
  .setRequired(true)
)

.addStringOption(option =>
  option
  .setName("mensagem")
  .setDescription("Mensagem")
  .setRequired(true)
),

new SlashCommandBuilder()
.setName("ticketpainel")
.setDescription("Enviar painel de ticket")

].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

await rest.put(
  Routes.applicationCommands(bot.user.id),
  { body: commands }
);

});
client.on(Events.InteractionCreate, async interaction => {

  // PAINEL BOAS VINDAS
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "painel") {

      await interaction.deferReply({ ephemeral: true });

      const canal = interaction.options.getChannel("canal");
      const mensagem = interaction.options.getString("mensagem");

      config.canal = canal.id;
      config.mensagem = mensagem;

      fs.writeFileSync(
        "./config.json",
        JSON.stringify(config, null, 2)
      );

      const embed = new EmbedBuilder()
        .setColor("#00ff88")
        .setTitle("✅ Painel Atualizado")
        .setDescription(`Canal: ${canal}\nMensagem: ${mensagem}`);

      await interaction.editReply({
        embeds: [embed]
      });

    }

  }

});

// BOAS VINDAS
client.on(Events.GuildMemberAdd, async member => {

  const canal = member.guild.channels.cache.get(config.canal);

  if (!canal) return;

  const embed = new EmbedBuilder()
    .setColor("#00ff88")
    .setTitle("✨ Novo membro")
    .setDescription(
      config.mensagem.replace("{user}", `${member}`)
    )
    .setThumbnail(
      member.user.displayAvatarURL({ dynamic: true })
    )
    .setImage("https://cdn.discordapp.com/attachments/1495896642904129676/1508278446160351322/d4533674-2366-4c03-8565-9ddd40dfc22a.png?ex=6a14f544&is=6a13a3c4&hm=c895747c3226bd347675b97a5316fa054e3a1c41ddac3b843261777a9e321869&.png");

  canal.send({
    content: "@here",
    embeds: [embed]
  });

});

// CHAT INTERATIVO
client.on(Events.MessageCreate, async message => {

  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg.includes("oi")) {
    return message.reply(`Oii ${message.author}! 💚`);
  }

  if (msg.includes("boa noite")) {
    return message.reply(`Boa noite ${message.author}! 🌙`);
  }

  if (msg.includes("tudo bem")) {
    return message.reply(`Tudo ótimo 😎`);
  }

  if (msg.includes("pergunta")) {

    const perguntas = [
      "Qual jogo vocês mais jogam? 🎮",
      "Quem é o mais ativo? 👀",
      "Qual música combina com o servidor? 🎵",
      "Qual evento vocês querem? 🔥"
    ];

    const pergunta =
      perguntas[Math.floor(Math.random() * perguntas.length)];

    return message.channel.send(pergunta);

  }

});
require("./ticket")(client);
require("./pet")(client);
require("./rpg")(client);
client.login("TOKEN");
