

function roulette(index, round = 0) {
  if(index == players.length) index = 0;
  if(lost[index]) {roulette(index+1, round); return;}
  if(numT == 0) {
    curGame.channel.send(players[index].username + ' wins the game!');
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

function getCoins(user)
{
  return new Promise(function(resolve, reject) {
    pool.query(`SELECT amt FROM coin WHERE id = ${user.id}`, (err, res) => {
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
    getCoins.then((res) => {
      pool.query(`UPDATE coin SET amt = ${amt} WHERE id = '${user.id}'`, (err, res) => {
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