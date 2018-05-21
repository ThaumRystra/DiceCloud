AccountsMeld.configure({
	meldDBCallback: function(sourceUserId, destinationUserId){
		// Here you can modify every collection you need for the document referencing
		// to sourceUserId to be modified in order to point to destinationUserId
		Characters.update(
			{owner: sourceUserId},
			{$set: {owner: destinationUserId}},
			{multi: true}
		);
		Characters.update(
			{writers: sourceUserId},
			{
				$pull: {writers: sourceUserId},
				$addToSet: {writers: destinationUserId},
			},
			{multi: true}
		);
		Characters.update(
			{readers: sourceUserId},
			{
				$pull: {readers: sourceUserId},
				$addToSet: {readers: destinationUserId},
			},
			{multi: true}
		);
	},
});
