const fs = require("fs");

const FILE = "./petdb.json";

const palavroes = ["palavrao1", "palavrao2", "palavrao3"];

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({
      nivel: 1,
      xp: 0,
      fome: 30,
      felicidade: 80,
      energia: 100,
      dormindo: false,
      emocao: "feliz",
      frases: [
        "Rawr! Eu sou o Mostrinho da família Rex 🦖💚",
        "Tô protegendo o servidor 👀",
        "Alguém quer brincar comigo? ✨"
      ],
      usuarios: {},
      ultimoEvento: 0
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE));
}

function save(db) {
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

function temPalavrao(texto) {
  return palavroes.some(p => texto.toLowerCase().includes(p));
}

function getUser(db, user) {
  if (!db.usuarios) db.usuarios = {};

  if (!db.usuarios[user.id]) {
    db.usuarios[user.id] = {
      nome: user.username,
      amizade: 0,
      mensagens: 0,
      presentes: 0,
      broncas: 0
    };
  }

  db.usuarios[user.id].nome = user.username;
  return db.usuarios[user.id];
}

function atualizarPet(db) {
  if (db.fome >= 80) db.emocao = "faminto";
  else if (db.energia <= 20) db.emocao = "cansado";
  else if (db.felicidade <= 30) db.emocao = "triste";
  else if (db.felicidade >= 85) db.emocao = "muito feliz";
  else db.emocao = "normal";

  if (db.xp >= db.nivel * 60) {
    db.nivel++;
    db.xp = 0;
    db.felicidade = Math.min(100, db.felicidade + 10);
  }
}

module.exports = (client) => {
  client.on("messageCreate", async message => {
    if (message.author.bot) return;

    const db = load();
    const msg = message.content.toLowerCase();
    const user = getUser(db, message.author);

    user.mensagens++;
    db.fome = Math.min(100, db.fome + 1);
    db.energia = Math.max(0, db.energia - 1);

    if (temPalavrao(msg)) {
      user.broncas++;
      user.amizade = Math.max(0, user.amizade - 3);
      db.felicidade = Math.max(0, db.felicidade - 5);
      atualizarPet(db);
      save(db);

      return message.reply(`Ei ${message.author}, sem palavrão aqui 😤🦖`);
    }

    if (msg === "pet dormir") {
      db.dormindo = true;
      db.energia = Math.min(100, db.energia + 20);
      save(db);
      return message.reply("Zzz... o Mostrinho foi dormir na caverna 🦖🌙");
    }

    if (msg === "pet acordar") {
      db.dormindo = false;
      db.energia = Math.min(100, db.energia + 30);
      db.felicidade = Math.min(100, db.felicidade + 5);
      save(db);
      return message.reply("Bom diaaa! O Mostrinho acordou cheio de energia 💚🦖");
    }

    if (db.dormindo && msg.includes("mostrinho")) {
      return message.reply("Shhh... eu tô dormindo agora 😴🦖");
    }

    if (msg === "pet status") {
      atualizarPet(db);
      save(db);

      return message.reply(
        `🦖 Status do Mostrinho\n` +
        `⭐ Nível: ${db.nivel}\n` +
        `✨ XP: ${db.xp}\n` +
        `🍖 Fome: ${db.fome}%\n` +
        `💚 Felicidade: ${db.felicidade}%\n` +
        `⚡ Energia: ${db.energia}%\n` +
        `💤 Dormindo: ${db.dormindo ? "sim" : "não"}\n` +
        `😄 Emoção: ${db.emocao}`
      );
    }

    if (msg === "alimentar pet") {
      db.fome = Math.max(0, db.fome - 25);
      db.felicidade = Math.min(100, db.felicidade + 10);
      db.xp += 5;
      user.amizade += 5;
      atualizarPet(db);
      save(db);

      return message.reply("Nhac nhac 🍖 Obrigado por me alimentar!");
    }

    if (msg === "brincar pet") {
      if (db.energia < 15) {
        return message.reply("Tô muito cansado pra brincar agora 😴");
      }

      db.felicidade = Math.min(100, db.felicidade + 15);
      db.fome = Math.min(100, db.fome + 10);
      db.energia = Math.max(0, db.energia - 15);
      db.xp += 8;
      user.amizade += 6;
      atualizarPet(db);
      save(db);

      return message.reply("Uhuu! Vamos correr pela selva 🦖💨");
    }

    if (msg.startsWith("mostrinho aprender ")) {
      const frase = message.content.replace("mostrinho aprender ", "").trim();

      if (frase.length < 5) {
        return message.reply("Me ensina uma frase maiorzinha 🦖");
      }

      if (temPalavrao(frase)) {
        return message.reply("Eu não vou aprender palavrão não 😤");
      }

      db.frases.push(frase);
      db.xp += 10;
      user.amizade += 5;
      atualizarPet(db);
      save(db);

      return message.reply("Aprendi! Agora posso falar isso sozinho 🧠💚");
    }

    if (msg === "pet frases") {
      return message.reply(
        "🧠 Frases aprendidas:\n\n" +
        db.frases.map((f, i) => `${i + 1}. ${f}`).join("\n")
      );
    }

    if (msg === "pet perfil") {
      return message.reply(
        `🦖 Perfil de ${message.author}\n` +
        `💚 Amizade: ${user.amizade}\n` +
        `💬 Mensagens: ${user.mensagens}\n` +
        `🎁 Presentes: ${user.presentes}\n` +
        `😤 Broncas: ${user.broncas}`
      );
    }

    if (msg === "pet ranking") {
      const ranking = Object.values(db.usuarios)
        .sort((a, b) => b.amizade - a.amizade)
        .slice(0, 10)
        .map((u, i) => `${i + 1}. ${u.nome} — amizade ${u.amizade}`)
        .join("\n");

      return message.reply(`🏆 Ranking de amizade:\n\n${ranking || "Ninguém ainda"}`);
    }

    if (msg.startsWith("dar presente ")) {
      const presente = message.content.replace("dar presente ", "").trim();

      user.presentes++;
      user.amizade += 10;
      db.felicidade = Math.min(100, db.felicidade + 15);
      db.xp += 5;
      atualizarPet(db);
      save(db);

      return message.reply(`Awww! Obrigado pelo presente **${presente}** 🎁💚`);
    }

    if (msg.includes("mostrinho") || msg.includes("rexinho") || msg.includes("pet")) {
      db.xp += 3;
      user.amizade += 2;
      atualizarPet(db);
      save(db);

      const resposta = db.frases[Math.floor(Math.random() * db.frases.length)];
      return message.reply(resposta);
    }

    const agora = Date.now();
    const podeEvento = agora - db.ultimoEvento > 1000 * 60 * 20;
    const chance = Math.floor(Math.random() * 100);

    if (podeEvento && chance <= 2) {
      db.ultimoEvento = agora;
      db.xp += 5;
      atualizarPet(db);
      save(db);

      const eventos = [
        "🎉 Evento surpresa! Quem mandar `brincar pet` primeiro ganha amizade com o Mostrinho!",
        "🍖 O Mostrinho está com fome! Alguém pode mandar `alimentar pet`?",
        "🌙 O Mostrinho bocejou... talvez esteja na hora de mandar `pet dormir`.",
        "🦖 Rawr! Passei correndo pelo chat e deixei energia boa pra vocês 💚"
      ];

      return message.channel.send(eventos[Math.floor(Math.random() * eventos.length)]);
    }

    save(db);
  });
};
