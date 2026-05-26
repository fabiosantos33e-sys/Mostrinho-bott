const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

module.exports = (client) => {

client.on(Events.InteractionCreate, async interaction => {

  // PAINEL
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "ticketpainel") {

      const embed = new EmbedBuilder()
      .setColor("#39ff14")
      .setTitle("🦖💚 Central de Ajuda Rex 💚🦖")
      .setDescription(`
🦖💚 Oiii! Eu sou o Mostrinho da Central de Ajuda 💚🦖

Escolha uma opção abaixo para abrir um ticket!

🔧 Suporte
🚨 Denúnia
🤝 Parcerias
⚙️ Funções
      `)
      .setImage("https://cdn.discordapp.com/attachments/1495896642904129676/1508270269712568330/bb3f7ace-1ee0-40d6-bac4-3ad5c5e8a9ba.png?ex=6a14eda6&is=6a139c26&hm=d5f9095c411732a8c81cc54645f53d818e8ff7020d9ac67fa7eefd2b196473c7&.png");

      const row = new ActionRowBuilder()
      .addComponents(

        new StringSelectMenuBuilder()
        .setCustomId("menu_ticket")
        .setPlaceholder("Clique para escolher uma opção")
        .addOptions([
          {
            label: "Suporte",
            description: "Abrir ticket de suporte",
            value: "suporte",
            emoji: "🔧"
          },
          {
            label: "Denúncia",
            description: "Reportar algo",
            value: "denuncia",
            emoji: "🚨"
          },
          {
            label: "Parcerias",
            description: "Parcerias do servidor",
            value: "parcerias",
            emoji: "🤝"
          },
          {
            label: "Funções",
            description: "Dúvidas sobre cargos",
            value: "funcoes",
            emoji: "⚙️"
          }
        ])

      );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }

  }

  // MENU TICKET
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "menu_ticket") {

      await interaction.deferReply({ ephemeral: true });

      const tipo = interaction.values[0];

      const canal = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,

        permissionOverwrites: [

          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },

          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }

        ]

      });

      const embed = new EmbedBuilder()
      .setColor("#39ff14")
      .setTitle(`🎫 Ticket ${tipo}`)
      .setDescription(`
💚 Olá ${interaction.user}!

Seu ticket foi aberto com sucesso 🦖

Explique seu problema e aguarde a equipe responder.
      `)
      .setImage("https://cdn.discordapp.com/attachments/1495896642904129676/1508277079433806104/26f18974-5305-4e62-aecb-0ebd816a2856.png?ex=6a14f3fe&is=6a13a27e&hm=7690714d3ceea1c1f4e28a7601c704cdafed8273c6ff6196e20527b6850098a4&.png");
      const fechar = new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()
        .setCustomId("fechar_ticket")
        .setLabel("Fechar Ticket")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔒")

      );

      await canal.send({
        content: `${interaction.user}`,
        embeds: [embed],
        components: [fechar]
      });

      return interaction.editReply({
        content: `✅ Ticket criado: ${canal}`
      });

    }

  }

  // FECHAR
  if (interaction.isButton()) {

    if (interaction.customId === "fechar_ticket") {

      await interaction.reply({
        content: "🔒 Fechando ticket em 5 segundos...",
        ephemeral: true
      });

      setTimeout(async () => {

        try {
          await interaction.channel.delete();
        } catch(err) {
          console.log(err);
        }

      }, 5000);

    }

  }

});

};
