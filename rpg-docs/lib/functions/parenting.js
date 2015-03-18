var childSchema = new SimpleSchema({
	parent:              { type: Object },
	'parent.collection': { type: String },
	'parent.id':         { type: String, regEx: SimpleSchema.RegEx.Id }
});

var joinWithDefaultKeys = function(keys){
	var defaultKeys = [
		'charId',
		'removed',
		'removedAt',
		'removedBy',
		'restoredAt',
		'restoredBy'
	];
	return _.union(keys, defaultKeys);
}

var limitModifierToKeys = function(modifier, keys){
	if(!modifier) return;
	modifier = _.pick(modifier, ['$set', '$unset']);
	if(modifier.$set) modifier.$set   = _.pick(modifier.$set,   keys);
	if(modifier.$unset) modifier.$unset = _.pick(modifier.$unset, keys);
	if(_.isEmpty(modifier.$set))   delete modifier.$set;
	if(_.isEmpty(modifier.$unset)) delete modifier.$unset;
	return modifier;
}

var childCollections = [];

makeChild = function(collection, inheritedKeys){
	inheritedKeys = inheritedKeys || [];
	if(inheritedKeys) collection.inheritedKeys = joinWithDefaultKeys(inheritedKeys);
	collection.helpers({
		//returns the parent even if it's removed
		getParent: function(){
			var parentCol = Meteor.isClient? 
				window[this.parent.collection] : global[this.parent.collection];
			if (parentCol)
				return parentCol.findOne(this.parent.id, {removed: true});
		},
		getParentCollection: function(){
			return Meteor.isClient? 
				window[this.parent.collection] : global[this.parent.collection];
		}
	});

	//when we change parents, inherit its properties
	collection.after.update(function (userId, doc, fieldNames, modifier, options) {
		if(modifier && modifier.$set && modifier.$set.parent){
			var parent = doc.getParent();
			if(!parent) throw new Meteor.Error('Parenting Error',
											   'Document\'s parent does not exist');
			var handMeDowns = _.pick(parent, collection.inheritedKeys);
			collection.update(doc._id, {$set: handMeDowns});
		}
	});

	collection.attachSchema(childSchema);

	childCollections.push(collection);
};

makeParent = function(collection, donatedKeys){
	donatedKeys = joinWithDefaultKeys(donatedKeys);

	//after changing, push the changes to all children
	collection.after.update(function (userId, doc, fieldNames, modifier, options) {
		modifier = limitModifierToKeys(modifier, donatedKeys);
		doc = _.pick(doc, ['_id','charId']);
		Meteor.call('updateChildren', doc, modifier, true);
	});

	collection.after.remove(function (userId, doc) {
		doc = _.pick(doc, ['_id','charId']);
		Meteor.call('removeChildren', doc);
	});
};

var checkPermission = function(userId, charId){
	var char = Characters.findOne( charId, { fields: {owner: 1, writers: 1} } );
	if(!char)
		throw new Meteor.Error('Access Denied',
							   'Character '+charId+' does not exist');
	if (!userId) 
		throw new Meteor.Error('Access Denied',
							   'No UserId set when trying to update character asset.');
	if (char.owner !== userId && !_.contains(char.writers, userId))
		throw new Meteor.Error('Access Denied',
							   'Not permitted to update assets of this character.');
	return true;
};

Meteor.methods({
	updateChildren: function (parent, modifier, limitToInheritance) {
		check(parent, {_id: String, charId: String});
		check(modifier, Object);
		checkPermission(this.userId, parent.charId);
		_.each(childCollections, function(collection){
			var thisModifier;
			if(limitToInheritance){
				thisModifier = limitModifierToKeys(modifier, collection.inheritedKeys);
			} else{
				thisModifier = _.clone(modifier);
			}
			if(_.isEmpty(thisModifier)) return;
			collection.update( {'parent.id': parent._id}, thisModifier, {multi: true});
		});
	},
	removeChildren: function (parent) {
		check(parent, {_id: String, charId: String});
		checkPermission(this.userId, parent.charId);

		_.each(childCollections, function(collection){
			collection.remove(
				{charId: parent.charId, 'parent.id': parent._id}
			);
		});
	}
});
