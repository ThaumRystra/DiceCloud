Template.shareDialog.helpers({

});

Template.shareDialog.events({
	"tap #shareButton": function(event, instance){
        var self = this;
		var userName = instance.find("#userNameOrEmailInput").value;
		var permission = instance.find("#accessLevelMenu").value;
        Meteor.call("getUserId", userName, function (err, result) {
            if(err){
                this.userFindError = true;
            } else{
                if(permission === "write"){
                    Characters.update(self._id, {
                        $push: {writers: result},
                        $pull: {readers: result}
                    });
                } else {
                    Characters.update(self._id, {
                        $push: {readers: result},
                        $pull: {writers: result}
                    });
                }
                GlobalUI.closeDialog();
            }
        });
	}
});
