const Discord = require('discord.js');
const axios = require('axios');

function generateResponse(name, profileImage, response) {
  let lines = response.data.split('\n');
  const dpsRankingLine = 'DPS Ranking:';
  let dpsLine = '';
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    console.log(`line[${i}] = ${lines[i]}`);
    if (line === dpsRankingLine) {
      dpsLine = lines[i + 1];
      console.log(`DPS result for ${name} is ${dpsLine}`);
      break;
    }
  }
  return new Discord.RichEmbed().setTitle('DPS simulation result for ' + name).
      setAuthor(name, profileImage).
      setColor(0x00AE86).
      setURL(`https://liuyi.us/simc/results/${name}.html`).
      addField('Your DPS:', dpsLine);
}

const sendMessage = async (message, content) => {
  console.log('Sending message..');
  const msg = await message.channel.send(content);
  console.log('Sending message complete!');
  return msg;
};

const getProfile = async (name) => {
  console.log('Getting profile for ' + name);
  const profile = await axios.get(
      `https://us.api.battle.net/wow/character/illidan/${name}?fields=appearance&locale=en_US&apikey=gg38sq3xg73j6h8qsjn4qu456zccx3qj`);
  console.log('Getting profile complete');
  return profile;
};

const simulate = async (name, server, realm) => {
  console.log(`Simulating ${name} ${server} ${realm}`);
  const simulationResult = await axios.get(
      `https://liuyi.us/simc/?id=${name}&server=${server}&realm=${realm}`);
  console.log('Simulation complete');
  return simulationResult;
};

const simulateAddonExports = async (name, body) => {
  console.log('Simulating addon exports ' + name);
  const simulationResult = await axios.post(
      'https://liuyi.us/simc/simcAddon.php',
      'body=' + encodeURIComponent(body) + '&name=' + name);
  console.log('Simulation complete');
  return simulationResult;
};

const getName = (args) => {
  if (args.length === 1) {
    return args[0];
  }
  let simcExportedLines = args.join(' ').split('\n');
  console.log(simcExportedLines);
  for (let i = 0; i < simcExportedLines.length; i++) {
    let line = simcExportedLines[i];
    console.log('parsing: ' + line);
    //rogue="Aierbeijuary"
    const characterRegex = /^(deathknight|demonhunter|druid|hunter|mage|monk|paladin|priest|rogue|shaman|warrior|warlock)="?([a-zA-Z]+)"?$/;
    if (characterRegex.test(line)) {
      return characterRegex.exec(line)[2];
    }
  }
  return null;
};

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  console.log('Simulating args: ', args.length, args);
  const name = getName(args);
  let simcPromise = null;
  if (name === null) {
    return await sendMessage(message, `Hmm.. who do you want to simulate?`);
  } else if (args.join(' ').length > 100) {
    simcPromise = simulateAddonExports(name, args.join(' '));
  } else {
    simcPromise = simulate(name);
  }
  const messagePromise = sendMessage(message,
      `Simulating ${name}, please be patient`);
  const profilePromise = getProfile(name);

  try {
    let [newMessage, profile, simcResult] = await Promise.all(
        [messagePromise, profilePromise, simcPromise]);
    const profileImage = `https://render-us.worldofwarcraft.com/character/${profile.data['thumbnail']}`;
    const newMessageBody = generateResponse(name, profileImage, simcResult);
    newMessage.edit({embed: newMessageBody});
  } catch (e) {
    console.log('Exception!');
    sendMessage(message, 'Something\'s wrong... maybe ping const@illidan');
  }
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
