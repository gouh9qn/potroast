const Discord = require('discord.js');
var https = require('https');

var options = {
  hostname: 'api.imgur.com',
  path: '/3/album/PCYtJp8/images/',
  headers: {Authorization: 'Client-ID c9796abee6990a5'},
  method: 'GET'
};

var inspire = {
  hostname: 'inspirobot.me',
  path: 'api?generate=true'
}

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
console.log(process.env);

client.on('message', msg => {
  var message = msg.content.split(' ');
  if(msg.author.bot) return;
  switch(message[0]) {
  case '!potroast':
    if(images.length == 0)
    { msg.reply('Could not load images. Please try to \'!refresh\'.'); } 
    else { msg.reply('Here\'s your pot roast!', {files: [images[Math.floor(Math.random()*images.length)].link]}); }
    break;
  case '!refresh':
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
  case '!goodmorning':
    msg.reply('Good morning!');
    break;
  case '!happyhalloween':
      msg.reply('Happy Halloween!');
      break;
  case '!goodnight':
      msg.reply('Good Night!');
      break;
  case '!spooky':
      msg.channel.send('Here\'s a spooky skeleton! https://www.youtube.com/watch?v=XTgFtxHhCQ0');
      break;
    case 'p!help':
      msg.channel.send({embed: {
        color: 0x4d798e,
        title: 'Help for Pot Roasts!',
        fields: [{
          name: 'Commands',
          value: 'Here are some basic commands:\n`!goodmorning`\n\n`!goodnight`\n\n`!happyhalloween`\n\n`!potroast`\n\n`p!help`'
        },
        {
          name: 'Feedback',
          value: 'To send feedback, please do p!feedback.'}]
      }});
      break;
    case 'p!feedback':
      client.fetchUser('314452647954612224').then(
        function(user) {
          user.send(msg.content);
          msg.reply('Feedback Sent!');});
      break;
  }
});
client.on("ready", () => {
    client.user.setActivity("p!help", { type: "WATCHING"})
})

client.login('NDk5Mzc0NTQyNTQwNzY3MjMy.DqgR8A.u9yC9SeBoeMuWMZaHn3fxWhalV4');
