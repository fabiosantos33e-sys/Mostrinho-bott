module.exports = (client) => {

client.on("messageCreate", message => {

  if(message.content === "!rex") {
    message.reply("🦖💚 Oii eu sou o Mostrinho!");
  }

});

};
