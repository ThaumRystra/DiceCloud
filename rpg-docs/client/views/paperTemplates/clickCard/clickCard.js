Template.clickCard.events({
	"click paper-shadow ": function(event){
		event.currentTarget.setZ(2);
		_.delay(function(){
			event.currentTarget.setZ(1);	
		}, 300)
	}
})