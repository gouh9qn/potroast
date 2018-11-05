const names = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
const defaultVals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const colors = ['Spades', 'Diamonds', 'Hearts', 'Clubs'];

var newDeck = function(cards = defaultVals, num = 1)
{
	var deck1 = [];
	for(var i = 0; i < num; i++)
		for(var j = 0; j < colors.length; j++)
			for(var k = 0; k < names.length; k++)
				deck1.push({name: names[k], color: colors[j], val: cards[k]});
	for(var i = deck1.length - 1; i >= 0; i--)
	{
		var t = Math.floor(Math.random()*i);
		var te = deck1[t];
		deck1[t] = deck1[i];
		deck1[i] = te;
	}
	return {
		deck: deck1,
		discard: [],
		draw: function() {
			if(deck.length == 0)
				return null;
			return deck.splice(0, 1);
		},
		deal: function(n) {
			if(deck.length < n) return null;
			hand = [];
			for(var i = 0; i < n; i++) hand.push(draw());
			return hand;
		}
	}
}
exports.newDeck = newDeck;