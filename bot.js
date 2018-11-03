const Discord = require('discord.js');
var https = require('https');

var options = {
  hostname: 'api.imgur.com',
  path: '/3/album/PCYtJp8/images/',
  headers: {Authorization: 'Client-ID c9796abee6990a5'},
  method: 'GET'
};

var images = [];
var req = https.request(options, function(res) {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
  console.log('test');

  res.on('data', function(d) {
    images.push(d);
  }).on('end', function() {
    var data = Buffer.concat(images);
    images = JSON.parse(data).data;
  });
}).on('error', (e) => {images = [];});

req.end();
var client = new Discord.Client();


var pots = 'CEug9Fi';
var numB;
console.log(process.env);

var curGame;
var curID;
var players;
var playerN;

client.on('message', msg => {
  var message = msg.content.trim().split(/\s+/);
  if(msg.author.bot) return;
  switch(message[0]) {
    case 'pr!ping':
      msg.channel.send('Pong! ' + client.ping.toFixed(2) + " ms");
      break;
    case 'pr!potroast':
      if(images.length == 0)
      { msg.reply('Could not load images. Please try to \'!refresh\'.'); } 
      else { msg.reply('Here\'s your pot roast!', {files: [images[Math.floor(Math.random()*images.length)].link]}); }
      break;
    case 'pr!refresh':
      images = [];
      req = https.request(options, function(res) {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        console.log('test');
    
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
      if(curGame != null) {msg.reply('Game already started!'); break;}
      curID = msg.author.id;
      msg.reply('Starting new roulette game! Please respond with pr!join to join and pr!start to start.').then(o => {players = []; curGame = o; playerN = [];});
      break;
    case 'pr!join':
      if(players == null) {msg.reply('No game started!'); break;}
      if(players.includes(msg.author)) {msg.reply('You already joined!'); break;}
      if(players.length == 6) {msg.reply('The game is at max capacity!'); break;}
      players.push(msg.author);
      msg.reply('Game joined!');
      break;
    case 'pr!start':
      if(players == null) {msg.reply('No game started!'); break;}
      if(msg.author.id != curID) {msg.reply('You didn\'t create the game!'); break;}
      if(players.length == 0) {msg.reply('No one has joined!'); break;}
      msg.channel.send('Starting Game!').then(mess => {curGame = mess;
      numB = 6;
      numT = players.length;
      setTimeout(function() {roulette(0);}, 3000)});
      break;
    case 'pr!cancel':
      if(players == null) {msg.reply('No game started!'); break;}
      if(msg.author.id != curID) {msg.reply('You didn\'t create the game!'); break;}
      curGame = null;
      players = null;
      msg.reply('Game canceled!');
      break;
  }
});

function roulette(index) {
  if(players.length == 1) {curGame.channel.send(players[0].username + ' is the winner!');
    var t = function() {return null;};
    players = t();
    curGame = t(); return;}
  if(index == players.length) index = 0;
  curGame.edit(players[index].username + ' is taking their turn! There are ' + numT + ' out of ' + numB + ' bullets left, and ' + players.length + ' players left!');
  var b = Math.floor(Math.random()*numB);
  setTimeout(function() {
    if(b < numT)
    {
      numT--;
      curGame.edit(players[index].username + ' was eliminated! Oh no!');
      players.splice(index, 1);
    } else
    {
      curGame.edit(players[index].username + ' didn\'t die!');
    }
    setTimeout(function() {roulette(index+1);}, 3000);
  }, 3000);
}

client.on("ready", () => {
    client.user.setActivity("p!help", { type: "WATCHING"})
})  

client.login(process.env.auth);
