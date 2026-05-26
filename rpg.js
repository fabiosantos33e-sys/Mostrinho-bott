const {
  Events,
  SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");

const FILE = "./rpgdb.json";

const ADMINS = [
  "1053803800340746261"
];

const NIVEL_MAX = 400;
const VIDA_MAXIMA = 12000;

const itensLoja = {
  espada_sombra: {
    nome: "Espada das Sombras",
    preco: 500,
    ataque: 80
  },

  katana_monarca: {
    nome: "Katana do Monarca",
    preco: 1500,
    ataque: 180
  },

  armadura_rex: {
    nome: "Armadura Rex",
    preco: 1200,
    defesa: 120
  },

  adaga_assassino: {
    nome: "Adaga do Assassino",
    preco: 900,
    ataque: 130
  },

  pocoes: {
    nome: "Poção Suprema",
    preco: 300,
    cura: 1000
  }
};

const monstros = [
  {
    nome: "Goblin Sombrio",
    vida: 300,
    ataque: 35,
    xp: 80,
    moedas: 120
  },

  {
    nome: "Lobo Maldito",
    vida: 700,
    ataque: 90,
    xp: 180,
    moedas: 250
  },

  {
    nome: "Aranha da Dungeon",
    vida: 1500,
    ataque: 160,
    xp: 350,
    moedas: 500
  },

  {
    nome: "Dragão Verde",
    vida: 5000,
    ataque: 450,
    xp: 1200,
    moedas: 2000
  }
];

function load() {

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(
      FILE,
      JSON.stringify({ jogadores: {} }, null, 2)
    );
  }

  return JSON.parse(fs.readFileSync(FILE));
}

