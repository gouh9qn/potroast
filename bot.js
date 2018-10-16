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
  switch(message[0]) {
  case '!roast':
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
  case '!good':
    msg.reply('Good morning!');
    break;
  case '!inspire':
    req = https.request(options, function(res) {
      res.on('data', function(d) {
        msg.reply(d);
      }
    }
    req.end();
  }
});

client.login(process.env.auth);
