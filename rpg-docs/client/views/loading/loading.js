var hints = [
	"Drag and drop items to move them between containers.",
	"Hold Ctrl while dragging items around to only move some of them.",
	"Magic items are considered priceless, don't give them a gold value.",
	"You can use formulae in {curly brackets} in any field with a {} icon.",
	"You can disable the 'Spells' tab from the charecter menu in the top right.",
	"You can share your character with others from the menu in the top right.",
	"Your spells, features, and items are ordered by their colour, which you can set with the paint bucket.",
	"You can only have three magic items attuned to you at once. Choose carefully!",
	"Click the '+' underneath 'Hit Points' to add additional health bars for temporary HP, wild shapes, familiars and more.",
];

Template.loading.helpers({
	randomHint: function(){
		return Random.choice(hints);
	}
});
