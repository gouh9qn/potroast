const Discord = require('discord.js');
var https = require('https');
const newDeck = require('./card').newDeck; 

var pg = require('pg');
const pool = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
pool.connect();

var options = {
  hostname: 'api.imgur.com',
  path: '/3/album/PCYtJp8/images/',
  headers: {Authorization: 'Client-ID c9796abee6990a5'},
  method: 'GET'
};

var images = [];
var req = https.request(options, function(res) {

  res.on('data', function(d) {
    images.push(d);
  }).on('end', function() {
    var data = Buffer.concat(images);
    images = JSON.parse(data).data;
  });
}).on('error', (e) => {images = [];});

req.end();
var client = new Discord.Client();


const changelog = "Added meme coins, multiple channel roulette games, and `pr!unjoin`";
const future = "Add blackjack";

const botinf = {embed: {
  color: 0x4d798e,
  title: "Changelog",
  description: "Click on the link above for the full changelog.",
  url: 'https://github.com/Xylenox/potroast/blob/master/changelog.txt',
  fields: [
    {name: "Version", value: '1.1.1'},
    {name: "Changelog", value: changelog},
    {name: "Future Features", value: future}
  ]
}};

var pots = 'CEug9Fi';

var curGames = new Map();
var allPlayers = [];

client.on('message', msg => {
  var message = msg.content.trim().split(/\s+/);
  if(msg.author.bot) return;
  switch(message[0]) {
    case 'pr!changelog':
      msg.channel.send(botinf);
      break;
    case 'pr!ping':
      msg.channel.send(':ping_pong: Pong! ' + client.ping.toFixed(0) + " ms");
      break;
    case 'pr!potroast':
      if(images.length == 0)
      { msg.reply('Could not load images. Please try to \'!refresh\'.'); } 
      else { msg.reply('Here\'s your pot roast!', {files: [images[Math.floor(Math.random()*images.length)].link]}); }
      break;
    case 'pr!refresh':
      images = [];
      req = https.request(options, function(res) {
    
        res.on('data', function(d) {
          images.push(d);
        }).on('end', function() {
          var data = Buffer.concat(images);
          images = JSON.parse(data).data;
          msg.reply('images refreshed!');
        });
      }).on('error', (e) => {images = [];});
      req.end();
      break;
    case 'pr!goodmorning':
    msg.reply('Good morning!');
    break;
    case 'pr!happyhalloween':
      msg.reply('Happy Halloween!');
      break;
    case 'pr!goodnight':
      msg.reply('Good Night!');
      break;
    case 'pr!spooky':
      msg.channel.send('Here\'s a spooky skeleton! https://www.youtube.com/watch?v=XTgFtxHhCQ0');
      break;
    case 'pr!help':
      msg.channel.send({embed: {
        color: 0x4d798e,
        title: 'Help for Pot Roasts!',
        fields: [{
          name: 'Commands',
          value: 'Here are some basic commands:\n\n`pr!goodmorning`\n`pr!goodnight`\n`pr!happyhalloween`\n`pr!potroast`\n`pr!help`\n`pr!spooky`\n`pr!ping`\n`pr!refresh`'
        },
        {
          name: 'Russian Roulette',
          value: '`pr!roulette`\nStarts a new game.\n`pr!join`\nJoins a game.\n`pr!start`\nStarts the current game.\n`pr!cancel`\nCancels the current game.\n`pr!unjoin`\nUnjoins the current game'
        },
        {
          name: 'Account Commands',
          value: '`pr!balance`\nShows you\'re balance.\n`pr!createaccount`\nCreates an account\n`pr!givemoney`\nGives youreself money, but only works if you\'re Andy'
        },
        {
          name: 'Feedback',
          value: 'To send feedback, please do pr!feedback.'}]
      }});
      break;
    case 'pr!feedback':
      if(message.length < 4) {msg.reply('Please include at least 3 words.'); break;}
      if(msg.content.replace(/\s+/g, "").length < 31) {msg.reply('Please include at least 20 characters.'); break;}
      client.fetchUser('314452647954612224').then(
        function(user) {
          user.send('Feedback from ' + msg.author.username + ': ' + msg.content.substring(12, msg.content.length));
          msg.reply('Feedback Sent!');});
      break;
    case 'pr!roulette':
      if(curGames.get(msg.channel.id) != null) {msg.reply('Game already started!');
      break;}
      var bid = parseInt(message[1]);
      if(isNaN(bid)) {msg.reply('Please enter a valid number to bid!');
        break;}
      curGames.set(msg.channel.id, ({
        curGame: msg,
        players: [],
        minBets: bid,
        bids: [],
        pot: 0
      }));
      msg.reply('Created a new game! Please reply with `pr!join` to join and `pr!start` to start!');
      break;
    case 'pr!join':
      if(curGames.get(msg.channel.id) == null) {msg.reply('No game started in this channel!'); break;}
      if(allPlayers.includes(msg.author)) {msg.reply('You already joined a game!'); break;}
      if(curGames.get(msg.channel.id).players.length == 8) {msg.reply('The game is at max capacity!'); break;}
      getCoins(msg.author.id).then((res) =>
      {
        var temp = parseInt(message[1]);
        if(isNaN(temp) || temp < 0) msg.reply('Please enter a valid number to bid!');
        else
        {
          if(temp > res) msg.reply('You do not have enough money!');
          else if(temp < curGames.get(msg.channel.id).minBets) msg.reply(`The value you entered is less than the minimum bid of ${bid}!`);
          else
          {
            msg.reply('Game joined!');
            curGames.get(msg.channel.id).players.push(msg.author);
            allPlayers.push(msg.author);
            curGames.get(msg.channel.id).bids.push(temp);
            curGames.get(msg.channel.id).pot += temp;
          }
        }
      }).catch((err) => {
        msg.reply('You do not have an account, but you can still participate anonymously!');
        players.push(msg.author);
        bids.push(-1);
      });
      break;
    case 'pr!start':
      curGame = curGames.get(msg.channel.id);
      if(curGame == null) {msg.reply('No game started in this channel!'); break;}
      if(msg.author.id != curGame.curGame.author.id) {msg.reply('You didn\'t create the game!'); break;}
      if(curGame.players.length < 2) {msg.reply('Not enough players have joined!'); break;}
      curGame.curEmbed = {embed: {
        color: 0xf4a142,
        title: 'Russian Roulette',
        fields: []
      }};
      curGame.lost = new Array(curGame.players.length);
      var count = curGame.players.length-1;
      curGame.bullets = new Array(8);
      while(count != 0)
      {
        var p = Math.floor(Math.random()*8);
        if(curGame.bullets[p]) continue;
        curGame.bullets[p] = true;
        count--;
      }
      for(var i = curGame.players.length - 1; i >= 0; i--)
      {
        curGame.lost[i] = false;
        var p = Math.floor(Math.random()*i);
        var t = curGame.players[i];
        curGame.players[i] = curGame.players[p];
        curGame.players[p] = t;
        t = curGame.bids[i];
        curGame.bids[i] = curGame.bids[p];
        curGame.bids[p] = t;
        curGame.curEmbed.embed.fields.unshift({name: curGame.players[i].username,
          value: ':white_check_mark:',
          inline: true
        });
      }
      curGame.curEmbed.embed.fields.push({name: 'Starting',
        value: 'A game is starting!'});
      msg.channel.send(curGame.curEmbed).then(mess => {curGame.curGame = mess;
      curGame.numB = 6;
      curGame.numT = curGame.players.length-1;
      curGames.delete(msg.channel.id);
      setTimeout(function() {roulette(0, 0, curGame);}, 3000)});
      break;
    case 'pr!unjoin':
      curGame = curGames.get(msg.channel.id);
      if(curGame == null) {msg.reply('No game started!'); break;}
      var index = curGame.players.indexOf(msg.author);
      if(index == -1) {msg.reply('You did not join this game yet!'); break;}
      curGame.players.splice(index, 1);
      curGame.bids.splice(index, 1);
      allPlayers.splice(allPlayers.indexOf(msg.author), 1);
      msg.reply('Succesfully quit the game!');
      break;
    case 'pr!cancel':
      curGame = curGames.get(msg.channel.id);
      if(curGame == null) {msg.reply('No game started!'); break;}
      if(msg.author.id != curGame.curGame.author.id) {msg.reply('You didn\'t create the game!'); break;}
      curGames.delete(msg.channel.id);
      for(var i = 0; i < curGame.players.length; i++)
        allPlayers.splice(allPlayers.indexOf(curGame.players[i]), 1);
      msg.reply('Game canceled!');
      break;
    case 'pr!balance':
      getCoins(msg.author.id).then(function(t) {
        msg.channel.send(new Discord.RichEmbed().setTitle(msg.author.username + '\'s balance').setDescription(new Number(t).toLocaleString('en') + ' meme coins').setColor(0x4d798e));
      }, function(err) {
        msg.channel.send(new Discord.RichEmbed().setTitle(msg.author.username + '\'s balance').setDescription('You have not created an account yet.').setColor(0x4d798e));});
      break;
    case 'pr!givemoney':
      if(msg.author.id != '314452647954612224') {msg.reply('You are not Andy!'); break;}
      setCoins(msg.author.id, 100).then((res) => {
        if(res == -1) msg.channel.send(new Discord.RichEmbed().setTitle(msg.author.username + '\'s balance').setDescription(`You have not created an account yet.`).setColor(0x4d798e));
        else getCoins(msg.author.id).then((res) => {msg.channel.send(new Discord.RichEmbed().setTitle(msg.author.username + '\'s balance').setDescription(`You're new balance is ${res}`).setColor(0x4d798e))});
      }).catch((err) => {
        msg.channel.send(err.stack);
      });
      break;
    case 'pr!createaccount':
      createUser(msg.author.id, 1000).then((res) => {
        msg.channel.send('You\'re account was created.');
      }).catch((err) => {msg.channel.send('You already have an account.'); console.log(err.stack)});
      break;
  }
});

