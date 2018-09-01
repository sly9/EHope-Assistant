const Discord = require('discord.js');
const axios = require('axios');

function generateResponse(name, profileImage, response) {
  let lines = response.data.split('\n');
  const dpsRankingLine = 'DPS Ranking:';
  let dpsLine = '';
  for (let i = 0 ; i < lines.length; i++) {
    let line = lines[i];
    console.log(`line[${i}] = ${lines[i]}`);
    if (line == dpsRankingLine) {
      dpsLine = lines[i + 1];
      console.log(`DPS result for ${name} is ${dpsLine}`);
      break;
    }
  }

  return new Discord.RichEmbed().setTitle('DPS simulation result for ' + name).
      setAuthor(name , profileImage)
      /*
       * Alternatively, use '#00AE86', [0, 174, 134] or an integer number.
       */.
      setColor(0x00AE86).
      setDescription(
          'Your quick simulation result. Click on the link to see the details.')
      /*
       * Takes a Date object, defaults to current date.
       */.
      setTimestamp().
      setURL(`https://liuyi.us/simc/results/${name}.html`).
      addField('Your DPS:', dpsLine);
}

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  console.log('simc args: ', args);
  const name = args[0];
  const profileResponse = await axios.get(`https://us.api.battle.net/wow/character/illidan/${name}?fields=appearance&locale=en_US&apikey=gg38sq3xg73j6h8qsjn4qu456zccx3qj`)
  const profileImage = `https://render-us.worldofwarcraft.com/character/${profileResponse.data['thumbnail']}`;
  console.log('profile:', profileImage);

  const httpResponse = await axios.get(`https://liuyi.us/simc/?id=${args[0]}`);
  const response = generateResponse(args[0],profileImage, httpResponse);

  const msg = await message.channel.send({embed: response});
  //msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['模拟', 'sim'],
  permLevel: 'User',
};

exports.help = {
  name: 'simc',
  category: 'Miscelaneous',
  description: 'simc <your_id> will simulate your id in illidan;\n',
  usage: 'simc',
};
