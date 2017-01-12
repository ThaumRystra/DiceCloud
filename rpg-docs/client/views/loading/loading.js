var hints = [
	"Drag and drop items to move them between containers",
	"Hold Ctrl while dragging items around to only move some of them",
	"Magic items are considered priceless, don't give them a gold value",
];

Template.loading.helpers({
	randomHint: function(){
		return Random.choice(hints);
	}
});