function roulette(index, round = 0, curGame) {
  if(index == curGame.players.length) index = 0;
  if(curGame.lost[index]) {roulette(index+1, round, curGame); return;}
  if(curGame.numT == 0) {
    if(curGame.bids[index] != -1)
    {
      curGame.curGame.channel.send(`<@${curGame.players[index].id}> wins the game! He won ${curGame.pot-curGame.bids[index]} meme coins!`);
      setCoins(curGame.players[index].id, curGame.pot-curGame.bids[index]);
      allPlayers.splice(allPlayers.indexOf(curGame.players[index]), 1);
    } else
    {
      curGame.curGame.channel.send(`<@${curGame.player[index].toString}> wins the game, but they don't have an account, so they don't win anything!`);
    }
    return;
  }
  curGame.curEmbed.embed.fields[curGame.curEmbed.embed.fields.length-1] = {
    name: 'Round ' + (round+1),
    value: curGame.players[index].username + ' rolls the cylinder.'
  };
  curGame.curGame.edit(curGame.curEmbed);
  if(curGame.numT > 1)
    setTimeout(function() {curGame.curEmbed.embed.fields[curGame.curEmbed.embed.fields.length-1].value += '\nThere are ' + curGame.numT + ' bullets left.';curGame.curGame.edit(curGame.curEmbed);}, 1000);
  else
    setTimeout(function() {curGame.curEmbed.embed.fields[curGame.curEmbed.embed.fields.length-1].value += '\nThere is ' + curGame.numT + ' bullet left.';curGame.curGame.edit(curGame.curEmbed);}, 1000);

  setTimeout(function() {
    if(curGame.bullets[round])
    {
      curGame.numT--;
      curGame.curEmbed.embed.fields[curGame.curEmbed.embed.fields.length-1].value +=  '\nHe is shot in the foot!';
      curGame.lost[index] = true;
      curGame.curEmbed.embed.fields[index].value = ':x:';
      curGame.curGame.edit(curGame.curEmbed);
      setCoins(curGame.players[index].id, -1*curGame.bids[index]);
      allPlayers.splice(allPlayers.indexOf(curGame.players[index]), 1);
    } else
    {
      curGame.curEmbed.embed.fields[curGame.curEmbed.embed.fields.length-1].value += '\nHe was lucky this time!';
      curGame.curGame.edit(curGame.curEmbed);
    }
    setTimeout(function() {roulette(index+1, round+1, curGame);}, 3000);
  }, 3000);
}

function createUser(user, amt)
{
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO coin (id, amt) VALUES(${user}, ${amt})`, (err, res) => {
      if(err) {
        console.log(err.stack);
        reject(new Error('Account'));
      } else {
        resolve('Account Created.');
      }
    });
  });
}

function getCoins(user)
{
  return new Promise(function(resolve, reject) {
    var temp = `SELECT amt FROM coin WHERE id = '${user}'`;
    pool.query(temp, (err, res) => {
      if (err) {
        console.log(err.stack);
      } else {
        if(res.rows.length == 0) {reject(new Error('Its borken'));}
        else
        resolve(res.rows[0].amt);
      }
    });
  });
}

function setCoins(user, amt)
{
  return new Promise((resolve, reject) => {
    getCoins(user).then((res) => {
      var temp = `UPDATE coin SET amt = amt + ${amt} WHERE id = '${user}'`;
      pool.query(temp, (err, res) => {
        if(err) {
          console.log(err.stack);
          reject(new Error('An error occured.'));
        } else
        {
          resolve(0);
        }
      })
    }).catch((err) => {
      resolve(-1);
    });
  });
}

client.on("ready", () => {
    client.user.setActivity("pr!help", { type: "WATCHING"});
});

client.login(process.env.auth);
