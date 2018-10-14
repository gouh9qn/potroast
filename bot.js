const Discord = require('discord.js');
var https = require('https');

var fs = require("fs");
var jsonContents = JSON.parse(fs.readFileSync("auth.json"));
var token = jsonContents.token;

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
    console.log(images);
  });
}).on('error', (e) = > {images = [];});

req.end();
var client = new Discord.Client({
   token: token,
   autorun: true
});


var pots = 'CEug9Fi';

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
        console.log(images);
        msg.reply('images refreshed!');
      });
    }).on('error', (e) = > {images = [];});
    req.end();
    break;
  }
});

client.login(token);