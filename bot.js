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


const changelog = "Added pr!roulette and relevent commands\nAdded pr!ping";
const future = "Add blackjack";

const botinf = {embed: {
  color: 0x4d798e,
  title: "Bot Info",
  fields: [
    {name: "Version", value: '1.1.0'},
    {name: "Changelog", value: changelog},
    {name: "Future Features", value: future}
  ]
}};

var pots = 'CEug9Fi';
var numB;

var curGame;
var curEmbed;
var curID;
var players
var bid;
var playerN;
var bids;
var pot;

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
          value: '`pr!roulette`\nStarts a new game.\n`pr!join`\nJoins a game.\n`pr!start`\nStarts the current game.\n`pr!cancel`\nCancels the current game.'
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
      if(curGame != null) {msg.reply('Game already started!');
      break;}
      bid = parseInt(message[1]);
      if(isNaN(bid)) {msg.reply('Please enter a valid number to bid!');
       break;}
      msg.reply('Created a new game! Please reply with `pr!join` to join and `pr!start` to start!')
      curGame = msg;
      playerN = [];
      players = [];
      bids = [];
      pot = 0;
      break;
    case 'pr!join':
      if(players == null) {msg.reply('No game started!'); break;}
      if(players.includes(msg.author)) {msg.reply('You already joined!'); break;}
      if(players.length == 6) {msg.reply('The game is at max capacity!'); break;}
      getCoins(msg.author.id).then((res) =>
      {
        var temp = parseInt(message[1]);
        if(isNaN(temp) || temp < 0) msg.reply('Please enter a valid number to bid!');
        else
        {
          if(temp > res) msg.reply('You do not have enough money!');
          else if(temp < bid) msg.reply(`The value you entered is less than the minimum bid of ${bid}!`);
          else
          {
            msg.reply('Game joined!');
            players.push(msg.author);
            bids.push(temp);
            pot += temp;
          }
        }
      }).catch((err) => {
        msg.reply('You do not have an account, but you can still participate anonymously!');
        players.push(msg.author);
        bids.push(-1);
      });
      break;
    case 'pr!start':
      if(players == null) {msg.reply('No game started!'); break;}
      if(msg.author.id != curGame.author.id) {msg.reply('You didn\'t create the game!'); break;}
      if(players.length < 2) {msg.reply('Not enough players have joined!'); break;}
      curEmbed = {embed: {
        color: 0xf4a142,
        title: 'Russian Roulette',
        fields: []
      }};
      lost = [players.length];
      for(var i = players.length - 1; i >= 0; i--)
      {
        lost[i] = false;
        var p = Math.floor(Math.random()*i);
        var t = players[i];
        players[i] = players[p];
        players[p] = t;
        t = bids[i];
        bids[i] = bids[p];
        bids[p] = t;
        curEmbed.embed.fields.unshift({name: players[i].username,
          value: ':white_check_mark:',
          inline: true
        });
      }
      curEmbed.embed.fields.push({name: 'Starting',
        value: 'A game is starting!'});
      msg.channel.send(curEmbed).then(mess => {curGame = mess;
      numB = 6;
      numT = players.length-1;
      setTimeout(function() {roulette(0);}, 3000)});
      break;
    case 'pr!cancel':
      if(players == null) {msg.reply('No game started!'); break;}
      if(msg.author.id != curGame.author.id) {msg.reply('You didn\'t create the game!'); break;}
      curGame = null;
      players = null;
      msg.reply('Game canceled!');
      break;
    case 'pr!balance':
      console.log(msg.author);
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
      createUser(msg.author.id, 100).then((res) => {
        msg.channel.send('You\'re account was created.');
      }).catch((err) => {msg.channel.send('You already have an account.'); console.log(err.stack)});
      break;
  }
});

function roulette(index, round = 0) {
  if(index == players.length) index = 0;
  if(lost[index]) {roulette(index+1, round); return;}
  if(numT == 0) {
    if(bid[index] != -1)
    {
      curGame.channel.send(`<@${players[index].id}> wins the game! He won ${pot} meme coins!`);
      setCoins(players[index].id, pot);
      for(var i = 0; i < players.length; i++)
        if(bid[i] != -1 && i != index) setCoins(players[i], bid[i]*-1);
    } else
    {
      curGame.channel.send(`<@${player[index].toString}> wins the game, but they don't have an account, so they don't win anything!`);
    }
    players = null;
    curGame = null;
    return;
  }
  curEmbed.embed.fields[curEmbed.embed.fields.length-1] = {
    name: 'Round ' + (round+1),
    value: players[index].username + ' rolls the cylinder.'
  };
  curGame.edit(curEmbed);
  if(numT > 1)
    setTimeout(function() {curEmbed.embed.fields[curEmbed.embed.fields.length-1].value += '\nThere are ' + numT + ' bullets left.';curGame.edit(curEmbed);}, 1000);
  else
    setTimeout(function() {curEmbed.embed.fields[curEmbed.embed.fields.length-1].value += '\nThere is ' + numT + ' bullet left.';curGame.edit(curEmbed);}, 1000);

  var b = Math.floor(Math.random()*numB);
  setTimeout(function() {
    if(b < numT)
    {
      numT--;
      curEmbed.embed.fields[curEmbed.embed.fields.length-1].value +=  '\nHe is shot in the foot!';
      lost[index] = true;
      curEmbed.embed.fields[index].value = ':x:';
      curGame.edit(curEmbed);
    } else
    {
      curEmbed.embed.fields[curEmbed.embed.fields.length-1].value += '\nHe was lucky this time!';
      curGame.edit(curEmbed);
    }
    setTimeout(function() {roulette(index+1, round+1);}, 3000);
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
    console.log(temp);
    pool.query(temp, (err, res) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(res);
        if(res.rows.length == 0) {reject(new Error('Its borken')); console.log('Debug');}
        else
        {console.log(res.rows[0].amt);
                resolve(res.rows[0].amt);}
      }
    });
  });
}

function setCoins(user, amt)
{
  return new Promise((resolve, reject) => {
    getCoins(user).then((res) => {
      var temp = `UPDATE coin SET amt = amt + ${amt} WHERE id = '${user}'`;
      console.log(temp);
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