function save(db) {
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

function isAdmin(id) {
  return ADMINS.includes(id);
}

function getPlayer(db, user) {

  if (!db.jogadores[user.id]) {

    db.jogadores[user.id] = {
      nome: user.username,
      nivel: 1,
      xp: 0,
      vida: 500,
      vidaMax: 500,
      ataque: 60,
      defesa: 25,
      moedas: 500,
      classe: "Rank E",
      inventario: [],
      cacadas: 0
    };

  }

  return db.jogadores[user.id];
}

function atualizarClasse(player) {

  if (player.nivel >= 350) {
    player.classe = "Monarca das Sombras";
  }

  else if (player.nivel >= 250) {
    player.classe = "Rank Nacional";
  }

  else if (player.nivel >= 150) {
    player.classe = "Rank S";
  }

  else if (player.nivel >= 80) {
    player.classe = "Rank A";
  }

  else if (player.nivel >= 40) {
    player.classe = "Rank B";
  }

  else if (player.nivel >= 20) {
    player.classe = "Rank C";
  }

  else if (player.nivel >= 10) {
    player.classe = "Rank D";
  }

  else {
    player.classe = "Rank E";
  }

}

function upar(player) {

  let upou = false;

  while (
    player.xp >= player.nivel * 120 &&
    player.nivel < NIVEL_MAX
  ) {

    player.xp -= player.nivel * 120;

    player.nivel++;

    player.ataque += 25;
    player.defesa += 12;

    player.vidaMax = Math.min(
      VIDA_MAXIMA,
      player.vidaMax + 80
    );

    player.vida = player.vidaMax;

    atualizarClasse(player);

    upou = true;
  }

  return upou;
}

module.exports = (client) => {

  client.once(Events.ClientReady, async () => {

    const comandos = [

      new SlashCommandBuilder()
      .setName("criar")
      .setDescription("Criar personagem RPG"),

      new SlashCommandBuilder()
      .setName("perfil")
      .setDescription("Ver perfil RPG"),

      new SlashCommandBuilder()
      .setName("caçar")
      .setDescription("Caçar monstros"),

      new SlashCommandBuilder()
      .setName("loja")
      .setDescription("Ver loja"),

      new SlashCommandBuilder()
      .setName("inventario")
      .setDescription("Ver inventário"),

      new SlashCommandBuilder()
      .setName("curar")
      .setDescription("Curar vida"),

      new SlashCommandBuilder()
      .setName("ranking")
      .setDescription("Ranking RPG"),

      new SlashCommandBuilder()
      .setName("comprar")
      .setDescription("Comprar item")
      .addStringOption(option =>
        option
        .setName("item")
        .setDescription("Nome do item")
        .setRequired(true)
      ),

      new SlashCommandBuilder()
      .setName("rpgadmin")
      .setDescription("Comandos admin")

      .addStringOption(option =>
        option
        .setName("acao")
        .setDescription("money, xp, level, heal, reset")
        .setRequired(true)
      )

      .addUserOption(option =>
        option
        .setName("usuario")
        .setDescription("Usuário")
        .setRequired(true)
      )

      .addIntegerOption(option =>
        option
        .setName("valor")
        .setDescription("Valor")
      )

    ].map(cmd => cmd.toJSON());

    try {

      for (const cmd of comandos) {
        await client.application.commands.create(cmd);
      }

      console.log("✅ RPG carregado");

    } catch (err) {
      console.log(err);
    }

  });

  client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isChatInputCommand()) return;

    try {

      await interaction.deferReply();

      const db = load();

      const user = interaction.user;

      const player = getPlayer(db, user);

      if (interaction.commandName === "criar") {

        save(db);

        return interaction.editReply(
          `🦖 ${user} seu personagem foi criado!\n` +
          `🏷️ Classe: ${player.classe}`
        );

      }

      if (interaction.commandName === "perfil") {

        return interaction.editReply(

          `🦖 Perfil de ${user}\n\n` +

          `🏷️ Classe: ${player.classe}\n` +
          `⭐ Nível: ${player.nivel}/${NIVEL_MAX}\n` +
          `✨ XP: ${player.xp}/${player.nivel * 120}\n` +
          `❤️ Vida: ${player.vida}/${player.vidaMax}\n` +
          `⚔️ Ataque: ${player.ataque}\n` +
          `🛡️ Defesa: ${player.defesa}\n` +
          `💰 Moedas: ${player.moedas}\n` +
          `🌑 Caçadas: ${player.cacadas}`

        );

      }

      if (interaction.commandName === "caçar") {

        if (player.vida <= 0) {

          return interaction.editReply(
            "❤️ Você está sem vida. Use /curar"
          );

        }

        const monstro =
        monstros[Math.floor(Math.random() * monstros.length)];

        const danoRecebido =
        Math.max(1, monstro.ataque - player.defesa);

        player.vida =
        Math.max(0, player.vida - danoRecebido);

        player.xp += monstro.xp;

        player.moedas += monstro.moedas;

        player.cacadas++;

        const upou = upar(player);

        save(db);

        return interaction.editReply(

          `🌑 Você enfrentou ${monstro.nome}\n\n` +

          `💥 Recebeu ${danoRecebido} de dano\n` +

          `✨ XP ganho: ${monstro.xp}\n` +

          `💰 Moedas ganhas: ${monstro.moedas}\n\n` +

          `${upou
            ? `🔥 LEVEL UP! Agora você está no nível ${player.nivel}`
            : "⚔️ Continue evoluindo"}`
        );

      }

      if (interaction.commandName === "loja") {

        let texto = "🏪 Loja RPG\n\n";

        for (const id in itensLoja) {

          const item = itensLoja[id];

          texto +=
          `🔹 ${id}\n` +
          `🗡️ ${item.nome}\n` +
          `💰 ${item.preco}\n\n`;

        }

        return interaction.editReply(texto);

      }

      if (interaction.commandName === "comprar") {

        const itemId =
        interaction.options.getString("item");

        const item = itensLoja[itemId];

        if (!item) {

          return interaction.editReply(
            "❌ Item não existe"
          );

        }

        if (player.moedas < item.preco) {

          return interaction.editReply(
            "💰 Você não tem moedas suficientes"
          );

        }

        player.moedas -= item.preco;

        player.inventario.push(item.nome);

        if (item.ataque) {
          player.ataque += item.ataque;
        }

        if (item.defesa) {
          player.defesa += item.defesa;
        }

        if (item.cura) {

          player.vida =
          Math.min(
            player.vidaMax,
            player.vida + item.cura
          );

        }

        save(db);

        return interaction.editReply(
          `✅ Você comprou ${item.nome}`
        );

      }

      if (interaction.commandName === "inventario") {

        return interaction.editReply(

          `🎒 Inventário\n\n` +

          `${player.inventario.join("\n") || "Vazio"}`

        );

      }

      if (interaction.commandName === "curar") {

        if (player.moedas < 100) {

          return interaction.editReply(
            "💰 Você precisa de 100 moedas"
          );

        }

        player.moedas -= 100;

        player.vida = player.vidaMax;

        save(db);

        return interaction.editReply(
          "❤️ Vida restaurada"
        );

      }

      if (interaction.commandName === "ranking") {

        const ranking = Object.values(db.jogadores)

        .sort((a, b) =>
          b.nivel - a.nivel ||
          b.xp - a.xp
        )

        .slice(0, 10)

        .map((p, i) =>

          `${i + 1}. ${p.nome} — Lv ${p.nivel}`

        )

        .join("\n");

        return interaction.editReply(

          `🏆 Ranking RPG\n\n${ranking}`

        );

      }

      if (interaction.commandName === "rpgadmin") {

        if (!isAdmin(user.id)) {

          return interaction.editReply(
            "❌ Apenas admins"
          );

        }

        const acao =
        interaction.options.getString("acao");

        const alvo =
        interaction.options.getUser("usuario");

        const valor =
        interaction.options.getInteger("valor") || 0;

        const target = getPlayer(db, alvo);

        if (acao === "money") {
          target.moedas += valor;
        }

        else if (acao === "xp") {
          target.xp += valor;
        }

        else if (acao === "level") {
          target.nivel += valor;
        }

        else if (acao === "heal") {
          target.vida = target.vidaMax;
        }

        else if (acao === "reset") {
          delete db.jogadores[alvo.id];
        }

        else {

          return interaction.editReply(
            "❌ ação inválida"
          );

        }

        atualizarClasse(target);

        save(db);

        return interaction.editReply(

          `👑 Admin executou ${acao} em ${alvo}`

        );

      }

    } catch (err) {

      console.log(err);

    }

  });

};
